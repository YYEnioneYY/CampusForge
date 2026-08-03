import type { Prisma } from '../../generated/prisma/client';

export type CreateOutboxEventInput = {
  topic: string;
  eventType: string;
  eventVersion?: number;

  aggregateType: string;
  aggregateId: string;
  partitionKey?: string;

  payload: Prisma.InputJsonValue;
};