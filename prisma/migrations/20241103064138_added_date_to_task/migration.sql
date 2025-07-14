/*
  Warnings:

  - Made the column `title` on table `Task` required. This step will fail if there are existing NULL values in that column.
  - Made the column `emoji` on table `Task` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Task" ADD COLUMN     "dateId" TEXT,
ALTER COLUMN "title" SET NOT NULL,
ALTER COLUMN "emoji" SET NOT NULL,
ALTER COLUMN "emoji" SET DEFAULT '🧠';

-- CreateTable
CREATE TABLE "Date" (
    "id" TEXT NOT NULL,
    "from" TEXT,
    "to" TEXT,

    CONSTRAINT "Date_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_dateId_fkey" FOREIGN KEY ("dateId") REFERENCES "Date"("id") ON DELETE SET NULL ON UPDATE CASCADE;
