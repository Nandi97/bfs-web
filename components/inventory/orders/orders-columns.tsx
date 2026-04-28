"use client";

import { ColumnDef } from "@tanstack/react-table";
import { DataTableColumnHeader } from "@/components/ui/table/data-table-column-header";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export type OrderStatus = "CREATED" | "UPDATED" | "ORDERED" | "RAISED" | "DELIVERED";

export type OrderRow = {
  id: string;
  units: number;
  status: OrderStatus;
  createdAt: string;
  direction: "in" | "out";
  product: { name: string; productCode: string; unit: string };
  from: { id: string; name: string };
  to: { id: string; name: string };
};

const STATUS_STEPS: OrderStatus[] = [
  "CREATED",
  "UPDATED",
  "ORDERED",
  "RAISED",
  "DELIVERED",
];

const STATUS_LABEL: Record<OrderStatus, string> = {
  CREATED:   "Created",
  UPDATED:   "Updated",
  ORDERED:   "Ordered",
  RAISED:    "Raised",
  DELIVERED: "Delivered",
};

export function OrderStatusIndicator({ status }: { status: OrderStatus }) {
  const current = STATUS_STEPS.indexOf(status);
  return (
    <div className="flex items-center gap-1">
      {STATUS_STEPS.map((step, i) => (
        <div
          key={step}
          title={STATUS_LABEL[step]}
          className={cn(
            "h-1.5 w-5 rounded-sm",
            i <= current
              ? step === "DELIVERED"
                ? "bg-foreground"
                : "bg-foreground/50"
              : "bg-border"
          )}
        />
      ))}
      <span className="ml-1.5 text-xs text-muted-foreground">
        {STATUS_LABEL[status]}
      </span>
    </div>
  );
}

export const ordersColumns: ColumnDef<OrderRow>[] = [
  {
    id: "direction",
    header: "",
    cell: ({ row }) => (
      <Badge
        variant={row.original.direction === "in" ? "outline" : "secondary"}
        className="w-10 justify-center text-xs"
      >
        {row.original.direction === "in" ? "In" : "Out"}
      </Badge>
    ),
  },
  {
    accessorKey: "product.name",
    id: "product",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Product" />
    ),
    cell: ({ row }) => (
      <div>
        <p className="font-medium text-sm">{row.original.product.name}</p>
        <p className="font-mono text-xs text-muted-foreground">
          {row.original.product.productCode}
        </p>
      </div>
    ),
  },
  {
    id: "from",
    header: "From",
    cell: ({ row }) => (
      <span className="text-sm text-muted-foreground">
        {row.original.from.name}
      </span>
    ),
  },
  {
    id: "to",
    header: "To",
    cell: ({ row }) => (
      <span className="text-sm text-muted-foreground">
        {row.original.to.name}
      </span>
    ),
  },
  {
    accessorKey: "units",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Units" />
    ),
    cell: ({ row }) => (
      <span className="font-mono text-sm tabular-nums">
        {row.original.units} {row.original.product.unit}
      </span>
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => (
      <OrderStatusIndicator status={row.original.status} />
    ),
  },
  {
    accessorKey: "createdAt",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Date" />
    ),
    cell: ({ row }) => (
      <span className="text-sm text-muted-foreground">
        {new Date(row.original.createdAt).toLocaleDateString("en-CA", {
          month: "short",
          day: "numeric",
          year: "numeric",
        })}
      </span>
    ),
  },
];
