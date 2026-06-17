import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import crypto, { timingSafeEqual } from 'crypto';
import { OAuth2Client } from 'google-auth-library';
import { rateLimit } from 'express-rate-limit';
import { prisma } from '../lib/prisma.js';
import { validate } from '../middleware/validate.js';
import { authenticate } from '../middleware/auth.js';
import { asyncHandler } from '../lib/asyncHandler.js';
import { AppError, ValidationError, UnauthorizedError, ConflictError } from '../lib/errors.js';
import { logger } from '../lib/logger.js';
import { sendWelcomeEmail } from '../lib/email.js';

export const authRouter = Router();

authRouter.get('/google/client-id', (req, res) => {
  res.json({ success: true, data: { clientId: GOOGLE_CLIENT_ID } });
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: process.env.NODE_ENV === 'production' ? 10 : 50,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: 'Too many login attempts. Try again later.' },
});

const JWT_SECRET = (() => {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET environment variable is required');
  }
  return process.env.JWT_SECRET;
})();
const JWT_REFRESH_SECRET = (() => {
  if (!process.env.JWT_REFRESH_SECRET) {
    throw new Error('JWT_REFRESH_SECRET environment variable is required');
  }
  return process.env.JWT_REFRESH_SECRET;
})();
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '15m';
const JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || '7d';
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || '';
const HAS_GOOGLE_AUTH = GOOGLE_CLIENT_ID.length > 20;

const googleClient = HAS_GOOGLE_AUTH ? new OAuth2Client(GOOGLE_CLIENT_ID) : null;

function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

function generateTokens(payload: { userId: string; role: string }) {
  const accessToken = jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN } as jwt.SignOptions);
  const refreshToken = jwt.sign(payload, JWT_REFRESH_SECRET, { expiresIn: JWT_REFRESH_EXPIRES_IN } as jwt.SignOptions);
  return { accessToken, refreshToken };
}

authRouter.post('/google', authLimiter, asyncHandler(async (req, res) => {
  if (!googleClient) {
    res.status(503).json({ success: false, error: 'Google authentication is not configured', code: 'SERVICE_UNAVAILABLE' });
    return;
  }
  const { credential } = req.body;
  if (!credential) {
    res.status(400).json({ success: false, error: 'Google credential is required', code: 'VALIDATION_ERROR' });
    return;
  }

  const ticket = await googleClient.verifyIdToken({
    idToken: credential,
    audience: GOOGLE_CLIENT_ID,
  });
  const payload = ticket.getPayload();
  if (!payload?.email) {
    res.status(401).json({ success: false, error: 'Invalid Google token', code: 'UNAUTHORIZED' });
    return;
  }

  const { sub: googleId, email, name, picture } = payload;

  let user = await prisma.user.findUnique({ where: { googleId } })
    ?? await prisma.user.findUnique({ where: { email } });

  if (user) {
    const updateData: Record<string, any> = {};
    if (!user.googleId) updateData.googleId = googleId;
    if (name && name !== user.name) updateData.name = name;
    if (picture && picture !== user.avatar) updateData.avatar = picture;
    if (Object.keys(updateData).length > 0) {
      user = await prisma.user.update({
        where: { id: user.id },
        data: updateData,
      });
    }
  } else {
    const passwordHash = await bcrypt.hash(crypto.randomUUID(), 12);
    user = await prisma.user.create({
      data: {
        name: name || email.split('@')[0],
        email,
        passwordHash,
        googleId,
        avatar: picture || null,
      },
    });
    await prisma.subscription.create({
      data: {
        userId: user.id,
        plan: 'FREE',
        status: 'TRIALING',
        currentPeriodStart: new Date(),
        currentPeriodEnd: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        trialEnd: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      },
    });
  }

  const tokens = generateTokens({ userId: user.id, role: user.role });
  await prisma.user.update({ where: { id: user.id }, data: { refreshToken: hashToken(tokens.refreshToken) } });

  res.cookie('refreshToken', tokens.refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: '/api/auth',
  });

  res.json({
    success: true,
    data: {
      user: { id: user.id, email: user.email, name: user.name, role: user.role, avatar: user.avatar },
      accessToken: tokens.accessToken,
    },
  });
}));

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters').max(128),
  gender: z.string().optional(),
  birthDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Use YYYY-MM-DD format').optional(),
  birthTime: z.string().regex(/^\d{2}:\d{2}$/, 'Use HH:MM format').optional(),
  birthPlace: z.string().min(1).max(200).optional(),
  country: z.string().min(2).max(100).optional(),
  language: z.string().min(2).max(10).optional(),
  timezone: z.string().optional(),
});

authRouter.post('/register', authLimiter, validate(registerSchema), asyncHandler(async (req, res) => {
  const body = req.body as z.infer<typeof registerSchema>;
  const { name, email, password, gender, birthDate, birthTime, birthPlace, country, language, timezone } = body;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) throw new ConflictError('An account with this email already exists');

  const passwordHash = await bcrypt.hash(password, 12);
  const user = await prisma.user.create({
    data: {
      name, email, passwordHash,
      ...(gender && { gender }),
      ...(birthDate && { birthDate }),
      ...(birthTime && { birthTime }),
      ...(birthPlace && { birthPlace }),
      ...(country && { country }),
      ...(language && { language }),
      ...(timezone && { timezone }),
    },
  });

  // Generate astrology profile if birth details provided
  if (birthDate && birthTime && birthPlace) {
    try {
      const { calculateBirthDetails } = await import('../services/astrology/calculator.js');
      const { RASHI_DATA, NAKSHATRA_LORDS } = await import('../services/astrology/constants.js');
      const details = calculateBirthDetails(birthDate, birthTime);
      const rd = RASHI_DATA[details.rashiKey] || RASHI_DATA.Mesh;
      await prisma.astrologyProfile.create({
        data: {
          userId: user.id,
          rashi: `${details.rashiKey} (${rd.translation})`,
          nakshatra: details.nakshatraName,
          nakshatraLord: NAKSHATRA_LORDS[details.nakshatraIndex % 9],
          lagna: `${details.lagnaKey} (${(RASHI_DATA[details.lagnaKey] || RASHI_DATA.Mesh).translation})`,
          rashiLord: rd.lord,
          element: rd.element,
          doshaDominance: rd.dosha,
        },
      });
    } catch (error: unknown) {
      logger.warn({ error }, 'Failed to create astrology profile on registration');
    }
  }

  sendWelcomeEmail(email, name).catch((e) => logger.warn({ err: e }, 'Welcome email failed'));

  await prisma.subscription.create({
    data: {
      userId: user.id,
      plan: 'FREE',
      status: 'TRIALING',
      currentPeriodStart: new Date(),
      currentPeriodEnd: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      trialEnd: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
    },
  });

  const tokens = generateTokens({ userId: user.id, role: user.role });
  await prisma.user.update({ where: { id: user.id }, data: { refreshToken: hashToken(tokens.refreshToken) } });

  res.cookie('refreshToken', tokens.refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: '/api/auth',
  });

  // Fetch astrology profile for response
  const astrologyProfile = await prisma.astrologyProfile.findUnique({ where: { userId: user.id } });

  res.status(201).json({
    success: true,
    data: {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        gender: user.gender,
        birthDate: user.birthDate,
        birthTime: user.birthTime,
        birthPlace: user.birthPlace,
        country: user.country,
        language: user.language,
        timezone: user.timezone,
        astrologyProfile,
      },
      accessToken: tokens.accessToken,
    },
  });
}));

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1, 'Password is required'),
});

authRouter.post('/login', authLimiter, validate(loginSchema), asyncHandler(async (req, res) => {
  const { email, password } = req.body as z.infer<typeof loginSchema>;

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) throw new UnauthorizedError('Invalid email or password');

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) throw new UnauthorizedError('Invalid email or password');

  const tokens = generateTokens({ userId: user.id, role: user.role });
  await prisma.user.update({ where: { id: user.id }, data: { refreshToken: hashToken(tokens.refreshToken) } });

  res.cookie('refreshToken', tokens.refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: '/api/auth',
  });

  res.json({
    success: true,
    data: { user: { id: user.id, email: user.email, name: user.name, role: user.role }, accessToken: tokens.accessToken },
  });
}));

authRouter.post('/refresh', authLimiter, asyncHandler(async (req, res) => {
  const token = req.cookies?.refreshToken || req.body?.refreshToken;
  if (!token) throw new UnauthorizedError('No refresh token provided');

  try {
    const decoded = jwt.verify(token, JWT_REFRESH_SECRET) as { userId: string; role: string };
    const user = await prisma.user.findUnique({ where: { id: decoded.userId } });
    if (!user || !user.refreshToken) throw new UnauthorizedError('Invalid refresh token');
    const hashedInput = hashToken(token);
    const hashedStored = Buffer.from(user.refreshToken, 'utf-8');
    const hashedInputBuf = Buffer.from(hashedInput, 'utf-8');
    if (hashedStored.length !== hashedInputBuf.length || !timingSafeEqual(hashedStored, hashedInputBuf)) {
      throw new UnauthorizedError('Invalid refresh token');
    }

    const tokens = generateTokens({ userId: user.id, role: user.role });
    await prisma.user.update({ where: { id: user.id }, data: { refreshToken: hashToken(tokens.refreshToken) } });

    res.cookie('refreshToken', tokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: '/api/auth',
    });

    res.json({ success: true, data: { accessToken: tokens.accessToken } });
  } catch {
    throw new UnauthorizedError('Invalid or expired refresh token');
  }
}));

authRouter.post('/logout', authenticate, asyncHandler(async (req, res) => {
  await prisma.user.update({
    where: { id: req.user!.userId },
    data: { refreshToken: null },
  });
  res.clearCookie('refreshToken', { path: '/api/auth' });
  res.json({ success: true, message: 'Logged out successfully' });
}));

authRouter.get('/me', authenticate, asyncHandler(async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user!.userId },
    select: { id: true, email: true, name: true, role: true, avatar: true, timezone: true, language: true, emailVerified: true, birthDate: true, birthTime: true, birthPlace: true, createdAt: true },
  });
  if (!user) throw new UnauthorizedError('User not found');
  res.json({ success: true, data: user });
}));
