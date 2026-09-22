-- AlterTable
ALTER TABLE "user_profiles" ADD COLUMN     "previous_username" VARCHAR(30),
ADD COLUMN     "username_changed_at" TIMESTAMPTZ;
