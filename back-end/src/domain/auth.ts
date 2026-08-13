import argon2 from 'argon2';
import { z } from 'zod';

export const registerSchema = z.object({
  name: z.string().trim().min(3).max(120),
  email: z.string().trim().toLowerCase().email(),
  phone: z.string().regex(/^\d{10,13}$/),
  password: z.string().min(8).max(128).regex(/[A-Z]/, 'Use ao menos uma letra maiúscula.').regex(/\d/, 'Use ao menos um número.'),
  birthDate: z.string().date().optional(),
  acceptTerms: z.literal(true)
});

export const loginSchema = z.object({ email: z.string().trim().toLowerCase().email(), password: z.string().min(1) });
export const hashPassword = (password: string) => argon2.hash(password, { type: argon2.argon2id });
export const verifyPassword = (hash: string, password: string) => argon2.verify(hash, password);
