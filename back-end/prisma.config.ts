import 'dotenv/config';
import { defineConfig } from 'prisma/config';
import { normalizeDatabaseUrl } from './src/config/database-url.js';

const migrationUrl = normalizeDatabaseUrl(process.env.DIRECT_URL ?? process.env.DATABASE_URL);

if (!migrationUrl) {
  throw new Error('Defina DIRECT_URL ou DATABASE_URL para executar comandos do Prisma.');
}

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: { path: 'prisma/migrations', seed: 'tsx prisma/seed.ts' },
  datasource: { url: migrationUrl }
});
