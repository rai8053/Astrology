import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import { logger } from '../lib/logger.js';

const CSRF_COOKIE = 'csrf-token';
const SAME_SITE = process.env.CROSS_ORIGIN_DEPLOY === 'true' ? 'none' : 'lax' as 'none' | 'lax';

export function generateCsrfToken(res: Response): string {
  const token = crypto.randomBytes(32).toString('hex');
  res.cookie(CSRF_COOKIE, token, {
    httpOnly: false,
    secure: process.env.NODE_ENV === 'production',
    sameSite: SAME_SITE,
    path: '/',
    maxAge: 24 * 60 * 60 * 1000,
  });
  return token;
}

export function csrfProtection(req: Request, res: Response, next: NextFunction) {
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    return next();
  }

  const csrfCookie = req.cookies?.[CSRF_COOKIE];
  const csrfHeader = req.headers['x-csrf-token'];

  if (!csrfCookie || !csrfHeader || csrfCookie !== csrfHeader) {
    logger.warn({ ip: req.ip }, 'CSRF validation failed');
    res.status(403).json({ success: false, error: 'Invalid CSRF token', code: 'CSRF_ERROR' });
    return;
  }

  next();
}
