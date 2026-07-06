/*
  Warnings:

  - You are about to drop the column `phone` on the `users` table. All the data in the column will be lost.
  - Made the column `system_role` on table `users` required. This step will fail if there are existing NULL values in that column.

*/
-- DropIndex
DROP INDEX "users_phone_key";

-- AlterTable
ALTER TABLE "users" DROP COLUMN "phone",
ALTER COLUMN "system_role" SET NOT NULL,
ALTER COLUMN "system_role" SET DEFAULT 'user';
