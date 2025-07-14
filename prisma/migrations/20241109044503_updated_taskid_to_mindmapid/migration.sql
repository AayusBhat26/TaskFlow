/*
  Warnings:

  - You are about to drop the column `taskId` on the `savedMindMaps` table. All the data in the column will be lost.
  - Added the required column `mindMapId` to the `savedMindMaps` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "savedMindMaps" DROP CONSTRAINT "savedMindMaps_taskId_fkey";

-- DropIndex
DROP INDEX "savedMindMaps_taskId_idx";

-- AlterTable
ALTER TABLE "savedMindMaps" DROP COLUMN "taskId",
ADD COLUMN     "mindMapId" TEXT NOT NULL;

-- CreateIndex
CREATE INDEX "savedMindMaps_mindMapId_idx" ON "savedMindMaps"("mindMapId");

-- AddForeignKey
ALTER TABLE "savedMindMaps" ADD CONSTRAINT "savedMindMaps_mindMapId_fkey" FOREIGN KEY ("mindMapId") REFERENCES "MindMap"("id") ON DELETE CASCADE ON UPDATE CASCADE;
