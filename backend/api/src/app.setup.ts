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
  app.enableCors({ origin: options.corsOrigins });

  if (options.enableSwagger) {
    const document = SwaggerModule.createDocument(
      app,
      new DocumentBuilder()
        .setTitle('English Honours Learning Platform API')
        .setDescription('Backend API (foundation phase: health endpoints only).')
        .setVersion('0.0.0')
        .build(),
    );
    SwaggerModule.setup(SWAGGER_PATH, app, document);
  }
}
