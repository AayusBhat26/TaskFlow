/*
  Warnings:

  - You are about to drop the column `channelId` on the `ChatMessage` table. All the data in the column will be lost.
  - You are about to drop the column `editedAt` on the `ChatMessage` table. All the data in the column will be lost.
  - You are about to drop the column `replyToId` on the `ChatMessage` table. All the data in the column will be lost.
  - You are about to drop the `ChatAttachment` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ChatChannel` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ChatMention` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ChatReaction` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `UserTyping` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `WorkspaceMessage` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `workspaceId` to the `ChatMessage` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "BlockType" AS ENUM ('TEXT', 'HEADING_1', 'HEADING_2', 'HEADING_3', 'BULLET_LIST', 'NUMBERED_LIST', 'TODO', 'QUOTE', 'CODE', 'DIVIDER', 'IMAGE', 'VIDEO', 'FILE', 'EMBED', 'TABLE', 'CALLOUT', 'TOGGLE', 'COLUMN', 'COLUMN_LIST');

-- DropForeignKey
ALTER TABLE "ChatAttachment" DROP CONSTRAINT "ChatAttachment_messageId_fkey";

-- DropForeignKey
ALTER TABLE "ChatChannel" DROP CONSTRAINT "ChatChannel_workspaceId_fkey";

-- DropForeignKey
ALTER TABLE "ChatMention" DROP CONSTRAINT "ChatMention_messageId_fkey";

-- DropForeignKey
ALTER TABLE "ChatMention" DROP CONSTRAINT "ChatMention_userId_fkey";

-- DropForeignKey
ALTER TABLE "ChatMessage" DROP CONSTRAINT "ChatMessage_channelId_fkey";

-- DropForeignKey
ALTER TABLE "ChatMessage" DROP CONSTRAINT "ChatMessage_replyToId_fkey";

-- DropForeignKey
ALTER TABLE "ChatReaction" DROP CONSTRAINT "ChatReaction_messageId_fkey";

-- DropForeignKey
ALTER TABLE "ChatReaction" DROP CONSTRAINT "ChatReaction_userId_fkey";

-- DropForeignKey
ALTER TABLE "UserTyping" DROP CONSTRAINT "UserTyping_channelId_fkey";

-- DropForeignKey
ALTER TABLE "UserTyping" DROP CONSTRAINT "UserTyping_userId_fkey";

-- DropForeignKey
ALTER TABLE "WorkspaceMessage" DROP CONSTRAINT "WorkspaceMessage_authorId_fkey";

-- DropForeignKey
ALTER TABLE "WorkspaceMessage" DROP CONSTRAINT "WorkspaceMessage_workspaceId_fkey";

-- DropIndex
DROP INDEX "ChatMessage_channelId_idx";

-- AlterTable
ALTER TABLE "ChatMessage" DROP COLUMN "channelId",
DROP COLUMN "editedAt",
DROP COLUMN "replyToId",
ADD COLUMN     "workspaceId" TEXT NOT NULL;

-- DropTable
DROP TABLE "ChatAttachment";

-- DropTable
DROP TABLE "ChatChannel";

-- DropTable
DROP TABLE "ChatMention";

-- DropTable
DROP TABLE "ChatReaction";

-- DropTable
DROP TABLE "UserTyping";

-- DropTable
DROP TABLE "WorkspaceMessage";

-- DropEnum
DROP TYPE "ChannelType";

-- DropEnum
DROP TYPE "MentionType";

-- CreateTable
CREATE TABLE "Note" (
    "id" TEXT NOT NULL,
    "title" TEXT DEFAULT 'Untitled',
    "icon" TEXT,
    "coverImage" TEXT,
    "isPublic" BOOLEAN NOT NULL DEFAULT false,
    "isArchived" BOOLEAN NOT NULL DEFAULT false,
    "isFavorite" BOOLEAN NOT NULL DEFAULT false,
    "workspaceId" TEXT,
    "parentId" TEXT,
    "position" INTEGER NOT NULL DEFAULT 0,
    "authorId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Note_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NoteBlock" (
    "id" TEXT NOT NULL,
    "noteId" TEXT NOT NULL,
    "type" "BlockType" NOT NULL,
    "content" JSONB,
    "position" INTEGER NOT NULL DEFAULT 0,
    "parentId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdById" TEXT NOT NULL,

    CONSTRAINT "NoteBlock_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Note_authorId_idx" ON "Note"("authorId");

-- CreateIndex
CREATE INDEX "Note_workspaceId_idx" ON "Note"("workspaceId");

-- CreateIndex
CREATE INDEX "Note_parentId_idx" ON "Note"("parentId");

-- CreateIndex
CREATE INDEX "Note_position_idx" ON "Note"("position");

-- CreateIndex
CREATE INDEX "Note_createdAt_idx" ON "Note"("createdAt");

-- CreateIndex
CREATE INDEX "NoteBlock_noteId_idx" ON "NoteBlock"("noteId");

-- CreateIndex
CREATE INDEX "NoteBlock_position_idx" ON "NoteBlock"("position");

-- CreateIndex
CREATE INDEX "NoteBlock_parentId_idx" ON "NoteBlock"("parentId");

-- CreateIndex
CREATE INDEX "NoteBlock_type_idx" ON "NoteBlock"("type");

-- CreateIndex
CREATE INDEX "ChatMessage_workspaceId_idx" ON "ChatMessage"("workspaceId");

-- AddForeignKey
ALTER TABLE "ChatMessage" ADD CONSTRAINT "ChatMessage_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Note" ADD CONSTRAINT "Note_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Note" ADD CONSTRAINT "Note_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Note" ADD CONSTRAINT "Note_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "Note"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NoteBlock" ADD CONSTRAINT "NoteBlock_noteId_fkey" FOREIGN KEY ("noteId") REFERENCES "Note"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NoteBlock" ADD CONSTRAINT "NoteBlock_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NoteBlock" ADD CONSTRAINT "NoteBlock_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "NoteBlock"("id") ON DELETE CASCADE ON UPDATE CASCADE;
