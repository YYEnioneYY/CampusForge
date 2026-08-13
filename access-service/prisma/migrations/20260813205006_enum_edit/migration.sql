/*
  Warnings:

  - Changed the type of `scope_type` on the `permissions` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `scope_type` on the `role_assignments` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `scope_type` on the `roles` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "access_scope_type" AS ENUM ('global', 'organization', 'project');

-- AlterTable
ALTER TABLE "permissions" DROP COLUMN "scope_type",
ADD COLUMN     "scope_type" "access_scope_type" NOT NULL;

-- AlterTable
ALTER TABLE "role_assignments" DROP COLUMN "scope_type",
ADD COLUMN     "scope_type" "access_scope_type" NOT NULL;

-- AlterTable
ALTER TABLE "roles" DROP COLUMN "scope_type",
ADD COLUMN     "scope_type" "access_scope_type" NOT NULL;

-- DropEnum
DROP TYPE "AccessScopeType";

-- CreateIndex
CREATE INDEX "permissions_scope_type_idx" ON "permissions"("scope_type");

-- CreateIndex
CREATE INDEX "role_assignments_scope_type_scope_id_idx" ON "role_assignments"("scope_type", "scope_id");

-- CreateIndex
CREATE INDEX "roles_scope_type_idx" ON "roles"("scope_type");

-- CreateIndex
CREATE INDEX "roles_scope_type_owner_scope_id_idx" ON "roles"("scope_type", "owner_scope_id");
