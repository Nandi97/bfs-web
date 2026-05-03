import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { StockBadge } from "@/components/inventory/stock-badge";
import { Badge } from "@/components/ui/badge";
import { ArrowDownToLine, ArrowUpFromLine, Package, TriangleAlert } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function InventoryDashboardPage({
  params,
}: {
  params: Promise<{ locationId: string }>;
}) {
  const { locationId } = await params;

  const [retailStock, consumableStock, transfersIn, transfersOut, recentTransfers] =
    await Promise.all([
      prisma.stockLevel.findMany({
        where: { locationId, product: { isRetail: true } },
        include: {
          product: { select: { name: true, productCode: true, unit: { select: { abbreviation: true } } } },
        },
        orderBy: { quantity: "asc" },
      }),
      prisma.stockLevel.findMany({
        where: { locationId, product: { isConsumable: true } },
        include: {
          product: { select: { name: true, productCode: true, unit: { select: { abbreviation: true } } } },
        },
        orderBy: { quantity: "asc" },
      }),
      prisma.inventoryTransfer.count({ where: { toLocationId: locationId } }),
      prisma.inventoryTransfer.count({ where: { fromLocationId: locationId } }),
      prisma.inventoryTransfer.findMany({
        where: { OR: [{ toLocationId: locationId }, { fromLocationId: locationId }] },
        include: {
          product: { select: { name: true, productCode: true } },
          fromLocation: { select: { name: true } },
          toLocation: { select: { name: true } },
        },
        orderBy: { createdAt: "desc" },
        take: 8,
      }),
    ]);

  const isLow = (s: { quantity: number; reorderAt: number | null }) =>
    s.reorderAt !== null && s.quantity <= s.reorderAt;

  const lowStock = [...retailStock.filter(isLow), ...consumableStock.filter(isLow)];

  const stats = [
    {
      label: "Retail SKUs",
      value: retailStock.length,
      icon: Package,
    },
    {
      label: "Consumable SKUs",
      value: consumableStock.length,
      icon: Package,
    },
    {
      label: "Low stock alerts",
      value: lowStock.length,
      icon: TriangleAlert,
      alert: lowStock.length > 0,
    },
    {
      label: "Transfers in",
      value: transfersIn,
      icon: ArrowDownToLine,
    },
    {
      label: "Transfers out",
      value: transfersOut,
      icon: ArrowUpFromLine,
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      {/* Stat strip */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {stats.map(({ label, value, icon: Icon, alert }) => (
          <div
            key={label}
            className="rounded-md border bg-card px-4 py-3"
          >
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground">{label}</p>
              <Icon
                className={`size-4 ${alert ? "text-destructive" : "text-muted-foreground"}`}
              />
            </div>
            <p className={`mt-1 text-2xl font-semibold tabular-nums ${alert ? "text-destructive" : ""}`}>
              {value}
            </p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Low stock */}
        <Card className="gap-0 py-0">
          <CardHeader className="border-b px-4 py-3">
            <CardTitle className="text-sm font-medium">Low stock</CardTitle>
          </CardHeader>
          <CardContent className="px-0 pb-0">
            {lowStock.length === 0 ? (
              <p className="px-4 py-6 text-sm text-muted-foreground">
                All stock levels are above threshold.
              </p>
            ) : (
              <Table>
                <TableHeader className="bg-muted/40 text-xs">
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>Code</TableHead>
                    <TableHead className="text-right">Qty</TableHead>
                    <TableHead className="text-right">Reorder at</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {lowStock.slice(0, 8).map((s) => (
                    <TableRow key={s.id}>
                      <TableCell className="font-medium">
                        {s.product.name}
                      </TableCell>
                      <TableCell className="font-mono text-xs text-muted-foreground">
                        {s.product.productCode}
                      </TableCell>
                      <TableCell className="text-right">
                        <StockBadge quantity={s.quantity} reorderAt={s.reorderAt} />
                      </TableCell>
                      <TableCell className="text-right text-sm text-muted-foreground">
                        {s.reorderAt ?? "—"} {s.product.unit?.abbreviation}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Recent transfers */}
        <Card className="gap-0 py-0">
          <CardHeader className="border-b px-4 py-3">
            <CardTitle className="text-sm font-medium">Recent transfers</CardTitle>
          </CardHeader>
          <CardContent className="px-0 pb-0">
            {recentTransfers.length === 0 ? (
              <p className="px-4 py-6 text-sm text-muted-foreground">
                No transfers recorded.
              </p>
            ) : (
              <Table>
                <TableHeader className="bg-muted/40 text-xs">
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>Direction</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead className="text-right">Units</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentTransfers.map((t) => {
                    const isIn = t.toLocationId === locationId;
                    return (
                      <TableRow key={t.id}>
                        <TableCell className="font-medium">
                          {t.product.name}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={isIn ? "outline" : "secondary"}
                            className="text-xs"
                          >
                            {isIn ? "In" : "Out"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {isIn ? t.fromLocation.name : t.toLocation.name}
                        </TableCell>
                        <TableCell className="text-right font-mono text-sm tabular-nums">
                          {t.units}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
