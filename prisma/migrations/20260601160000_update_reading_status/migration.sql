-- Migration: update reading status enum + remove dnf field

-- Step 1: Drop the default (it depends on the enum type) then convert to text
ALTER TABLE "UserBook" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "UserBook" ALTER COLUMN "status" TYPE TEXT;

-- Step 2: Migrate old enum values to new ones
UPDATE "UserBook" SET status = 'PLAN_TO_READ' WHERE status IN ('WISHLIST', 'WANT_TO_READ');
UPDATE "UserBook" SET status = 'COMPLETED'    WHERE status = 'DONE';
UPDATE "UserBook" SET status = 'DROPPED'      WHERE status = 'DROPPED'; -- no-op, just in case
-- READING stays READING

-- Step 3: Drop old enum type
DROP TYPE "ReadingStatus";

-- Step 4: Create new enum type
CREATE TYPE "ReadingStatus" AS ENUM ('PLAN_TO_READ', 'READING', 'ON_HOLD', 'DROPPED', 'COMPLETED', 'RE_READING');

-- Step 5: Convert column back to the new enum
ALTER TABLE "UserBook"
  ALTER COLUMN "status" TYPE "ReadingStatus" USING status::"ReadingStatus",
  ALTER COLUMN "status" SET DEFAULT 'PLAN_TO_READ'::"ReadingStatus";

-- Step 6: Remove the dnf boolean column
ALTER TABLE "UserBook" DROP COLUMN IF EXISTS "dnf";
