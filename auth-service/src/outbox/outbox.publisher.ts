import {
  Inject,
  Injectable,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Interval } from '@nestjs/schedule';
import { ClientKafka } from '@nestjs/microservices';
import { randomUUID } from 'node:crypto';
import { hostname } from 'node:os';
import { lastValueFrom } from 'rxjs';

import {
  OUTBOX_KAFKA_CLIENT,
  OUTBOX_PUBLISH_INTERVAL_MS,
} from './outbox.constants';
import { OutboxRepository } from './outbox.repository';
import type { ClaimedOutboxEvent } from './types/claimed-outbox-event.type';
import type { IntegrationEventEnvelope } from './types/integration-event-envelope.type';

@Injectable()
export class OutboxPublisher {
  private readonly logger =
    new Logger(OutboxPublisher.name);

  private readonly workerId =
    `${hostname()}:${process.pid}:${randomUUID()}`;

  private readonly batchSize: number;
  private readonly maxAttempts: number;
  private readonly lockTimeoutSeconds: number;
  private readonly enabled: boolean;

  private processing = false;

  constructor(
    @Inject(OUTBOX_KAFKA_CLIENT)
    private readonly kafkaClient:
      ClientKafka,

    private readonly outboxRepository:
      OutboxRepository,

    private readonly configService:
      ConfigService,
  ) {
    this.batchSize =
      this.getPositiveInteger(
        'OUTBOX_BATCH_SIZE',
        20,
      );

    this.maxAttempts =
      this.getPositiveInteger(
        'OUTBOX_MAX_ATTEMPTS',
        25,
      );

    this.lockTimeoutSeconds =
      this.getPositiveInteger(
        'OUTBOX_LOCK_TIMEOUT_SECONDS',
        300,
      );

    this.enabled =
      this.getBoolean(
        'OUTBOX_PUBLISHER_ENABLED',
        true,
      );
  }

  @Interval(
    'outbox-publisher',
    OUTBOX_PUBLISH_INTERVAL_MS,
  )
  async publishPendingEvents(): Promise<void> {
    if (!this.enabled || this.processing) {
      return;
    }

    this.processing = true;

    try {
      const events =
        await this.outboxRepository.claimBatch({
          workerId: this.workerId,
          batchSize: this.batchSize,
          lockTimeoutSeconds:
            this.lockTimeoutSeconds,
        });

      for (const event of events) {
        await this.publishEvent(event);
      }
    } catch (error) {
      this.logger.error(
        'Failed to claim outbox events',
        this.getErrorStack(error),
      );
    } finally {
      this.processing = false;
    }
  }

  private async publishEvent(
    event: ClaimedOutboxEvent,
  ): Promise<void> {
    const envelope =
      this.createEnvelope(event);

    try {
      await lastValueFrom(
        this.kafkaClient.emit(
          event.topic,
          {
            key: event.partitionKey,

            value: event.payload,

            headers: {
              'x-event-id':
                event.id,

              'x-event-type':
                event.eventType,

              'x-event-version':
                String(
                  event.eventVersion,
                ),
            },
          },
        ),
      );
    } catch (error) {
      await this.handlePublishFailure(
        event,
        error,
      );

      return;
    }

    try {
      const marked =
        await this.outboxRepository
          .markPublished({
            eventId: event.id,
            workerId: this.workerId,
          });

      if (!marked) {
        this.logger.warn(
          `Outbox event ${event.id} was published but could not be marked as published`,
        );

        return;
      }

      this.logger.debug(
        `Published outbox event ${event.id} to ${event.topic}`,
      );
    } catch (error) {
      this.logger.error(
        `Outbox event ${event.id} was sent to Kafka but could not be marked as published`,
        this.getErrorStack(error),
      );
    }
  }

  private async handlePublishFailure(
    event: ClaimedOutboxEvent,
    error: unknown,
  ): Promise<void> {
    const delaySeconds =
      this.getRetryDelaySeconds(
        event.attempts,
      );

    const nextAttemptAt =
      new Date(
        Date.now() +
          delaySeconds * 1_000,
      );

    const errorMessage =
      this.getErrorMessage(error);

    try {
      const result =
        await this.outboxRepository
          .markFailed({
            eventId: event.id,
            workerId: this.workerId,

            attempts: event.attempts,
            maxAttempts:
              this.maxAttempts,

            nextAttemptAt,
            errorMessage,
          });

      if (!result.updated) {
        this.logger.warn(
          `Failed to update outbox event ${event.id} after Kafka error`,
        );

        return;
      }

      if (result.dead) {
        this.logger.error(
          `Outbox event ${event.id} moved to DEAD after ${event.attempts} attempts`,
        );

        return;
      }

      this.logger.warn(
        `Failed to publish outbox event ${event.id}; retry in ${delaySeconds} seconds`,
      );
    } catch (markError) {
      this.logger.error(
        `Failed to persist publishing error for outbox event ${event.id}`,
        this.getErrorStack(markError),
      );
    }
  }

  private createEnvelope(
    event: ClaimedOutboxEvent,
  ): IntegrationEventEnvelope {
    return {
      eventId: event.id,
      eventType: event.eventType,
      eventVersion:
        event.eventVersion,

      occurredAt:
        event.createdAt.toISOString(),

      aggregateType:
        event.aggregateType,

      aggregateId:
        event.aggregateId,

      data: event.payload,
    };
  }

  private getRetryDelaySeconds(
    attempts: number,
  ): number {
    const exponentialDelay =
      5 *
      2 **
        Math.max(
          0,
          Math.min(attempts - 1, 6),
        );

    return Math.min(
      exponentialDelay,
      300,
    );
  }

  private getErrorMessage(
    error: unknown,
  ): string {
    if (error instanceof Error) {
      return `${error.name}: ${error.message}`
        .slice(0, 4_000);
    }

    return 'Unknown Kafka publishing error';
  }

  private getErrorStack(
    error: unknown,
  ): string | undefined {
    return error instanceof Error
      ? error.stack
      : undefined;
  }

  private getPositiveInteger(
    key: string,
    defaultValue: number,
  ): number {
    const rawValue =
      this.configService.get<
        string | number
      >(key);

    if (
      rawValue === undefined ||
      rawValue === null
    ) {
      return defaultValue;
    }

    const value = Number(rawValue);

    if (
      !Number.isInteger(value) ||
      value <= 0
    ) {
      throw new Error(
        `${key} must be a positive integer`,
      );
    }

    return value;
  }

  private getBoolean(
    key: string,
    defaultValue: boolean,
  ): boolean {
    const rawValue =
      this.configService.get<
        string | boolean
      >(key);

    if (
      rawValue === undefined ||
      rawValue === null
    ) {
      return defaultValue;
    }

    if (typeof rawValue === 'boolean') {
      return rawValue;
    }

    if (rawValue === 'true') {
      return true;
    }

    if (rawValue === 'false') {
      return false;
    }

    throw new Error(
      `${key} must be true or false`,
    );
  }
}