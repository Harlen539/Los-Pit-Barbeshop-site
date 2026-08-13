import { describe, expect, it } from 'vitest';
import { normalizeDatabaseUrl } from '../src/config/database-url.js';

describe('normalização da conexão PostgreSQL', () => {
  it('remove prefixo, aspas e parâmetros copiados do Supabase Session Pooler', () => {
    expect(normalizeDatabaseUrl(
      ' DIRECT_URL="postgresql://postgres.projeto:senha@aws-0-ca-central-1.pooler.supabase.com:5432/postgres?sslmode=require&schema=public&connect_timeout=30" '
    )).toBe('postgresql://postgres.projeto:senha@aws-0-ca-central-1.pooler.supabase.com:5432/postgres');
  });

  it('preserva parâmetros de conexões que não usam o Supabase Session Pooler', () => {
    expect(normalizeDatabaseUrl('postgresql://postgres:senha@localhost:5432/los_pit?schema=public'))
      .toBe('postgresql://postgres:senha@localhost:5432/los_pit?schema=public');
  });
});
