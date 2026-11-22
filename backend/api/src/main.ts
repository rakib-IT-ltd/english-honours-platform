import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module.js';
import { configureApp } from './app.setup.js';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);
  const config = app.get(ConfigService);

  configureApp(app, {
    corsOrigins: config.getOrThrow<string[]>('CORS_ORIGINS'),
    enableSwagger: config.getOrThrow<string>('NODE_ENV') !== 'production',
  });
  app.enableShutdownHooks();

  const port = config.getOrThrow<number>('PORT');
  await app.listen(port);
  console.log(`API listening on http://localhost:${port}/api/v1 (docs: /api/docs)`);
}

void bootstrap();
