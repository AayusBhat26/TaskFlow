/*
  Warnings:

  - A unique constraint covering the columns `[inviteCode]` on the table `Workspace` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[adminCode]` on the table `Workspace` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[canEditCode]` on the table `Workspace` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[readOnlyCode]` on the table `Workspace` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Workspace" ADD COLUMN     "adminCode" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "canEditCode" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "inviteCode" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "readOnlyCode" TEXT NOT NULL DEFAULT '';

-- CreateIndex
CREATE UNIQUE INDEX "Workspace_inviteCode_key" ON "Workspace"("inviteCode");

-- CreateIndex
CREATE UNIQUE INDEX "Workspace_adminCode_key" ON "Workspace"("adminCode");

-- CreateIndex
CREATE UNIQUE INDEX "Workspace_canEditCode_key" ON "Workspace"("canEditCode");

-- CreateIndex
CREATE UNIQUE INDEX "Workspace_readOnlyCode_key" ON "Workspace"("readOnlyCode");
