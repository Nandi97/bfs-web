import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";
import { OrdersFilterBar } from "@/components/inventory/orders/orders-filter-bar";
import type { OrderStatus } from "@/app/generated/prisma/client";

const VALID_STATUSES: OrderStatus[] = [
  "CREATED", "UPDATED", "ORDERED", "RAISED", "DELIVERED",
];

const STATUS_LABEL: Record<OrderStatus, string> = {
  CREATED:   "Created",
  UPDATED:   "Updated",
  ORDERED:   "Ordered",
  RAISED:    "Raised",
  DELIVERED: "Delivered",
};

const STATUS_STEPS: OrderStatus[] = ["CREATED", "UPDATED", "ORDERED", "RAISED", "DELIVERED"];

export default async function OrdersPage({
  params,
  searchParams,
}: {
  params: Promise<{ locationId: string }>;
  searchParams: Promise<{ status?: string }>;
}) {
  const { locationId } = await params;
  const { status = "all" } = await searchParams;

  // TODO: replace false with hasSuperInventoryAccess(staffMemberId) when auth is wired
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

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium">Purchase Orders</p>
          <p className="text-xs text-muted-foreground">
            Stock orders for this location
            {isSuperInventory && " — all locations"}
          </p>
        </div>
      </div>

      <OrdersFilterBar currentStatus={status} />

      <div className="rounded-md border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/40 text-left text-xs text-muted-foreground">
              <th className="px-4 py-2.5 font-medium">PO #</th>
              <th className="px-4 py-2.5 font-medium">Vendor</th>
              {isSuperInventory && (
                <th className="px-4 py-2.5 font-medium">Location</th>
              )}
              <th className="px-4 py-2.5 font-medium">Items</th>
              <th className="px-4 py-2.5 font-medium">Total qty</th>
              <th className="px-4 py-2.5 font-medium">Status</th>
              <th className="px-4 py-2.5 font-medium">Date</th>
            </tr>
          </thead>
          <tbody>
            {orders.length === 0 && (
              <tr>
                <td
                  colSpan={isSuperInventory ? 7 : 6}
                  className="px-4 py-8 text-center text-xs text-muted-foreground"
                >
                  No orders found
                </td>
              </tr>
            )}
            {orders.map((po) => {
              const totalQty = po.items.reduce(
                (s, i) => s + i.retailRaised + i.consumableRaised,
                0
              );
              const step = STATUS_STEPS.indexOf(po.status);
              return (
                <tr
                  key={po.id}
                  className="border-b last:border-0 hover:bg-muted/30 transition-colors"
                >
                  <td className="px-4 py-3">
                    <Link
                      href={`/inventory/${locationId}/orders/${po.id}`}
                      className="font-mono text-xs font-medium hover:underline"
                    >
                      #{po.orderRefNumber}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-sm">
                    {po.vendor?.name ?? <span className="text-muted-foreground">—</span>}
                  </td>
                  {isSuperInventory && (
                    <td className="px-4 py-3 text-sm text-muted-foreground">
                      {po.location.name}
                    </td>
                  )}
                  <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
                    {po.items.length}
                  </td>
                  <td className="px-4 py-3 font-mono text-xs tabular-nums">
                    {totalQty}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      <div className="flex gap-0.5">
                        {STATUS_STEPS.map((s, i) => (
                          <div
                            key={s}
                            className={`h-1 w-4 rounded-sm ${
                              i <= step ? "bg-foreground/70" : "bg-border"
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {STATUS_LABEL[po.status]}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground tabular-nums">
                    {po.createdAt.toLocaleDateString("en-CA", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
