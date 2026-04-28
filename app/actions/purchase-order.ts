"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import type { OrderStatus } from "@/app/generated/prisma/client";

const STATUS_ORDER: OrderStatus[] = [
  "CREATED", "UPDATED", "ORDERED", "RAISED", "DELIVERED",
];

function milestoneTimestamps(status: OrderStatus): {
  orderedAt?: Date | null;
  raisedAt?: Date | null;
  deliveredAt?: Date | null;
} {
  const now = new Date();
  const idx = STATUS_ORDER.indexOf(status);
  return {
    orderedAt:   idx >= STATUS_ORDER.indexOf("ORDERED")   ? now : null,
    raisedAt:    idx >= STATUS_ORDER.indexOf("RAISED")    ? now : null,
    deliveredAt: idx >= STATUS_ORDER.indexOf("DELIVERED") ? now : null,
  };
}

export async function updateOrderStatus(orderId: string, status: OrderStatus) {
  const existing = await prisma.purchaseOrder.findUnique({
    where: { id: orderId },
    select: { orderedAt: true, raisedAt: true, deliveredAt: true },
  });
  if (!existing) throw new Error("Order not found");

  // Preserve existing timestamps — only fill in when first reaching a stage
  const now = new Date();
  const idx = STATUS_ORDER.indexOf(status);

  await prisma.purchaseOrder.update({
    where: { id: orderId },
    data: {
      status,
      orderedAt:   existing.orderedAt   ?? (idx >= STATUS_ORDER.indexOf("ORDERED")   ? now : null),
      raisedAt:    existing.raisedAt    ?? (idx >= STATUS_ORDER.indexOf("RAISED")    ? now : null),
      deliveredAt: existing.deliveredAt ?? (idx >= STATUS_ORDER.indexOf("DELIVERED") ? now : null),
    },
  });

  revalidatePath(`/inventory`, "layout");
}

export async function saveOrderDetails(
  orderId: string,
  locationId: string,
  data: {
    invoiceNumber?: string;
    isInvoicePaid: boolean;
    dateOfShipment?: string;
    dateOfDelivery?: string;
    addressOfDelivery?: string;
    notes?: string;
    items: {
      id: string;
      retailReceived: number;
      consumableReceived: number;
      notes?: string;
    }[];
  }
) {
  await prisma.$transaction([
    prisma.purchaseOrder.update({
      where: { id: orderId },
      data: {
        invoiceNumber:    data.invoiceNumber     || null,
        isInvoicePaid:    data.isInvoicePaid,
        dateOfShipment:   data.dateOfShipment    ? new Date(data.dateOfShipment)  : null,
        dateOfDelivery:   data.dateOfDelivery    ? new Date(data.dateOfDelivery)  : null,
        addressOfDelivery: data.addressOfDelivery || null,
        notes:            data.notes             || null,
      },
    }),
    ...data.items.map((item) =>
      prisma.purchaseOrderItem.update({
        where: { id: item.id },
        data: {
          retailReceived:     item.retailReceived,
          consumableReceived: item.consumableReceived,
          notes:              item.notes || null,
        },
      })
    ),
  ]);

  revalidatePath(`/inventory/${locationId}/orders/${orderId}`);
}
