/*
  Warnings:

  - Added the required column `verification_status` to the `organizations` table without a default value. This is not possible if the table is not empty.
  - Added the required column `verified_at` to the `organizations` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "organization_verification_status" AS ENUM ('verified', 'review_required', 'revoked');

-- AlterTable
ALTER TABLE "organizations" ADD COLUMN     "verification_status" "organization_verification_status" NOT NULL,
ADD COLUMN     "verified_at" TIMESTAMPTZ NOT NULL;

-- CreateIndex
CREATE INDEX "organizations_verification_status_idx" ON "organizations"("verification_status");
