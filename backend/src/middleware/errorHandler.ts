import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { AppError } from '../lib/errors.js';

export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  const message = err instanceof Error ? err.message : String(err);

  try {
    if (err instanceof ZodError) {
      const msg = err.errors.map(e => `${e.path.join('.')}: ${e.message}`).join('; ');
      res.status(400).json({ success: false, error: msg, code: 'VALIDATION_ERROR' });
      return;
    }

    if (err instanceof AppError) {
      res.status(err.statusCode).json({ success: false, error: err.message, code: err.code });
      return;
    }

    if (err instanceof SyntaxError && 'body' in err) {
      res.status(400).json({ success: false, error: 'Invalid JSON in request body', code: 'INVALID_JSON' });
      return;
    }

    console.error('[ErrorHandler] Unhandled:', message);
  } catch (logErr) {
    console.error('[ErrorHandler] Logger failed:', logErr);
  }

  try {
    res.status(500).json({ success: false, error: message, code: 'INTERNAL_ERROR' });
  } catch {
    res.status(500).end();
  }
}
