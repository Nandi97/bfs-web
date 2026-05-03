import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import type { OrderStatus } from "@/app/generated/prisma/client";

export const dynamic = "force-dynamic";

const STATUS_ORDER: OrderStatus[] = [
  "CREATED", "UPDATED", "ORDERED", "RAISED", "DELIVERED",
];

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ locationId: string; orderId: string }> }
) {
  const { orderId } = await params;

  const order = await prisma.purchaseOrder.findUnique({
    where: { id: orderId },
    include: {
      vendor:   true,
      location: { select: { id: true, name: true, address: true } },
      items: {
        include: {
          product: {
            select: {
              id: true,
              name: true,
              productCode: true,
              isRetail: true,
              isConsumable: true,
            },
          },
        },
        orderBy: { product: { name: "asc" } },
      },
    },
  });

  if (!order) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json({
    id:               order.id,
    orderRefNumber:   order.orderRefNumber,
    status:           order.status,
    createdAt:        order.createdAt,
    orderedAt:        order.orderedAt,
    raisedAt:         order.raisedAt,
    deliveredAt:      order.deliveredAt,
    invoiceNumber:    order.invoiceNumber,
    isInvoicePaid:    order.isInvoicePaid,
    dateOfShipment:   order.dateOfShipment,
    dateOfDelivery:   order.dateOfDelivery,
    addressOfDelivery: order.addressOfDelivery,
    notes:            order.notes,
    vendor:   order.vendor
      ? { name: order.vendor.name, email: order.vendor.email, address: order.vendor.address }
      : null,
    location: { id: order.location.id, name: order.location.name, address: order.location.address },
    items: order.items.map((item) => ({
      id:                 item.id,
      productCode:        item.product.productCode,
      productName:        item.product.name,
      vendorPartNumber:   item.vendorPartNumber,
      retailRaised:       item.retailRaised,
      consumableRaised:   item.consumableRaised,
      retailReceived:     item.retailReceived,
      consumableReceived: item.consumableReceived,
      notes:              item.notes,
    })),
  });
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ locationId: string; orderId: string }> }
) {
  const { orderId } = await params;
  const body = (await req.json()) as { status: OrderStatus };

  if (!STATUS_ORDER.includes(body.status)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  const existing = await prisma.purchaseOrder.findUnique({
    where: { id: orderId },
    select: { orderedAt: true, raisedAt: true, deliveredAt: true },
  });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const now = new Date();
  const idx = STATUS_ORDER.indexOf(body.status);

  const updated = await prisma.purchaseOrder.update({
    where: { id: orderId },
    data: {
      status:      body.status,
      orderedAt:   existing.orderedAt   ?? (idx >= STATUS_ORDER.indexOf("ORDERED")   ? now : null),
      raisedAt:    existing.raisedAt    ?? (idx >= STATUS_ORDER.indexOf("RAISED")    ? now : null),
      deliveredAt: existing.deliveredAt ?? (idx >= STATUS_ORDER.indexOf("DELIVERED") ? now : null),
    },
  });

  return NextResponse.json({ status: updated.status });
}
