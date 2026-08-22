import {
  Inject,
  Injectable,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';

import {
  ClientKafka,
} from '@nestjs/microservices';

import {
  lastValueFrom,
} from 'rxjs';

import {
  MEDIA_PATTERNS,
} from '../kafka/patterns/media-patterns';

import type {
  MediaFileReadyEvent,
} from '../media/types/media-file-ready-event.type';

@Injectable()
export class MediaEventProducerService
  implements
    OnModuleInit,
    OnModuleDestroy
{
  constructor(
    @Inject('MEDIA_EVENT_PRODUCER')
    private readonly client:
      ClientKafka,
  ) {}

  async onModuleInit(): Promise<void> {
    await this.client.connect();
  }

  async onModuleDestroy(): Promise<void> {
    await this.client.close();
  }

  async emitFileReady(
    event: MediaFileReadyEvent,
  ): Promise<void> {
    await lastValueFrom(
      this.client.emit<
        void,
        MediaFileReadyEvent
      >(
        MEDIA_PATTERNS.FILE_READY,
        event,
      ),
    );
  }
}