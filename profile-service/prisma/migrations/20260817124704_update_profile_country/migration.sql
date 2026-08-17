/*
  Warnings:

  - You are about to drop the column `city` on the `user_profiles` table. All the data in the column will be lost.
  - You are about to drop the column `country` on the `user_profiles` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "user_profiles" DROP COLUMN "city",
DROP COLUMN "country",
ADD COLUMN     "country_code" CHAR(2),
ADD COLUMN     "country_name" VARCHAR(150);
