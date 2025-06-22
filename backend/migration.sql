-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('CUSTOMER', 'MANAGER', 'ADMIN');

-- DropForeignKey
ALTER TABLE "ProductVehicle" DROP CONSTRAINT "ProductVehicle_generationId_fkey";

-- DropForeignKey
ALTER TABLE "VehicleGeneration" DROP CONSTRAINT "VehicleGeneration_modelId_fkey";

-- DropIndex
DROP INDEX "ProductVehicle_generationId_idx";

-- DropIndex
DROP INDEX "ProductVehicle_productId_generationId_key";

-- DropIndex
DROP INDEX "VehicleBrand_name_key";

-- DropIndex
DROP INDEX "VehicleModel_brandId_name_key";

-- AlterTable
ALTER TABLE "ChatMessage" ADD COLUMN     "deliveredAt" TIMESTAMP(3),
ADD COLUMN     "isDelivered" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "readAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "DeliveryMethod" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "sortOrder" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "OrderStatus" ADD COLUMN     "color" TEXT NOT NULL DEFAULT '#6B7280',
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "isFinal" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "PaymentMethod" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "sortOrder" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "ProductVehicle" DROP COLUMN "generationId",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "fitmentNotes" TEXT,
ADD COLUMN     "isUniversal" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "vehicleModelId" TEXT NOT NULL,
ADD COLUMN     "yearFrom" INTEGER,
ADD COLUMN     "yearTo" INTEGER;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "companyInn" TEXT,
ADD COLUMN     "companyName" TEXT,
ADD COLUMN     "defaultShippingAddress" TEXT,
ADD COLUMN     "email" TEXT,
ADD COLUMN     "role" "UserRole" NOT NULL DEFAULT 'CUSTOMER';

-- AlterTable
ALTER TABLE "VehicleBrand" ADD COLUMN     "country" TEXT,
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "externalId" TEXT NOT NULL,
ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "logo" TEXT,
ADD COLUMN     "nameCyrillic" TEXT NOT NULL,
ADD COLUMN     "popular" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "slug" TEXT NOT NULL,
ADD COLUMN     "sortOrder" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "VehicleModel" ADD COLUMN     "class" TEXT NOT NULL,
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "externalId" TEXT NOT NULL,
ADD COLUMN     "image" TEXT,
ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "nameCyrillic" TEXT NOT NULL,
ADD COLUMN     "slug" TEXT NOT NULL,
ADD COLUMN     "sortOrder" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "yearFrom" INTEGER NOT NULL,
ADD COLUMN     "yearTo" INTEGER;

-- DropTable
DROP TABLE "VehicleGeneration";

-- CreateIndex
CREATE INDEX "ChatMessage_isDelivered_idx" ON "ChatMessage"("isDelivered");

-- CreateIndex
CREATE INDEX "ChatMessage_isRead_idx" ON "ChatMessage"("isRead");

-- CreateIndex
CREATE INDEX "ProductVehicle_vehicleModelId_idx" ON "ProductVehicle"("vehicleModelId");

-- CreateIndex
CREATE INDEX "ProductVehicle_yearFrom_idx" ON "ProductVehicle"("yearFrom");

-- CreateIndex
CREATE INDEX "ProductVehicle_yearTo_idx" ON "ProductVehicle"("yearTo");

-- CreateIndex
CREATE UNIQUE INDEX "ProductVehicle_productId_vehicleModelId_yearFrom_yearTo_key" ON "ProductVehicle"("productId", "vehicleModelId", "yearFrom", "yearTo");

-- CreateIndex
CREATE UNIQUE INDEX "VehicleBrand_externalId_key" ON "VehicleBrand"("externalId");

-- CreateIndex
CREATE UNIQUE INDEX "VehicleBrand_slug_key" ON "VehicleBrand"("slug");

-- CreateIndex
CREATE INDEX "VehicleBrand_slug_idx" ON "VehicleBrand"("slug");

-- CreateIndex
CREATE INDEX "VehicleBrand_popular_idx" ON "VehicleBrand"("popular");

-- CreateIndex
CREATE INDEX "VehicleBrand_isActive_idx" ON "VehicleBrand"("isActive");

-- CreateIndex
CREATE UNIQUE INDEX "VehicleModel_externalId_key" ON "VehicleModel"("externalId");

-- CreateIndex
CREATE UNIQUE INDEX "VehicleModel_slug_key" ON "VehicleModel"("slug");

-- CreateIndex
CREATE INDEX "VehicleModel_brandId_idx" ON "VehicleModel"("brandId");

-- CreateIndex
CREATE INDEX "VehicleModel_slug_idx" ON "VehicleModel"("slug");

-- CreateIndex
CREATE INDEX "VehicleModel_class_idx" ON "VehicleModel"("class");

-- CreateIndex
CREATE INDEX "VehicleModel_yearFrom_yearTo_idx" ON "VehicleModel"("yearFrom", "yearTo");

-- CreateIndex
CREATE INDEX "VehicleModel_isActive_idx" ON "VehicleModel"("isActive");

-- AddForeignKey
ALTER TABLE "ProductVehicle" ADD CONSTRAINT "ProductVehicle_vehicleModelId_fkey" FOREIGN KEY ("vehicleModelId") REFERENCES "VehicleModel"("id") ON DELETE CASCADE ON UPDATE CASCADE;

