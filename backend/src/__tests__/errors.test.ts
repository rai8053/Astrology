import { describe, it, expect } from 'vitest';
import { AppError, NotFoundError, UnauthorizedError, ForbiddenError, ValidationError, ConflictError } from '../lib/errors.js';

describe('AppError', () => {
  it('creates error with status and message', () => {
    const err = new AppError(418, 'test error', 'TEAPOT');
    expect(err).toBeInstanceOf(Error);
    expect(err.statusCode).toBe(418);
    expect(err.message).toBe('test error');
    expect(err.code).toBe('TEAPOT');
    expect(err.name).toBe('AppError');
  });
});

describe('NotFoundError', () => {
  it('creates 404 error with resource name', () => {
    const err = new NotFoundError('User');
    expect(err.statusCode).toBe(404);
    expect(err.message).toBe('User not found');
    expect(err.code).toBe('NOT_FOUND');
  });
});

describe('UnauthorizedError', () => {
  it('creates 401 error with default message', () => {
    const err = new UnauthorizedError();
    expect(err.statusCode).toBe(401);
    expect(err.message).toBe('Unauthorized');
    expect(err.code).toBe('UNAUTHORIZED');
  });

  it('creates 401 error with custom message', () => {
    const err = new UnauthorizedError('Invalid token');
    expect(err.message).toBe('Invalid token');
  });
});

describe('ForbiddenError', () => {
  it('creates 403 error', () => {
    const err = new ForbiddenError();
    expect(err.statusCode).toBe(403);
    expect(err.code).toBe('FORBIDDEN');
  });
});

describe('ValidationError', () => {
  it('creates 400 error', () => {
    const err = new ValidationError('Invalid input');
    expect(err.statusCode).toBe(400);
    expect(err.code).toBe('VALIDATION_ERROR');
  });
});

describe('ConflictError', () => {
  it('creates 409 error', () => {
    const err = new ConflictError('Duplicate entry');
    expect(err.statusCode).toBe(409);
    expect(err.code).toBe('CONFLICT');
  });
});
