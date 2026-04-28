"use client";

import { useState, useCallback } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  type SortingState,
} from "@tanstack/react-table";
import { DataTable } from "@/components/ui/table/data-table";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { X } from "lucide-react";
import { ordersColumns, type OrderRow } from "./orders-columns";

interface OrdersTableProps {
  data: OrderRow[];
  isSuperInventory: boolean;
}

const DIRECTION_OPTIONS = [
  { value: "all", label: "All transfers" },
  { value: "in",  label: "Incoming"      },
  { value: "out", label: "Outgoing"      },
];

const STATUS_OPTIONS = [
  { value: "all",       label: "All statuses" },
  { value: "CREATED",   label: "Created"      },
  { value: "UPDATED",   label: "Updated"      },
  { value: "ORDERED",   label: "Ordered"      },
  { value: "RAISED",    label: "Raised"       },
  { value: "DELIVERED", label: "Delivered"    },
];

export function OrdersTable({ data, isSuperInventory }: OrdersTableProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [sorting, setSorting] = useState<SortingState>([
    { id: "createdAt", desc: true },
  ]);

  const table = useReactTable({
    data,
    columns: ordersColumns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: 20 } },
  });

  const currentDirection = searchParams.get("direction") ?? "all";
  const currentStatus    = searchParams.get("status")    ?? "all";

  const pushParam = useCallback(
    (key: string, value: string) => {
      const p = new URLSearchParams(searchParams.toString());
      if (value && value !== "all") {
        p.set(key, value);
      } else {
        p.delete(key);
      }
      router.push(`${pathname}?${p.toString()}`);
    },
    [router, pathname, searchParams]
  );

  const hasFilters = currentDirection !== "all" || currentStatus !== "all";

  return (
    <DataTable table={table}>
      <div className="flex flex-wrap items-center gap-2">
        {/* Direction filter — hidden for super-inventory (all locations visible) */}
        {!isSuperInventory && (
          <Select
            value={currentDirection}
            onValueChange={(v) => pushParam("direction", v ?? "all")}
          >
            <SelectTrigger className="h-8 w-44">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {DIRECTION_OPTIONS.map((o) => (
                <SelectItem key={o.value} value={o.value}>
                  {o.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        <Select
          value={currentStatus}
          onValueChange={(v) => pushParam("status", v ?? "all")}
        >
          <SelectTrigger className="h-8 w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {STATUS_OPTIONS.map((o) => (
              <SelectItem key={o.value} value={o.value}>
                {o.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {hasFilters && (
          <Button
            variant="outline"
            size="sm"
            className="h-8 border-dashed"
            onClick={() => router.push(pathname)}
          >
            <X className="mr-1 size-3.5" />
            Reset
          </Button>
        )}
      </div>
    </DataTable>
  );
}
