-- AlterTable
ALTER TABLE "refresh_tokens" ADD COLUMN     "device_id" UUID;

-- CreateIndex
CREATE INDEX "refresh_tokens_user_id_device_id_idx" ON "refresh_tokens"("user_id", "device_id");
