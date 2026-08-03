import type { Prisma } from '../../generated/prisma/client';

export type ClaimedOutboxEvent = {
  id: string;

  topic: string;
  eventType: string;
  eventVersion: number;

  aggregateType: string;
  aggregateId: string;
  partitionKey: string;

  payload: Prisma.JsonValue;

  attempts: number;
  createdAt: Date;
};