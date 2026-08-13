import type { NextFunction, Request, Response } from 'express';
import { env } from '../config/env.js';
import { AppError } from '../lib/errors.js';

export const verifyOrigin = (req: Request, _res: Response, next: NextFunction) => {
  if (!['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method)) return next();
  const origin = req.get('origin');
  if (origin && origin !== env.FRONTEND_URL) return next(new AppError(403, 'Origem da solicitação não permitida.', 'INVALID_ORIGIN'));
  next();
};
