import { describe, it, expect, vi } from 'vitest';
import { z } from 'zod';
import { validate } from '../middleware/validate.js';
import type { Request, Response, NextFunction } from 'express';

describe('validate middleware', () => {
  const schema = z.object({ name: z.string().min(2), age: z.number().min(0) });

  it('passes valid body data', () => {
    const req = { body: { name: 'Test', age: 25 } } as Request;
    const next = vi.fn() as NextFunction;
    validate(schema)(req, {} as Response, next);
    expect(next).toHaveBeenCalled();
    expect(req.body).toEqual({ name: 'Test', age: 25 });
  });

  it('throws on invalid body data', () => {
    const req = { body: { name: 'A', age: -1 } } as Request;
    const next = vi.fn() as NextFunction;
    expect(() => validate(schema)(req, {} as Response, next)).toThrow();
    expect(next).not.toHaveBeenCalled();
  });

  it('validates query params when source is query', () => {
    const req = { query: { name: 'Test', age: '25' } } as unknown as Request;
    const next = vi.fn() as NextFunction;
    expect(() => validate(schema, 'query')(req, {} as Response, next)).toThrow();
    expect(next).not.toHaveBeenCalled();
  });
});
