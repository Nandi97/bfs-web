import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ locationId: string }> }
) {
  const { locationId } = await params;
  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search") ?? "";
  const type = searchParams.get("type") ?? "all"; // "retail" | "consumable" | "all"
  const category = searchParams.get("category") ?? "";

  const products = await prisma.product.findMany({
    where: {
      ...(search && {
        OR: [
          { name: { contains: search, mode: "insensitive" } },
          { productCode: { contains: search, mode: "insensitive" } },
          { brand: { contains: search, mode: "insensitive" } },
        ],
      }),
      ...(type === "retail" && { isRetail: true }),
      ...(type === "consumable" && { isConsumable: true }),
      ...(category && { category }),
      // Only products that have a stock level at this location
      stockLevels: { some: { locationId } },
    },
    include: {
      unit: { select: { name: true, abbreviation: true } },
      stockLevels: {
        where: { locationId },
        select: { quantity: true, reorderAt: true },
      },
    },
    orderBy: { name: "asc" },
  });

  return NextResponse.json(
    products.map((p) => ({
      id: p.id,
      productCode: p.productCode,
      name: p.name,
      brand: p.brand,
      category: p.category,
      subCategory: p.subCategory,
      unit: p.unit ? { name: p.unit.name, abbreviation: p.unit.abbreviation } : null,
      msrp: p.msrp ? Number(p.msrp) : null,
      amount: p.amount ? Number(p.amount) : null,
      isKit: p.isKit,
      isConsumable: p.isConsumable,
      isRetail: p.isRetail,
      hasCommission: p.hasCommission,
      stock: p.stockLevels[0] ?? null,
    }))
  );
}
