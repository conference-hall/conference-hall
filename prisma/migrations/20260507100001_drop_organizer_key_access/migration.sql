-- DropForeignKey
ALTER TABLE "users" DROP CONSTRAINT IF EXISTS "users_organizerKey_fkey";

-- DropColumn
ALTER TABLE "users" DROP COLUMN IF EXISTS "organizerKey";

-- DropTable
DROP TABLE IF EXISTS "organizer_key_access";
