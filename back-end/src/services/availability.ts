import type { AppointmentStatus, Prisma } from '@prisma/client';
import { prisma } from '../lib/prisma.js';
import { calculateAvailableSlots, localMinuteToDate, professionalSupportsAll, summarizeServices, type Interval } from '../domain/booking.js';
import { AppError } from '../lib/errors.js';

export const activeAppointmentStatuses: AppointmentStatus[] = ['PENDING', 'CONFIRMED'];

export const getAvailability = async (input: {
  date: string;
  serviceIds: string[];
  professionalId?: string;
  now?: Date;
}, db: Prisma.TransactionClient | typeof prisma = prisma) => {
  const settings = await db.businessSetting.findUnique({ where: { id: 'default' } });
  const timezone = settings?.timezone ?? process.env.APP_TIMEZONE ?? 'America/Fortaleza';
  const now = input.now ?? new Date();
  const today = new Intl.DateTimeFormat('en-CA', { timeZone: timezone, year: 'numeric', month: '2-digit', day: '2-digit' }).format(now);
  const maxDateValue = new Date(`${today}T12:00:00Z`);
  maxDateValue.setUTCDate(maxDateValue.getUTCDate() + (settings?.maximumAdvanceDays ?? 60));
  const maximumDate = maxDateValue.toISOString().slice(0, 10);
  if (input.date < today || input.date > maximumDate) throw new AppError(422, 'A data está fora do período permitido para agendamento.', 'INVALID_DATE');
  const services = await db.service.findMany({ where: { id: { in: input.serviceIds }, active: true } });
  if (services.length !== new Set(input.serviceIds).size) throw new AppError(422, 'Um ou mais serviços não estão disponíveis.', 'INVALID_SERVICES');
  const totals = summarizeServices(services);
  const weekdayName = new Intl.DateTimeFormat('en-US', { timeZone: timezone, weekday: 'short' }).format(new Date(`${input.date}T12:00:00Z`));
  const weekday = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(weekdayName);
  const nextDateValue = new Date(`${input.date}T12:00:00Z`);
  nextDateValue.setUTCDate(nextDateValue.getUTCDate() + 1);
  const dayStart = localMinuteToDate(input.date, 0, timezone);
  const dayEnd = localMinuteToDate(nextDateValue.toISOString().slice(0, 10), 0, timezone);

  const professionals = await db.professional.findMany({
    where: { active: true, ...(input.professionalId ? { id: input.professionalId } : {}) },
    include: {
      services: true,
      schedules: { where: { weekday, active: true } },
      breaks: { where: { weekday } },
      blockedPeriods: { where: { startAt: { lt: dayEnd }, endAt: { gt: dayStart } } },
      appointments: { where: { startAt: { lt: dayEnd }, endAt: { gt: dayStart }, status: { in: activeAppointmentStatuses } } }
    }
  });

  return professionals
    .filter((professional) => professionalSupportsAll(professional.services.map((item) => item.serviceId), input.serviceIds))
    .map((professional) => {
      const unavailable: Interval[] = [
        ...professional.blockedPeriods.map((item) => ({ start: item.startAt, end: item.endAt })),
        ...professional.appointments.map((item) => ({ start: item.startAt, end: item.endAt })),
        ...professional.breaks.map((item) => ({
          start: localMinuteToDate(input.date, item.startMinute, timezone), end: localMinuteToDate(input.date, item.endMinute, timezone)
        }))
      ];
      const slots = calculateAvailableSlots({
        date: input.date, timezone, durationMin: totals.durationMin, bufferMin: professional.bufferMinutes,
        schedules: professional.schedules, unavailable, now,
        minimumNoticeMin: settings?.minimumNoticeMin ?? 60
      });
      return { professionalId: professional.id, professionalName: professional.name, slots: slots.map((slot) => slot.toISOString()), durationMin: totals.durationMin, totalCents: totals.priceCents };
    });
};
