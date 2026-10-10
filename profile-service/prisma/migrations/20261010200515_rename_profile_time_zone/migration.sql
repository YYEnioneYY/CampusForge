/*
  Warnings:

  - You are about to drop the column `time_zone` on the `user_profiles` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "user_profiles"
RENAME COLUMN "time_zone" TO "work_time_zone";
