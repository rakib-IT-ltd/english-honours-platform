import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    root: './',
    include: ['test/**/*.e2e-spec.ts'],
    // Must exist before AppModule is imported (ConfigModule validates at import time).
    env: { NODE_ENV: 'test', DATABASE_URL: 'postgresql://test:test@localhost:5432/test' },
  },
});
