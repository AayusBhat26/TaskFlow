-- CreateEnum
CREATE TYPE "AchievementCategory" AS ENUM ('PRODUCTIVITY', 'COLLABORATION', 'CONSISTENCY', 'MASTERY', 'SOCIAL', 'SPECIAL');

-- CreateEnum
CREATE TYPE "AchievementType" AS ENUM ('MILESTONE', 'STREAK', 'CUMULATIVE', 'RARE_EVENT', 'SOCIAL');

-- CreateEnum
CREATE TYPE "AchievementRarity" AS ENUM ('COMMON', 'UNCOMMON', 'RARE', 'EPIC', 'LEGENDARY');

-- CreateEnum
CREATE TYPE "ChallengeType" AS ENUM ('DAILY', 'WEEKLY', 'MONTHLY', 'SPECIAL_EVENT', 'PERSONAL');

-- CreateEnum
CREATE TYPE "ChallengeCategory" AS ENUM ('TASK_COMPLETION', 'POMODORO_FOCUS', 'DSA_PRACTICE', 'COLLABORATION', 'CONSISTENCY', 'SPEED');

-- CreateEnum
CREATE TYPE "ChallengeDifficulty" AS ENUM ('EASY', 'MEDIUM', 'HARD', 'EXTREME');

-- CreateEnum
CREATE TYPE "StreakType" AS ENUM ('DAILY_LOGIN', 'TASK_COMPLETION', 'POMODORO_SESSION', 'DSA_PRACTICE', 'CHAT_ACTIVITY', 'COLLABORATION');

-- CreateEnum
CREATE TYPE "PurchaseItemType" AS ENUM ('THEME', 'AVATAR', 'SOUND_PACK', 'BADGE', 'TITLE', 'FEATURE_UNLOCK', 'CUSTOMIZATION');

-- CreateEnum
CREATE TYPE "LeaderboardType" AS ENUM ('TOTAL_POINTS', 'WEEKLY_POINTS', 'TASK_COMPLETION', 'POMODORO_SESSIONS', 'DSA_SOLVED', 'STREAK_LENGTH', 'LEVEL_RANKING');

-- CreateEnum
CREATE TYPE "LeaderboardPeriod" AS ENUM ('DAILY', 'WEEKLY', 'MONTHLY', 'ALL_TIME');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "PointType" ADD VALUE 'ACHIEVEMENT_UNLOCKED';
ALTER TYPE "PointType" ADD VALUE 'CHALLENGE_COMPLETED';
ALTER TYPE "PointType" ADD VALUE 'STREAK_BONUS';
ALTER TYPE "PointType" ADD VALUE 'DAILY_LOGIN';
ALTER TYPE "PointType" ADD VALUE 'COLLABORATION_BONUS';
ALTER TYPE "PointType" ADD VALUE 'LEVEL_UP_BONUS';
ALTER TYPE "PointType" ADD VALUE 'REFERRAL_BONUS';
ALTER TYPE "PointType" ADD VALUE 'PURCHASE_SPENT';
ALTER TYPE "PointType" ADD VALUE 'ADMIN_BONUS';
ALTER TYPE "PointType" ADD VALUE 'EVENT_PARTICIPATION';
ALTER TYPE "PointType" ADD VALUE 'MILESTONE_REACHED';

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "currentStreak" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "currentTitle" TEXT,
ADD COLUMN     "experience" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "lastActivityDate" TIMESTAMP(3),
ADD COLUMN     "level" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "longestStreak" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "profileBadges" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "totalPomodoroCompleted" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "totalTasksCompleted" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "Achievement" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" "AchievementCategory" NOT NULL,
    "type" "AchievementType" NOT NULL,
    "iconName" TEXT NOT NULL,
    "iconColor" TEXT NOT NULL,
    "requirement" INTEGER NOT NULL,
    "pointsReward" INTEGER NOT NULL,
    "badgeId" TEXT,
    "isSecret" BOOLEAN NOT NULL DEFAULT false,
    "rarity" "AchievementRarity" NOT NULL DEFAULT 'COMMON',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Achievement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserAchievement" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "achievementId" TEXT NOT NULL,
    "unlockedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "progress" INTEGER NOT NULL DEFAULT 0,
    "isCompleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "UserAchievement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Challenge" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "type" "ChallengeType" NOT NULL,
    "category" "ChallengeCategory" NOT NULL,
    "difficulty" "ChallengeDifficulty" NOT NULL,
    "requirement" INTEGER NOT NULL,
    "timeLimit" INTEGER,
    "pointsReward" INTEGER NOT NULL,
    "experienceReward" INTEGER NOT NULL,
    "badgeReward" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Challenge_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserChallenge" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "challengeId" TEXT NOT NULL,
    "progress" INTEGER NOT NULL DEFAULT 0,
    "isCompleted" BOOLEAN NOT NULL DEFAULT false,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "UserChallenge_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserStreak" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "streakType" "StreakType" NOT NULL,
    "currentCount" INTEGER NOT NULL DEFAULT 0,
    "longestCount" INTEGER NOT NULL DEFAULT 0,
    "lastActiveDate" TIMESTAMP(3),
    "multiplier" DOUBLE PRECISION NOT NULL DEFAULT 1.0,

    CONSTRAINT "UserStreak_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PointPurchase" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "itemType" "PurchaseItemType" NOT NULL,
    "itemId" TEXT NOT NULL,
    "pointsCost" INTEGER NOT NULL,
    "purchasedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PointPurchase_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LeaderboardEntry" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "leaderboardType" "LeaderboardType" NOT NULL,
    "period" "LeaderboardPeriod" NOT NULL,
    "score" INTEGER NOT NULL,
    "rank" INTEGER NOT NULL,
    "periodStart" TIMESTAMP(3) NOT NULL,
    "periodEnd" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LeaderboardEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GameSettings" (
    "id" TEXT NOT NULL,
    "experiencePerLevel" INTEGER NOT NULL DEFAULT 1000,
    "experienceMultiplier" DOUBLE PRECISION NOT NULL DEFAULT 1.5,
    "maxLevel" INTEGER NOT NULL DEFAULT 100,
    "streakBonusThreshold" INTEGER NOT NULL DEFAULT 7,
    "streakBonusMultiplier" DOUBLE PRECISION NOT NULL DEFAULT 1.5,
    "dailyPointsLimit" INTEGER NOT NULL DEFAULT 1000,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GameSettings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "UserAchievement_userId_achievementId_key" ON "UserAchievement"("userId", "achievementId");

-- CreateIndex
CREATE UNIQUE INDEX "UserChallenge_userId_challengeId_key" ON "UserChallenge"("userId", "challengeId");

-- CreateIndex
CREATE UNIQUE INDEX "UserStreak_userId_streakType_key" ON "UserStreak"("userId", "streakType");

-- CreateIndex
CREATE UNIQUE INDEX "LeaderboardEntry_userId_leaderboardType_period_periodStart_key" ON "LeaderboardEntry"("userId", "leaderboardType", "period", "periodStart");

-- AddForeignKey
ALTER TABLE "UserAchievement" ADD CONSTRAINT "UserAchievement_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserAchievement" ADD CONSTRAINT "UserAchievement_achievementId_fkey" FOREIGN KEY ("achievementId") REFERENCES "Achievement"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserChallenge" ADD CONSTRAINT "UserChallenge_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserChallenge" ADD CONSTRAINT "UserChallenge_challengeId_fkey" FOREIGN KEY ("challengeId") REFERENCES "Challenge"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserStreak" ADD CONSTRAINT "UserStreak_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PointPurchase" ADD CONSTRAINT "PointPurchase_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LeaderboardEntry" ADD CONSTRAINT "LeaderboardEntry_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
