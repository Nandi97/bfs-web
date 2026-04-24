DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'StoreType') THEN
    CREATE TYPE "StoreType" AS ENUM ('CORPORATE', 'FRANCHISE');
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS "StoreLocation" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "type" "StoreType" NOT NULL,
  "managerName" TEXT NOT NULL,
  "serviceQueueLabel" TEXT NOT NULL,
  "stockAlert" TEXT NOT NULL,
  "sortOrder" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "StoreLocation_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "ServiceAppointment" (
  "id" TEXT NOT NULL,
  "storeId" TEXT NOT NULL,
  "windowLabel" TEXT NOT NULL,
  "note" TEXT NOT NULL,
  "sortOrder" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "ServiceAppointment_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "OperationalTask" (
  "id" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "sortOrder" INTEGER NOT NULL DEFAULT 0,
  "storeId" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "OperationalTask_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "InventoryTransfer" (
  "id" TEXT NOT NULL,
  "sku" TEXT NOT NULL,
  "units" INTEGER NOT NULL,
  "sortOrder" INTEGER NOT NULL DEFAULT 0,
  "fromLocationId" TEXT NOT NULL,
  "toLocationId" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "InventoryTransfer_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "ServiceAppointment_storeId_sortOrder_idx"
  ON "ServiceAppointment"("storeId", "sortOrder");

CREATE INDEX IF NOT EXISTS "OperationalTask_sortOrder_idx"
  ON "OperationalTask"("sortOrder");

CREATE INDEX IF NOT EXISTS "InventoryTransfer_sortOrder_idx"
  ON "InventoryTransfer"("sortOrder");

CREATE INDEX IF NOT EXISTS "InventoryTransfer_fromLocationId_idx"
  ON "InventoryTransfer"("fromLocationId");

CREATE INDEX IF NOT EXISTS "InventoryTransfer_toLocationId_idx"
  ON "InventoryTransfer"("toLocationId");

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.table_constraints
    WHERE constraint_name = 'ServiceAppointment_storeId_fkey'
  ) THEN
    ALTER TABLE "ServiceAppointment"
      ADD CONSTRAINT "ServiceAppointment_storeId_fkey"
      FOREIGN KEY ("storeId") REFERENCES "StoreLocation"("id")
      ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.table_constraints
    WHERE constraint_name = 'OperationalTask_storeId_fkey'
  ) THEN
    ALTER TABLE "OperationalTask"
      ADD CONSTRAINT "OperationalTask_storeId_fkey"
      FOREIGN KEY ("storeId") REFERENCES "StoreLocation"("id")
      ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.table_constraints
    WHERE constraint_name = 'InventoryTransfer_fromLocationId_fkey'
  ) THEN
    ALTER TABLE "InventoryTransfer"
      ADD CONSTRAINT "InventoryTransfer_fromLocationId_fkey"
      FOREIGN KEY ("fromLocationId") REFERENCES "StoreLocation"("id")
      ON DELETE RESTRICT ON UPDATE CASCADE;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.table_constraints
    WHERE constraint_name = 'InventoryTransfer_toLocationId_fkey'
  ) THEN
    ALTER TABLE "InventoryTransfer"
      ADD CONSTRAINT "InventoryTransfer_toLocationId_fkey"
      FOREIGN KEY ("toLocationId") REFERENCES "StoreLocation"("id")
      ON DELETE RESTRICT ON UPDATE CASCADE;
  END IF;
END $$;
