-- CreateEnum
CREATE TYPE "TourStatus" AS ENUM ('DRAFT', 'READY', 'PUBLISHED', 'SELLING', 'SOLD_OUT', 'EXPIRED', 'CANCELLED', 'INACTIVE');

-- CreateTable
CREATE TABLE "TourCategory" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,

    CONSTRAINT "TourCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TourDestination" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,

    CONSTRAINT "TourDestination_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Tour" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "categoryId" TEXT,
    "destinationId" TEXT,
    "status" "TourStatus" NOT NULL DEFAULT 'DRAFT',
    "durationDays" INTEGER,
    "durationNights" INTEGER,
    "transportType" TEXT,
    "images" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Tour_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TourDate" (
    "id" TEXT NOT NULL,
    "tourId" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "totalCapacity" INTEGER NOT NULL,
    "remainingCapacity" INTEGER NOT NULL,
    "adultPrice" DOUBLE PRECISION NOT NULL,
    "childPrice" DOUBLE PRECISION NOT NULL,
    "infantPrice" DOUBLE PRECISION NOT NULL,
    "singlePrice" DOUBLE PRECISION,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TourDate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TourItinerary" (
    "id" TEXT NOT NULL,
    "tourId" TEXT NOT NULL,
    "dayNumber" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "TourItinerary_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TourService" (
    "id" TEXT NOT NULL,
    "tourId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "isIncluded" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "TourService_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TourHotelRelation" (
    "id" TEXT NOT NULL,
    "tourId" TEXT NOT NULL,
    "hotelId" TEXT NOT NULL,
    "relationType" TEXT NOT NULL DEFAULT 'MAIN',
    "priority" INTEGER NOT NULL DEFAULT 0,
    "notes" TEXT,

    CONSTRAINT "TourHotelRelation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Lead" (
    "id" TEXT NOT NULL,
    "leadType" TEXT NOT NULL,
    "customerName" TEXT,
    "phone" TEXT,
    "email" TEXT,
    "relatedTourId" TEXT,
    "relatedHotelId" TEXT,
    "preferredDate" TIMESTAMP(3),
    "passengerCount" INTEGER,
    "message" TEXT,
    "source" TEXT,
    "status" TEXT NOT NULL DEFAULT 'NEW',
    "assignedAgentId" TEXT,
    "nextFollowupDate" TIMESTAMP(3),
    "notes" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Lead_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "TourCategory_name_key" ON "TourCategory"("name");

-- CreateIndex
CREATE UNIQUE INDEX "TourCategory_slug_key" ON "TourCategory"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "TourDestination_name_key" ON "TourDestination"("name");

-- CreateIndex
CREATE UNIQUE INDEX "TourDestination_slug_key" ON "TourDestination"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Tour_slug_key" ON "Tour"("slug");

-- CreateIndex
CREATE INDEX "TourDate_tourId_startDate_idx" ON "TourDate"("tourId", "startDate");

-- CreateIndex
CREATE INDEX "TourItinerary_tourId_dayNumber_idx" ON "TourItinerary"("tourId", "dayNumber");

-- CreateIndex
CREATE UNIQUE INDEX "TourHotelRelation_tourId_hotelId_key" ON "TourHotelRelation"("tourId", "hotelId");

-- CreateIndex
CREATE INDEX "Lead_status_idx" ON "Lead"("status");

-- CreateIndex
CREATE INDEX "Lead_relatedTourId_idx" ON "Lead"("relatedTourId");

-- AddForeignKey
ALTER TABLE "Tour" ADD CONSTRAINT "Tour_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "TourCategory"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Tour" ADD CONSTRAINT "Tour_destinationId_fkey" FOREIGN KEY ("destinationId") REFERENCES "TourDestination"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TourDate" ADD CONSTRAINT "TourDate_tourId_fkey" FOREIGN KEY ("tourId") REFERENCES "Tour"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TourItinerary" ADD CONSTRAINT "TourItinerary_tourId_fkey" FOREIGN KEY ("tourId") REFERENCES "Tour"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TourService" ADD CONSTRAINT "TourService_tourId_fkey" FOREIGN KEY ("tourId") REFERENCES "Tour"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TourHotelRelation" ADD CONSTRAINT "TourHotelRelation_tourId_fkey" FOREIGN KEY ("tourId") REFERENCES "Tour"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TourHotelRelation" ADD CONSTRAINT "TourHotelRelation_hotelId_fkey" FOREIGN KEY ("hotelId") REFERENCES "Hotel"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Lead" ADD CONSTRAINT "Lead_relatedTourId_fkey" FOREIGN KEY ("relatedTourId") REFERENCES "Tour"("id") ON DELETE SET NULL ON UPDATE CASCADE;
