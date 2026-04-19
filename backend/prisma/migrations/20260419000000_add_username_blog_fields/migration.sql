-- Migration: add_username_blog_fields
-- Adds username to User (nullable first, populate, then make unique required)
-- Adds excerpt, coverImage, tags to Blog

-- Step 1: Add username as nullable (so existing rows don't fail)
ALTER TABLE "User" ADD COLUMN "username" TEXT;

-- Step 2: Populate existing rows with a derived username (email prefix, deduplicated)
UPDATE "User" SET "username" = LOWER(REPLACE(SPLIT_PART(email, '@', 1), '.', '_')) || '_' || CAST(id AS TEXT)
WHERE "username" IS NULL;

-- Step 3: Make username NOT NULL and add unique constraint
ALTER TABLE "User" ALTER COLUMN "username" SET NOT NULL;
ALTER TABLE "User" ADD CONSTRAINT "User_username_key" UNIQUE ("username");

-- Step 4: Add index on username
CREATE INDEX "User_username_idx" ON "User"("username");

-- Step 5: Add optional fields to Blog
ALTER TABLE "Blog" ADD COLUMN "excerpt" TEXT;
ALTER TABLE "Blog" ADD COLUMN "coverImage" TEXT;
ALTER TABLE "Blog" ADD COLUMN "tags" TEXT[] NOT NULL DEFAULT '{}';
