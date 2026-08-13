import { randomBytes } from 'node:crypto';
import { Router } from 'express';
import type { Response } from 'express';
import type { Role } from '@prisma/client';
import rateLimit from 'express-rate-limit';
import argon2 from 'argon2';
import { z } from 'zod';
import { prisma } from '../lib/prisma.js';
import { AppError } from '../lib/errors.js';
import { createAccessToken, createRefreshToken, hashToken, verifyRefreshToken } from '../services/tokens.js';
import { env } from '../config/env.js';
import { requireAuth } from '../middleware/auth.js';
import { hashPassword, loginSchema, registerSchema, verifyPassword } from '../domain/auth.js';

export const authRouter = Router();
const limiterOptions = {
  windowMs: 15 * 60_000,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req: unknown, res: Response) => res.status(429).json({
    error: 'Muitas tentativas. Aguarde alguns minutos e tente novamente.',
    code: 'TOO_MANY_ATTEMPTS'
  })
};
const loginLimiter = rateLimit({ ...limiterOptions, limit: 20, skipSuccessfulRequests: true });
const registerLimiter = rateLimit({ ...limiterOptions, limit: 20 });
const refreshLimiter = rateLimit({ ...limiterOptions, limit: 180 });
const recoveryLimiter = rateLimit({ ...limiterOptions, limit: 10 });
const cookieOptions = {
  httpOnly: true,
  secure: env.NODE_ENV === 'production',
  sameSite: 'strict' as const,
  path: '/api/auth',
  maxAge: 30 * 24 * 60 * 60_000
};

const publicUser = (user: { id: string; name: string; email: string; phone: string | null; birthDate: Date | null; role: string }) => ({
  id: user.id, name: user.name, email: user.email, phone: user.phone, birthDate: user.birthDate, role: user.role
});

const issueSession = async (res: Response, user: { id: string; role: Role }) => {
  const refreshToken = createRefreshToken(user.id);
  await prisma.refreshToken.create({ data: { tokenHash: hashToken(refreshToken), userId: user.id, expiresAt: new Date(Date.now() + cookieOptions.maxAge) } });
  res.cookie('los_pit_refresh', refreshToken, cookieOptions);
  return createAccessToken(user.id, user.role);
};

authRouter.post('/register', registerLimiter, async (req, res) => {
  const data = registerSchema.parse(req.body);
  const passwordHash = await hashPassword(data.password);
  const session = await prisma.$transaction(async (tx) => {
    const user = await tx.user.create({ data: { name: data.name, email: data.email, phone: data.phone, passwordHash, ...(data.birthDate ? { birthDate: new Date(`${data.birthDate}T12:00:00Z`) } : {}) } });
    const refreshToken = createRefreshToken(user.id);
    await tx.refreshToken.create({ data: { tokenHash: hashToken(refreshToken), userId: user.id, expiresAt: new Date(Date.now() + cookieOptions.maxAge) } });
    return { user, refreshToken, accessToken: createAccessToken(user.id, user.role) };
  });
  res.cookie('los_pit_refresh', session.refreshToken, cookieOptions);
  const { user, accessToken } = session;
  res.status(201).json({ accessToken, user: publicUser(user) });
});

authRouter.post('/login', loginLimiter, async (req, res) => {
  const data = loginSchema.parse(req.body);
  const user = await prisma.user.findUnique({ where: { email: data.email } });
  if (!user || !user.active || !(await verifyPassword(user.passwordHash, data.password))) throw new AppError(401, 'E-mail ou senha incorretos.', 'INVALID_CREDENTIALS');
  const accessToken = await issueSession(res, user);
  res.json({ accessToken, user: publicUser(user) });
});

authRouter.post('/refresh', refreshLimiter, async (req, res) => {
  const token = req.cookies.los_pit_refresh as string | undefined;
  if (!token) throw new AppError(401, 'Sessão não encontrada.', 'NO_REFRESH_TOKEN');
  let payload: ReturnType<typeof verifyRefreshToken>;
  try { payload = verifyRefreshToken(token); } catch { throw new AppError(401, 'Sessão inválida.', 'INVALID_REFRESH_TOKEN'); }
  const record = await prisma.refreshToken.findUnique({ where: { tokenHash: hashToken(token) }, include: { user: true } });
  if (!record || record.revokedAt || record.expiresAt <= new Date() || !record.user.active || payload.type !== 'refresh') {
    throw new AppError(401, 'Sessão inválida.', 'INVALID_REFRESH_TOKEN');
  }
  await prisma.refreshToken.update({ where: { id: record.id }, data: { revokedAt: new Date() } });
  const accessToken = await issueSession(res, record.user);
  res.json({ accessToken, user: publicUser(record.user) });
});

authRouter.post('/logout', async (req, res) => {
  const token = req.cookies.los_pit_refresh as string | undefined;
  if (token) await prisma.refreshToken.updateMany({ where: { tokenHash: hashToken(token), revokedAt: null }, data: { revokedAt: new Date() } });
  res.clearCookie('los_pit_refresh', cookieOptions);
  res.status(204).send();
});

authRouter.post('/forgot-password', recoveryLimiter, async (req, res) => {
  const { email } = z.object({ email: z.string().trim().toLowerCase().email() }).parse(req.body);
  const user = await prisma.user.findUnique({ where: { email } });
  if (user) {
    const token = randomBytes(32).toString('hex');
    await prisma.passwordResetToken.create({ data: { tokenHash: hashToken(token), userId: user.id, expiresAt: new Date(Date.now() + 30 * 60_000) } });
    // Intentionally never return the token. Connect an email provider in production.
  }
  res.json({ message: 'Se o e-mail estiver cadastrado, enviaremos as instruções.' });
});

authRouter.post('/reset-password', recoveryLimiter, async (req, res) => {
  const data = z.object({ token: z.string().min(32), password: z.string().min(8).max(128) }).parse(req.body);
  const reset = await prisma.passwordResetToken.findUnique({ where: { tokenHash: hashToken(data.token) } });
  if (!reset || reset.usedAt || reset.expiresAt <= new Date()) throw new AppError(422, 'O link é inválido ou expirou.', 'INVALID_RESET_TOKEN');
  const passwordHash = await argon2.hash(data.password, { type: argon2.argon2id });
  await prisma.$transaction([
    prisma.user.update({ where: { id: reset.userId }, data: { passwordHash } }),
    prisma.passwordResetToken.update({ where: { id: reset.id }, data: { usedAt: new Date() } }),
    prisma.refreshToken.updateMany({ where: { userId: reset.userId, revokedAt: null }, data: { revokedAt: new Date() } })
  ]);
  res.json({ message: 'Senha alterada com sucesso.' });
});

authRouter.get('/me', requireAuth, async (req, res) => {
  const user = await prisma.user.findUnique({ where: { id: req.auth!.userId } });
  if (!user) throw new AppError(404, 'Usuário não encontrado.', 'NOT_FOUND');
  res.json(publicUser(user));
});
