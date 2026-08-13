import { Router } from 'express';
import argon2 from 'argon2';
import { z } from 'zod';
import { prisma } from '../lib/prisma.js';
import { AppError } from '../lib/errors.js';
import { requireAuth } from '../middleware/auth.js';

export const accountRouter = Router();
accountRouter.use(requireAuth);

accountRouter.patch('/profile', async (req, res) => {
  const data = z.object({ name: z.string().trim().min(3).max(120), phone: z.string().regex(/^\d{10,13}$/), birthDate: z.string().date().nullable().optional() }).parse(req.body);
  const user = await prisma.user.update({ where: { id: req.auth!.userId }, data: { name: data.name, phone: data.phone, birthDate: data.birthDate ? new Date(`${data.birthDate}T12:00:00Z`) : null } });
  res.json({ id: user.id, name: user.name, email: user.email, phone: user.phone, birthDate: user.birthDate, role: user.role });
});

accountRouter.patch('/password', async (req, res) => {
  const data = z.object({ currentPassword: z.string().min(1), newPassword: z.string().min(8).max(128) }).parse(req.body);
  const user = await prisma.user.findUnique({ where: { id: req.auth!.userId } });
  if (!user || !(await argon2.verify(user.passwordHash, data.currentPassword))) throw new AppError(422, 'A senha atual está incorreta.', 'INVALID_PASSWORD');
  await prisma.$transaction([
    prisma.user.update({ where: { id: user.id }, data: { passwordHash: await argon2.hash(data.newPassword, { type: argon2.argon2id }) } }),
    prisma.refreshToken.updateMany({ where: { userId: user.id, revokedAt: null }, data: { revokedAt: new Date() } })
  ]);
  res.json({ message: 'Senha alterada. Entre novamente nos seus dispositivos.' });
});

accountRouter.delete('/sessions', async (req, res) => {
  await prisma.refreshToken.updateMany({ where: { userId: req.auth!.userId, revokedAt: null }, data: { revokedAt: new Date() } });
  res.status(204).send();
});

accountRouter.delete('/', async (req, res) => {
  const future = await prisma.appointment.count({ where: { clientId: req.auth!.userId, startAt: { gt: new Date() }, status: { in: ['PENDING', 'CONFIRMED'] } } });
  if (future) throw new AppError(422, 'Cancele seus próximos agendamentos antes de excluir a conta.', 'ACTIVE_APPOINTMENTS');
  await prisma.user.update({ where: { id: req.auth!.userId }, data: { active: false, name: 'Conta removida', email: `deleted-${req.auth!.userId}@invalid.local`, phone: null } });
  res.status(204).send();
});
