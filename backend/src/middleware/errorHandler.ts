import * as Sentry from '@sentry/node';
import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { AppError } from '../lib/errors.js';
import { logger } from '../lib/logger.js';

function sanitizeUrl(url: string): string {
  return url.replace(/[\x00-\x1f\x7f]/g, '').slice(0, 2000);
}

export function errorHandler(err: unknown, req: Request, res: Response, _next: NextFunction) {
  if (res.headersSent) {
    return;
  }

  const safeUrl = sanitizeUrl(req.originalUrl);

  try {
    if (err instanceof ZodError) {
      const msg = err.errors.map(e => `${e.path.join('.')}: ${e.message}`).join('; ');
      logger.warn({ errors: err.errors, method: req.method, url: safeUrl }, 'Validation error');
      res.status(400).json({ success: false, error: msg, code: 'VALIDATION_ERROR' });
      return;
    }

    if (err instanceof AppError) {
      logger.warn({ statusCode: err.statusCode, code: err.code, method: req.method, url: safeUrl }, 'Application error');
      res.status(err.statusCode).json({ success: false, error: err.message, code: err.code });
      return;
    }

    if (err instanceof SyntaxError && 'body' in err) {
      logger.warn({ method: req.method, url: safeUrl }, 'Invalid JSON body');
      res.status(400).json({ success: false, error: 'Invalid JSON in request body', code: 'INVALID_JSON' });
      return;
    }
  } catch (logErr: unknown) {
    logger.error({ err: logErr }, 'Error classification failed');
  }

  try {
    Sentry.captureException(err, { extra: { method: req.method, url: safeUrl } });
    logger.error({ err, method: req.method, url: safeUrl }, 'Internal server error');
    res.status(500).json({ success: false, error: 'An unexpected error occurred', code: 'INTERNAL_ERROR' });
  } catch (jsonErr: unknown) {
    logger.error({ err: jsonErr }, 'Failed to send JSON error response');
    try {
      res.status(500).end();
    } catch { /* ignore */ }
  }
}
