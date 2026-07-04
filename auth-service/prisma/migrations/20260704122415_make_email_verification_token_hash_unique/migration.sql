/*
  Warnings:

  - A unique constraint covering the columns `[token_hash]` on the table `email_verification_tokens` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "email_verification_tokens_token_hash_key" ON "email_verification_tokens"("token_hash");
