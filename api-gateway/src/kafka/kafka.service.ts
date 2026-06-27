import {
  GatewayTimeoutException,
  HttpException,
  Inject,
  Injectable,
  Logger,
  OnApplicationShutdown,
  OnModuleInit,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';
import { randomUUID } from 'crypto';
import {
  catchError,
  lastValueFrom,
  Observable,
  throwError,
  timeout,
  TimeoutError,
} from 'rxjs';
import { KAFKA_CLIENT } from './kafka.constants';
import { KafkaRequestResponseTopics } from './kafka.topics';
import {
  KafkaHeaders,
  KafkaMessage,
  KafkaRequestOptions,
} from './kafka.types';

@Injectable()
export class KafkaService implements OnModuleInit, OnApplicationShutdown {
  private readonly logger = new Logger(KafkaService.name);

  private readonly requestResponseTopics = KafkaRequestResponseTopics;

  constructor(
    @Inject(KAFKA_CLIENT)
    private readonly client: ClientKafka,
  ) {}

  async onModuleInit() {
    for (const topic of this.requestResponseTopics) {
      this.client.subscribeToResponseOf(topic);
    }

    await this.client.connect();

    this.logger.log('Kafka client connected');
  }

  async onApplicationShutdown() {
    await this.client.close();

    this.logger.log('Kafka client disconnected');
  }

  async send<TResponse, TData>(
    topic: string,
    data: TData,
    options?: KafkaRequestOptions,
  ): Promise<TResponse> {
    const message = this.buildMessage(data, options);
    const timeoutMs = options?.timeoutMs ?? 5000;

    return lastValueFrom(
      this.client.send<TResponse, KafkaMessage<TData>>(topic, message).pipe(
        timeout(timeoutMs),
        catchError((error) => this.handleKafkaError(error, topic)),
      ),
    );
  }

  emit<TData>(
    topic: string,
    data: TData,
    options?: KafkaRequestOptions,
  ): Observable<unknown> {
    const message = this.buildMessage(data, options);

    return this.client.emit(topic, message);
  }

  private buildMessage<TData>(
    data: TData,
    options?: KafkaRequestOptions,
  ): KafkaMessage<TData> {
    const requestId = options?.requestId || randomUUID();
    const correlationId = options?.correlationId || requestId;

    const headers: KafkaHeaders = {
      'x-source-service': 'api-gateway',
      'x-request-id': requestId,
      'x-correlation-id': correlationId,
      'x-timestamp': new Date().toISOString(),
      ...options?.headers,
    };

    if (options?.userId) {
      headers['x-user-id'] = options.userId;
    }

    return {
      key: options?.key,
      value: data,
      headers,
    };
  }

  private handleKafkaError(error: unknown, topic: string) {
    this.logger.error(`Kafka request failed. Topic: ${topic}`, error);

    if (error instanceof TimeoutError) {
      return throwError(
        () =>
          new GatewayTimeoutException(
            `Kafka service timeout. Topic: ${topic}`,
          ),
      );
    }

    const rpcError = this.extractRpcError(error);

    if (rpcError?.statusCode) {
      return throwError(() => new HttpException(rpcError, rpcError.statusCode));
    }

    return throwError(
      () =>
        new ServiceUnavailableException(
          `Kafka service unavailable. Topic: ${topic}`,
        ),
    );
  }

  private extractRpcError(error: unknown): any {
    if (!error || typeof error !== 'object') {
      return null;
    }

    const maybeError = error as any;

    if (typeof maybeError.statusCode === 'number') {
      return maybeError;
    }

    if (
      maybeError.response &&
      typeof maybeError.response.statusCode === 'number'
    ) {
      return maybeError.response;
    }

    if (maybeError.error && typeof maybeError.error.statusCode === 'number') {
      return maybeError.error;
    }

    return null;
  }
}