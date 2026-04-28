"use client";

import { cn } from "@/lib/utils";
import type { OrderStatus } from "@/app/generated/prisma/client";

interface OrderTimelineProps {
  status:      OrderStatus;
  createdAt:   Date | string;
  orderedAt:   Date | string | null;
  raisedAt:    Date | string | null;
  deliveredAt: Date | string | null;
}

const MILESTONES = [
  { key: "createdAt",   label: "Created Date"   },
  { key: "orderedAt",   label: "Order Date"     },
  { key: "raisedAt",    label: "Raised Date"    },
  { key: "deliveredAt", label: "Delivered Date" },
] as const;

function fmt(d: Date | string | null) {
  if (!d) return null;
  const date = typeof d === "string" ? new Date(d) : d;
  return {
    date: date.toLocaleDateString("en-CA", { year: "numeric", month: "2-digit", day: "2-digit" }),
    time: date.toLocaleTimeString("en-CA", { hour: "2-digit", minute: "2-digit" }),
  };
}

export function OrderTimeline({
  createdAt, orderedAt, raisedAt, deliveredAt,
}: OrderTimelineProps) {
  const values: Record<string, Date | string | null> = {
    createdAt, orderedAt, raisedAt, deliveredAt,
  };

  return (
    <div className="relative rounded-md border p-4">
      {/* Connecting line */}
      <div className="absolute left-[calc(12.5%+16px)] right-[calc(12.5%+16px)] top-[28px] h-px bg-border" />

      <div className="relative grid grid-cols-4 gap-4">
        {MILESTONES.map(({ key, label }) => {
          const ts     = values[key];
          const filled = ts !== null;
          const parsed = fmt(ts);

          return (
            <div key={key} className="flex flex-col items-center gap-2">
              {/* Node */}
              <div
                className={cn(
                  "relative z-10 flex size-8 items-center justify-center rounded-md border text-xs font-medium",
                  filled
                    ? "border-foreground bg-foreground text-background"
                    : "border-border bg-background text-muted-foreground"
                )}
              >
                {filled ? "✓" : "·"}
              </div>

              {/* Label + timestamp */}
              <div className="text-center">
                <p className={cn("text-xs font-medium", !filled && "text-muted-foreground")}>
                  {label}
                </p>
                {parsed ? (
                  <>
                    <p className="text-xs tabular-nums">{parsed.date}</p>
                    <p className="text-xs text-muted-foreground tabular-nums">{parsed.time}</p>
                  </>
                ) : (
                  <p className="text-xs text-muted-foreground">—</p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
