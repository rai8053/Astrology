import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { AppError } from '../lib/errors.js';

export function errorHandler(err: unknown, req: Request, res: Response, _next: NextFunction) {
  const message = err instanceof Error ? err.message : String(err);
  const stack = err instanceof Error ? err.stack : '';

  console.error('\n=== ERROR HANDLER ===');
  console.error('URL:', req.method, req.originalUrl);
  console.error('Error:', message);
  console.error('Stack:', stack);
  console.error('headersSent:', res.headersSent);
  console.error('======================\n');

  if (res.headersSent) {
    console.error('[ErrorHandler] Headers already sent, cannot send JSON error response');
    return;
  }

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
  } catch (logErr: unknown) {
    console.error('[ErrorHandler] Error classification failed:', logErr);
  }

  try {
    res.status(500).json({ success: false, error: message, code: 'INTERNAL_ERROR' });
  } catch (jsonErr: unknown) {
    console.error('[ErrorHandler] Failed to send JSON response:', jsonErr);
    try {
      res.status(500).end();
    } catch { /* ignore */ }
  }
}
