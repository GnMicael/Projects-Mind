import { z } from 'zod';
export const updateProfile = z.object({
  name: z.string().trim().min(2).max(80).optional(),
  professions: z.array(z.string().max(60)).max(12).optional(),
  purposes: z.array(z.string().max(60)).max(12).optional(),
  style: z.string().max(60).optional(),
  wants: z.array(z.string().max(60)).max(12).optional(),
  level: z.enum(['Simples', 'Intermediário', 'Avançado']).optional(),
}).strict();
