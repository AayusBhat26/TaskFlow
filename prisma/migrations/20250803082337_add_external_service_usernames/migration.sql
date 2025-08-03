-- AlterTable
ALTER TABLE "User" ADD COLUMN     "codeforcesUsername" TEXT,
ADD COLUMN     "emailIds" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "githubUsername" TEXT,
ADD COLUMN     "leetcodeUsername" TEXT,
ADD COLUMN     "redditUsername" TEXT;
