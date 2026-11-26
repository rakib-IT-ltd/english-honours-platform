import type { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

export interface AppSetupOptions {
  corsOrigins: string[];
  enableSwagger: boolean;
}

export const API_PREFIX = 'api/v1';
export const SWAGGER_PATH = 'api/docs';

/** Shared by main.ts and the e2e tests so both exercise the same application configuration. */
export function configureApp(app: INestApplication, options: AppSetupOptions): void {
  app.setGlobalPrefix(API_PREFIX);
  app.enableCors({
    origin: options.corsOrigins,
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Authorization', 'Content-Type'],
  });

  if (options.enableSwagger) {
    const document = SwaggerModule.createDocument(
      app,
      new DocumentBuilder()
        .setTitle('English Honours Learning Platform API')
        .setDescription(
          'Backend API: academic structure (read-only) and student accounts (Firebase ID token required for /me).',
        )
        .setVersion('0.0.0')
        .addBearerAuth()
        .build(),
    );
    SwaggerModule.setup(SWAGGER_PATH, app, document);
  }
}
