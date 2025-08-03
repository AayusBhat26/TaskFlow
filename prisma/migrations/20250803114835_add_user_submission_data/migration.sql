-- CreateTable
CREATE TABLE "UserSubmissionData" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "platform" TEXT NOT NULL,
    "submissionData" TEXT NOT NULL,
    "uploadedFileName" TEXT NOT NULL,
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "totalSubmissions" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "UserSubmissionData_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "UserSubmissionData_userId_idx" ON "UserSubmissionData"("userId");

-- CreateIndex
CREATE INDEX "UserSubmissionData_platform_idx" ON "UserSubmissionData"("platform");

-- CreateIndex
CREATE INDEX "UserSubmissionData_uploadedAt_idx" ON "UserSubmissionData"("uploadedAt");

-- CreateIndex
CREATE UNIQUE INDEX "UserSubmissionData_userId_platform_key" ON "UserSubmissionData"("userId", "platform");

-- AddForeignKey
ALTER TABLE "UserSubmissionData" ADD CONSTRAINT "UserSubmissionData_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
