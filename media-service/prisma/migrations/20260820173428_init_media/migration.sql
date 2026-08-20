-- CreateEnum
CREATE TYPE "media_owner_type" AS ENUM ('user', 'organization', 'project');

-- CreateEnum
CREATE TYPE "media_purpose" AS ENUM ('profile_avatar');

-- CreateEnum
CREATE TYPE "media_status" AS ENUM ('pending', 'ready', 'expired', 'deleted');

-- CreateTable
CREATE TABLE "media_files" (
    "id" UUID NOT NULL,
    "owner_type" "media_owner_type" NOT NULL,
    "owner_id" UUID NOT NULL,
    "uploaded_by_user_id" UUID NOT NULL,
    "purpose" "media_purpose" NOT NULL,
    "object_key" VARCHAR(1024) NOT NULL,
    "content_type" VARCHAR(150) NOT NULL,
    "size_bytes" BIGINT,
    "status" "media_status" NOT NULL DEFAULT 'pending',
    "expires_at" TIMESTAMPTZ,
    "completed_at" TIMESTAMPTZ,
    "deleted_at" TIMESTAMPTZ,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "media_files_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "media_files_object_key_key" ON "media_files"("object_key");

-- CreateIndex
CREATE INDEX "media_files_owner_type_owner_id_idx" ON "media_files"("owner_type", "owner_id");

-- CreateIndex
CREATE INDEX "media_files_owner_type_owner_id_purpose_idx" ON "media_files"("owner_type", "owner_id", "purpose");

-- CreateIndex
CREATE INDEX "media_files_uploaded_by_user_id_idx" ON "media_files"("uploaded_by_user_id");

-- CreateIndex
CREATE INDEX "media_files_status_idx" ON "media_files"("status");

-- CreateIndex
CREATE INDEX "media_files_status_expires_at_idx" ON "media_files"("status", "expires_at");
