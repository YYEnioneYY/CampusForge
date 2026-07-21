import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';
import { setupSwagger } from './swagger/setup-swagger';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);

  const configService = app.get(ConfigService);

  app.enableShutdownHooks();
  app.setGlobalPrefix('api');

  setupSwagger(app);

  const port =
    configService.getOrThrow<number>('PORT');

  await app.listen(port);
}

void bootstrap();