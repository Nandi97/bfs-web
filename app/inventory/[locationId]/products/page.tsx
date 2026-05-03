import { prisma } from "@/lib/prisma";
import { ProductTable } from "@/components/inventory/products/product-table";
import type { ProductRow } from "@/components/inventory/products/product-columns";

export const dynamic = "force-dynamic";

export default async function ProductsPage({
  params,
  searchParams,
}: {
  params: Promise<{ locationId: string }>;
  searchParams: Promise<{ search?: string; type?: string; category?: string }>;
}) {
  const { locationId } = await params;
  const { search = "", type = "all", category = "" } = await searchParams;

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

  const data: ProductRow[] = products.map((p) => ({
    id: p.id,
    productCode: p.productCode,
    name: p.name,
    brand: p.brand,
    category: p.category,
    subCategory: p.subCategory,
    unit: p.unit,
    msrp: p.msrp ? Number(p.msrp) : null,
    amount: p.amount ? Number(p.amount) : null,
    isKit: p.isKit,
    isConsumable: p.isConsumable,
    isRetail: p.isRetail,
    hasCommission: p.hasCommission,
    stock: p.stockLevels[0] ?? null,
  }));

  return <ProductTable data={data} />;
}
