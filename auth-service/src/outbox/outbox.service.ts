import { Injectable } from '@nestjs/common';

import type { Prisma } from '../generated/prisma/client';
import type { CreateOutboxEventInput } from './types/create-outbox-event.input';

@Injectable()
export class OutboxService {
  async enqueue(
    transaction: Prisma.TransactionClient,
    input: CreateOutboxEventInput,
  ): Promise<{ id: string }> {
    return transaction.outboxEvent.create({
      data: {
        topic: input.topic,
        eventType: input.eventType,
        eventVersion: input.eventVersion ?? 1,

        aggregateType: input.aggregateType,
        aggregateId: input.aggregateId,

        partitionKey:
          input.partitionKey ??
          input.aggregateId,

        payload: input.payload,
      },

      select: {
        id: true,
      },
    });
  }
}