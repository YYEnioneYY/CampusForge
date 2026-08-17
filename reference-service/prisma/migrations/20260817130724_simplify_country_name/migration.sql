ALTER TABLE "countries"
RENAME COLUMN "name_ru" TO "name";

DROP INDEX IF EXISTS "countries_name_ru_idx";
DROP INDEX IF EXISTS "countries_name_en_idx";

ALTER TABLE "countries"
DROP COLUMN "name_en";

CREATE INDEX "countries_name_idx"
ON "countries"("name");