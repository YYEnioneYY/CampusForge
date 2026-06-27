import { Global, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { KAFKA_CLIENT } from './kafka.constants';
import { KafkaService } from './kafka.service';

@Global()
@Module({
  imports: [
    ConfigModule,
    ClientsModule.registerAsync([
      {
        name: KAFKA_CLIENT,
        imports: [ConfigModule],
        inject: [ConfigService],
        useFactory: (configService: ConfigService) => ({
          transport: Transport.KAFKA,
          options: {
            client: {
              clientId:
                configService.get<string>('KAFKA_CLIENT_ID') || 'api-gateway',
              brokers: [
                configService.get<string>('KAFKA_BROKER') || 'kafka:9092',
              ],
            },
            consumer: {
              groupId:
                configService.get<string>('KAFKA_GROUP_ID_API_GATEWAY') ||
                'api-gateway-consumer',
            },
          },
        }),
      },
    ]),
  ],
  providers: [KafkaService],
  exports: [KafkaService],
})
export class KafkaModule {}