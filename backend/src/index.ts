import 'dotenv/config';
import * as Sentry from '@sentry/node';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import { rateLimit } from 'express-rate-limit';
import { logger } from './lib/logger.js';
import { prisma } from './lib/prisma.js';
import { authRouter } from './routes/auth.js';

if (process.env.SENTRY_DSN) {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.NODE_ENV || 'development',
    tracesSampleRate: parseFloat(process.env.SENTRY_SAMPLE_RATE || '0.1'),
    integrations: [Sentry.prismaIntegration()],
  });
}

if (!process.env.NODE_ENV) {
  process.env.NODE_ENV = 'development';
}

process.on('uncaughtException', (err) => {
  logger.fatal({ err }, 'Uncaught exception');
  process.exit(1);
});
process.on('unhandledRejection', (err) => {
  logger.fatal({ err }, 'Unhandled rejection');
  process.exit(1);
});
import { astrologyRouter } from './routes/astrology.js';
import { chatRouter } from './routes/chat.js';
import { paymentRouter } from './routes/payment.js';
import { adminRouter } from './routes/admin.js';
import { userRouter } from './routes/user.js';
import { locationsRouter } from './routes/locations.js';
import { healthRouter } from './routes/health.js';
import { reportRouter } from './routes/report.js';
import { contactRouter } from './routes/contact.js';
import { translateRouter } from './routes/translate.js';
import { voiceRouter } from './routes/voice.js';
import { errorHandler } from './middleware/errorHandler.js';
import { requestLogger } from './middleware/requestLogger.js';

const app = express();
const rawPort = parseInt(process.env.PORT || '4000', 10);
const PORT = isNaN(rawPort) || rawPort < 1 ? 4000 : rawPort;

const corsOrigins = (process.env.CORS_ORIGINS || 'http://localhost:5173').split(',').map(s => s.trim()).filter(Boolean);
const isDev = process.env.NODE_ENV === 'development';
const corsOrigin = isDev ? ['http://localhost:5173', 'http://localhost:4000', 'http://127.0.0.1:5173', 'http://127.0.0.1:4000', 'https://astryn.hara-xy.com/'] : corsOrigins;

function isValidOrigin(origin: string | undefined): boolean {
  if (!origin) return true;
  try {
    const parsed = new URL(origin);
    return corsOrigin.includes(origin) || corsOrigin.includes(`${parsed.protocol}//${parsed.host}`);
  } catch {
    return false;
  }
}

app.use(helmet({
  strictTransportSecurity: { maxAge: 31536000, includeSubDomains: true, preload: true },
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", 'https://fonts.googleapis.com'],
      fontSrc: ["'self'", 'data:', 'https://fonts.gstatic.com'],
      imgSrc: ["'self'", 'data:', 'blob:'],
      connectSrc: ["'self'", ...corsOrigins],
      frameSrc: ["'none'"],
      objectSrc: ["'none'"],
      formAction: ["'self'"],
      baseUri: ["'self'"],
      ...(isDev ? {} : { upgradeInsecureRequests: [] }),
    },
  },
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
  xssFilter: true,
  noSniff: true,
  frameguard: { action: 'deny' },
  hidePoweredBy: true,
  ieNoOpen: true,
  dnsPrefetchControl: { allow: false },
}));
app.use(compression());
app.use(cookieParser());

app.use(cors({
  origin: function (origin, callback) {
    if (isValidOrigin(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-CSRF-Token', 'X-Requested-With'],
  maxAge: 86400,
}));

const apiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: isDev ? 500 : 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: 'Too many requests. Please try again later.' },
  skip: isDev ? (req) => req.ip === '127.0.0.1' || req.ip === '::1' || req.ip === '::ffff:127.0.0.1' : undefined,
});
app.use('/api/', apiLimiter);

app.use(requestLogger);

app.use('/api/health', healthRouter);

app.use('/api/payments/webhook', express.raw({ type: 'application/json' }));
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

app.use('/api/auth', authRouter);
app.use('/api/astrology', astrologyRouter);
app.use('/api/chat', chatRouter);
app.use('/api/payments', paymentRouter);
app.use('/api/admin', adminRouter);
app.use('/api/locations', locationsRouter);
app.use('/api/user', userRouter);
app.use('/api/translate', translateRouter);
app.use('/api/report', reportRouter);
app.use('/api/contact', contactRouter);
app.use('/api/voice', voiceRouter);

app.use(errorHandler);

const server = app.listen(PORT, '0.0.0.0', () => {
  if (!process.env.JWT_SECRET) {
    logger.warn('⚠️  JWT_SECRET is not configured. Set a strong secret in production.');
  }
  if (!process.env.OPENROUTER_API_KEY && !process.env.AI_API_KEY) {
    logger.warn('⚠️  No AI_API_KEY configured. Set OPENROUTER_API_KEY or AI_API_KEY for AI features.');
  }
  logger.info(`Soma & Surya API running on port ${PORT}`);
});

function gracefulShutdown(signal: string) {
  logger.info({ signal }, 'Received shutdown signal — closing server and DB connections...');
  server.close(() => {
    prisma.$disconnect().then(() => {
      logger.info('Server and DB connections closed gracefully');
      process.exit(0);
    }).catch((err: unknown) => {
      logger.error({ err }, 'Error disconnecting Prisma');
      process.exit(1);
    });
  });
  setTimeout(() => {
    logger.error('Forced shutdown after timeout');
    process.exit(1);
  }, 30000);
}

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

export default app;
