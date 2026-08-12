/*
  Warnings:

  - Added the required column `accessEndsAt` to the `Enrollment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `accessStartsAt` to the `Enrollment` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Enrollment" ADD COLUMN     "accessEndsAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "accessStartsAt" TIMESTAMP(3) NOT NULL;
