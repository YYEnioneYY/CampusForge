/*
  Warnings:

  - You are about to drop the column `name` on the `countries` table. All the data in the column will be lost.
  - Added the required column `name_en` to the `countries` table without a default value. This is not possible if the table is not empty.
  - Added the required column `name_ru` to the `countries` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "countries_name_idx";

-- AlterTable
ALTER TABLE "countries" DROP COLUMN "name",
ADD COLUMN     "name_en" VARCHAR(150) NOT NULL,
ADD COLUMN     "name_ru" VARCHAR(150) NOT NULL;

-- CreateIndex
CREATE INDEX "countries_name_en_idx" ON "countries"("name_en");

-- CreateIndex
CREATE INDEX "countries_name_ru_idx" ON "countries"("name_ru");
