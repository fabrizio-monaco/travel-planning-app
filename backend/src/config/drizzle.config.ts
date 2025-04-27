import { defineConfig } from 'drizzle-kit';
import { ENV } from './env.config';

export default defineConfig({
  dialect: 'postgresql',
  schema: './src/database/schema',
  out: './drizzle',
  casing: 'snake_case',
  dbCredentials: {
    url: ENV.DATABASE_URL,
  },
  migrations: {
    table: 'migrations',
  },
});
