import type { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import type { Role } from '@prisma/client';
import { env } from '../config/env.js';
import { AppError } from '../lib/errors.js';

interface AccessPayload { sub: string; role: Role; type: 'access' }

export const requireAuth = (req: Request, _res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.replace(/^Bearer\s+/i, '');
  if (!token) return next(new AppError(401, 'Faça login para continuar.', 'UNAUTHORIZED'));
  try {
    const payload = jwt.verify(token, env.JWT_ACCESS_SECRET) as AccessPayload;
    if (payload.type !== 'access') throw new Error('invalid token type');
    req.auth = { userId: payload.sub, role: payload.role };
    next();
  } catch {
    next(new AppError(401, 'Sua sessão expirou. Entre novamente.', 'INVALID_TOKEN'));
  }
};

export const optionalAuth = (req: Request, _res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.replace(/^Bearer\s+/i, '');
  if (!token) return next();
  try {
    const payload = jwt.verify(token, env.JWT_ACCESS_SECRET) as AccessPayload;
    if (payload.type !== 'access') throw new Error('invalid token type');
    req.auth = { userId: payload.sub, role: payload.role };
    next();
  } catch {
    next(new AppError(401, 'Sua sessão expirou. Entre novamente.', 'INVALID_TOKEN'));
  }
};

export const requireRole = (...roles: Role[]) => (req: Request, _res: Response, next: NextFunction) => {
  if (!req.auth || !roles.includes(req.auth.role)) return next(new AppError(403, 'Você não tem permissão para esta ação.', 'FORBIDDEN'));
  next();
};
