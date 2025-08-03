-- CreateEnum
CREATE TYPE "DSAStatus" AS ENUM ('TODO', 'IN_PROGRESS', 'COMPLETED', 'REVIEW', 'SKIPPED');

-- CreateEnum
CREATE TYPE "Difficulty" AS ENUM ('EASY', 'MEDIUM', 'HARD');

-- CreateTable
CREATE TABLE "DSAQuestion" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "topic" TEXT NOT NULL,
    "difficulty" "Difficulty" NOT NULL DEFAULT 'MEDIUM',
    "leetcodeUrl" TEXT,
    "platform" TEXT NOT NULL DEFAULT 'LeetCode',
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "hints" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "companies" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "frequency" INTEGER NOT NULL DEFAULT 1,
    "timeComplexity" TEXT,
    "spaceComplexity" TEXT,
    "approach" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DSAQuestion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DSAProgress" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "status" "DSAStatus" NOT NULL DEFAULT 'TODO',
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "timeSpent" INTEGER NOT NULL DEFAULT 0,
    "notes" TEXT,
    "approach" TEXT,
    "rating" INTEGER,
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DSAProgress_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "DSAQuestion_topic_idx" ON "DSAQuestion"("topic");

-- CreateIndex
CREATE INDEX "DSAQuestion_difficulty_idx" ON "DSAQuestion"("difficulty");

-- CreateIndex
CREATE INDEX "DSAQuestion_platform_idx" ON "DSAQuestion"("platform");

-- CreateIndex
CREATE INDEX "DSAQuestion_frequency_idx" ON "DSAQuestion"("frequency");

-- CreateIndex
CREATE INDEX "DSAProgress_userId_idx" ON "DSAProgress"("userId");

-- CreateIndex
CREATE INDEX "DSAProgress_questionId_idx" ON "DSAProgress"("questionId");

-- CreateIndex
CREATE INDEX "DSAProgress_status_idx" ON "DSAProgress"("status");

-- CreateIndex
CREATE UNIQUE INDEX "DSAProgress_userId_questionId_key" ON "DSAProgress"("userId", "questionId");

-- AddForeignKey
ALTER TABLE "DSAProgress" ADD CONSTRAINT "DSAProgress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DSAProgress" ADD CONSTRAINT "DSAProgress_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "DSAQuestion"("id") ON DELETE CASCADE ON UPDATE CASCADE;
