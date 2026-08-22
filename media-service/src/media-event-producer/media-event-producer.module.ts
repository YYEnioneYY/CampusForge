import {
  Module,
} from '@nestjs/common';

import {
  ClientsModule,
  Transport,
} from '@nestjs/microservices';

import { MediaEventProducerService } from './media-event-producer.service';

@Module({
  imports: [
    ClientsModule.register([
      {
        name:
          'MEDIA_EVENT_PRODUCER',

        transport:
          Transport.KAFKA,

        options: {
          client: {
            clientId:
              process.env
                .KAFKA_MEDIA_EVENT_CLIENT_ID ??
              'media-service-event-producer',

            brokers:
              (
                process.env.KAFKA_BROKERS ??
                'localhost:9092'
              )
                .split(',')
                .map(
                  (broker) =>
                    broker.trim(),
                ),
          },

          producerOnlyMode: true,
        },
      },
    ]),
  ],

  providers: [
    MediaEventProducerService,
  ],

  exports: [
    MediaEventProducerService,
  ],
})
export class MediaEventProducerModule {}