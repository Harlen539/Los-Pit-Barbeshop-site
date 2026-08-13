import { fromZonedTime } from 'date-fns-tz';

export interface BookableService {
  id: string;
  priceCents: number;
  durationMin: number;
}

export interface Interval {
  start: Date;
  end: Date;
}

export interface DaySchedule {
  startMinute: number;
  endMinute: number;
}

export const summarizeServices = (services: BookableService[]) =>
  services.reduce(
    (summary, service) => ({
      priceCents: summary.priceCents + service.priceCents,
      durationMin: summary.durationMin + service.durationMin
    }),
    { priceCents: 0, durationMin: 0 }
  );

export const professionalSupportsAll = (
  supportedServiceIds: Iterable<string>,
  requestedServiceIds: Iterable<string>
) => {
  const supported = new Set(supportedServiceIds);
  return [...requestedServiceIds].every((id) => supported.has(id));
};

const overlaps = (a: Interval, b: Interval) => a.start < b.end && a.end > b.start;

export interface SlotCalculationInput {
  date: string;
  timezone: string;
  durationMin: number;
  bufferMin?: number;
  stepMin?: number;
  schedules: DaySchedule[];
  unavailable: Interval[];
  now?: Date;
  minimumNoticeMin?: number;
}

export const localMinuteToDate = (date: string, minute: number, timezone: string) => {
  const hours = String(Math.floor(minute / 60)).padStart(2, '0');
  const minutes = String(minute % 60).padStart(2, '0');
  return fromZonedTime(`${date} ${hours}:${minutes}:00`, timezone);
};

export const calculateAvailableSlots = (input: SlotCalculationInput) => {
  const step = input.stepMin ?? 30;
  const occupiedDuration = input.durationMin + (input.bufferMin ?? 0);
  const earliest = new Date((input.now ?? new Date()).getTime() + (input.minimumNoticeMin ?? 0) * 60_000);
  const slots: Date[] = [];

  for (const schedule of input.schedules) {
    for (let minute = schedule.startMinute; minute + occupiedDuration <= schedule.endMinute; minute += step) {
      const start = localMinuteToDate(input.date, minute, input.timezone);
      const end = new Date(start.getTime() + occupiedDuration * 60_000);
      if (start >= earliest && !input.unavailable.some((interval) => overlaps({ start, end }, interval))) {
        slots.push(start);
      }
    }
  }
  return slots.sort((a, b) => a.getTime() - b.getTime());
};

export const formatWhatsAppMessage = (data: {
  customerName: string; phone: string; email?: string | null;
  services: string[]; professional: string; date: string; time: string;
  durationMin: number; totalCents: number; notes?: string | null;
}) => [
  'Olá! Acabei de realizar um agendamento na Los Pit Barber Shop.', '',
  `Cliente: ${data.customerName}`,
  `WhatsApp: ${data.phone}`,
  `E-mail: ${data.email || 'Não informado'}`,
  `Serviços: ${data.services.join(', ')}`,
  `Profissional: ${data.professional}`,
  `Data: ${data.date}`,
  `Horário: ${data.time}`,
  `Duração total: ${data.durationMin} minutos`,
  `Valor total: ${(data.totalCents / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}`,
  `Observações: ${data.notes || 'Nenhuma'}`
].join('\n');

export const formatWhatsAppCancellationMessage = (data: {
  customerName: string; phone: string; email?: string | null;
  services: string[]; professional: string; date: string; time: string;
}) => [
  'Olá! Estou avisando sobre o cancelamento de um horário na Los Pit Barber Shop.', '',
  `Cliente: ${data.customerName}`,
  `WhatsApp: ${data.phone}`,
  `E-mail: ${data.email || 'Não informado'}`,
  `Serviços cancelados: ${data.services.join(', ')}`,
  `Profissional: ${data.professional}`,
  `Data: ${data.date}`,
  `Horário: ${data.time}`
].join('\n');
