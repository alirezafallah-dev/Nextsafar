/*
  Warnings:

  - You are about to drop the column `images` on the `Hotel` table. All the data in the column will be lost.
  - You are about to drop the column `visaType` on the `VisaCase` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "VisaCase" DROP CONSTRAINT "VisaCase_countryId_fkey";

-- AlterTable
ALTER TABLE "Hotel" DROP COLUMN "images",
ADD COLUMN     "acfFields" JSONB,
ADD COLUMN     "address" TEXT,
ADD COLUMN     "ageRestriction" TEXT,
ADD COLUMN     "amenitiesCount" INTEGER,
ADD COLUMN     "bookingLink" TEXT,
ADD COLUMN     "canonical" TEXT,
ADD COLUMN     "checkinPolicy" TEXT,
ADD COLUMN     "checkinTime" TEXT,
ADD COLUMN     "checkoutPolicy" TEXT,
ADD COLUMN     "checkoutTime" TEXT,
ADD COLUMN     "cleanlinessPoint" DOUBLE PRECISION,
ADD COLUMN     "comfortPoint" DOUBLE PRECISION,
ADD COLUMN     "countryCode" TEXT,
ADD COLUMN     "currency" TEXT,
ADD COLUMN     "expensesPolicy" TEXT,
ADD COLUMN     "externalId" TEXT,
ADD COLUMN     "facilitiesPoint" DOUBLE PRECISION,
ADD COLUMN     "featuredImage" TEXT,
ADD COLUMN     "focusKeyword" TEXT,
ADD COLUMN     "galleryImages" JSONB,
ADD COLUMN     "googleMapCoords" JSONB,
ADD COLUMN     "hotelType" TEXT,
ADD COLUMN     "instructions" TEXT,
ADD COLUMN     "lastMediaSyncAt" TIMESTAMP(3),
ADD COLUMN     "locationPoint" DOUBLE PRECISION,
ADD COLUMN     "mediaSyncStatus" TEXT,
ADD COLUMN     "nameEn" TEXT,
ADD COLUMN     "nearbyPlaces" JSONB,
ADD COLUMN     "ogImage" TEXT,
ADD COLUMN     "petsPolicy" TEXT,
ADD COLUMN     "price" DOUBLE PRECISION,
ADD COLUMN     "priceBeforeTaxes" DOUBLE PRECISION,
ADD COLUMN     "priceFormatted" TEXT,
ADD COLUMN     "propertyToken" TEXT,
ADD COLUMN     "reviewsBreakdown" JSONB,
ADD COLUMN     "reviewsCount" INTEGER,
ADD COLUMN     "reviewsHistogram" JSONB,
ADD COLUMN     "servicesPoint" DOUBLE PRECISION,
ADD COLUMN     "staffPoint" DOUBLE PRECISION,
ADD COLUMN     "stars" INTEGER,
ADD COLUMN     "totalPrice" DOUBLE PRECISION,
ADD COLUMN     "wpLastModified" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "VisaCase" DROP COLUMN "visaType",
ADD COLUMN     "visaCategory" TEXT,
ADD COLUMN     "visaTypeId" TEXT,
ALTER COLUMN "countryId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "VisaChecklist" ADD COLUMN     "visaTypeId" TEXT,
ALTER COLUMN "countryId" DROP NOT NULL;

-- CreateTable
CREATE TABLE "VisaType" (
    "id" TEXT NOT NULL,
    "wpPostId" INTEGER,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "shortDescription" TEXT,
    "fullContent" TEXT,
    "basePrice" DOUBLE PRECISION,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "prices" JSONB,
    "processingDays" INTEGER,
    "validityDays" INTEGER,
    "issueTime" TEXT,
    "expiryTime" TEXT,
    "entryType" TEXT,
    "visaType" TEXT,
    "requiredDocuments" JSONB,
    "bannerImage" TEXT,
    "featuredImage" TEXT,
    "gallery" JSONB,
    "seoTitle" TEXT,
    "seoDescription" TEXT,
    "focusKeyword" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "syncStatus" TEXT NOT NULL DEFAULT 'SYNCED',
    "lastSyncedAt" TIMESTAMP(3),
    "contentVersion" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VisaType_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "VisaType_wpPostId_key" ON "VisaType"("wpPostId");

-- CreateIndex
CREATE UNIQUE INDEX "VisaType_slug_key" ON "VisaType"("slug");

-- CreateIndex
CREATE INDEX "VisaType_isActive_idx" ON "VisaType"("isActive");

-- CreateIndex
CREATE INDEX "VisaType_visaType_idx" ON "VisaType"("visaType");

-- CreateIndex
CREATE INDEX "Hotel_city_idx" ON "Hotel"("city");

-- CreateIndex
CREATE INDEX "Hotel_country_idx" ON "Hotel"("country");

-- CreateIndex
CREATE INDEX "Hotel_stars_idx" ON "Hotel"("stars");

-- CreateIndex
CREATE INDEX "Hotel_rating_idx" ON "Hotel"("rating");

-- CreateIndex
CREATE INDEX "Hotel_publishStatus_idx" ON "Hotel"("publishStatus");

-- CreateIndex
CREATE INDEX "VisaCase_visaTypeId_idx" ON "VisaCase"("visaTypeId");

-- CreateIndex
CREATE INDEX "VisaChecklist_visaTypeId_idx" ON "VisaChecklist"("visaTypeId");

-- AddForeignKey
ALTER TABLE "VisaChecklist" ADD CONSTRAINT "VisaChecklist_visaTypeId_fkey" FOREIGN KEY ("visaTypeId") REFERENCES "VisaType"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VisaCase" ADD CONSTRAINT "VisaCase_countryId_fkey" FOREIGN KEY ("countryId") REFERENCES "VisaCountry"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VisaCase" ADD CONSTRAINT "VisaCase_visaTypeId_fkey" FOREIGN KEY ("visaTypeId") REFERENCES "VisaType"("id") ON DELETE SET NULL ON UPDATE CASCADE;
