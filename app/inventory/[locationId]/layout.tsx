import { notFound, redirect } from "next/navigation";
import { InventoryNav } from "@/components/inventory/inventory-nav";
import { getCurrentStaffAccess } from "@/lib/inventory-access";

export const dynamic = "force-dynamic";

export default async function LocationInventoryLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locationId: string }>;
}) {
  const { locationId } = await params;
  const access = await getCurrentStaffAccess();

  if (!access) {
    redirect("/sign-in");
  }

  if (access.accessibleLocations.length === 0) {
    redirect("/");
  }

  const location = access.accessibleLocations.find((entry) => entry.id === locationId);

  if (!location) {
    if (access.primaryLocationId) {
      redirect(`/inventory/${access.primaryLocationId}/dashboard`);
    }

    notFound();
  }

  return (
    <div className="flex flex-1 flex-col">
      <InventoryNav
        locations={access.accessibleLocations}
        currentLocationId={location.id}
      />
      <div className="flex flex-1 flex-col p-6">
        {children}
      </div>
    </div>
  );
}
