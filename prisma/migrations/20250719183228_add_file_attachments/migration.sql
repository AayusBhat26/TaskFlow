/*
  Warnings:

  - You are about to drop the column `createdById` on the `Conversation` table. All the data in the column will be lost.
  - You are about to drop the column `image` on the `Conversation` table. All the data in the column will be lost.
  - You are about to drop the column `lastMessageAt` on the `Conversation` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `Conversation` table. All the data in the column will be lost.
  - You are about to drop the column `type` on the `Conversation` table. All the data in the column will be lost.
  - You are about to drop the `ConversationParticipant` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `additionalResource` table. If the table is not empty, all the data it contains will be lost.
  - Made the column `workspaceId` on table `Conversation` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "Conversation" DROP CONSTRAINT "Conversation_createdById_fkey";

-- DropForeignKey
ALTER TABLE "ConversationParticipant" DROP CONSTRAINT "ConversationParticipant_conversationId_fkey";

-- DropForeignKey
ALTER TABLE "ConversationParticipant" DROP CONSTRAINT "ConversationParticipant_userId_fkey";

-- DropForeignKey
ALTER TABLE "additionalResource" DROP CONSTRAINT "additionalResource_messageId_fkey";

-- AlterTable
ALTER TABLE "Conversation" DROP COLUMN "createdById",
DROP COLUMN "image",
DROP COLUMN "lastMessageAt",
DROP COLUMN "name",
DROP COLUMN "type",
ALTER COLUMN "workspaceId" SET NOT NULL;

-- DropTable
DROP TABLE "ConversationParticipant";

-- DropTable
DROP TABLE "additionalResource";

-- DropEnum
DROP TYPE "AdditionalResourceTypes";

-- DropEnum
DROP TYPE "ConversationRole";

-- DropEnum
DROP TYPE "ConversationType";

-- CreateTable
CREATE TABLE "FileAttachment" (
    "id" TEXT NOT NULL,
    "filename" TEXT NOT NULL,
    "originalName" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "url" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "messageId" TEXT NOT NULL,
    "uploadedById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FileAttachment_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "FileAttachment" ADD CONSTRAINT "FileAttachment_messageId_fkey" FOREIGN KEY ("messageId") REFERENCES "Message"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FileAttachment" ADD CONSTRAINT "FileAttachment_uploadedById_fkey" FOREIGN KEY ("uploadedById") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
