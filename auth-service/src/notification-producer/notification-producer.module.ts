import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { NotificationProducerService } from './notification-producer.service';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'NOTIFICATION_SERVICE',
        transport: Transport.KAFKA,
        options: {
          client: {
            clientId: process.env.KAFKA_NOTIFICATION_CLIENT_ID ?? 'auth-service-notification-client',
            brokers: (process.env.KAFKA_BROKERS ?? 'localhost:9092')
              .split(',')
              .map((broker) => broker.trim()),
          },
          producerOnlyMode: true,
        },
      },
    ]),
  ],
  providers: [NotificationProducerService],
  exports: [NotificationProducerService],
})
export class NotificationProducerModule {}