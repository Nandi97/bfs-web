import { prisma } from "@/lib/prisma";

export async function getDashboardData() {
  const [stores, actions, appointments, transfers] = await Promise.all([
    prisma.storeLocation.findMany({
      orderBy: { sortOrder: "asc" },
    }),
    prisma.operationalTask.findMany({
      orderBy: { sortOrder: "asc" },
    }),
    prisma.serviceAppointment.findMany({
      orderBy: { sortOrder: "asc" },
      include: {
        store: true,
      },
    }),
    prisma.inventoryTransfer.findMany({
      orderBy: { sortOrder: "asc" },
      include: {
        fromLocation: true,
        toLocation: true,
      },
    }),
  ]);

  return {
    actions: actions.map((action) => ({
      id: action.id,
      title: action.title,
    })),
    appointments: appointments.map((appointment) => ({
      id: appointment.id,
      locationName: appointment.store.name,
      note: appointment.note,
      windowLabel: appointment.windowLabel,
    })),
    stores: stores.map((store) => ({
      id: store.id,
      managerName: store.managerName,
      name: store.name,
      serviceQueueLabel: store.serviceQueueLabel,
      stockAlert: store.stockAlert,
      type: store.type,
    })),
    transfers: transfers.map((transfer) => ({
      fromName: transfer.fromLocation.name,
      id: transfer.id,
      sku: transfer.sku,
      toName: transfer.toLocation.name,
      units: transfer.units,
    })),
  };
}
