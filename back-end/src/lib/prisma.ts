import { PrismaClient } from '@prisma/client';
import { normalizeDatabaseUrl } from '../config/database-url.js';

const databaseUrl = normalizeDatabaseUrl(process.env.DATABASE_URL);
if (databaseUrl) process.env.DATABASE_URL = databaseUrl;

export const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error']
});
