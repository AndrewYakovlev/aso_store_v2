/*
  Warnings:

  - You are about to drop the column `isAnonymous` on the `User` table. All the data in the column will be lost.
  - You are about to drop the `Session` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[anonymousUserId]` on the table `Cart` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[anonymousUserId,productId]` on the table `Favorite` will be added. If there are existing duplicate values, this will fail.
  - Made the column `phone` on table `User` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "Cart" DROP CONSTRAINT "Cart_userId_fkey";

-- DropForeignKey
ALTER TABLE "Chat" DROP CONSTRAINT "Chat_userId_fkey";

-- DropForeignKey
ALTER TABLE "Favorite" DROP CONSTRAINT "Favorite_userId_fkey";

-- DropForeignKey
ALTER TABLE "Session" DROP CONSTRAINT "Session_userId_fkey";

-- AlterTable
ALTER TABLE "Cart" ADD COLUMN     "anonymousUserId" TEXT,
ALTER COLUMN "userId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Chat" ADD COLUMN     "anonymousUserId" TEXT,
ALTER COLUMN "userId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Favorite" ADD COLUMN     "anonymousUserId" TEXT,
ALTER COLUMN "userId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "isAnonymous",
ADD COLUMN     "firstName" TEXT,
ADD COLUMN     "lastName" TEXT,
ADD COLUMN     "middleName" TEXT,
ALTER COLUMN "phone" SET NOT NULL;

-- DropTable
DROP TABLE "Session";

-- CreateTable
CREATE TABLE "AnonymousUser" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "userId" TEXT,
    "lastActivity" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AnonymousUser_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OtpCode" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OtpCode_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AnonymousUser_token_key" ON "AnonymousUser"("token");

-- CreateIndex
CREATE INDEX "AnonymousUser_userId_idx" ON "AnonymousUser"("userId");

-- CreateIndex
CREATE INDEX "AnonymousUser_token_idx" ON "AnonymousUser"("token");

-- CreateIndex
CREATE INDEX "OtpCode_userId_idx" ON "OtpCode"("userId");

-- CreateIndex
CREATE INDEX "OtpCode_code_idx" ON "OtpCode"("code");

-- CreateIndex
CREATE INDEX "Cart_userId_idx" ON "Cart"("userId");

-- CreateIndex
CREATE INDEX "Cart_anonymousUserId_idx" ON "Cart"("anonymousUserId");

-- CreateIndex
CREATE UNIQUE INDEX "Cart_anonymousUserId_key" ON "Cart"("anonymousUserId");

-- CreateIndex
CREATE INDEX "Chat_anonymousUserId_idx" ON "Chat"("anonymousUserId");

-- CreateIndex
CREATE INDEX "Favorite_anonymousUserId_idx" ON "Favorite"("anonymousUserId");

-- CreateIndex
CREATE UNIQUE INDEX "Favorite_anonymousUserId_productId_key" ON "Favorite"("anonymousUserId", "productId");

-- AddForeignKey
ALTER TABLE "AnonymousUser" ADD CONSTRAINT "AnonymousUser_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OtpCode" ADD CONSTRAINT "OtpCode_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Cart" ADD CONSTRAINT "Cart_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Cart" ADD CONSTRAINT "Cart_anonymousUserId_fkey" FOREIGN KEY ("anonymousUserId") REFERENCES "AnonymousUser"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Favorite" ADD CONSTRAINT "Favorite_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Favorite" ADD CONSTRAINT "Favorite_anonymousUserId_fkey" FOREIGN KEY ("anonymousUserId") REFERENCES "AnonymousUser"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Chat" ADD CONSTRAINT "Chat_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Chat" ADD CONSTRAINT "Chat_anonymousUserId_fkey" FOREIGN KEY ("anonymousUserId") REFERENCES "AnonymousUser"("id") ON DELETE SET NULL ON UPDATE CASCADE;
