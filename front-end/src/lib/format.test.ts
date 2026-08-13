import { describe, expect, it } from 'vitest';
import { currency, duration, phoneDigits, phoneMask } from './format';

describe('formatadores da interface', () => {
  it('formata valores monetários em centavos', () => expect(currency(5000)).toContain('50,00'));
  it('formata duração combinada', () => expect(duration(75)).toBe('1h 15min'));
  it('normaliza e mascara WhatsApp', () => {
    expect(phoneDigits('(85) 99999-9999')).toBe('85999999999');
    expect(phoneMask('85999999999')).toBe('(85) 99999-9999');
  });
});
