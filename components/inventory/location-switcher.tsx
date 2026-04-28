"use client";

import { useRouter } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Building2 } from "lucide-react";

type Location = { id: string; name: string; type: string };

interface LocationSwitcherProps {
  locations: Location[];
  currentLocationId: string;
}

export function LocationSwitcher({
  locations,
  currentLocationId,
}: LocationSwitcherProps) {
  const router = useRouter();

  const handleChange = (locationId: string | null) => {
    if (!locationId) return;
    router.push(`/inventory/${locationId}/dashboard`);
  };

  return (
    <div className="flex items-center gap-2 py-2">
      <Building2 className="size-4 shrink-0 text-muted-foreground" />
      <Select value={currentLocationId} onValueChange={handleChange}>
        <SelectTrigger className="h-8 w-52 border-none bg-transparent shadow-none focus:ring-0 text-sm font-medium">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {locations.map((loc) => (
            <SelectItem key={loc.id} value={loc.id}>
              {loc.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
