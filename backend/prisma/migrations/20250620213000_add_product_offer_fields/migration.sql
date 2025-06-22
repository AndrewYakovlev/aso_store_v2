-- AlterTable
ALTER TABLE "ProductOffer" ADD COLUMN "oldPrice" DECIMAL(10,2),
ADD COLUMN "image" TEXT,
ADD COLUMN "deliveryDays" INTEGER,
ADD COLUMN "isOriginal" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "isAnalog" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable  
ALTER TABLE "ChatMessage" ADD COLUMN "offerId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "ChatMessage_offerId_key" ON "ChatMessage"("offerId");

-- CreateIndex
CREATE INDEX "ChatMessage_offerId_idx" ON "ChatMessage"("offerId");

-- AddForeignKey
ALTER TABLE "ChatMessage" ADD CONSTRAINT "ChatMessage_offerId_fkey" FOREIGN KEY ("offerId") REFERENCES "ProductOffer"("id") ON DELETE SET NULL ON UPDATE CASCADE;