-- CreateTable
CREATE TABLE "StoreSettings" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "value" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StoreSettings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StorePhone" (
    "id" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "name" TEXT,
    "isWhatsApp" BOOLEAN NOT NULL DEFAULT false,
    "isTelegram" BOOLEAN NOT NULL DEFAULT false,
    "isMain" BOOLEAN NOT NULL DEFAULT false,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StorePhone_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StoreAddress" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'main',
    "name" TEXT,
    "country" TEXT NOT NULL DEFAULT 'Россия',
    "city" TEXT NOT NULL,
    "street" TEXT NOT NULL,
    "building" TEXT NOT NULL,
    "office" TEXT,
    "postalCode" TEXT,
    "coordinates" TEXT,
    "workingHours" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StoreAddress_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "StoreSettings_key_key" ON "StoreSettings"("key");
