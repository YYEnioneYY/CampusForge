-- CreateTable
CREATE TABLE "account_restore_tokens" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "token_hash" TEXT NOT NULL,
    "expires_at" TIMESTAMPTZ NOT NULL,
    "used_at" TIMESTAMPTZ,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "account_restore_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "account_restore_tokens_token_hash_key" ON "account_restore_tokens"("token_hash");

-- CreateIndex
CREATE INDEX "account_restore_tokens_user_id_idx" ON "account_restore_tokens"("user_id");

-- CreateIndex
CREATE INDEX "account_restore_tokens_expires_at_idx" ON "account_restore_tokens"("expires_at");

-- AddForeignKey
ALTER TABLE "account_restore_tokens" ADD CONSTRAINT "account_restore_tokens_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
