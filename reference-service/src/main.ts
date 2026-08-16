import { NestFactory } from '@nestjs/core';
import { Transport, MicroserviceOptions } from '@nestjs/microservices';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { rpcValidationExceptionFactory } from './common/rpc/rpc-validation-exception-factory';

function getKafkaBrokers(): string[] {
  return (process.env.KAFKA_BROKERS ?? 'localhost:9092')
    .split(',')
    .map((broker) => broker.trim())
    .filter(Boolean);
}

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    AppModule,
    {
      transport: Transport.KAFKA,
      options: {
        client: {
          clientId: process.env.KAFKA_CLIENT_ID ?? 'notification-service',
          brokers: getKafkaBrokers(),
        },
        consumer: {
          groupId: process.env.KAFKA_GROUP_ID ?? 'notification-service-consumer',
        },
      },
    },
  );

  app.enableShutdownHooks;

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      exceptionFactory: rpcValidationExceptionFactory,
    }),
  );

  await app.listen();
}

bootstrap();