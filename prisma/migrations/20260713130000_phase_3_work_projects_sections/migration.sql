-- CreateEnum
CREATE TYPE "WorkProjectSectionStatus" AS ENUM ('ACTIVE', 'ARCHIVED');

-- AlterTable
ALTER TABLE "Task" ADD COLUMN     "workProjectSectionId" TEXT;

-- CreateTable
CREATE TABLE "WorkProjectSection" (
    "id" TEXT NOT NULL,
    "workProjectId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "normalizedName" TEXT NOT NULL,
    "description" TEXT,
    "managerId" TEXT,
    "color" TEXT DEFAULT '#3B82F6',
    "status" "WorkProjectSectionStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WorkProjectSection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorkProjectSectionMember" (
    "id" TEXT NOT NULL,
    "sectionId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WorkProjectSectionMember_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "WorkProjectSection_workProjectId_idx" ON "WorkProjectSection"("workProjectId");

-- CreateIndex
CREATE INDEX "WorkProjectSection_managerId_idx" ON "WorkProjectSection"("managerId");

-- CreateIndex
CREATE INDEX "WorkProjectSection_status_idx" ON "WorkProjectSection"("status");

-- CreateIndex
CREATE UNIQUE INDEX "WorkProjectSection_workProjectId_normalizedName_key" ON "WorkProjectSection"("workProjectId", "normalizedName");

-- CreateIndex
CREATE INDEX "WorkProjectSectionMember_userId_idx" ON "WorkProjectSectionMember"("userId");

-- CreateIndex
CREATE INDEX "WorkProjectSectionMember_sectionId_idx" ON "WorkProjectSectionMember"("sectionId");

-- CreateIndex
CREATE UNIQUE INDEX "WorkProjectSectionMember_sectionId_userId_key" ON "WorkProjectSectionMember"("sectionId", "userId");

-- CreateIndex
CREATE INDEX "Task_workProjectSectionId_idx" ON "Task"("workProjectSectionId");

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_workProjectSectionId_fkey" FOREIGN KEY ("workProjectSectionId") REFERENCES "WorkProjectSection"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkProjectSection" ADD CONSTRAINT "WorkProjectSection_workProjectId_fkey" FOREIGN KEY ("workProjectId") REFERENCES "WorkProject"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkProjectSection" ADD CONSTRAINT "WorkProjectSection_managerId_fkey" FOREIGN KEY ("managerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkProjectSectionMember" ADD CONSTRAINT "WorkProjectSectionMember_sectionId_fkey" FOREIGN KEY ("sectionId") REFERENCES "WorkProjectSection"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkProjectSectionMember" ADD CONSTRAINT "WorkProjectSectionMember_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

