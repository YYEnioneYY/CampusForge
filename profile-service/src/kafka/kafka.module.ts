import { Module } from '@nestjs/common';
import {
  ConfigModule,
  ConfigService,
} from '@nestjs/config';
import {
  ClientsModule,
  Transport,
} from '@nestjs/microservices';

import {
  REFERENCE_KAFKA_CLIENT,
} from './kafka.constants';

import {
  ReferenceKafkaService,
} from './reference-kafka.service';

@Module({
  imports: [
    ClientsModule.registerAsync([
      {
        name: REFERENCE_KAFKA_CLIENT,

        imports: [
          ConfigModule,
        ],

        inject: [
          ConfigService,
        ],

        useFactory: (
          configService: ConfigService,
        ) => {
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

          const clientId =
            configService
              .getOrThrow<string>(
                'KAFKA_CLIENT_ID',
              );

          const groupId =
            configService
              .getOrThrow<string>(
                'KAFKA_GROUP_ID',
              );

          return {
            transport: Transport.KAFKA,

            options: {
              client: {
                clientId:
                  `${clientId}-reference`,
                brokers,
              },

              consumer: {
                groupId:
                  `${groupId}-reference`,
              },
            },
          };
        },
      },
    ]),
  ],

  providers: [ReferenceKafkaService],

  exports: [ReferenceKafkaService],
})
export class KafkaModule {}