/*
  Warnings:

  - The values [organization_only] on the enum `profile_visibility` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "profile_visibility_new" AS ENUM ('public', 'private', 'shared_organization');
ALTER TABLE "public"."user_profiles" ALTER COLUMN "visibility" DROP DEFAULT;
ALTER TABLE "user_profiles" ALTER COLUMN "visibility" TYPE "profile_visibility_new" USING ("visibility"::text::"profile_visibility_new");
ALTER TYPE "profile_visibility" RENAME TO "profile_visibility_old";
ALTER TYPE "profile_visibility_new" RENAME TO "profile_visibility";
DROP TYPE "public"."profile_visibility_old";
ALTER TABLE "user_profiles" ALTER COLUMN "visibility" SET DEFAULT 'public';
COMMIT;
