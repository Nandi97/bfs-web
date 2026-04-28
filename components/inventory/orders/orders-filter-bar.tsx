"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useCallback } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

const STATUS_OPTIONS = [
  { value: "all",       label: "All statuses" },
  { value: "CREATED",   label: "Created"      },
  { value: "UPDATED",   label: "Updated"      },
  { value: "ORDERED",   label: "Ordered"      },
  { value: "RAISED",    label: "Raised"       },
  { value: "DELIVERED", label: "Delivered"    },
];

export function OrdersFilterBar({ currentStatus }: { currentStatus: string }) {
  const router     = useRouter();
  const pathname   = usePathname();
  const searchParams = useSearchParams();

  const pushParam = useCallback(
    (key: string, value: string) => {
      const p = new URLSearchParams(searchParams.toString());
      value && value !== "all" ? p.set(key, value) : p.delete(key);
      router.push(`${pathname}?${p.toString()}`);
    },
    [router, pathname, searchParams]
  );

  return (
    <div className="flex items-center gap-2">
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

      {currentStatus !== "all" && (
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
  );
}
