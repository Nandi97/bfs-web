import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function InventoryIndexPage() {
  // TODO: When auth is wired, redirect to the user's assigned location.
  // For now, default to the first corporate store.
  const first = await prisma.storeLocation.findFirst({
    where: { type: { not: "HEAD_OFFICE" } },
    orderBy: { sortOrder: "asc" },
    select: { id: true },
  });

  if (!first) redirect("/");
  redirect(`/inventory/${first.id}/dashboard`);
}
