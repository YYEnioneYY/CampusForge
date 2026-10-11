-- CreateTable
CREATE TABLE "work_experiences" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "company" VARCHAR(150) NOT NULL,
    "position" VARCHAR(100) NOT NULL,
    "description" VARCHAR(2000),
    "started_at" DATE NOT NULL,
    "ended_at" DATE,
    "is_current" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "work_experiences_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "work_experiences_user_id_is_current_started_at_idx" ON "work_experiences"("user_id", "is_current", "started_at");

-- AddForeignKey
ALTER TABLE "work_experiences" ADD CONSTRAINT "work_experiences_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user_profiles"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;
