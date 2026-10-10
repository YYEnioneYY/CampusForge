-- AlterTable
ALTER TABLE "user_profiles" ADD COLUMN     "company" VARCHAR(150),
ADD COLUMN     "headline" VARCHAR(160),
ADD COLUMN     "position" VARCHAR(100),
ADD COLUMN     "time_zone" VARCHAR(64);
