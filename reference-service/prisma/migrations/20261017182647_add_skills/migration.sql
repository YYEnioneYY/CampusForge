-- CreateTable
CREATE TABLE "skills" (
    "id" UUID NOT NULL,
    "name" VARCHAR(80) NOT NULL,
    "normalized_name" VARCHAR(80) NOT NULL,
    "slug" VARCHAR(100) NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "skills_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "skills_normalized_name_key" ON "skills"("normalized_name");

-- CreateIndex
CREATE UNIQUE INDEX "skills_slug_key" ON "skills"("slug");

-- CreateIndex
CREATE INDEX "skills_is_active_idx" ON "skills"("is_active");
