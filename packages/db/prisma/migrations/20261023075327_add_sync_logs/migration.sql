-- CreateTable
CREATE TABLE "SyncLog" (
    "id" TEXT NOT NULL,
    "wpPostId" INTEGER NOT NULL,
    "eventType" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "errorMessage" TEXT,
    "contentVersion" INTEGER,
    "attemptCount" INTEGER NOT NULL DEFAULT 1,
    "receivedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "processedAt" TIMESTAMP(3),

    CONSTRAINT "SyncLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "SyncLog_wpPostId_idx" ON "SyncLog"("wpPostId");

-- CreateIndex
CREATE INDEX "SyncLog_status_idx" ON "SyncLog"("status");
