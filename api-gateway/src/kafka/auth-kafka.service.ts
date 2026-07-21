import {
  Inject,
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';
import { Observable } from 'rxjs';
import { AUTH_RESPONSE_PATTERNS } from './patterns/auth-patterns';
import { AUTH_KAFKA_CLIENT } from './kafka.constants';

@Injectable()
export class AuthKafkaService
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(
    AuthKafkaService.name,
  );

  constructor(
    @Inject(AUTH_KAFKA_CLIENT)
    private readonly client: ClientKafka,
  ) {}

  async onModuleInit(): Promise<void> {
    for (const pattern of AUTH_RESPONSE_PATTERNS) {
      this.client.subscribeToResponseOf(pattern);
    }

    this.client.status.subscribe((status) => {
      this.logger.log(`Kafka status: ${status}`);
    });

    await this.client.connect();
  }

  async onModuleDestroy(): Promise<void> {
    await this.client.close();
  }

  send<TResponse, TPayload>(
    pattern: string,
    payload: TPayload,
  ): Observable<TResponse> {
    return this.client.send<TResponse, TPayload>(
      pattern,
      payload,
    );
  }

  emit<TPayload>(
    pattern: string,
    payload: TPayload,
  ): Observable<void> {
    return this.client.emit<void, TPayload>(
      pattern,
      payload,
    );
  }
}