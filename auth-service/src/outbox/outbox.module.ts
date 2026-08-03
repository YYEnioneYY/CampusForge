import { Module } from '@nestjs/common';
import {
  ClientsModule,
  KafkaOptions,
  Transport,
} from '@nestjs/microservices';
import {
  ConfigModule,
  ConfigService,
} from '@nestjs/config';

import { PrismaModule } from '../prisma/prisma.module';
import {
  OUTBOX_KAFKA_CLIENT,
} from './outbox.constants';
import { OutboxService } from './outbox.service';
import { OutboxRepository } from './outbox.repository';
import { OutboxPublisher } from './outbox.publisher';

@Module({
  imports: [
    PrismaModule,

    ClientsModule.registerAsync([
      {
        name:
          OUTBOX_KAFKA_CLIENT,

        imports: [
          ConfigModule,
        ],

        inject: [
          ConfigService,
        ],

        useFactory: (
          configService:
            ConfigService,
        ): KafkaOptions => {
          const brokers =
            configService
              .getOrThrow<string>(
                'KAFKA_BROKERS',
              )
              .split(',')
              .map((broker) =>
                broker.trim(),
              )
              .filter(Boolean);

          return {
            transport:
              Transport.KAFKA,

            options: {
              client: {
                clientId:
                  'auth-service-outbox-publisher',

                brokers,
              },

              producerOnlyMode:
                true,

              send: {
                acks: -1,
                timeout: 10_000,
              },
            },
          };
        },
      },
    ]),
  ],

  providers: [
    OutboxService,
    OutboxRepository,
    OutboxPublisher,
  ],

  exports: [
    OutboxService,
  ],
})
export class OutboxModule {}