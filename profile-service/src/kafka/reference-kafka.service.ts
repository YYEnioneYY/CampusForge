import {
  Inject,
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ClientKafka } from '@nestjs/microservices';
import {
  Observable,
  timeout,
} from 'rxjs';

import {
  REFERENCE_KAFKA_CLIENT,
} from './kafka.constants';

import {
  REFERENCE_RESPONSE_PATTERNS,
} from './patterns/reference-patterns';

@Injectable()
export class ReferenceKafkaService
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(
    ReferenceKafkaService.name,
  );

  private readonly requestTimeoutMs: number;

  constructor(
    @Inject(REFERENCE_KAFKA_CLIENT)
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
      const pattern of
        REFERENCE_RESPONSE_PATTERNS
    ) {
      this.client.subscribeToResponseOf(
        pattern,
      );
    }

    this.client.status.subscribe(
      (status) => {
        this.logger.log(
          `Reference Kafka status: ${status}`,
        );
      },
    );

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