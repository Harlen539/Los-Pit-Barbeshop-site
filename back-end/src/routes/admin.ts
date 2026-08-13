import { Router } from 'express';
import { z } from 'zod';
import { Prisma, Role } from '@prisma/client';
import { prisma } from '../lib/prisma.js';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { AppError } from '../lib/errors.js';
import { persistAppointment } from '../services/appointments.js';

export const adminRouter = Router();
adminRouter.use(requireAuth, requireRole(Role.ADMIN));

const audit = (actorId: string, action: string, entity: string, entityId?: string, metadata?: object) =>
  prisma.auditLog.create({ data: { actorId, action, entity, ...(entityId ? { entityId } : {}), ...(metadata ? { metadata } : {}) } });

adminRouter.get('/appointments', async (req, res) => {
  const query = z.object({ from: z.string().datetime().optional(), to: z.string().datetime().optional(), professionalId: z.string().optional() }).parse(req.query);
  res.json(await prisma.appointment.findMany({
    where: {
      ...(query.professionalId ? { professionalId: query.professionalId } : {}),
      ...(query.from || query.to ? { startAt: { ...(query.from ? { gte: new Date(query.from) } : {}), ...(query.to ? { lte: new Date(query.to) } : {}) } } : {})
    }, orderBy: { startAt: 'asc' }, include: { professional: true, services: true }
  }));
});

adminRouter.post('/appointments', async (req, res) => {
  const data = z.object({
    professionalId: z.string(), serviceIds: z.array(z.string()).min(1), startAt: z.string().datetime({ offset: true }),
    customerName: z.string().trim().min(3), customerPhone: z.string().regex(/^\d{10,13}$/),
    customerEmail: z.string().email().nullable().optional(), notes: z.string().max(500).nullable().optional(), clientId: z.string().optional()
  }).parse(req.body);
  const appointment = await persistAppointment({ ...data, startAt: new Date(data.startAt) });
  await audit(req.auth!.userId, 'CREATE_APPOINTMENT', 'Appointment', appointment.id);
  res.status(201).json(appointment);
});

adminRouter.patch('/appointments/:id', async (req, res) => {
  const data = z.object({ status: z.enum(['PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED', 'NO_SHOW']), notes: z.string().max(500).optional() }).parse(req.body);
  const updated = await prisma.appointment.update({ where: { id: req.params.id }, data: { status: data.status, ...(data.notes !== undefined ? { notes: data.notes } : {}), ...(data.status === 'CANCELLED' ? { cancelledAt: new Date() } : {}) } });
  await audit(req.auth!.userId, 'UPDATE_APPOINTMENT', 'Appointment', updated.id, { status: data.status });
  res.json(updated);
});

adminRouter.get('/services', async (_req, res) => res.json(await prisma.service.findMany({ orderBy: { sortOrder: 'asc' } })));
adminRouter.post('/services', async (req, res) => {
  const data = z.object({ name: z.string().min(2), slug: z.string().regex(/^[a-z0-9-]+$/), description: z.string().min(3), durationMin: z.number().int().min(5).max(480), priceCents: z.number().int().nonnegative(), active: z.boolean().default(true), featured: z.boolean().default(false) }).parse(req.body);
  const service = await prisma.service.create({ data }); await audit(req.auth!.userId, 'CREATE_SERVICE', 'Service', service.id); res.status(201).json(service);
});
adminRouter.patch('/services/:id', async (req, res) => {
  const data = z.object({ name: z.string().min(2).optional(), description: z.string().min(3).optional(), durationMin: z.number().int().min(5).max(480).optional(), priceCents: z.number().int().nonnegative().optional(), active: z.boolean().optional(), featured: z.boolean().optional() }).parse(req.body);
  const service = await prisma.service.update({ where: { id: req.params.id }, data }); await audit(req.auth!.userId, 'UPDATE_SERVICE', 'Service', service.id, data); res.json(service);
});

adminRouter.get('/professionals', async (_req, res) => res.json(await prisma.professional.findMany({ include: { services: true, schedules: true, breaks: true } })));
adminRouter.post('/professionals', async (req, res) => {
  const data = z.object({ name: z.string().min(2), slug: z.string().regex(/^[a-z0-9-]+$/), bio: z.string().max(500).optional(), specialty: z.string().max(120).optional(), photoUrl: z.string().optional(), whatsappNumber: z.string().regex(/^\d{12,13}$/).optional(), serviceIds: z.array(z.string()).default([]) }).parse(req.body);
  const professional = await prisma.professional.create({ data: { name: data.name, slug: data.slug, bio: data.bio, specialty: data.specialty, photoUrl: data.photoUrl, whatsappNumber: data.whatsappNumber, services: { create: data.serviceIds.map((serviceId) => ({ serviceId })) } } });
  await audit(req.auth!.userId, 'CREATE_PROFESSIONAL', 'Professional', professional.id); res.status(201).json(professional);
});
adminRouter.patch('/professionals/:id', async (req, res) => {
  const data = z.object({ name: z.string().min(2).optional(), bio: z.string().max(500).nullable().optional(), specialty: z.string().max(120).nullable().optional(), photoUrl: z.string().nullable().optional(), whatsappNumber: z.string().regex(/^\d{12,13}$/).nullable().optional(), active: z.boolean().optional(), bufferMinutes: z.number().int().min(0).max(120).optional() }).parse(req.body);
  const professional = await prisma.professional.update({ where: { id: req.params.id }, data }); await audit(req.auth!.userId, 'UPDATE_PROFESSIONAL', 'Professional', professional.id, data); res.json(professional);
});

adminRouter.put('/professionals/:id/availability', async (req, res) => {
  const professionalId = z.string().parse(req.params.id);
  const data = z.object({
    bufferMinutes: z.number().int().min(0).max(120).default(0),
    serviceIds: z.array(z.string()).default([]),
    schedules: z.array(z.object({ weekday: z.number().int().min(0).max(6), startMinute: z.number().int().min(0).max(1439), endMinute: z.number().int().min(1).max(1440) }).refine((item) => item.endMinute > item.startMinute)).default([]),
    breaks: z.array(z.object({ weekday: z.number().int().min(0).max(6), startMinute: z.number().int().min(0).max(1439), endMinute: z.number().int().min(1).max(1440) }).refine((item) => item.endMinute > item.startMinute)).default([])
  }).parse(req.body);
  await prisma.$transaction([
    prisma.professionalSchedule.deleteMany({ where: { professionalId } }),
    prisma.professionalBreak.deleteMany({ where: { professionalId } }),
    prisma.professionalService.deleteMany({ where: { professionalId } }),
    prisma.professional.update({ where: { id: professionalId }, data: { bufferMinutes: data.bufferMinutes } }),
    prisma.professionalSchedule.createMany({ data: data.schedules.map((item) => ({ professionalId, ...item })) }),
    prisma.professionalBreak.createMany({ data: data.breaks.map((item) => ({ professionalId, ...item })) }),
    prisma.professionalService.createMany({ data: data.serviceIds.map((serviceId) => ({ professionalId, serviceId })) })
  ]);
  await audit(req.auth!.userId, 'UPDATE_PROFESSIONAL_AVAILABILITY', 'Professional', professionalId);
  res.json({ message: 'Disponibilidade atualizada.' });
});

adminRouter.post('/blocked-periods', async (req, res) => {
  const data = z.object({ professionalId: z.string(), startAt: z.string().datetime(), endAt: z.string().datetime(), reason: z.string().max(200).optional() }).refine((v) => new Date(v.endAt) > new Date(v.startAt), { message: 'O fim deve ser posterior ao início.' }).parse(req.body);
  const block = await prisma.blockedPeriod.create({ data: { professionalId: data.professionalId, startAt: new Date(data.startAt), endAt: new Date(data.endAt), reason: data.reason } });
  await audit(req.auth!.userId, 'CREATE_BLOCK', 'BlockedPeriod', block.id); res.status(201).json(block);
});
adminRouter.delete('/blocked-periods/:id', async (req, res) => {
  const existing = await prisma.blockedPeriod.findUnique({ where: { id: req.params.id } }); if (!existing) throw new AppError(404, 'Bloqueio não encontrado.');
  await prisma.blockedPeriod.delete({ where: { id: existing.id } }); await audit(req.auth!.userId, 'DELETE_BLOCK', 'BlockedPeriod', existing.id); res.status(204).send();
});

adminRouter.get('/clients', async (_req, res) => res.json(await prisma.user.findMany({ where: { role: Role.CLIENT }, select: { id: true, name: true, email: true, phone: true, active: true, createdAt: true } })));
adminRouter.get('/gallery', async (_req, res) => res.json(await prisma.galleryImage.findMany({ orderBy: { sortOrder: 'asc' } })));
adminRouter.post('/gallery', async (req, res) => {
  const data = z.object({ url: z.string().min(1), alt: z.string().min(3), category: z.string().optional(), sortOrder: z.number().int().default(0), active: z.boolean().default(true) }).parse(req.body);
  const item = await prisma.galleryImage.create({ data }); await audit(req.auth!.userId, 'CREATE_GALLERY_IMAGE', 'GalleryImage', item.id); res.status(201).json(item);
});
adminRouter.patch('/gallery/:id', async (req, res) => {
  const data = z.object({ alt: z.string().min(3).optional(), category: z.string().nullable().optional(), sortOrder: z.number().int().optional(), active: z.boolean().optional() }).parse(req.body);
  const item = await prisma.galleryImage.update({ where: { id: z.string().parse(req.params.id) }, data });
  await audit(req.auth!.userId, 'UPDATE_GALLERY_IMAGE', 'GalleryImage', item.id, data);
  res.json(item);
});
adminRouter.patch('/settings', async (req, res) => {
  const data = z.object({ name: z.string().min(2).optional(), address: z.string().nullable().optional(), phone: z.string().nullable().optional(), email: z.string().email().nullable().optional(), instagram: z.string().nullable().optional(), openingHours: z.record(z.string(), z.unknown()).nullable().optional(), cancellationHours: z.number().int().min(0).optional(), minimumNoticeMin: z.number().int().min(0).optional(), maximumAdvanceDays: z.number().int().min(1).max(365).optional(), timezone: z.string().optional() }).parse(req.body);
  const { openingHours, ...rest } = data;
  const prismaData = { ...rest, ...(openingHours !== undefined ? { openingHours: openingHours === null ? Prisma.JsonNull : openingHours as Prisma.InputJsonValue } : {}) };
  const settings = await prisma.businessSetting.upsert({ where: { id: 'default' }, create: { id: 'default', ...prismaData }, update: prismaData }); await audit(req.auth!.userId, 'UPDATE_SETTINGS', 'BusinessSetting', 'default', data); res.json(settings);
});
