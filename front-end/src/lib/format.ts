export const currency = (cents: number) => cents === 0 ? 'Sob consulta' : (cents / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
export const duration = (minutes: number) => minutes >= 60 ? `${Math.floor(minutes / 60)}h${minutes % 60 ? ` ${minutes % 60}min` : ''}` : `${minutes} min`;
export const phoneDigits = (value: string) => value.replace(/\D/g, '').slice(0, 13);
export const phoneMask = (value: string) => {
  const digits = phoneDigits(value).replace(/^55(?=\d{10,11}$)/, '');
  if (digits.length <= 10) return digits.replace(/^(\d{0,2})(\d{0,4})(\d{0,4}).*/, (_, a, b, c) => [a && `(${a}`, a.length === 2 && ') ', b, c && `-${c}`].filter(Boolean).join(''));
  return digits.replace(/^(\d{2})(\d{5})(\d{0,4}).*/, '($1) $2-$3');
};
