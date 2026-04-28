"use client";

import { useState, useCallback } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  getFilteredRowModel,
  type SortingState,
} from "@tanstack/react-table";
import { DataTable } from "@/components/ui/table/data-table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { X } from "lucide-react";
import { stockColumns, type StockRow } from "./stock-columns";

interface StockTableProps {
  data: StockRow[];
}

const STATUS_OPTIONS = [
  { value: "all", label: "All"       },
  { value: "low", label: "Low stock" },
  { value: "ok",  label: "OK"        },
];

export function StockTable({ data }: StockTableProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [sorting, setSorting] = useState<SortingState>([]);

  const table = useReactTable({
    data,
    columns: stockColumns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    initialState: { pagination: { pageSize: 20 } },
  });

  const currentSearch = searchParams.get("search") ?? "";
  const currentStatus = searchParams.get("status") ?? "all";

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

  const hasFilters = currentSearch || currentStatus !== "all";

  return (
    <DataTable table={table}>
      <div className="flex flex-wrap items-center gap-2">
        <Input
          placeholder="Search products..."
          defaultValue={currentSearch}
          className="h-8 w-56"
          onChange={(e) =>
            table.getColumn("name")?.setFilterValue(e.target.value)
          }
          onBlur={(e) => pushParam("search", e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") pushParam("search", e.currentTarget.value);
          }}
        />
        <Select
          value={currentStatus}
          onValueChange={(v) => pushParam("status", v ?? "all")}
        >
          <SelectTrigger className="h-8 w-36">
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
