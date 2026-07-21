import { INestApplication } from '@nestjs/common';
import {
  DocumentBuilder,
  SwaggerModule,
} from '@nestjs/swagger';

export function setupSwagger(
  app: INestApplication,
): void {
  const config = new DocumentBuilder()
    .setTitle('CampusForge API')
    .setDescription(
      'HTTP API Gateway for CampusForge services',
    )
    .setVersion('1.0.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
      'access-token',
    )
    .build();

  const documentFactory = () =>
    SwaggerModule.createDocument(app, config);

  SwaggerModule.setup(
    'docs',
    app,
    documentFactory,
    {
      useGlobalPrefix: true,
      customSiteTitle: 'CampusForge API',
      swaggerOptions: {
        persistAuthorization: true,
        displayRequestDuration: true,
      },
    },
  );
}