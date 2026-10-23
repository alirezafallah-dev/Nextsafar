-- CreateEnum
CREATE TYPE "HotelPublishStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'INACTIVE', 'PENDING_REVIEW', 'REMOVED_FROM_WORDPRESS', 'NEEDS_UPDATE');

-- CreateTable
CREATE TABLE "Hotel" (
    "id" TEXT NOT NULL,
    "wpPostId" INTEGER,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "city" TEXT,
    "country" TEXT,
    "publishStatus" "HotelPublishStatus" NOT NULL DEFAULT 'DRAFT',
    "displayStatus" BOOLEAN NOT NULL DEFAULT true,
    "syncStatus" TEXT,
    "source" TEXT,
    "contentVersion" INTEGER NOT NULL DEFAULT 1,
    "lastSyncedAt" TIMESTAMP(3),
    "images" JSONB,
    "amenities" JSONB,
    "coordinates" JSONB,
    "rating" DOUBLE PRECISION,
    "seoTitle" TEXT,
    "seoDescription" TEXT,
    "seoImage" TEXT,
    "shortDescription" TEXT,
    "fullContent" TEXT,
    "faq" JSONB,
    "tags" TEXT[],
    "categories" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Hotel_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HotelSlug" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "hotelId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "HotelSlug_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HotelProviderMapping" (
    "id" TEXT NOT NULL,
    "hotelId" TEXT NOT NULL,
    "providerName" TEXT NOT NULL,
    "providerHotelId" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "lastSyncedAt" TIMESTAMP(3),
    "priority" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "HotelProviderMapping_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Hotel_wpPostId_key" ON "Hotel"("wpPostId");

-- CreateIndex
CREATE UNIQUE INDEX "Hotel_slug_key" ON "Hotel"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "HotelSlug_slug_key" ON "HotelSlug"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "HotelProviderMapping_hotelId_providerName_key" ON "HotelProviderMapping"("hotelId", "providerName");

-- AddForeignKey
ALTER TABLE "HotelSlug" ADD CONSTRAINT "HotelSlug_hotelId_fkey" FOREIGN KEY ("hotelId") REFERENCES "Hotel"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HotelProviderMapping" ADD CONSTRAINT "HotelProviderMapping_hotelId_fkey" FOREIGN KEY ("hotelId") REFERENCES "Hotel"("id") ON DELETE CASCADE ON UPDATE CASCADE;
