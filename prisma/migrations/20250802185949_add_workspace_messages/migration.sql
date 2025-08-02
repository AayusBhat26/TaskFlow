-- CreateTable
CREATE TABLE "WorkspaceMessage" (
    "id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "editedAt" TIMESTAMP(3),

    CONSTRAINT "WorkspaceMessage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "WorkspaceMessage_workspaceId_idx" ON "WorkspaceMessage"("workspaceId");

-- CreateIndex
CREATE INDEX "WorkspaceMessage_authorId_idx" ON "WorkspaceMessage"("authorId");

-- CreateIndex
CREATE INDEX "WorkspaceMessage_createdAt_idx" ON "WorkspaceMessage"("createdAt");

-- AddForeignKey
ALTER TABLE "WorkspaceMessage" ADD CONSTRAINT "WorkspaceMessage_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkspaceMessage" ADD CONSTRAINT "WorkspaceMessage_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;
