import { defineConfig } from 'prisma/config';

// Prisma 7 no longer loads .env automatically. Node's built-in loader keeps this dependency-free;
// the file is optional (CI and containers inject real environment variables).
try {
  process.loadEnvFile();
} catch {
  // no .env file present - rely on the process environment
}

export default defineConfig({
  schema: '../../database/prisma/schema.prisma',
  migrations: { path: '../../database/prisma/migrations' },
  datasource: {
    // Not required for `prisma generate`; required for migrate/studio.
    url: process.env['DATABASE_URL'] ?? '',
  },
});
