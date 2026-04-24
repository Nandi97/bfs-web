import "dotenv/config";

import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient, StoreType } from "../app/generated/prisma/client";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is not set");
}

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString }),
});

async function main() {
  await prisma.inventoryTransfer.deleteMany();
  await prisma.operationalTask.deleteMany();
  await prisma.serviceAppointment.deleteMany();
  await prisma.storeLocation.deleteMany();

  const stores = await Promise.all([
    prisma.storeLocation.create({
      data: {
        name: "West End Retail",
        type: StoreType.CORPORATE,
        managerName: "Ama Mensah",
        serviceQueueLabel: "14 bookings",
        stockAlert: "Tester reorder",
        sortOrder: 1,
      },
    }),
    prisma.storeLocation.create({
      data: {
        name: "Maple Studio",
        type: StoreType.FRANCHISE,
        managerName: "Clara Osei",
        serviceQueueLabel: "9 bookings",
        stockAlert: "No alert",
        sortOrder: 2,
      },
    }),
    prisma.storeLocation.create({
      data: {
        name: "Union Square",
        type: StoreType.CORPORATE,
        managerName: "Michael Li",
        serviceQueueLabel: "6 bookings",
        stockAlert: "Foundation short",
        sortOrder: 3,
      },
    }),
    prisma.storeLocation.create({
      data: {
        name: "North Hill Spa",
        type: StoreType.FRANCHISE,
        managerName: "Lina Boateng",
        serviceQueueLabel: "12 bookings",
        stockAlert: "Wax refill",
        sortOrder: 4,
      },
    }),
  ]);

  const storeByName = Object.fromEntries(stores.map((store) => [store.name, store]));

  await prisma.serviceAppointment.createMany({
    data: [
      {
        storeId: storeByName["West End Retail"].id,
        windowLabel: "10:00 - 12:00",
        note: "Skin analysis and bridal trial",
        sortOrder: 1,
      },
      {
        storeId: storeByName["North Hill Spa"].id,
        windowLabel: "12:30 - 15:30",
        note: "Laser follow-up block at 80% capacity",
        sortOrder: 2,
      },
      {
        storeId: storeByName["Union Square"].id,
        windowLabel: "16:00 - 18:00",
        note: "Walk-in overflow expected after campaign send",
        sortOrder: 3,
      },
    ],
  });

  await prisma.operationalTask.createMany({
    data: [
      {
        title: "Approve North Hill supply transfer before 11:30",
        sortOrder: 1,
      },
      {
        title: "Review two late closeouts from franchise stores",
        sortOrder: 2,
      },
      {
        title: "Confirm Friday esthetician cover for Maple Studio",
        sortOrder: 3,
      },
      {
        title: "Publish revised tester replenishment counts",
        sortOrder: 4,
      },
    ],
  });

  await prisma.inventoryTransfer.createMany({
    data: [
      {
        sku: "Tint Serum 30ml",
        units: 24,
        fromLocationId: storeByName["West End Retail"].id,
        toLocationId: storeByName["Union Square"].id,
        sortOrder: 1,
      },
      {
        sku: "Hydra Cleanser",
        units: 12,
        fromLocationId: storeByName["West End Retail"].id,
        toLocationId: storeByName["North Hill Spa"].id,
        sortOrder: 2,
      },
      {
        sku: "Wax Cartridge",
        units: 40,
        fromLocationId: storeByName["Maple Studio"].id,
        toLocationId: storeByName["North Hill Spa"].id,
        sortOrder: 3,
      },
    ],
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
