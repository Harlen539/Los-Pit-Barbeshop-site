import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { z } from 'zod';
import { prisma } from '../lib/prisma.js';
import { getAvailability } from '../services/availability.js';

export const publicRouter = Router();

publicRouter.get('/services', async (_req, res) => {
  const services = await prisma.service.findMany({ where: { active: true }, orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }] });
  res.json(services);
});

publicRouter.get('/professionals', async (_req, res) => {
  const professionals = await prisma.professional.findMany({
    where: { active: true }, orderBy: { name: 'asc' },
    include: { services: { include: { service: { select: { id: true, name: true } } } } }
  });
  res.json(professionals.map((professional) => ({ ...professional, services: professional.services.map((item) => item.service) })));
});

publicRouter.get('/professionals/:id', async (req, res) => {
  const professional = await prisma.professional.findFirst({ where: { id: req.params.id, active: true }, include: { services: { include: { service: true } } } });
  if (!professional) return res.status(404).json({ error: 'Profissional não encontrado.' });
  res.json(professional);
});

publicRouter.get('/gallery', async (_req, res) => {
  res.json(await prisma.galleryImage.findMany({ where: { active: true }, orderBy: { sortOrder: 'asc' } }));
});

publicRouter.get('/settings', async (_req, res) => {
  const settings = await prisma.businessSetting.findUnique({ where: { id: 'default' } });
  res.json(settings ?? { name: 'Los Pit Barber Shop', timezone: process.env.APP_TIMEZONE ?? 'America/Fortaleza' });
});

publicRouter.get('/availability', rateLimit({ windowMs: 60_000, limit: 90 }), async (req, res) => {
  const query = z.object({
    date: z.string().date(),
    serviceIds: z.string().transform((value) => [...new Set(value.split(',').filter(Boolean))]).pipe(z.array(z.string()).min(1)),
    professionalId: z.string().optional()
  }).parse(req.query);
  res.json(await getAvailability(query));
});
