import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ locationId: string }> }
) {
  const { locationId } = await params;
  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search") ?? "";
  const status = searchParams.get("status") ?? "all";

  const stock = await prisma.stockLevel.findMany({
    where: {
      locationId,
      product: {
        isConsumable: true,
        ...(search && {
          OR: [
            { name: { contains: search, mode: "insensitive" } },
            { productCode: { contains: search, mode: "insensitive" } },
          ],
        }),
      },
    },
    include: {
      product: {
        select: {
          id: true,
          name: true,
          productCode: true,
          brand: true,
          category: true,
          amount: true,
          unit: { select: { abbreviation: true } },
        },
      },
    },
    orderBy: { quantity: "asc" },
  });

  const rows = stock.filter((s) => {
    if (status === "low") return s.reorderAt !== null && s.quantity <= s.reorderAt;
    if (status === "ok") return s.reorderAt === null || s.quantity > s.reorderAt;
    return true;
  });

  return NextResponse.json(
    rows.map((s) => ({
      id: s.id,
      quantity: s.quantity,
      reorderAt: s.reorderAt,
      product: {
        id: s.product.id,
        name: s.product.name,
        productCode: s.product.productCode,
        brand: s.product.brand,
        category: s.product.category,
        amount: s.product.amount ? Number(s.product.amount) : null,
        unit: s.product.unit?.abbreviation ?? "",
      },
    }))
  );
}
