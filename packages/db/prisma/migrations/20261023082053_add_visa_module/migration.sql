-- CreateEnum
CREATE TYPE "VisaCaseStatus" AS ENUM ('INITIAL', 'DOCUMENTS_INCOMPLETE', 'DOCUMENTS_COMPLETE', 'UNDER_REVIEW', 'APPOINTMENT_NEEDED', 'APPOINTMENT_DONE', 'SUBMITTED', 'IN_PROCESS', 'BIOMETRICS_DONE', 'APPROVED', 'REJECTED', 'NEEDS_CORRECTION', 'COMPLETED', 'CANCELLED');

-- CreateTable
CREATE TABLE "VisaCountry" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "description" TEXT,
    "processingTime" TEXT,
    "fee" DOUBLE PRECISION,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VisaCountry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VisaChecklist" (
    "id" TEXT NOT NULL,
    "countryId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "isRequired" BOOLEAN NOT NULL DEFAULT true,
    "order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "VisaChecklist_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VisaCase" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "countryId" TEXT NOT NULL,
    "caseNumber" TEXT NOT NULL,
    "status" "VisaCaseStatus" NOT NULL DEFAULT 'INITIAL',
    "applicantName" TEXT NOT NULL,
    "applicantPassport" TEXT,
    "travelDate" TIMESTAMP(3),
    "visaType" TEXT,
    "notes" TEXT,
    "assignedAgentId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VisaCase_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VisaCaseDocument" (
    "id" TEXT NOT NULL,
    "caseId" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "fileSize" INTEGER NOT NULL,
    "mimeType" TEXT NOT NULL,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "verifiedBy" TEXT,
    "verifiedAt" TIMESTAMP(3),
    "notes" TEXT,
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "VisaCaseDocument_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VisaAppointment" (
    "id" TEXT NOT NULL,
    "caseId" TEXT NOT NULL,
    "appointmentDate" TIMESTAMP(3) NOT NULL,
    "location" TEXT,
    "referenceNumber" TEXT,
    "status" TEXT NOT NULL DEFAULT 'SCHEDULED',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VisaAppointment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VisaCaseTimeline" (
    "id" TEXT NOT NULL,
    "caseId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "oldStatus" TEXT,
    "newStatus" TEXT,
    "description" TEXT,
    "changedBy" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "VisaCaseTimeline_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "VisaCountry_name_key" ON "VisaCountry"("name");

-- CreateIndex
CREATE UNIQUE INDEX "VisaCountry_code_key" ON "VisaCountry"("code");

-- CreateIndex
CREATE INDEX "VisaChecklist_countryId_idx" ON "VisaChecklist"("countryId");

-- CreateIndex
CREATE UNIQUE INDEX "VisaCase_caseNumber_key" ON "VisaCase"("caseNumber");

-- CreateIndex
CREATE INDEX "VisaCase_userId_idx" ON "VisaCase"("userId");

-- CreateIndex
CREATE INDEX "VisaCase_status_idx" ON "VisaCase"("status");

-- CreateIndex
CREATE INDEX "VisaCase_countryId_idx" ON "VisaCase"("countryId");

-- CreateIndex
CREATE INDEX "VisaCaseDocument_caseId_idx" ON "VisaCaseDocument"("caseId");

-- CreateIndex
CREATE INDEX "VisaAppointment_caseId_idx" ON "VisaAppointment"("caseId");

-- CreateIndex
CREATE INDEX "VisaCaseTimeline_caseId_idx" ON "VisaCaseTimeline"("caseId");

-- AddForeignKey
ALTER TABLE "VisaChecklist" ADD CONSTRAINT "VisaChecklist_countryId_fkey" FOREIGN KEY ("countryId") REFERENCES "VisaCountry"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VisaCase" ADD CONSTRAINT "VisaCase_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VisaCase" ADD CONSTRAINT "VisaCase_countryId_fkey" FOREIGN KEY ("countryId") REFERENCES "VisaCountry"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VisaCaseDocument" ADD CONSTRAINT "VisaCaseDocument_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "VisaCase"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VisaAppointment" ADD CONSTRAINT "VisaAppointment_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "VisaCase"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VisaCaseTimeline" ADD CONSTRAINT "VisaCaseTimeline_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "VisaCase"("id") ON DELETE CASCADE ON UPDATE CASCADE;
