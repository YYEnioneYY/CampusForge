-- CreateEnum
CREATE TYPE "profile_visibility" AS ENUM ('public', 'private', 'organization_only');

-- CreateTable
CREATE TABLE "user_profiles" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "first_name" VARCHAR(255) NOT NULL,
    "last_name" VARCHAR(255) NOT NULL,
    "middle_name" VARCHAR(255),
    "avatar_url" TEXT,
    "bio" TEXT,
    "city" VARCHAR(255),
    "country" VARCHAR(255),
    "date_of_birth" DATE,
    "visibility" "profile_visibility" NOT NULL DEFAULT 'public',
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "user_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_profiles_user_id_key" ON "user_profiles"("user_id");
