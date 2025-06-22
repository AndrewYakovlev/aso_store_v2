-- AlterTable
ALTER TABLE "Order" ADD COLUMN "createdByManagerId" TEXT,
ADD COLUMN "isManagerCreated" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE INDEX "Order_createdByManagerId_idx" ON "Order"("createdByManagerId");

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_createdByManagerId_fkey" FOREIGN KEY ("createdByManagerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;