import { defineConfig } from 'prisma/config';
import { env } from 'process';

export default defineConfig({
  datasource: {
    url: env('DATABASE_URL'),
  },
});
