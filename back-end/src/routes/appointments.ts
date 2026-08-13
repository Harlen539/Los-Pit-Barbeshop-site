import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { z } from 'zod';
import { prisma } from '../lib/prisma.js';
import { AppError } from '../lib/errors.js';
import { formatWhatsAppCancellationMessage, formatWhatsAppMessage } from '../domain/booking.js';
import { env } from '../config/env.js';
import { optionalAuth, requireAuth } from '../middleware/auth.js';
import { persistAppointment } from '../services/appointments.js';

export const appointmentsRouter = Router();
const createLimiter = rateLimit({ windowMs: 15 * 60_000, limit: 12, standardHeaders: true, legacyHeaders: false });

const createSchema = z.object({
  professionalId: z.string().min(1),
  serviceIds: z.array(z.string()).min(1).max(6).transform((items) => [...new Set(items)]),
  startAt: z.string().datetime({ offset: true }),
  customerName: z.string().trim().min(3).max(120),
  customerPhone: z.string().regex(/^\d{10,13}$/),
  customerEmail: z.union([z.string().trim().toLowerCase().email(), z.literal('')]).optional(),
  notes: z.string().trim().max(500).optional()
});

appointmentsRouter.post('/', createLimiter, optionalAuth, async (req, res) => {
  const data = createSchema.parse(req.body);
  const requestedStart = new Date(data.startAt);
  const appointment = await persistAppointment({
    professionalId: data.professionalId, serviceIds: data.serviceIds, startAt: requestedStart,
    customerName: data.customerName, customerPhone: data.customerPhone,
    customerEmail: data.customerEmail || null, notes: data.notes || null,
    ...(req.auth?.userId ? { clientId: req.auth.userId } : {})
  });

  const local = new Intl.DateTimeFormat('pt-BR', { timeZone: appointment.timezone, dateStyle: 'short', timeStyle: 'short' }).formatToParts(appointment.startAt);
  const part = (type: Intl.DateTimeFormatPartTypes) => local.find((item) => item.type === type)?.value ?? '';
  const message = formatWhatsAppMessage({
    customerName: appointment.customerName, phone: appointment.customerPhone,
    email: appointment.customerEmail, services: appointment.services.map((item) => item.nameSnapshot),
    professional: appointment.professional.name,
    date: `${part('day')}/${part('month')}/${part('year')}`, time: `${part('hour')}:${part('minute')}`,
    durationMin: appointment.services.reduce((sum, item) => sum + item.durationMin, 0),
    totalCents: appointment.totalCents, notes: appointment.notes
  });
  const whatsAppDestination = appointment.professional.whatsappNumber || env.WHATSAPP_NUMBER;
  const whatsAppDigits = whatsAppDestination?.replace(/\D/g, '') ?? '';
  const whatsAppUrl = /^\d{12,13}$/.test(whatsAppDigits)
    ? `https://wa.me/${whatsAppDigits}?text=${encodeURIComponent(message)}` : null;
  const publicAppointment = {
    ...appointment,
    professional: { id: appointment.professional.id, name: appointment.professional.name, photoUrl: appointment.professional.photoUrl }
  };
  res.status(201).json({ appointment: publicAppointment, whatsAppUrl });
});

appointmentsRouter.get('/me', requireAuth, async (req, res) => {
  const appointments = await prisma.appointment.findMany({
    where: { clientId: req.auth!.userId }, orderBy: { startAt: 'desc' },
    include: { services: true, professional: { select: { id: true, name: true, photoUrl: true } } }
  });
  res.json(appointments);
});

appointmentsRouter.patch('/:id/cancel', requireAuth, async (req, res) => {
  const appointmentId = z.string().parse(req.params.id);
  const appointment = await prisma.appointment.findFirst({
    where: { id: appointmentId, clientId: req.auth!.userId },
    include: { services: true, professional: true }
  });
  if (!appointment) throw new AppError(404, 'Agendamento não encontrado.', 'NOT_FOUND');
  const settings = await prisma.businessSetting.findUnique({ where: { id: 'default' } });
  const limitMs = (settings?.cancellationHours ?? 2) * 60 * 60_000;
  if (appointment.startAt.getTime() - Date.now() < limitMs) throw new AppError(422, 'O prazo para cancelamento online foi encerrado. Entre em contato com a barbearia.', 'CANCELLATION_WINDOW_CLOSED');
  if (!['PENDING', 'CONFIRMED'].includes(appointment.status)) throw new AppError(422, 'Este agendamento não pode ser cancelado.', 'INVALID_STATUS');
  const updated = await prisma.appointment.update({ where: { id: appointment.id }, data: { status: 'CANCELLED', cancelledAt: new Date() } });
  const local = new Intl.DateTimeFormat('pt-BR', { timeZone: appointment.timezone, dateStyle: 'short', timeStyle: 'short' }).formatToParts(appointment.startAt);
  const part = (type: Intl.DateTimeFormatPartTypes) => local.find((item) => item.type === type)?.value ?? '';
  const message = formatWhatsAppCancellationMessage({
    customerName: appointment.customerName,
    phone: appointment.customerPhone,
    email: appointment.customerEmail,
    services: appointment.services.map((item) => item.nameSnapshot),
    professional: appointment.professional.name,
    date: `${part('day')}/${part('month')}/${part('year')}`,
    time: `${part('hour')}:${part('minute')}`
  });
  const whatsAppDestination = appointment.professional.whatsappNumber || env.WHATSAPP_NUMBER;
  const whatsAppDigits = whatsAppDestination?.replace(/\D/g, '') ?? '';
  const whatsAppUrl = /^\d{12,13}$/.test(whatsAppDigits)
    ? `https://wa.me/${whatsAppDigits}?text=${encodeURIComponent(message)}` : null;

  res.json({ appointment: { id: updated.id, status: updated.status, cancelledAt: updated.cancelledAt }, whatsAppUrl });
});

appointmentsRouter.patch('/:id/reschedule', requireAuth, async (_req, res) => {
  res.status(409).json({ error: 'Para preservar a reserva atual, escolha um novo horário pelo atendimento da barbearia.', code: 'CONTACT_REQUIRED' });
});
