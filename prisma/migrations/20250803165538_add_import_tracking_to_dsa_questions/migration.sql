-- AlterTable
ALTER TABLE "DSAQuestion" ADD COLUMN     "importBatchId" TEXT,
ADD COLUMN     "importedAt" TIMESTAMP(3),
ADD COLUMN     "importedBy" TEXT,
ADD COLUMN     "isImported" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "originalFileName" TEXT;

-- CreateIndex
CREATE INDEX "DSAQuestion_isImported_idx" ON "DSAQuestion"("isImported");

-- CreateIndex
CREATE INDEX "DSAQuestion_importedBy_idx" ON "DSAQuestion"("importedBy");

-- CreateIndex
CREATE INDEX "DSAQuestion_importBatchId_idx" ON "DSAQuestion"("importBatchId");

-- AddForeignKey
ALTER TABLE "DSAQuestion" ADD CONSTRAINT "DSAQuestion_importedBy_fkey" FOREIGN KEY ("importedBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
