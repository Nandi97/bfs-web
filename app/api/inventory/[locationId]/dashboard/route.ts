import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ locationId: string }> }
) {
  const { locationId } = await params;

  const [retailStock, consumableStock, transfersIn, transfersOut] =
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
    ]);

  const isLow = (s: { quantity: number; reorderAt: number | null }) =>
    s.reorderAt !== null && s.quantity <= s.reorderAt;

  const lowRetail = retailStock.filter(isLow);
  const lowConsumable = consumableStock.filter(isLow);

  return NextResponse.json({
    summary: {
      retailProducts: retailStock.length,
      consumableProducts: consumableStock.length,
      lowStockRetail: lowRetail.length,
      lowStockConsumable: lowConsumable.length,
      transfersIn,
      transfersOut,
    },
    lowStock: [...lowRetail, ...lowConsumable].slice(0, 10).map((s) => ({
      id: s.id,
      productName: s.product.name,
      productCode: s.product.productCode,
      quantity: s.quantity,
      reorderAt: s.reorderAt,
      unit: s.product.unit?.abbreviation ?? "",
    })),
  });
}
