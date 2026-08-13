import type { NextFunction, Request, Response } from 'express';
import { Prisma } from '@prisma/client';
import { ZodError } from 'zod';
import { AppError } from '../lib/errors.js';

export const notFound = (_req: Request, _res: Response, next: NextFunction) => next(new AppError(404, 'Rota não encontrada.', 'NOT_FOUND'));

export const errorHandler = (error: unknown, _req: Request, res: Response, _next: NextFunction) => {
  void _next;
  if (error instanceof ZodError) return res.status(422).json({ error: 'Confira os dados informados.', code: 'VALIDATION_ERROR', fields: error.flatten() });
  if (error instanceof AppError) return res.status(error.status).json({ error: error.message, code: error.code, details: error.details });
  if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
    const target = JSON.stringify(error.meta?.target || '').toLowerCase();
    if (target.includes('email')) return res.status(409).json({ error: 'Este e-mail já está cadastrado. Entre com sua conta ou use outro e-mail.', code: 'EMAIL_ALREADY_REGISTERED' });
    return res.status(409).json({ error: 'Este registro já existe.', code: 'CONFLICT' });
  }
  if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2034') return res.status(409).json({ error: 'O horário acabou de ser reservado. Escolha outro.', code: 'SLOT_TAKEN' });
  return res.status(500).json({ error: 'Não foi possível concluir a solicitação.', code: 'INTERNAL_ERROR' });
};
