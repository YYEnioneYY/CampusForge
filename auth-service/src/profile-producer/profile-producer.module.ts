import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ProfileProducerService } from './profile-producer.service';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'PROFILE_SERVICE',
        transport: Transport.KAFKA,
        options: {
          client: {
            clientId:
              process.env.KAFKA_PROFILE_CLIENT_ID ??
              'auth-service-profile-client',
            brokers: (process.env.KAFKA_BROKERS ?? 'localhost:9092')
              .split(',')
              .map((broker) => broker.trim())
              .filter(Boolean),
          },
          producerOnlyMode: true,
        },
      },
    ]),
  ],
  providers: [ProfileProducerService],
  exports: [ProfileProducerService],
})
export class ProfileProducerModule {}