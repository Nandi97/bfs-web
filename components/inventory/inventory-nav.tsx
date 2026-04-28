"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { LocationSwitcher } from "@/components/inventory/location-switcher";

type Location = { id: string; name: string; type: string };

interface InventoryNavProps {
  locations: Location[];
  currentLocationId: string;
}

const sections = [
  { label: "Dashboard",  slug: "dashboard"  },
  { label: "Products",   slug: "products"   },
  { label: "Retail",     slug: "retail"     },
  { label: "Consumable", slug: "consumable" },
  { label: "Orders",     slug: "orders"     },
] as const;

export function InventoryNav({ locations, currentLocationId }: InventoryNavProps) {
  const pathname = usePathname();

  return (
    <div className="border-b bg-background">
      <div className="flex items-center gap-6 px-6">
        <LocationSwitcher
          locations={locations}
          currentLocationId={currentLocationId}
        />

        <nav className="flex items-center gap-0" aria-label="Inventory sections">
          {sections.map(({ label, slug }) => {
            const href = `/inventory/${currentLocationId}/${slug}`;
            const isActive = pathname.includes(`/${slug}`);
            return (
              <Link
                key={slug}
                href={href}
                className={cn(
                  "border-b-2 px-3 py-3 text-sm transition-colors duration-100",
                  isActive
                    ? "border-foreground font-medium text-foreground"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                )}
              >
                {label}
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
