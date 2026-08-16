-- CreateTable
CREATE TABLE "countries" (
    "id" UUID NOT NULL,
    "code_2" CHAR(2) NOT NULL,
    "code_3" CHAR(3) NOT NULL,
    "name" VARCHAR(150) NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "countries_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "countries_code_2_key" ON "countries"("code_2");

-- CreateIndex
CREATE UNIQUE INDEX "countries_code_3_key" ON "countries"("code_3");

-- CreateIndex
CREATE INDEX "countries_name_idx" ON "countries"("name");

-- CreateIndex
CREATE INDEX "countries_is_active_idx" ON "countries"("is_active");
