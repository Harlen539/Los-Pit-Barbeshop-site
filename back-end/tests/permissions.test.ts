import { beforeAll, describe, expect, it, vi } from 'vitest';
import { Role } from '@prisma/client';
import type { NextFunction, Request, Response } from 'express';
import { AppError } from '../src/lib/errors.js';

describe('permissões administrativas', () => {
  beforeAll(() => {
    process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test';
    process.env.JWT_ACCESS_SECRET = 'access-secret-with-more-than-thirty-two-characters';
    process.env.JWT_REFRESH_SECRET = 'refresh-secret-with-more-than-thirty-two-characters';
  });
  it('nega um cliente e aceita um administrador', async () => {
    const { requireRole } = await import('../src/middleware/auth.js');
    const middleware = requireRole(Role.ADMIN);
    const nextClient = vi.fn() as unknown as NextFunction;
    middleware({ auth: { userId: 'client', role: Role.CLIENT } } as Request, {} as Response, nextClient);
    expect((nextClient as unknown as ReturnType<typeof vi.fn>).mock.calls[0]?.[0]).toBeInstanceOf(AppError);
    const nextAdmin = vi.fn() as unknown as NextFunction;
    middleware({ auth: { userId: 'admin', role: Role.ADMIN } } as Request, {} as Response, nextAdmin);
    expect((nextAdmin as unknown as ReturnType<typeof vi.fn>)).toHaveBeenCalledWith();
  });
});
