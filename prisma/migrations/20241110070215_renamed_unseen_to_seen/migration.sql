/*
  Warnings:

  - You are about to drop the column `unseen` on the `Notification` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Notification" DROP COLUMN "unseen",
ADD COLUMN     "seen" BOOLEAN NOT NULL DEFAULT false;
