import { config as loadEnv } from 'dotenv';
import { z } from 'zod';

loadEnv();

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z
    .string()
    .default('4000')
    .transform((val) => Number(val))
    .pipe(z.number().int().positive()),
  LOG_LEVEL: z.string().optional().default('info'),
  DB_SERVER: z.string().default('localhost'),
  DB_NAME: z.string(),
  DB_USER: z.string().optional().default(''),
  DB_PASSWORD: z.string().optional().default(''),
  JWT_SECRET: z.string().optional().default('mi_secreto_temporal'),
});

export const env = envSchema.parse(process.env);


