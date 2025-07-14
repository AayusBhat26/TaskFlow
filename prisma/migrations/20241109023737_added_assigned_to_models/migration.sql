-- CreateTable
CREATE TABLE "assignedToTask" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "taskId" TEXT NOT NULL,

    CONSTRAINT "assignedToTask_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "assignedToMindMap" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "mindMapId" TEXT NOT NULL,

    CONSTRAINT "assignedToMindMap_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "assignedToTask_userId_idx" ON "assignedToTask"("userId");

-- CreateIndex
CREATE INDEX "assignedToTask_taskId_idx" ON "assignedToTask"("taskId");

-- CreateIndex
CREATE INDEX "assignedToMindMap_userId_idx" ON "assignedToMindMap"("userId");

-- CreateIndex
CREATE INDEX "assignedToMindMap_mindMapId_idx" ON "assignedToMindMap"("mindMapId");

-- AddForeignKey
ALTER TABLE "assignedToTask" ADD CONSTRAINT "assignedToTask_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assignedToTask" ADD CONSTRAINT "assignedToTask_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "Task"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assignedToMindMap" ADD CONSTRAINT "assignedToMindMap_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assignedToMindMap" ADD CONSTRAINT "assignedToMindMap_mindMapId_fkey" FOREIGN KEY ("mindMapId") REFERENCES "MindMap"("id") ON DELETE CASCADE ON UPDATE CASCADE;
