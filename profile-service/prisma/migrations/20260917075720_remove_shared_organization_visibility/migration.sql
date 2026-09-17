UPDATE "user_profiles"
SET "visibility" = 'private'
WHERE "visibility" = 'shared_organization';

ALTER TABLE "user_profiles"
ALTER COLUMN "visibility" DROP DEFAULT;

CREATE TYPE "profile_visibility_new"
AS ENUM (
  'public',
  'private'
);

ALTER TABLE "user_profiles"
ALTER COLUMN "visibility"
TYPE "profile_visibility_new"
USING (
  "visibility"::text::"profile_visibility_new"
);

DROP TYPE "profile_visibility";

ALTER TYPE "profile_visibility_new"
RENAME TO "profile_visibility";

ALTER TABLE "user_profiles"
ALTER COLUMN "visibility"
SET DEFAULT 'public';