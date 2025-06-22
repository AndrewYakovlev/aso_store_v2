-- AlterTable
ALTER TABLE "ProductOffer" ADD COLUMN     "images" TEXT[],
ADD COLUMN     "isCancelled" BOOLEAN NOT NULL DEFAULT false;
