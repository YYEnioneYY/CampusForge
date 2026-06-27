-- CreateEnum
CREATE TYPE "notification_type" AS ENUM ('project_application', 'project_invitation', 'project_application_status', 'task_assigned', 'task_comment', 'deadline_reminder', 'project_status_changed', 'evaluation_received', 'organization_invitation', 'system_message');

-- CreateTable
CREATE TABLE "notifications" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "type" "notification_type" NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "message" TEXT,
    "entity_type" VARCHAR(255),
    "entity_id" UUID,
    "is_read" BOOLEAN NOT NULL DEFAULT false,
    "read_at" TIMESTAMPTZ,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMPTZ,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notification_settings" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "in_app_enabled" BOOLEAN NOT NULL DEFAULT true,
    "email_enabled" BOOLEAN NOT NULL DEFAULT true,
    "telegram_enabled" BOOLEAN NOT NULL DEFAULT false,
    "push_enabled" BOOLEAN NOT NULL DEFAULT false,
    "project_updates_enabled" BOOLEAN NOT NULL DEFAULT true,
    "task_updates_enabled" BOOLEAN NOT NULL DEFAULT true,
    "deadline_reminders_enabled" BOOLEAN NOT NULL DEFAULT true,
    "evaluation_notifications_enabled" BOOLEAN NOT NULL DEFAULT true,
    "marketing_enabled" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "notification_settings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "notifications_user_id_idx" ON "notifications"("user_id");

-- CreateIndex
CREATE INDEX "notifications_user_id_is_read_idx" ON "notifications"("user_id", "is_read");

-- CreateIndex
CREATE INDEX "notifications_user_id_created_at_idx" ON "notifications"("user_id", "created_at");

-- CreateIndex
CREATE INDEX "notifications_type_idx" ON "notifications"("type");

-- CreateIndex
CREATE INDEX "notifications_entity_type_entity_id_idx" ON "notifications"("entity_type", "entity_id");

-- CreateIndex
CREATE UNIQUE INDEX "notification_settings_user_id_key" ON "notification_settings"("user_id");
