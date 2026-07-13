-- CreateEnum
CREATE TYPE "WorkProjectStatus" AS ENUM ('PLANNING', 'ACTIVE', 'PAUSED', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "WorkProjectMemberRole" AS ENUM ('OWNER', 'MANAGER', 'MEMBER', 'VIEWER');

-- CreateEnum
CREATE TYPE "AttachmentStatus" AS ENUM ('PENDING', 'READY', 'DELETING', 'FAILED');

-- AlterTable
ALTER TABLE "Task" ADD COLUMN     "designatedApproverId" TEXT,
ADD COLUMN     "workProjectId" TEXT;

-- CreateTable
CREATE TABLE "WorkProject" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "status" "WorkProjectStatus" NOT NULL DEFAULT 'PLANNING',
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "ownerId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WorkProject_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorkProjectMember" (
    "id" TEXT NOT NULL,
    "workProjectId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" "WorkProjectMemberRole" NOT NULL DEFAULT 'MEMBER',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WorkProjectMember_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorkProjectActivityLog" (
    "id" TEXT NOT NULL,
    "workProjectId" TEXT NOT NULL,
    "actorId" TEXT,
    "eventType" TEXT NOT NULL,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WorkProjectActivityLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorkProjectAttachment" (
    "id" TEXT NOT NULL,
    "workProjectId" TEXT NOT NULL,
    "originalFileName" TEXT NOT NULL,
    "storageKey" TEXT NOT NULL,
    "bucketName" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "fileSize" INTEGER NOT NULL,
    "checksum" TEXT,
    "status" "AttachmentStatus" NOT NULL DEFAULT 'PENDING',
    "uploadedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "WorkProjectAttachment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TaskAttachment" (
    "id" TEXT NOT NULL,
    "taskId" TEXT NOT NULL,
    "originalFileName" TEXT NOT NULL,
    "storageKey" TEXT NOT NULL,
    "bucketName" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "fileSize" INTEGER NOT NULL,
    "checksum" TEXT,
    "status" "AttachmentStatus" NOT NULL DEFAULT 'PENDING',
    "uploadedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "TaskAttachment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "WorkProject_ownerId_idx" ON "WorkProject"("ownerId");

-- CreateIndex
CREATE INDEX "WorkProject_status_idx" ON "WorkProject"("status");

-- CreateIndex
CREATE INDEX "WorkProject_startDate_idx" ON "WorkProject"("startDate");

-- CreateIndex
CREATE INDEX "WorkProject_endDate_idx" ON "WorkProject"("endDate");

-- CreateIndex
CREATE INDEX "WorkProjectMember_userId_idx" ON "WorkProjectMember"("userId");

-- CreateIndex
CREATE INDEX "WorkProjectMember_workProjectId_idx" ON "WorkProjectMember"("workProjectId");

-- CreateIndex
CREATE UNIQUE INDEX "WorkProjectMember_workProjectId_userId_key" ON "WorkProjectMember"("workProjectId", "userId");

-- CreateIndex
CREATE INDEX "WorkProjectActivityLog_workProjectId_createdAt_idx" ON "WorkProjectActivityLog"("workProjectId", "createdAt");

-- CreateIndex
CREATE INDEX "WorkProjectActivityLog_actorId_idx" ON "WorkProjectActivityLog"("actorId");

-- CreateIndex
CREATE UNIQUE INDEX "WorkProjectAttachment_storageKey_key" ON "WorkProjectAttachment"("storageKey");

-- CreateIndex
CREATE INDEX "WorkProjectAttachment_workProjectId_createdAt_idx" ON "WorkProjectAttachment"("workProjectId", "createdAt");

-- CreateIndex
CREATE INDEX "WorkProjectAttachment_status_idx" ON "WorkProjectAttachment"("status");

-- CreateIndex
CREATE INDEX "WorkProjectAttachment_uploadedById_idx" ON "WorkProjectAttachment"("uploadedById");

-- CreateIndex
CREATE UNIQUE INDEX "TaskAttachment_storageKey_key" ON "TaskAttachment"("storageKey");

-- CreateIndex
CREATE INDEX "TaskAttachment_taskId_createdAt_idx" ON "TaskAttachment"("taskId", "createdAt");

-- CreateIndex
CREATE INDEX "TaskAttachment_status_idx" ON "TaskAttachment"("status");

-- CreateIndex
CREATE INDEX "TaskAttachment_uploadedById_idx" ON "TaskAttachment"("uploadedById");

-- CreateIndex
CREATE INDEX "Task_workProjectId_idx" ON "Task"("workProjectId");

-- CreateIndex
CREATE INDEX "Task_designatedApproverId_idx" ON "Task"("designatedApproverId");

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_workProjectId_fkey" FOREIGN KEY ("workProjectId") REFERENCES "WorkProject"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_designatedApproverId_fkey" FOREIGN KEY ("designatedApproverId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkProject" ADD CONSTRAINT "WorkProject_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkProjectMember" ADD CONSTRAINT "WorkProjectMember_workProjectId_fkey" FOREIGN KEY ("workProjectId") REFERENCES "WorkProject"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkProjectMember" ADD CONSTRAINT "WorkProjectMember_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkProjectActivityLog" ADD CONSTRAINT "WorkProjectActivityLog_workProjectId_fkey" FOREIGN KEY ("workProjectId") REFERENCES "WorkProject"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkProjectActivityLog" ADD CONSTRAINT "WorkProjectActivityLog_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkProjectAttachment" ADD CONSTRAINT "WorkProjectAttachment_workProjectId_fkey" FOREIGN KEY ("workProjectId") REFERENCES "WorkProject"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkProjectAttachment" ADD CONSTRAINT "WorkProjectAttachment_uploadedById_fkey" FOREIGN KEY ("uploadedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TaskAttachment" ADD CONSTRAINT "TaskAttachment_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "Task"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TaskAttachment" ADD CONSTRAINT "TaskAttachment_uploadedById_fkey" FOREIGN KEY ("uploadedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

