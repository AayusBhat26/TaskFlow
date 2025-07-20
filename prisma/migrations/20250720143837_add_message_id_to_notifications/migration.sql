-- AlterEnum
ALTER TYPE "NotifyType" ADD VALUE 'CHAT_MENTION';

-- AlterTable
ALTER TABLE "Notification" ADD COLUMN     "messageId" TEXT;
