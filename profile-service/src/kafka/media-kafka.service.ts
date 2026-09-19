import {
  Inject,
  Injectable,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';

import { ConfigService } from '@nestjs/config';
import { ClientKafka } from '@nestjs/microservices';
import { Observable, timeout } from 'rxjs';

import {
  MEDIA_KAFKA_CLIENT,
} from './kafka.constants';

import {
  MEDIA_RESPONSE_PATTERNS,
} from './patterns/media-patterns';

@Injectable()
export class MediaKafkaService
  implements OnModuleInit, OnModuleDestroy
{
  private readonly requestTimeoutMs: number;

  constructor(
    @Inject(MEDIA_KAFKA_CLIENT)
    private readonly client: ClientKafka,

    private readonly configService:
      ConfigService,
  ) {
    this.requestTimeoutMs =
      this.configService.getOrThrow<number>(
        'KAFKA_REQUEST_TIMEOUT_MS',
      );
  }

  async onModuleInit(): Promise<void> {
    for (
      const pattern of MEDIA_RESPONSE_PATTERNS
    ) {
      this.client.subscribeToResponseOf(
        pattern,
      );
    }

    await this.client.connect();
  }

  async onModuleDestroy(): Promise<void> {
    await this.client.close();
  }

  send<TResponse, TPayload>(
    pattern: string,
    payload: TPayload,
  ): Observable<TResponse> {
    return this.client
      .send<TResponse, TPayload>(
        pattern,
        payload,
      )
      .pipe(
        timeout({
          first: this.requestTimeoutMs,
        }),
      );
  }
}