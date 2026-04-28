import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ locationId: string }> }
) {
  const { locationId } = await params;
  const { searchParams } = new URL(req.url);
  const direction = searchParams.get("direction") ?? "all"; // "in" | "out" | "all"

  const transfers = await prisma.inventoryTransfer.findMany({
    where: {
      OR: [
        ...(direction !== "in" ? [{ fromLocationId: locationId }] : []),
        ...(direction !== "out" ? [{ toLocationId: locationId }] : []),
      ],
    },
    include: {
      product: { select: { name: true, productCode: true, unit: { select: { abbreviation: true } } } },
      fromLocation: { select: { id: true, name: true } },
      toLocation: { select: { id: true, name: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(
    transfers.map((t) => ({
      id: t.id,
      units: t.units,
      createdAt: t.createdAt,
      product: {
        name: t.product.name,
        productCode: t.product.productCode,
        unit: t.product.unit?.abbreviation ?? "",
      },
      from: { id: t.fromLocation.id, name: t.fromLocation.name },
      to: { id: t.toLocation.id, name: t.toLocation.name },
      direction: t.toLocationId === locationId ? "in" : "out",
    }))
  );
}
