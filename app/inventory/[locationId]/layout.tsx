import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { InventoryNav } from "@/components/inventory/inventory-nav";

export const dynamic = "force-dynamic";

// TODO: When auth is wired, add role check here:
//   1. Get session user → find StaffMember by userId
//   2. If StaffMember has StaffAssignment with Role "master-inventory" at HQ → allow all locationIds
//   3. Otherwise check StaffAssignment.locationId === params.locationId → allow or redirect to 403

export default async function LocationInventoryLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locationId: string }>;
}) {
  const { locationId } = await params;

  const [location, locations] = await Promise.all([
    prisma.storeLocation.findUnique({
      where: { id: locationId },
      select: { id: true, name: true, type: true },
    }),
    prisma.storeLocation.findMany({
      orderBy: { sortOrder: "asc" },
      select: { id: true, name: true, type: true },
    }),
  ]);

  if (!location) notFound();

  return (
    <div className="flex flex-1 flex-col">
      <InventoryNav
        locations={locations}
        currentLocationId={locationId}
      />
      <div className="flex flex-1 flex-col p-6">
        {children}
      </div>
    </div>
  );
}
