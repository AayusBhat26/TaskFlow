/*
  Warnings:

  - The values [CHAT_MENTION] on the enum `NotifyType` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `messageId` on the `FileAttachment` table. All the data in the column will be lost.
  - You are about to drop the column `messageId` on the `Notification` table. All the data in the column will be lost.
  - You are about to drop the `Conversation` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Message` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `MessageReaction` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `MessageRead` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "ChannelType" AS ENUM ('TEXT', 'VOICE', 'ANNOUNCEMENT');

-- CreateEnum
CREATE TYPE "MentionType" AS ENUM ('USER', 'ROLE', 'CHANNEL', 'EVERYONE');

-- AlterEnum
BEGIN;
CREATE TYPE "NotifyType_new" AS ENUM ('NEW_USER_IN_WORKSPACE', 'USER_LEFT_WORKSPACE', 'NEW_TASK', 'NEW_MIND_MAP', 'NEW_ROLE', 'NEW_ASSIGNMENT_TASK', 'NEW_ASSIGNMENT_MIND_MAP');
ALTER TABLE "Notification" ALTER COLUMN "notifyType" TYPE "NotifyType_new" USING ("notifyType"::text::"NotifyType_new");
ALTER TYPE "NotifyType" RENAME TO "NotifyType_old";
ALTER TYPE "NotifyType_new" RENAME TO "NotifyType";
DROP TYPE "NotifyType_old";
COMMIT;

-- DropForeignKey
ALTER TABLE "Conversation" DROP CONSTRAINT "Conversation_workspaceId_fkey";

-- DropForeignKey
ALTER TABLE "FileAttachment" DROP CONSTRAINT "FileAttachment_messageId_fkey";

-- DropForeignKey
ALTER TABLE "Message" DROP CONSTRAINT "Message_conversationId_fkey";

-- DropForeignKey
ALTER TABLE "Message" DROP CONSTRAINT "Message_replyToId_fkey";

-- DropForeignKey
ALTER TABLE "Message" DROP CONSTRAINT "Message_senderId_fkey";

-- DropForeignKey
ALTER TABLE "MessageReaction" DROP CONSTRAINT "MessageReaction_messageId_fkey";

-- DropForeignKey
ALTER TABLE "MessageReaction" DROP CONSTRAINT "MessageReaction_userId_fkey";

-- DropForeignKey
ALTER TABLE "MessageRead" DROP CONSTRAINT "MessageRead_messageId_fkey";

-- DropForeignKey
ALTER TABLE "MessageRead" DROP CONSTRAINT "MessageRead_userId_fkey";

-- AlterTable
ALTER TABLE "FileAttachment" DROP COLUMN "messageId";

-- AlterTable
ALTER TABLE "Notification" DROP COLUMN "messageId";

-- DropTable
DROP TABLE "Conversation";

-- DropTable
DROP TABLE "Message";

-- DropTable
DROP TABLE "MessageReaction";

-- DropTable
DROP TABLE "MessageRead";

-- DropEnum
DROP TYPE "MessageType";

-- CreateTable
CREATE TABLE "ChatChannel" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "type" "ChannelType" NOT NULL DEFAULT 'TEXT',
    "workspaceId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "position" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "ChatChannel_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChatMessage" (
    "id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "channelId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "editedAt" TIMESTAMP(3),
    "replyToId" TEXT,

    CONSTRAINT "ChatMessage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChatReaction" (
    "id" TEXT NOT NULL,
    "emoji" TEXT NOT NULL,
    "messageId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "ChatReaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChatMention" (
    "id" TEXT NOT NULL,
    "messageId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "MentionType" NOT NULL DEFAULT 'USER',

    CONSTRAINT "ChatMention_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChatAttachment" (
    "id" TEXT NOT NULL,
    "messageId" TEXT NOT NULL,
    "filename" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "mimeType" TEXT NOT NULL,

    CONSTRAINT "ChatAttachment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserTyping" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "channelId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserTyping_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ChatChannel_workspaceId_idx" ON "ChatChannel"("workspaceId");

-- CreateIndex
CREATE INDEX "ChatMessage_channelId_idx" ON "ChatMessage"("channelId");

-- CreateIndex
CREATE INDEX "ChatMessage_authorId_idx" ON "ChatMessage"("authorId");

-- CreateIndex
CREATE INDEX "ChatMessage_createdAt_idx" ON "ChatMessage"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "ChatReaction_messageId_userId_emoji_key" ON "ChatReaction"("messageId", "userId", "emoji");

-- CreateIndex
CREATE UNIQUE INDEX "ChatMention_messageId_userId_key" ON "ChatMention"("messageId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "UserTyping_userId_channelId_key" ON "UserTyping"("userId", "channelId");

-- AddForeignKey
ALTER TABLE "ChatChannel" ADD CONSTRAINT "ChatChannel_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChatMessage" ADD CONSTRAINT "ChatMessage_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChatMessage" ADD CONSTRAINT "ChatMessage_channelId_fkey" FOREIGN KEY ("channelId") REFERENCES "ChatChannel"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChatMessage" ADD CONSTRAINT "ChatMessage_replyToId_fkey" FOREIGN KEY ("replyToId") REFERENCES "ChatMessage"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChatReaction" ADD CONSTRAINT "ChatReaction_messageId_fkey" FOREIGN KEY ("messageId") REFERENCES "ChatMessage"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChatReaction" ADD CONSTRAINT "ChatReaction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChatMention" ADD CONSTRAINT "ChatMention_messageId_fkey" FOREIGN KEY ("messageId") REFERENCES "ChatMessage"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChatMention" ADD CONSTRAINT "ChatMention_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChatAttachment" ADD CONSTRAINT "ChatAttachment_messageId_fkey" FOREIGN KEY ("messageId") REFERENCES "ChatMessage"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserTyping" ADD CONSTRAINT "UserTyping_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserTyping" ADD CONSTRAINT "UserTyping_channelId_fkey" FOREIGN KEY ("channelId") REFERENCES "ChatChannel"("id") ON DELETE CASCADE ON UPDATE CASCADE;
