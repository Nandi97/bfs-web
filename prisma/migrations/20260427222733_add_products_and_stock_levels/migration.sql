/*
  Warnings:

  - You are about to drop the column `sku` on the `InventoryTransfer` table. All the data in the column will be lost.
  - Added the required column `productId` to the `InventoryTransfer` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "CommissionType" AS ENUM ('FLAT', 'PERCENTAGE');

-- AlterTable
ALTER TABLE "InventoryTransfer" DROP COLUMN "sku",
ADD COLUMN     "productId" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "Product" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "productCode" TEXT NOT NULL,
    "image" TEXT,
    "brand" TEXT,
    "category" TEXT,
    "subCategory" TEXT,
    "businessUnit" TEXT,
    "description" TEXT,
    "htmlDescription" TEXT,
    "cannotOrderFrom" TIMESTAMP(3),
    "cannotSellFrom" TIMESTAMP(3),
    "restrictionEndsAt" TIMESTAMP(3),
    "amount" DECIMAL(10,2),
    "unitOfMeasure" TEXT,
    "msrp" DECIMAL(10,2),
    "isKit" BOOLEAN NOT NULL DEFAULT false,
    "isConsumable" BOOLEAN NOT NULL DEFAULT false,
    "isRetail" BOOLEAN NOT NULL DEFAULT false,
    "hasCommission" BOOLEAN NOT NULL DEFAULT false,
    "commissionAdjustment" DECIMAL(10,4),
    "commissionType" "CommissionType",
    "tags" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Product_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StockLevel" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "locationId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 0,
    "reorderAt" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StockLevel_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Product_productCode_key" ON "Product"("productCode");

-- CreateIndex
CREATE INDEX "StockLevel_locationId_idx" ON "StockLevel"("locationId");

-- CreateIndex
CREATE UNIQUE INDEX "StockLevel_productId_locationId_key" ON "StockLevel"("productId", "locationId");

-- CreateIndex
CREATE INDEX "InventoryTransfer_productId_idx" ON "InventoryTransfer"("productId");

-- AddForeignKey
ALTER TABLE "StockLevel" ADD CONSTRAINT "StockLevel_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StockLevel" ADD CONSTRAINT "StockLevel_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "StoreLocation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InventoryTransfer" ADD CONSTRAINT "InventoryTransfer_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
