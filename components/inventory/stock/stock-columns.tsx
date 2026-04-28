"use client";

import { ColumnDef } from "@tanstack/react-table";
import { DataTableColumnHeader } from "@/components/ui/table/data-table-column-header";
import { StockBadge } from "@/components/inventory/stock-badge";

export type StockRow = {
  id: string;
  quantity: number;
  reorderAt: number | null;
  product: {
    id: string;
    name: string;
    productCode: string;
    brand: string | null;
    category: string | null;
    msrp?: number | null;
    amount?: number | null;
    unit: string; // abbreviation
  };
};

export const stockColumns: ColumnDef<StockRow>[] = [
  {
    accessorKey: "product.productCode",
    id: "productCode",
    header: "Code",
    cell: ({ row }) => (
      <span className="font-mono text-xs text-muted-foreground">
        {row.original.product.productCode}
      </span>
    ),
  },
  {
    accessorKey: "product.name",
    id: "name",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Product" />
    ),
    cell: ({ row }) => (
      <div>
        <p className="font-medium text-sm">{row.original.product.name}</p>
        {row.original.product.brand && (
          <p className="text-xs text-muted-foreground">
            {row.original.product.brand}
          </p>
        )}
      </div>
    ),
  },
  {
    accessorKey: "product.category",
    id: "category",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Category" />
    ),
    cell: ({ row }) => (
      <span className="text-sm text-muted-foreground">
        {row.original.product.category ?? "—"}
      </span>
    ),
  },
  {
    id: "unit",
    header: "Unit",
    cell: ({ row }) => (
      <span className="text-sm text-muted-foreground">
        {row.original.product.unit || "—"}
      </span>
    ),
  },
  {
    accessorKey: "quantity",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="On hand" />
    ),
    cell: ({ row }) => (
      <StockBadge
        quantity={row.original.quantity}
        reorderAt={row.original.reorderAt}
      />
    ),
  },
  {
    accessorKey: "reorderAt",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Reorder at" />
    ),
    cell: ({ row }) => (
      <span className="font-mono text-sm tabular-nums text-muted-foreground">
        {row.original.reorderAt ?? "—"}
      </span>
    ),
  },
];
