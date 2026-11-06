-- CreateEnum
CREATE TYPE "organization_creation_request_status" AS ENUM ('draft', 'submitted', 'in_review', 'approved', 'rejected', 'cancelled');

-- CreateTable
CREATE TABLE "organization_creation_requests" (
    "id" UUID NOT NULL,
    "applicant_user_id" UUID NOT NULL,
    "name" VARCHAR(120) NOT NULL,
    "slug" VARCHAR(80) NOT NULL,
    "description" TEXT,
    "legal_name" VARCHAR(255) NOT NULL,
    "registration_country_code" CHAR(2) NOT NULL,
    "registration_number" VARCHAR(100) NOT NULL,
    "tax_id" VARCHAR(100),
    "website_url" VARCHAR(2048),
    "contact_email" VARCHAR(320),
    "time_zone" VARCHAR(100) NOT NULL DEFAULT 'UTC',
    "status" "organization_creation_request_status" NOT NULL DEFAULT 'draft',
    "reviewed_by_user_id" UUID,
    "review_comment" TEXT,
    "organization_id" UUID,
    "submitted_at" TIMESTAMPTZ,
    "reviewed_at" TIMESTAMPTZ,
    "cancelled_at" TIMESTAMPTZ,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "organization_creation_requests_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "organization_creation_requests_organization_id_key" ON "organization_creation_requests"("organization_id");

-- CreateIndex
CREATE INDEX "organization_creation_requests_applicant_user_id_status_idx" ON "organization_creation_requests"("applicant_user_id", "status");

-- CreateIndex
CREATE INDEX "organization_creation_requests_status_created_at_idx" ON "organization_creation_requests"("status", "created_at");

-- CreateIndex
CREATE INDEX "organization_creation_requests_reviewed_by_user_id_idx" ON "organization_creation_requests"("reviewed_by_user_id");

-- CreateIndex
CREATE INDEX "organization_creation_requests_slug_idx" ON "organization_creation_requests"("slug");

-- CreateIndex
CREATE INDEX "organization_creation_requests_registration_country_code_re_idx" ON "organization_creation_requests"("registration_country_code", "registration_number");

-- AddForeignKey
ALTER TABLE "organization_creation_requests" ADD CONSTRAINT "organization_creation_requests_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE SET NULL ON UPDATE CASCADE;
