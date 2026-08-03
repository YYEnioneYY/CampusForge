import type { Prisma } from '../../generated/prisma/client';

export type IntegrationEventEnvelope = {
  eventId: string;
  eventType: string;
  eventVersion: number;

  occurredAt: string;

  aggregateType: string;
  aggregateId: string;

  data: Prisma.JsonValue;
};