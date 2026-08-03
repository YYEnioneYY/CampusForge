-- CreateEnum
CREATE TYPE "OutboxEventStatus" AS ENUM ('PENDING', 'PROCESSING', 'PUBLISHED', 'DEAD');

-- CreateTable
CREATE TABLE "outbox_events" (
    "id" UUID NOT NULL,
    "topic" VARCHAR(255) NOT NULL,
    "event_type" VARCHAR(150) NOT NULL,
    "event_version" INTEGER NOT NULL DEFAULT 1,
    "aggregate_type" VARCHAR(100) NOT NULL,
    "aggregate_id" VARCHAR(255) NOT NULL,
    "partition_key" VARCHAR(255) NOT NULL,
    "payload" JSONB NOT NULL,
    "status" "OutboxEventStatus" NOT NULL DEFAULT 'PENDING',
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "available_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "locked_at" TIMESTAMPTZ(3),
    "locked_by" VARCHAR(100),
    "published_at" TIMESTAMPTZ(3),
    "last_error" TEXT,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "outbox_events_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "outbox_events_status_available_at_idx" ON "outbox_events"("status", "available_at");

-- CreateIndex
CREATE INDEX "outbox_events_aggregate_idx" ON "outbox_events"("aggregate_type", "aggregate_id");

-- CreateIndex
CREATE INDEX "outbox_events_locked_at_idx" ON "outbox_events"("locked_at");
