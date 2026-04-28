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
  type ColumnFiltersState,
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
import { productColumns, type ProductRow } from "./product-columns";

interface ProductTableProps {
  data: ProductRow[];
}

const TYPE_OPTIONS = [
  { value: "all",        label: "All types"   },
  { value: "retail",     label: "Retail only" },
  { value: "consumable", label: "Consumable only" },
];

export function ProductTable({ data }: ProductTableProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

  const table = useReactTable({
    data,
    columns: productColumns,
    state: { sorting, columnFilters },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    initialState: { pagination: { pageSize: 20 } },
  });

  const currentSearch = searchParams.get("search") ?? "";
  const currentType = searchParams.get("type") ?? "all";

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

  const hasFilters = currentSearch || currentType !== "all";

  return (
    <DataTable table={table}>
      <div className="flex flex-wrap items-center gap-2">
        <Input
          placeholder="Search products..."
          defaultValue={currentSearch}
          className="h-8 w-56"
          onChange={(e) => {
            table.getColumn("name")?.setFilterValue(e.target.value);
          }}
          onBlur={(e) => pushParam("search", e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              pushParam("search", e.currentTarget.value);
            }
          }}
        />
        <Select
          value={currentType}
          onValueChange={(v) => pushParam("type", v ?? "all")}
        >
          <SelectTrigger className="h-8 w-44">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {TYPE_OPTIONS.map((o) => (
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
            onClick={() => {
              table.resetColumnFilters();
              router.push(pathname);
            }}
          >
            <X className="mr-1 size-3.5" />
            Reset
          </Button>
        )}
      </div>
    </DataTable>
  );
}
