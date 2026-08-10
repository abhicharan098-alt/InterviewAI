-- CreateEnum
CREATE TYPE "ResumeStatus" AS ENUM ('UPLOADING', 'PROCESSING', 'PARSED', 'FAILED');

-- AlterTable
ALTER TABLE "Resume" ADD COLUMN     "status" "ResumeStatus" NOT NULL DEFAULT 'UPLOADING';
