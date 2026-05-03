import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ locationId: string }> }
) {
  const { locationId } = await params;
  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search") ?? "";
  const status = searchParams.get("status") ?? "all"; // "low" | "ok" | "all"

  const stock = await prisma.stockLevel.findMany({
    where: {
      locationId,
      product: {
        isRetail: true,
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
          msrp: true,
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
        msrp: s.product.msrp ? Number(s.product.msrp) : null,
        unit: s.product.unit?.abbreviation ?? "",
      },
    }))
  );
}
