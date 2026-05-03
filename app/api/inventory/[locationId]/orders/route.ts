import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentStaffAccess } from "@/lib/inventory-access";
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
  const access = await getCurrentStaffAccess();

  if (!access) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const isSuperInventory = access.isSuperInventory;

  if (!isSuperInventory && !access.accessibleLocations.some((location) => location.id === locationId)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

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
