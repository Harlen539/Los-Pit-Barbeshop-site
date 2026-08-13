import 'dotenv/config';
import { z } from 'zod';
import { normalizeDatabaseUrl } from './database-url.js';

const normalizedDatabaseUrl = normalizeDatabaseUrl(process.env.DATABASE_URL);
if (normalizedDatabaseUrl) process.env.DATABASE_URL = normalizedDatabaseUrl;

const schema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(3333),
  FRONTEND_URL: z.string().url().default('http://localhost:5173').transform((value) => new URL(value).origin),
  DATABASE_URL: z.string().min(1),
  JWT_ACCESS_SECRET: z.string().min(32),
  JWT_REFRESH_SECRET: z.string().min(32),
  APP_TIMEZONE: z.string().default('America/Fortaleza'),
  WHATSAPP_NUMBER: z.string().optional()
});

export const env = schema.parse(process.env);
