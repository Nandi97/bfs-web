import { Badge } from "@/components/ui/badge";

interface StockBadgeProps {
  quantity: number;
  reorderAt: number | null;
}

export function StockBadge({ quantity, reorderAt }: StockBadgeProps) {
  if (reorderAt !== null && quantity <= reorderAt) {
    return (
      <Badge variant="destructive" className="font-mono text-xs">
        {quantity} — low
      </Badge>
    );
  }
  return (
    <span className="font-mono text-sm tabular-nums">{quantity}</span>
  );
}
