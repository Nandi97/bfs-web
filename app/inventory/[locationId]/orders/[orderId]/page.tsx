import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { ChevronRight } from "lucide-react";
import { OrderEditForm } from "@/components/inventory/orders/order-edit-form";
import { OrderTimeline } from "@/components/inventory/orders/order-timeline";
import { OrderActions } from "@/components/inventory/orders/order-actions";
import { Badge } from "@/components/ui/badge";
import type { OrderStatus } from "@/app/generated/prisma/client";

export const dynamic = "force-dynamic";

const STATUS_LABEL: Record<OrderStatus, string> = {
  CREATED:   "Created",
  UPDATED:   "Updated",
  ORDERED:   "Ordered",
  RAISED:    "Raised",
  DELIVERED: "Delivered",
};

// Editing is locked 90 days after delivery
function isEditLocked(order: { status: OrderStatus; deliveredAt: Date | null }) {
  if (order.status !== "DELIVERED" || !order.deliveredAt) return false;
  const ninetyDays = 90 * 24 * 60 * 60 * 1000;
  return Date.now() - order.deliveredAt.getTime() > ninetyDays;
}

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ locationId: string; orderId: string }>;
}) {
  const { locationId, orderId } = await params;

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

  if (!order) notFound();

  const locked = isEditLocked(order);

  return (
    <div className="flex flex-col gap-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1 text-xs text-muted-foreground">
        <Link href={`/inventory/${locationId}/orders`} className="hover:text-foreground">
          Orders
        </Link>
        <ChevronRight className="size-3" />
        <span className="text-foreground">PO #{order.orderRefNumber}</span>
      </nav>

      {/* Locked banner */}
      {locked && (
        <div className="flex items-center gap-2 rounded-md border bg-muted/40 px-4 py-2.5 text-xs text-muted-foreground">
          <span className="inline-block size-1.5 rounded-full bg-muted-foreground/50" />
          Editing of Delivered orders is restricted 90 days from the delivery date.
        </div>
      )}

      {/* Title row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-base font-semibold">
            Purchase Order&nbsp;
            <span className="font-mono">#{order.orderRefNumber}</span>
          </h1>
          <Badge variant="outline" className="text-xs">
            {STATUS_LABEL[order.status]}
          </Badge>
        </div>
        <OrderActions
          orderId={order.id}
          locationId={locationId}
          currentStatus={order.status}
          orderRefNumber={order.orderRefNumber}
        />
      </div>

      {/* Status timeline */}
      <OrderTimeline
        createdAt={order.createdAt}
        orderedAt={order.orderedAt}
        raisedAt={order.raisedAt}
        deliveredAt={order.deliveredAt}
        status={order.status}
      />

      {/* Order meta */}
      <div className="grid grid-cols-2 gap-x-16 gap-y-3 rounded-md border p-4 text-sm">
        <div className="flex gap-4">
          <span className="w-36 shrink-0 text-muted-foreground">Vendor</span>
          <span>{order.vendor?.name ?? "—"}</span>
        </div>
        <div className="flex gap-4">
          <span className="w-36 shrink-0 text-muted-foreground">Order raised from</span>
          <span>{order.location.name}</span>
        </div>
        <div className="flex gap-4">
          <span className="w-36 shrink-0 text-muted-foreground">Vendor address</span>
          <span className="text-muted-foreground">{order.vendor?.address ?? "—"}</span>
        </div>
        <div className="flex gap-4">
          <span className="w-36 shrink-0 text-muted-foreground">Billing address</span>
          <span className="text-muted-foreground">{order.location.address ?? "—"}</span>
        </div>
        <div className="flex gap-4">
          <span className="w-36 shrink-0 text-muted-foreground">Order ref #</span>
          <span className="font-mono">{order.orderRefNumber}</span>
        </div>
      </div>

      {/* Editable form: line items + additional details */}
      <OrderEditForm
        order={{
          id:               order.id,
          locationId,
          invoiceNumber:    order.invoiceNumber,
          isInvoicePaid:    order.isInvoicePaid,
          dateOfShipment:   order.dateOfShipment?.toISOString().split("T")[0] ?? null,
          dateOfDelivery:   order.dateOfDelivery?.toISOString().split("T")[0] ?? null,
          addressOfDelivery: order.addressOfDelivery,
          notes:            order.notes,
        }}
        items={order.items.map((item) => ({
          id:                item.id,
          productId:         item.product.id,
          productCode:       item.product.productCode,
          productName:       item.product.name,
          vendorPartNumber:  item.vendorPartNumber,
          retailRaised:      item.retailRaised,
          consumableRaised:  item.consumableRaised,
          retailReceived:    item.retailReceived,
          consumableReceived: item.consumableReceived,
          notes:             item.notes,
        }))}
        locked={locked}
      />
    </div>
  );
}
