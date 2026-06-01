import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import { rateLimit } from 'express-rate-limit';
import { authRouter } from './routes/auth.js';

process.on('uncaughtException', (err) => {
  console.error('[FATAL] Uncaught exception:', err);
});
process.on('unhandledRejection', (err) => {
  console.error('[FATAL] Unhandled rejection:', err);
});
import { astrologyRouter } from './routes/astrology.js';
import { chatRouter } from './routes/chat.js';
import { paymentRouter } from './routes/payment.js';
import { adminRouter } from './routes/admin.js';
import { userRouter } from './routes/user.js';
import { locationsRouter } from './routes/locations.js';
import { healthRouter } from './routes/health.js';
import { errorHandler } from './middleware/errorHandler.js';
import { requestLogger } from './middleware/requestLogger.js';
import { logger } from './lib/logger.js';

const app = express();
const rawPort = parseInt(process.env.PORT || '4000', 10);
const PORT = isNaN(rawPort) || rawPort < 1 ? 4000 : rawPort;

const corsOrigins = (process.env.CORS_ORIGINS || 'http://localhost:5173').split(',').map(s => s.trim());

app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
      styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
      fontSrc: ["'self'", 'data:', 'https://fonts.gstatic.com'],
      imgSrc: ["'self'", 'data:', 'blob:'],
      connectSrc: ["'self'", ...corsOrigins],
      frameSrc: ["'none'"],
      objectSrc: ["'none'"],
    },
  },
}));
app.use(compression());
app.use(cookieParser());
app.use(cors({
  origin: corsOrigins,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
}));

const globalLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: 'Too many requests. Please try again later.' },
});
app.use(globalLimiter);

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: process.env.NODE_ENV === 'production' ? 10 : 50,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: 'Too many login attempts. Try again later.' },
});

app.use(requestLogger);

app.use('/api/health', healthRouter);

app.use('/api/payments/webhook', express.raw({ type: 'application/json' }));
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

app.use('/api/auth', authLimiter, authRouter);

app.use('/api/astrology', astrologyRouter);
app.use('/api/chat', chatRouter);
app.use('/api/payments', paymentRouter);
app.use('/api/admin', adminRouter);
app.use('/api/locations', locationsRouter);
app.use('/api/user', userRouter);

app.use(errorHandler);

app.listen(PORT, '0.0.0.0', () => {
  if (!process.env.JWT_SECRET || process.env.JWT_SECRET === 'dev-secret-change-in-production') {
    logger.warn('⚠️  JWT_SECRET is using a weak default. Set a strong secret in production.');
  }
  if (!process.env.OPENROUTER_API_KEY) {
    logger.warn('⚠️  No OPENROUTER_API_KEY configured. Get one at https://openrouter.ai');
  }
  logger.info(`Soma & Surya API running on port ${PORT}`);
});

export default app;
