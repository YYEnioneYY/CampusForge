import { Module } from '@nestjs/common';
import {
  ConfigModule,
  ConfigService,
} from '@nestjs/config';
import {
  ClientsModule,
  Transport,
} from '@nestjs/microservices';
import { ErrorsModule } from '../common/errors/errors.module';
import { AuthKafkaService } from './auth-kafka.service';
import { ReferenceKafkaService } from './reference-kafka.service';
import { AUTH_KAFKA_CLIENT } from './kafka.constants';
import { REFERENCE_KAFKA_CLIENT } from './kafka.constants';
import { PROFILE_KAFKA_CLIENT } from './kafka.constants';
import { ProfileKafkaService } from './profile-kafka.service';

@Module({
  imports: [
    ConfigModule,
    ErrorsModule,

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
                configService
                  .getOrThrow<string>(
                    'KAFKA_AUTH_CLIENT_ID',
                  ),

              brokers:
                configService
                  .getOrThrow<string>(
                    'KAFKA_BROKERS',
                  )
                  .split(',')
                  .map((broker) =>
                    broker.trim(),
                  )
                  .filter(Boolean),
            },

            consumer: {
              groupId:
                configService
                  .getOrThrow<string>(
                    'KAFKA_AUTH_CONSUMER_GROUP_ID',
                  ),
            },
          },
        }),
      },

      {
        name: REFERENCE_KAFKA_CLIENT,
        imports: [ConfigModule],
        inject: [ConfigService],
        useFactory: (
          configService: ConfigService,
        ) => ({
          transport: Transport.KAFKA,
          options: {
            client: {
              clientId:
                configService
                  .getOrThrow<string>(
                    'KAFKA_REFERENCE_CLIENT_ID',
                  ),
    
              brokers:
                configService
                  .getOrThrow<string>(
                    'KAFKA_BROKERS',
                  )
                  .split(',')
                  .map((broker) =>
                    broker.trim(),
                  )
                  .filter(Boolean),
            },
    
            consumer: {
              groupId:
                configService
                  .getOrThrow<string>(
                    'KAFKA_REFERENCE_CONSUMER_GROUP_ID',
                  ),
            },
          },
        }),
      },

      {
        name: PROFILE_KAFKA_CLIENT,

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
            
          return {
            transport: Transport.KAFKA,
          
            options: {
              client: {
                clientId:
                  'KAFKA_PROFILE_CLIENT_ID',
                brokers,
              },
            
              consumer: {
                groupId:
                  'KAFKA_PROFILE_CONSUMER_GROUP_ID',
              },
            },
          };
        },
      },
    ]),
  ],
  providers: [
    AuthKafkaService,
    ReferenceKafkaService,
    ProfileKafkaService,
  ],
  exports: [
    AuthKafkaService,
    ReferenceKafkaService,
    ProfileKafkaService,
  ],
})
export class KafkaModule {}