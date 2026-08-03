import { Injectable } from '@nestjs/common';

import {
  OutboxEventStatus,
} from '../generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import type { ClaimedOutboxEvent } from './types/claimed-outbox-event.type';

type ClaimOutboxEventsInput = {
  workerId: string;
  batchSize: number;
  lockTimeoutSeconds: number;
};

type MarkOutboxEventPublishedInput = {
  eventId: string;
  workerId: string;
};

type MarkOutboxEventFailedInput = {
  eventId: string;
  workerId: string;

  attempts: number;
  maxAttempts: number;

  nextAttemptAt: Date;
  errorMessage: string;
};

@Injectable()
export class OutboxRepository {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  async claimBatch(
    input: ClaimOutboxEventsInput,
  ): Promise<ClaimedOutboxEvent[]> {
    const {
      workerId,
      batchSize,
      lockTimeoutSeconds,
    } = input;

    return this.prisma
      .$queryRaw<ClaimedOutboxEvent[]>`
        WITH candidates AS (
          SELECT event."id"
          FROM "outbox_events" AS event
          WHERE (
            (
              event."status" = 'PENDING'
              AND event."available_at" <= NOW()
            )
            OR (
              event."status" = 'PROCESSING'
              AND event."locked_at" IS NOT NULL
              AND event."locked_at" <=
                NOW() - (
                  ${lockTimeoutSeconds}::int
                  * INTERVAL '1 second'
                )
            )
          )
          AND NOT EXISTS (
            SELECT 1
            FROM "outbox_events" AS previous
            WHERE
              previous."aggregate_type" =
                event."aggregate_type"
              AND previous."aggregate_id" =
                event."aggregate_id"
              AND previous."status"
                IN ('PENDING', 'PROCESSING')
              AND (
                previous."created_at" <
                  event."created_at"
                OR (
                  previous."created_at" =
                    event."created_at"
                  AND previous."id" < event."id"
                )
              )
          )
          ORDER BY
            event."available_at" ASC,
            event."created_at" ASC,
            event."id" ASC
          FOR UPDATE SKIP LOCKED
          LIMIT ${batchSize}
        )
        UPDATE "outbox_events" AS event
        SET
          "status" = 'PROCESSING',
          "locked_at" = NOW(),
          "locked_by" = ${workerId},
          "attempts" = event."attempts" + 1,
          "updated_at" = NOW()
        FROM candidates
        WHERE event."id" = candidates."id"
        RETURNING
          event."id",
          event."topic",
          event."event_type" AS "eventType",
          event."event_version" AS "eventVersion",
          event."aggregate_type" AS "aggregateType",
          event."aggregate_id" AS "aggregateId",
          event."partition_key" AS "partitionKey",
          event."payload",
          event."attempts",
          event."created_at" AS "createdAt";
      `;
  }

  async markPublished(
    input: MarkOutboxEventPublishedInput,
  ): Promise<boolean> {
    const result =
      await this.prisma.outboxEvent.updateMany({
        where: {
          id: input.eventId,
          status:
            OutboxEventStatus.PROCESSING,
          lockedBy: input.workerId,
        },
        data: {
          status:
            OutboxEventStatus.PUBLISHED,
          publishedAt: new Date(),

          lockedAt: null,
          lockedBy: null,
          lastError: null,
        },
      });

    return result.count === 1;
  }

  async markFailed(
    input: MarkOutboxEventFailedInput,
  ): Promise<{
    updated: boolean;
    dead: boolean;
  }> {
    const dead =
      input.attempts >= input.maxAttempts;

    const result =
      await this.prisma.outboxEvent.updateMany({
        where: {
          id: input.eventId,
          status:
            OutboxEventStatus.PROCESSING,
          lockedBy: input.workerId,
        },
        data: {
          status: dead
            ? OutboxEventStatus.DEAD
            : OutboxEventStatus.PENDING,

          lockedAt: null,
          lockedBy: null,

          lastError: input.errorMessage,

          ...(
            dead
              ? {}
              : {
                  availableAt:
                    input.nextAttemptAt,
                }
          ),
        },
      });

    return {
      updated: result.count === 1,
      dead,
    };
  }
}