import 'dotenv/config';
import { z } from 'zod';

const envSchema = z.object({
  DATABASE_URL: z.string().url().min(1),
  PORT: z.coerce.number().int().positive().default(3000),
  GEOAPIFY_API_KEY: z.string().min(1),
});

export const ENV = envSchema.parse({
  ...process.env,
  GEOAPIFY_API_KEY: process.env.GEOAPIFY_API_KEY || '',
});
export type EnvType = typeof ENV;
