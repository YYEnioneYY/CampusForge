-- CreateEnum
CREATE TYPE "organization_visibility" AS ENUM ('public', 'private');

-- CreateEnum
CREATE TYPE "organization_status" AS ENUM ('active', 'archived', 'suspended');

-- CreateTable
CREATE TABLE "organizations" (
    "id" UUID NOT NULL,
    "name" VARCHAR(120) NOT NULL,
    "slug" VARCHAR(80) NOT NULL,
    "description" TEXT,
    "logo_id" UUID,
    "website_url" VARCHAR(2048),
    "contact_email" VARCHAR(320),
    "time_zone" VARCHAR(100) NOT NULL DEFAULT 'UTC',
    "visibility" "organization_visibility" NOT NULL DEFAULT 'private',
    "status" "organization_status" NOT NULL DEFAULT 'active',
    "created_by_user_id" UUID NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,
    "deleted_at" TIMESTAMPTZ,

    CONSTRAINT "organizations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "organizations_slug_key" ON "organizations"("slug");

-- CreateIndex
CREATE INDEX "organizations_created_by_user_id_idx" ON "organizations"("created_by_user_id");

-- CreateIndex
CREATE INDEX "organizations_status_visibility_deleted_at_idx" ON "organizations"("status", "visibility", "deleted_at");
