import { Request, Response, NextFunction } from 'express';
import { logger } from '../lib/logger.js';

function sanitizeUrl(url: string): string {
  return url.replace(/[\x00-\x1f\x7f]/g, '').slice(0, 2000);
}

export function requestLogger(req: Request, res: Response, next: NextFunction) {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.info({
      method: req.method,
      url: sanitizeUrl(req.originalUrl),
      status: res.statusCode,
      duration: `${duration}ms`,
      ip: req.ip,
    });
  });
  next();
}
