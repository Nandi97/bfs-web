-- CreateEnum
CREATE TYPE "OrderStatus" AS ENUM ('CREATED', 'UPDATED', 'ORDERED', 'RAISED', 'DELIVERED');

-- AlterTable
ALTER TABLE "InventoryTransfer" ADD COLUMN     "status" "OrderStatus" NOT NULL DEFAULT 'CREATED';

-- CreateIndex
CREATE INDEX "InventoryTransfer_status_idx" ON "InventoryTransfer"("status");
