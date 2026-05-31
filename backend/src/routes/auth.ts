import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import crypto from 'crypto';
import { OAuth2Client } from 'google-auth-library';
import { prisma } from '../lib/prisma.js';
import { validate } from '../middleware/validate.js';
import { authenticate } from '../middleware/auth.js';
import { asyncHandler } from '../lib/asyncHandler.js';
import { ConflictError, UnauthorizedError, ValidationError } from '../lib/errors.js';

export const authRouter = Router();

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-in-production';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'dev-refresh-secret-change-in-production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '15m';
const JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || '7d';
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || '';

const googleClient = new OAuth2Client(GOOGLE_CLIENT_ID);

function generateTokens(payload: { userId: string; role: string }) {
  const accessToken = jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN } as jwt.SignOptions);
  const refreshToken = jwt.sign(payload, JWT_REFRESH_SECRET, { expiresIn: JWT_REFRESH_EXPIRES_IN } as jwt.SignOptions);
  return { accessToken, refreshToken };
}

authRouter.post('/google', (req, res) => {
  (async () => {
    try {
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
        if (!user.googleId) {
          user = await prisma.user.update({
            where: { id: user.id },
            data: { googleId, avatar: picture || user.avatar },
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
      await prisma.user.update({ where: { id: user.id }, data: { refreshToken: tokens.refreshToken } });

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
    } catch (err) {
      console.error('[Google Auth] Error:', err);
      const message = err instanceof Error ? err.message : 'Unknown error';
      res.status(500).json({ success: false, error: message, code: 'INTERNAL_ERROR' });
    }
  })();
});

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters').max(128),
});

authRouter.post('/register', validate(registerSchema), asyncHandler(async (req, res) => {
  const { name, email, password } = req.body as z.infer<typeof registerSchema>;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) throw new ConflictError('An account with this email already exists');

  const passwordHash = await bcrypt.hash(password, 12);
  const user = await prisma.user.create({
    data: { name, email, passwordHash },
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

  const tokens = generateTokens({ userId: user.id, role: user.role });
  await prisma.user.update({ where: { id: user.id }, data: { refreshToken: tokens.refreshToken } });

  res.cookie('refreshToken', tokens.refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: '/api/auth',
  });

  res.status(201).json({
    success: true,
    data: {
      user: { id: user.id, email: user.email, name: user.name, role: user.role },
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    },
  });
}));

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1, 'Password is required'),
});

authRouter.post('/login', validate(loginSchema), asyncHandler(async (req, res) => {
  const { email, password } = req.body as z.infer<typeof loginSchema>;

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) throw new UnauthorizedError('Invalid email or password');

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) throw new UnauthorizedError('Invalid email or password');

  const tokens = generateTokens({ userId: user.id, role: user.role });
  await prisma.user.update({ where: { id: user.id }, data: { refreshToken: tokens.refreshToken } });

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

authRouter.post('/refresh', asyncHandler(async (req, res) => {
  const token = req.cookies?.refreshToken || req.body?.refreshToken;
  if (!token) throw new UnauthorizedError('No refresh token provided');

  try {
    const decoded = jwt.verify(token, JWT_REFRESH_SECRET) as { userId: string; role: string };
    const user = await prisma.user.findUnique({ where: { id: decoded.userId } });
    if (!user || user.refreshToken !== token) throw new UnauthorizedError('Invalid refresh token');

    const tokens = generateTokens({ userId: user.id, role: user.role });
    await prisma.user.update({ where: { id: user.id }, data: { refreshToken: tokens.refreshToken } });

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
