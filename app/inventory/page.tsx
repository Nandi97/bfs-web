import { redirect } from "next/navigation";
import { getCurrentStaffAccess } from "@/lib/inventory-access";

export const dynamic = "force-dynamic";

export default async function InventoryIndexPage() {
  const access = await getCurrentStaffAccess();

  if (!access?.primaryLocationId) {
    redirect("/");
  }

  redirect(`/inventory/${access.primaryLocationId}/dashboard`);
}
