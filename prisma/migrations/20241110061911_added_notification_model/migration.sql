-- CreateEnum
CREATE TYPE "NotifyType" AS ENUM ('NEW_USER_IN_WORKSPACE', 'USER_LEFT_WORKSPACE', 'NEW_TASK', 'NEW_MIND_MAP', 'NEW_ROLE', 'NEW_ASSIGNMENT_TASK', 'NEW_ASSIGNMENT_MIND_MAP');

-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "notifyCreatorId" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "unseen" BOOLEAN NOT NULL DEFAULT false,
    "clicked" BOOLEAN NOT NULL DEFAULT false,
    "createdDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "notifyType" "NotifyType" NOT NULL,
    "newUserRole" "UserPermission",
    "taskId" TEXT,
    "mindMapId" TEXT,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Notification_userId_idx" ON "Notification"("userId");

-- CreateIndex
CREATE INDEX "Notification_notifyCreatorId_idx" ON "Notification"("notifyCreatorId");

-- CreateIndex
CREATE INDEX "Notification_workspaceId_idx" ON "Notification"("workspaceId");

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_notifyCreatorId_fkey" FOREIGN KEY ("notifyCreatorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
