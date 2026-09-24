-- CreateEnum
CREATE TYPE "user_link_type" AS ENUM ('github', 'telegram', 'linkedin', 'portfolio', 'website', 'behance', 'other');

-- CreateTable
CREATE TABLE "user_links" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "type" "user_link_type" NOT NULL,
    "url" VARCHAR(2048) NOT NULL,
    "title" VARCHAR(100) NOT NULL,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "user_links_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "user_links_user_id_sort_order_idx" ON "user_links"("user_id", "sort_order");

-- CreateIndex
CREATE INDEX "user_links_user_id_type_idx" ON "user_links"("user_id", "type");

-- AddForeignKey
ALTER TABLE "user_links" ADD CONSTRAINT "user_links_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user_profiles"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;
