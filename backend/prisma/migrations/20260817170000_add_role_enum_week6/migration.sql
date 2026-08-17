CREATE TYPE "Role" AS ENUM ('STUDENT', 'ADMIN', 'TRAINER');

UPDATE "User"
SET "role" = 'STUDENT'
WHERE "role" = 'Student';

UPDATE "User"
SET "role" = 'TRAINER'
WHERE "role" = 'Trainer';

ALTER TABLE "User"
ALTER COLUMN "role" DROP DEFAULT;

ALTER TABLE "User"
ALTER COLUMN "role" TYPE "Role"
USING "role"::"Role";

ALTER TABLE "User"
ALTER COLUMN "role" SET DEFAULT 'STUDENT';