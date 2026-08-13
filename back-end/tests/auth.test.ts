import { beforeAll, describe, expect, it } from 'vitest';
import { hashPassword, loginSchema, registerSchema, verifyPassword } from '../src/domain/auth.js';

describe('cadastro e login', () => {
  it('valida, normaliza e aceita um cadastro completo', () => {
    const parsed = registerSchema.parse({ name: 'Cliente Teste', email: 'CLIENTE@EXEMPLO.COM', phone: '5585999999999', password: 'Senha123', acceptTerms: true });
    expect(parsed.email).toBe('cliente@exemplo.com');
  });
  it('rejeita cadastro sem aceite ou com senha fraca', () => {
    expect(registerSchema.safeParse({ name: 'Cliente Teste', email: 'c@e.com', phone: '85999999999', password: 'fraca', acceptTerms: false }).success).toBe(false);
  });
  it('faz hash Argon2 e verifica as credenciais no login', async () => {
    const credentials = loginSchema.parse({ email: 'cliente@exemplo.com', password: 'Senha123' });
    const hash = await hashPassword(credentials.password);
    expect(hash).not.toContain(credentials.password);
    await expect(verifyPassword(hash, credentials.password)).resolves.toBe(true);
    await expect(verifyPassword(hash, 'Incorreta123')).resolves.toBe(false);
  });
});

describe('refresh token', () => {
  beforeAll(() => {
    process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test';
    process.env.JWT_ACCESS_SECRET = 'access-secret-with-more-than-thirty-two-characters';
    process.env.JWT_REFRESH_SECRET = 'refresh-secret-with-more-than-thirty-two-characters';
  });
  it('assina e valida um refresh sem expor seu valor no hash', async () => {
    const { createRefreshToken, hashToken, verifyRefreshToken } = await import('../src/services/tokens.js');
    const token = createRefreshToken('user-1');
    expect(hashToken(token)).not.toBe(token);
    expect(verifyRefreshToken(token)).toMatchObject({ sub: 'user-1', type: 'refresh' });
  });
});
