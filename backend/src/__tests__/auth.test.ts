import { describe, it, expect, vi, beforeEach } from 'vitest';
import jwt from 'jsonwebtoken';
import type { Request, Response, NextFunction } from 'express';

vi.mock('../lib/prisma.js', () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
    },
  },
}));

vi.mock('../lib/logger.js', () => ({
  logger: { info: vi.fn(), warn: vi.fn(), error: vi.fn() },
}));

type AuthModule = typeof import('../middleware/auth.js');

describe('Auth Middleware', () => {
  let auth: AuthModule;

  beforeEach(async () => {
    vi.clearAllMocks();
    process.env.JWT_SECRET = 'test-jwt-secret-for-testing';
    // Dynamic import after env var is set
    auth = await import('../middleware/auth.js');
  });

  it('should throw UnauthorizedError without Authorization header', () => {
    const req = { headers: {} } as Request;
    const next = vi.fn() as NextFunction;
    expect(() => auth.authenticate(req, {} as Response, next)).toThrow('No token provided');
    expect(next).not.toHaveBeenCalled();
  });

  it('should throw UnauthorizedError with invalid token format', () => {
    const req = { headers: { authorization: 'InvalidFormat' } } as Request;
    const next = vi.fn() as NextFunction;
    expect(() => auth.authenticate(req, {} as Response, next)).toThrow('No token provided');
  });

  it('should throw with malformed token', () => {
    const req = { headers: { authorization: 'Bearer malformed-token' } } as Request;
    const next = vi.fn() as NextFunction;
    expect(() => auth.authenticate(req, {} as Response, next)).toThrow('Invalid or expired token');
  });

  it('should accept valid token and set req.user', () => {
    const token = jwt.sign({ userId: 'user-1', email: 'test@test.com', role: 'USER' }, process.env.JWT_SECRET!, { expiresIn: '5m' });
    const req = { headers: { authorization: `Bearer ${token}` } } as Request;
    const next = vi.fn() as NextFunction;
    auth.authenticate(req, {} as Response, next);
    expect(next).toHaveBeenCalledWith();
    expect((req as any).user).toBeDefined();
    expect((req as any).user.userId).toBe('user-1');
  });

  it('should reject expired token', async () => {
    const token = jwt.sign({ userId: 'user-1', email: 'test@test.com', role: 'USER' }, process.env.JWT_SECRET!, { expiresIn: '0s' });
    await new Promise(r => setTimeout(r, 100));
    const req = { headers: { authorization: `Bearer ${token}` } } as Request;
    const next = vi.fn() as NextFunction;
    expect(() => auth.authenticate(req, {} as Response, next)).toThrow('Invalid or expired token');
  });

  it('optionalAuth should not reject when no token provided', () => {
    const req = { headers: {} } as Request;
    const next = vi.fn() as NextFunction;
    auth.optionalAuth(req, {} as Response, next);
    expect(next).toHaveBeenCalled();
    expect((req as any).user).toBeUndefined();
  });
});
