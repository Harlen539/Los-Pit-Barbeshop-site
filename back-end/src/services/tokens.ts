import { createHash, randomBytes } from 'node:crypto';
import jwt from 'jsonwebtoken';
import type { Role } from '@prisma/client';
import { env } from '../config/env.js';

export const hashToken = (token: string) => createHash('sha256').update(token).digest('hex');

export const createAccessToken = (userId: string, role: Role) =>
  jwt.sign({ role, type: 'access' }, env.JWT_ACCESS_SECRET, { subject: userId, expiresIn: '15m' });

export const createRefreshToken = (userId: string) => {
  const id = randomBytes(24).toString('hex');
  return jwt.sign({ type: 'refresh', id }, env.JWT_REFRESH_SECRET, { subject: userId, expiresIn: '30d' });
};

export const verifyRefreshToken = (token: string) => jwt.verify(token, env.JWT_REFRESH_SECRET) as { sub: string; type: string; id: string };
