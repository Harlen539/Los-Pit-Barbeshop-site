import { describe, expect, it } from 'vitest';
import { calculateAvailableSlots, formatWhatsAppCancellationMessage, formatWhatsAppMessage, professionalSupportsAll, summarizeServices } from '../src/domain/booking.js';
import { activeAppointmentStatuses } from '../src/services/availability.js';

describe('regras de agendamento', () => {
  it('libera imediatamente um horário quando o agendamento é cancelado', () => {
    expect(activeAppointmentStatuses).toEqual(['PENDING', 'CONFIRMED']);
    expect(activeAppointmentStatuses).not.toContain('CANCELLED');
  });

  it('soma preços e durações sem ponto flutuante', () => {
    expect(summarizeServices([
      { id: 'corte', priceCents: 3500, durationMin: 30 },
      { id: 'barba', priceCents: 2500, durationMin: 30 }
    ])).toEqual({ priceCents: 6000, durationMin: 60 });
  });

  it('filtra profissionais capazes de executar todos os serviços', () => {
    expect(professionalSupportsAll(['corte', 'barba'], ['corte', 'barba'])).toBe(true);
    expect(professionalSupportsAll(['corte'], ['corte', 'barba'])).toBe(false);
  });

  it('exige uma janela contínua e bloqueia intervalos ocupados', () => {
    const slots = calculateAvailableSlots({
      date: '2030-08-08', timezone: 'America/Fortaleza', durationMin: 60,
      schedules: [{ startMinute: 8 * 60, endMinute: 12 * 60 }],
      unavailable: [{ start: new Date('2030-08-08T09:00:00-03:00'), end: new Date('2030-08-08T09:30:00-03:00') }],
      now: new Date('2030-08-07T00:00:00-03:00')
    });
    expect(slots.map((slot) => slot.toISOString())).toEqual([
      '2030-08-08T11:00:00.000Z',
      '2030-08-08T12:30:00.000Z',
      '2030-08-08T13:00:00.000Z',
      '2030-08-08T13:30:00.000Z',
      '2030-08-08T14:00:00.000Z'
    ]);
  });

  it('formata a mensagem de WhatsApp com os dados salvos', () => {
    const message = formatWhatsAppMessage({ customerName: 'Cliente', phone: '5585999999999', services: ['Corte'], professional: 'Profissional', date: '08/08/2030', time: '09:00', durationMin: 30, totalCents: 3500 });
    expect(message).not.toContain('Código:');
    expect(message).toContain('Valor total: R$ 35,00');
  });

  it('formata o aviso de cancelamento para o profissional escolhido', () => {
    const message = formatWhatsAppCancellationMessage({
      customerName: 'Cliente', phone: '5583999999999', email: 'cliente@email.com',
      services: ['Corte', 'Barba'], professional: 'Eribaldo', date: '17/08/2030', time: '12:00'
    });
    expect(message).toContain('cancelamento');
    expect(message).toContain('Serviços cancelados: Corte, Barba');
    expect(message).toContain('Profissional: Eribaldo');
    expect(message).not.toContain('Código:');
  });
});
