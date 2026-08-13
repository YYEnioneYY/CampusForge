-- CreateEnum
CREATE TYPE "AccessScopeType" AS ENUM ('GLOBAL', 'ORGANIZATION', 'PROJECT');

-- CreateTable
CREATE TABLE "permissions" (
    "id" UUID NOT NULL,
    "code" VARCHAR(150) NOT NULL,
    "name" VARCHAR(150) NOT NULL,
    "description" TEXT,
    "scope_type" "AccessScopeType" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "permissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "roles" (
    "id" UUID NOT NULL,
    "key" VARCHAR(255) NOT NULL,
    "code" VARCHAR(100) NOT NULL,
    "name" VARCHAR(150) NOT NULL,
    "description" TEXT,
    "scope_type" "AccessScopeType" NOT NULL,
    "owner_scope_id" UUID,
    "is_system" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "role_permissions" (
    "role_id" UUID NOT NULL,
    "permission_id" UUID NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "role_permissions_pkey" PRIMARY KEY ("role_id","permission_id")
);

-- CreateTable
CREATE TABLE "role_assignments" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "role_id" UUID NOT NULL,
    "scope_type" "AccessScopeType" NOT NULL,
    "scope_id" UUID,
    "scope_key" VARCHAR(128) NOT NULL,
    "assigned_by_user_id" UUID,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "role_assignments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "permissions_code_key" ON "permissions"("code");

-- CreateIndex
CREATE INDEX "permissions_scope_type_idx" ON "permissions"("scope_type");

-- CreateIndex
CREATE UNIQUE INDEX "roles_key_key" ON "roles"("key");

-- CreateIndex
CREATE INDEX "roles_scope_type_idx" ON "roles"("scope_type");

-- CreateIndex
CREATE INDEX "roles_scope_type_owner_scope_id_idx" ON "roles"("scope_type", "owner_scope_id");

-- CreateIndex
CREATE INDEX "roles_code_idx" ON "roles"("code");

-- CreateIndex
CREATE INDEX "role_permissions_permission_id_idx" ON "role_permissions"("permission_id");

-- CreateIndex
CREATE INDEX "role_assignments_user_id_idx" ON "role_assignments"("user_id");

-- CreateIndex
CREATE INDEX "role_assignments_user_id_scope_key_idx" ON "role_assignments"("user_id", "scope_key");

-- CreateIndex
CREATE INDEX "role_assignments_scope_type_scope_id_idx" ON "role_assignments"("scope_type", "scope_id");

-- CreateIndex
CREATE INDEX "role_assignments_role_id_idx" ON "role_assignments"("role_id");

-- CreateIndex
CREATE UNIQUE INDEX "role_assignments_user_id_role_id_scope_key_key" ON "role_assignments"("user_id", "role_id", "scope_key");

-- AddForeignKey
ALTER TABLE "role_permissions" ADD CONSTRAINT "role_permissions_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "roles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "role_permissions" ADD CONSTRAINT "role_permissions_permission_id_fkey" FOREIGN KEY ("permission_id") REFERENCES "permissions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "role_assignments" ADD CONSTRAINT "role_assignments_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "roles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
