import { prisma } from "@/lib/prisma";
import { StockTable } from "@/components/inventory/stock/stock-table";
import type { StockRow } from "@/components/inventory/stock/stock-columns";

export default async function ConsumableStockPage({
  params,
  searchParams,
}: {
  params: Promise<{ locationId: string }>;
  searchParams: Promise<{ search?: string; status?: string }>;
}) {
  const { locationId } = await params;
  const { search = "", status = "all" } = await searchParams;

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

  const data: StockRow[] = stock
    .filter((s) => {
      if (status === "low") return s.reorderAt !== null && s.quantity <= s.reorderAt;
      if (status === "ok") return s.reorderAt === null || s.quantity > s.reorderAt;
      return true;
    })
    .map((s) => ({
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
    }));

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium">Consumable stock</p>
          <p className="text-xs text-muted-foreground">
            Products used in service delivery at this location
          </p>
        </div>
      </div>
      <StockTable data={data} />
    </div>
  );
}
