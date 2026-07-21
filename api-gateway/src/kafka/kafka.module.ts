import { Module } from '@nestjs/common';
import {
  ClientsModule,
  Transport,
} from '@nestjs/microservices';
import {
  ConfigModule,
  ConfigService,
} from '@nestjs/config';
import { AuthKafkaService } from './auth-kafka.service';
import { AUTH_KAFKA_CLIENT } from './kafka.constants';

@Module({
  imports: [
    ClientsModule.registerAsync([
      {
        name: AUTH_KAFKA_CLIENT,
        imports: [ConfigModule],
        inject: [ConfigService],
        useFactory: (
          configService: ConfigService,
        ) => ({
          transport: Transport.KAFKA,
          options: {
            client: {
              clientId:
                configService.getOrThrow<string>(
                  'KAFKA_CLIENT_ID',
                ),
              brokers:
                configService
                  .getOrThrow<string>(
                    'KAFKA_BROKERS',
                  )
                  .split(',')
                  .map((broker) => broker.trim())
                  .filter(Boolean),
            },
            consumer: {
              groupId:
                configService.getOrThrow<string>(
                  'KAFKA_AUTH_CONSUMER_GROUP_ID',
                ),
            },
          },
        }),
      },
    ]),
  ],
  providers: [AuthKafkaService],
  exports: [AuthKafkaService],
})
export class KafkaModule {}