import { randomBytes } from 'node:crypto';
import { Prisma } from '@prisma/client';
import { prisma } from '../lib/prisma.js';
import { AppError } from '../lib/errors.js';
import { getAvailability } from './availability.js';
import { summarizeServices } from '../domain/booking.js';
import { env } from '../config/env.js';

export interface AppointmentInput {
  professionalId: string;
  serviceIds: string[];
  startAt: Date;
  customerName: string;
  customerPhone: string;
  customerEmail?: string | null;
  notes?: string | null;
  clientId?: string;
}

const makeCode = () => `LP-${new Date().getFullYear()}-${randomBytes(3).toString('hex').toUpperCase()}`;

export const persistAppointment = (input: AppointmentInput) => prisma.$transaction(async (tx) => {
  await tx.$queryRaw`SELECT id FROM "Professional" WHERE id = ${input.professionalId} FOR UPDATE`;
  const date = new Intl.DateTimeFormat('en-CA', { timeZone: env.APP_TIMEZONE, year: 'numeric', month: '2-digit', day: '2-digit' }).format(input.startAt);
  const availability = await getAvailability({ date, serviceIds: input.serviceIds, professionalId: input.professionalId }, tx);
  if (!availability[0]?.slots.some((slot) => new Date(slot).getTime() === input.startAt.getTime())) {
    throw new AppError(409, 'Este horário não está mais disponível. Escolha outro.', 'SLOT_TAKEN');
  }
  const services = await tx.service.findMany({ where: { id: { in: input.serviceIds }, active: true } });
  const totals = summarizeServices(services);
  return tx.appointment.create({
    data: {
      code: makeCode(), clientId: input.clientId, professionalId: input.professionalId,
      startAt: input.startAt, endAt: new Date(input.startAt.getTime() + totals.durationMin * 60_000), timezone: env.APP_TIMEZONE,
      subtotalCents: totals.priceCents, totalCents: totals.priceCents, customerName: input.customerName,
      customerPhone: input.customerPhone, customerEmail: input.customerEmail || null, notes: input.notes || null,
      services: { create: services.map((service) => ({ serviceId: service.id, nameSnapshot: service.name, priceCents: service.priceCents, durationMin: service.durationMin })) }
    }, include: { services: true, professional: true }
  });
}, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });
