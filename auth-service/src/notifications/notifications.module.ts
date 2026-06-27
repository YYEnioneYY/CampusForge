import { Global, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import {
  NOTIFICATIONS_KAFKA_CLIENT,
  NotificationsService,
} from './notifications.service';

@Global()
@Module({
  imports: [
    ClientsModule.registerAsync([
      {
        name: NOTIFICATIONS_KAFKA_CLIENT,
        imports: [ConfigModule],
        inject: [ConfigService],
        useFactory: (configService: ConfigService) => ({
          transport: Transport.KAFKA,
          options: {
            client: {
              clientId: 'auth-service-notifications-client',
              brokers: [
                configService.get<string>('KAFKA_BROKER') || 'kafka:9092',
              ],
            },
            consumer: {
              groupId: 'auth-service-notifications-client-group',
            },
          },
        }),
      },
    ]),
  ],
  providers: [NotificationsService],
  exports: [NotificationsService],
})
export class NotificationsModule {}