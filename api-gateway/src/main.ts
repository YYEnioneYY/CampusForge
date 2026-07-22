import {
  ValidationPipe,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { setupSwagger } from './swagger/setup-swagger';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);

  const configService = app.get(ConfigService);

  const trustProxyHops =
    configService.get<number>(
      'TRUST_PROXY_HOPS',
      0,
    );

  if (trustProxyHops > 0) {
    const expressApp =
      app.getHttpAdapter().getInstance();

    expressApp.set(
      'trust proxy',
      trustProxyHops,
    );
  }

  app.enableShutdownHooks();
  app.setGlobalPrefix('api');

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  setupSwagger(app);

  const port =
    configService.getOrThrow<number>('PORT');

  await app.listen(port, '0.0.0.0');
}

void bootstrap();