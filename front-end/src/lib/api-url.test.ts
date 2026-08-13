import { describe, expect, it } from 'vitest';
import { normalizeApiBase } from './api-url';

describe('URL pública da API', () => {
  it('adiciona /api ao endereço raiz do Render', () => {
    expect(normalizeApiBase('https://los-pit-barbeshop-site.onrender.com'))
      .toBe('https://los-pit-barbeshop-site.onrender.com/api');
  });

  it('não duplica /api e remove a barra final', () => {
    expect(normalizeApiBase('https://los-pit-barbeshop-site.onrender.com/api/'))
      .toBe('https://los-pit-barbeshop-site.onrender.com/api');
  });

  it('usa /api quando a variável não está configurada', () => {
    expect(normalizeApiBase(undefined)).toBe('/api');
  });
});
