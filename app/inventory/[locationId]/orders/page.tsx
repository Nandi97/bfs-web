import { prisma } from "@/lib/prisma";
import { OrdersTable } from "@/components/inventory/orders/orders-table";
import type { OrderRow } from "@/components/inventory/orders/orders-columns";

export default async function OrdersPage({
  params,
  searchParams,
}: {
  params: Promise<{ locationId: string }>;
  searchParams: Promise<{ direction?: string }>;
}) {
  const { locationId } = await params;
  const { direction = "all" } = await searchParams;

  const transfers = await prisma.inventoryTransfer.findMany({
    where: {
      OR: [
        ...(direction !== "in"  ? [{ fromLocationId: locationId }] : []),
        ...(direction !== "out" ? [{ toLocationId:   locationId }] : []),
      ],
    },
    include: {
      product: {
        select: {
          name: true,
          productCode: true,
          unit: { select: { abbreviation: true } },
        },
      },
      fromLocation: { select: { id: true, name: true } },
      toLocation:   { select: { id: true, name: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const data: OrderRow[] = transfers.map((t) => ({
    id: t.id,
    units: t.units,
    createdAt: t.createdAt.toISOString(),
    direction: t.toLocationId === locationId ? "in" : "out",
    product: {
      name: t.product.name,
      productCode: t.product.productCode,
      unit: t.product.unit?.abbreviation ?? "",
    },
    from: { id: t.fromLocation.id, name: t.fromLocation.name },
    to:   { id: t.toLocation.id,   name: t.toLocation.name   },
  }));

  return (
    <div className="flex flex-col gap-4">
      <div>
        <p className="text-sm font-medium">Transfers</p>
        <p className="text-xs text-muted-foreground">
          Inventory movements in and out of this location
        </p>
      </div>
      <OrdersTable data={data} />
    </div>
  );
}
