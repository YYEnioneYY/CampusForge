/*
  Warnings:

  - You are about to drop the column `avatar_url` on the `user_profiles` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "user_profiles" DROP COLUMN "avatar_url",
ADD COLUMN     "avatar_id" UUID;
