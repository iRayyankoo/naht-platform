-- CreateEnum
CREATE TYPE "TaskViewMode" AS ENUM ('TABLE', 'GANTT', 'TIMELINE', 'CALENDAR', 'KANBAN', 'CARDS');

-- AlterTable
ALTER TABLE "Task" ADD COLUMN     "plannedStartAt" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "UserTaskPreference" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "defaultViewMode" "TaskViewMode" NOT NULL DEFAULT 'KANBAN',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserTaskPreference_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "UserTaskPreference_userId_key" ON "UserTaskPreference"("userId");

-- CreateIndex
CREATE INDEX "Task_plannedStartAt_idx" ON "Task"("plannedStartAt");

-- AddForeignKey
ALTER TABLE "UserTaskPreference" ADD CONSTRAINT "UserTaskPreference_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "UserTaskPreference" ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON TABLE "UserTaskPreference"
FROM anon, authenticated;

