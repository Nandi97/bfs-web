import { NextResponse } from "next/server";
import { getCurrentStaffAccess } from "@/lib/inventory-access";

export const dynamic = "force-dynamic";

export async function GET() {
  const access = await getCurrentStaffAccess();

  if (!access) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return NextResponse.json(access.accessibleLocations);
}
