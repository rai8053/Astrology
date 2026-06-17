import { Request, Response, NextFunction } from 'express';
import { logger } from '../lib/logger.js';

function sanitizeField(value: string, maxLen = 2000): string {
  return value.replace(/[\x00-\x1f\x7f]/g, '').slice(0, maxLen);
}

export function requestLogger(req: Request, res: Response, next: NextFunction) {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.info({
      method: req.method,
      url: sanitizeField(req.originalUrl),
      status: res.statusCode,
      duration: `${duration}ms`,
      ip: sanitizeField(req.ip || '', 100),
    });
  });
  next();
}
