"use client";

import { ColumnDef } from "@tanstack/react-table";
import { DataTableColumnHeader } from "@/components/ui/table/data-table-column-header";
import { Badge } from "@/components/ui/badge";
import { StockBadge } from "@/components/inventory/stock-badge";

export type ProductRow = {
  id: string;
  productCode: string;
  name: string;
  brand: string | null;
  category: string | null;
  subCategory: string | null;
  unit: { name: string; abbreviation: string } | null;
  msrp: number | null;
  amount: number | null;
  isKit: boolean;
  isConsumable: boolean;
  isRetail: boolean;
  hasCommission: boolean;
  stock: { quantity: number; reorderAt: number | null } | null;
};

export const productColumns: ColumnDef<ProductRow>[] = [
  {
    accessorKey: "productCode",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Code" />
    ),
    cell: ({ row }) => (
      <span className="font-mono text-xs text-muted-foreground">
        {row.getValue("productCode")}
      </span>
    ),
  },
  {
    accessorKey: "name",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Product" />
    ),
    cell: ({ row }) => (
      <div>
        <p className="font-medium text-sm">{row.getValue("name")}</p>
        {row.original.brand && (
          <p className="text-xs text-muted-foreground">{row.original.brand}</p>
        )}
      </div>
    ),
  },
  {
    accessorKey: "category",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Category" />
    ),
    cell: ({ row }) => (
      <span className="text-sm text-muted-foreground">
        {row.getValue<string | null>("category") ?? "—"}
      </span>
    ),
  },
  {
    id: "type",
    header: "Type",
    cell: ({ row }) => (
      <div className="flex gap-1">
        {row.original.isRetail && (
          <Badge variant="outline" className="text-xs">Retail</Badge>
        )}
        {row.original.isConsumable && (
          <Badge variant="secondary" className="text-xs">Consumable</Badge>
        )}
        {row.original.isKit && (
          <Badge variant="outline" className="text-xs">Kit</Badge>
        )}
      </div>
    ),
  },
  {
    id: "unit",
    header: "Unit",
    cell: ({ row }) => (
      <span className="text-sm text-muted-foreground">
        {row.original.unit?.abbreviation ?? "—"}
      </span>
    ),
  },
  {
    accessorKey: "msrp",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="MSRP" />
    ),
    cell: ({ row }) => {
      const v = row.getValue<number | null>("msrp");
      return (
        <span className="font-mono text-sm tabular-nums">
          {v != null ? `$${v.toFixed(2)}` : "—"}
        </span>
      );
    },
  },
  {
    accessorKey: "amount",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Cost" />
    ),
    cell: ({ row }) => {
      const v = row.getValue<number | null>("amount");
      return (
        <span className="font-mono text-sm tabular-nums">
          {v != null ? `$${v.toFixed(2)}` : "—"}
        </span>
      );
    },
  },
  {
    id: "stock",
    header: "On hand",
    cell: ({ row }) => {
      const s = row.original.stock;
      if (!s) return <span className="text-muted-foreground">—</span>;
      return <StockBadge quantity={s.quantity} reorderAt={s.reorderAt} />;
    },
  },
];
