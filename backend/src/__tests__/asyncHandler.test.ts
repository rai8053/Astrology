import { describe, it, expect, vi } from 'vitest';
import { asyncHandler } from '../lib/asyncHandler.js';
import type { Request, Response, NextFunction } from 'express';

describe('asyncHandler', () => {
  it('calls next with error when handler rejects', async () => {
    const error = new Error('async error');
    const handler = asyncHandler(async () => { throw error; });
    const next = vi.fn() as NextFunction;
    await handler({} as Request, {} as Response, next);
    expect(next).toHaveBeenCalledWith(error);
  });

  it('does not call next when handler succeeds', async () => {
    const handler = asyncHandler(async () => 'ok');
    const next = vi.fn() as NextFunction;
    await handler({} as Request, {} as Response, next);
    expect(next).not.toHaveBeenCalled();
  });
});
