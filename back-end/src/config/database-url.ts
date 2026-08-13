const assignmentPrefix = /^(?:DATABASE_URL|DIRECT_URL)\s*=\s*/i;

export function normalizeDatabaseUrl(rawValue: string | undefined): string | undefined {
  if (!rawValue) return undefined;

  let value = rawValue.trim().replace(assignmentPrefix, '').trim();
  if (
    value.length >= 2
    && ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'")))
  ) {
    value = value.slice(1, -1).trim();
  }

  const url = new URL(value);
  if (url.protocol !== 'postgresql:' && url.protocol !== 'postgres:') {
    throw new Error('A conexão do banco deve começar com postgresql:// ou postgres://.');
  }

  // Supavisor Session Pooler already negotiates TLS and uses the public schema
  // by default. Removing copied dashboard parameters avoids Prisma P1013 errors
  // caused by parameters that belong to other PostgreSQL clients.
  if (url.hostname.endsWith('.pooler.supabase.com') && url.port === '5432') {
    url.search = '';
  }

  return url.toString();
}
