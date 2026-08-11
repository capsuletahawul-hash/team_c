-- AlterTable
ALTER TABLE "Course" ADD COLUMN     "category" TEXT NOT NULL,
ADD COLUMN     "durationWeeks" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "isVisible" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "level" TEXT NOT NULL DEFAULT 'beginner',
ADD COLUMN     "maxStudents" INTEGER NOT NULL DEFAULT 30,
ADD COLUMN     "rating" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "requirementsNotes" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'coming_soon',
ADD COLUMN     "trainerId" TEXT NOT NULL,
ADD COLUMN     "videoDurationMinutes" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "Trainer" ADD COLUMN     "bioAr" TEXT,
ADD COLUMN     "experience" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "phone" TEXT,
ADD COLUMN     "specializationAr" TEXT,
ADD COLUMN     "userId" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Trainer_userId_key" ON "Trainer"("userId");

-- AddForeignKey
ALTER TABLE "Trainer" ADD CONSTRAINT "Trainer_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Course" ADD CONSTRAINT "Course_trainerId_fkey" FOREIGN KEY ("trainerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

