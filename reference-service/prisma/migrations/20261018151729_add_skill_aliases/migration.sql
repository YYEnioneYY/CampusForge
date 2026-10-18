-- CreateTable
CREATE TABLE "skill_aliases" (
    "id" UUID NOT NULL,
    "skill_id" UUID NOT NULL,
    "alias" VARCHAR(80) NOT NULL,
    "normalized_alias" VARCHAR(80) NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "skill_aliases_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "skill_aliases_normalized_alias_key" ON "skill_aliases"("normalized_alias");

-- CreateIndex
CREATE INDEX "skill_aliases_skill_id_idx" ON "skill_aliases"("skill_id");

-- AddForeignKey
ALTER TABLE "skill_aliases" ADD CONSTRAINT "skill_aliases_skill_id_fkey" FOREIGN KEY ("skill_id") REFERENCES "skills"("id") ON DELETE CASCADE ON UPDATE CASCADE;
