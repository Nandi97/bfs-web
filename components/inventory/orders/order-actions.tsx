"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { MoreHorizontal, Printer, FileSpreadsheet, Mail, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { updateOrderStatus } from "@/app/actions/purchase-order";
import type { OrderStatus } from "@/app/generated/prisma/client";

const STATUS_ORDER: OrderStatus[] = [
  "CREATED", "UPDATED", "ORDERED", "RAISED", "DELIVERED",
];
const STATUS_LABEL: Record<OrderStatus, string> = {
  CREATED:   "Created",
  UPDATED:   "Updated",
  ORDERED:   "Ordered",
  RAISED:    "Raised",
  DELIVERED: "Delivered",
};

interface OrderActionsProps {
  orderId:        string;
  locationId:     string;
  currentStatus:  OrderStatus;
  orderRefNumber: number;
}

export function OrderActions({
  orderId,
  locationId,
  currentStatus,
  orderRefNumber,
}: OrderActionsProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);

  const currentIdx  = STATUS_ORDER.indexOf(currentStatus);
  const nextStatus  = STATUS_ORDER[currentIdx + 1] as OrderStatus | undefined;

  function advance() {
    if (!nextStatus) return;
    startTransition(async () => {
      await updateOrderStatus(orderId, nextStatus);
      router.refresh();
    });
  }

  function handlePrint() {
    window.print();
  }

  function handleDownloadCSV() {
    // Placeholder — full CSV export requires server-side generation
    const url = `/api/inventory/${locationId}/orders/${orderId}/export`;
    const a = document.createElement("a");
    a.href = url;
    a.download = `PO-${orderRefNumber}.csv`;
    a.click();
  }

  return (
    <div className="flex items-center gap-2">
      {/* Advance status button */}
      {nextStatus && (
        <Button
          size="sm"
          variant="outline"
          className="h-8 gap-1.5 text-xs"
          onClick={advance}
          disabled={isPending}
        >
          Mark as {STATUS_LABEL[nextStatus]}
          <ChevronRight className="size-3.5" />
        </Button>
      )}

      {/* Kebab menu */}
      <DropdownMenu open={open} onOpenChange={setOpen}>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="icon" className="size-8">
            <MoreHorizontal className="size-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-44">
          <DropdownMenuItem onClick={handlePrint}>
            <Printer className="mr-2 size-3.5" />
            Print
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handlePrint}>
            <Printer className="mr-2 size-3.5" />
            Print barcodes
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem disabled>
            <Mail className="mr-2 size-3.5" />
            Email history
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleDownloadCSV}>
            <FileSpreadsheet className="mr-2 size-3.5" />
            Download Excel
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
