import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import type { OrderStatus } from "@/app/generated/prisma/client";

export const dynamic = "force-dynamic";

const VALID_STATUSES: OrderStatus[] = [
  "CREATED", "UPDATED", "ORDERED", "RAISED", "DELIVERED",
];

export async function GET(
  req: Request,
  { params }: { params: Promise<{ locationId: string }> }
) {
  const { locationId } = await params;
  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status") ?? "all";

  // TODO: check isSuperInventory from session — when true, drop locationId filter
  const isSuperInventory = false;

  const statusFilter =
    status !== "all" && VALID_STATUSES.includes(status as OrderStatus)
      ? (status as OrderStatus)
      : undefined;

  const orders = await prisma.purchaseOrder.findMany({
    where: {
      ...(statusFilter ? { status: statusFilter } : {}),
      ...(isSuperInventory ? {} : { locationId }),
    },
    include: {
      vendor:   { select: { name: true } },
      location: { select: { name: true } },
      items:    { select: { retailRaised: true, consumableRaised: true } },
    },
    orderBy: { orderRefNumber: "desc" },
  });

  return NextResponse.json(
    orders.map((po) => ({
      id:             po.id,
      orderRefNumber: po.orderRefNumber,
      status:         po.status,
      createdAt:      po.createdAt,
      orderedAt:      po.orderedAt,
      raisedAt:       po.raisedAt,
      deliveredAt:    po.deliveredAt,
      vendor:         po.vendor ? { name: po.vendor.name } : null,
      location:       { name: po.location.name },
      itemCount:      po.items.length,
      totalQty:       po.items.reduce((s, i) => s + i.retailRaised + i.consumableRaised, 0),
    }))
  );
}
