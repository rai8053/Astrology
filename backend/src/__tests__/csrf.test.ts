import { describe, it, expect, vi } from 'vitest';
import type { Request, Response, NextFunction } from 'express';
import { csrfProtection, generateCsrfToken } from '../middleware/csrf.js';

vi.mock('../lib/logger.js', () => ({
  logger: { info: vi.fn(), warn: vi.fn(), error: vi.fn() },
}));

describe('CSRF Middleware', () => {
  it('should skip protection for GET requests', () => {
    const req = { method: 'GET' } as Request;
    const next = vi.fn() as NextFunction;
    csrfProtection(req, {} as Response, next);
    expect(next).toHaveBeenCalled();
  });

  it('should skip protection for HEAD requests', () => {
    const req = { method: 'HEAD' } as Request;
    const next = vi.fn() as NextFunction;
    csrfProtection(req, {} as Response, next);
    expect(next).toHaveBeenCalled();
  });

  it('should skip protection for OPTIONS requests', () => {
    const req = { method: 'OPTIONS' } as Request;
    const next = vi.fn() as NextFunction;
    csrfProtection(req, {} as Response, next);
    expect(next).toHaveBeenCalled();
  });

  it('should reject POST without CSRF cookie', () => {
    const req = { method: 'POST', headers: {}, cookies: {} } as unknown as Request;
    const res = { status: vi.fn().mockReturnThis(), json: vi.fn() } as unknown as Response;
    const next = vi.fn() as NextFunction;
    csrfProtection(req, res, next);
    expect(res.status).toHaveBeenCalledWith(403);
    expect(next).not.toHaveBeenCalled();
  });

  it('should reject POST without CSRF header', () => {
    const req = { method: 'POST', headers: {}, cookies: { 'csrf-token': 'valid-token' } } as unknown as Request;
    const res = { status: vi.fn().mockReturnThis(), json: vi.fn() } as unknown as Response;
    const next = vi.fn() as NextFunction;
    csrfProtection(req, res, next);
    expect(res.status).toHaveBeenCalledWith(403);
  });

  it('should reject POST with mismatched tokens', () => {
    const req = { method: 'POST', headers: { 'x-csrf-token': 'wrong' }, cookies: { 'csrf-token': 'valid-token' } } as unknown as Request;
    const res = { status: vi.fn().mockReturnThis(), json: vi.fn() } as unknown as Response;
    const next = vi.fn() as NextFunction;
    csrfProtection(req, res, next);
    expect(res.status).toHaveBeenCalledWith(403);
  });

  it('should accept POST with matching tokens', () => {
    const req = { method: 'POST', headers: { 'x-csrf-token': 'match-token' }, cookies: { 'csrf-token': 'match-token' } } as unknown as Request;
    const res = {} as Response;
    const next = vi.fn() as NextFunction;
    csrfProtection(req, res, next);
    expect(next).toHaveBeenCalled();
  });

  it('generateCsrfToken should set cookie and return string', () => {
    const res = { cookie: vi.fn() } as unknown as Response;
    const token = generateCsrfToken(res);
    expect(token).toBeDefined();
    expect(typeof token).toBe('string');
    expect(token.length).toBe(64);
    expect(res.cookie).toHaveBeenCalled();
  });
});
