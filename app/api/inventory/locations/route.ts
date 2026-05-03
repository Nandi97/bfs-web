import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  // TODO: filter by user's StaffAssignment once auth is wired to StaffMember.
  // master-inventory role → all locations; store staff → their assigned location(s) only.
  const locations = await prisma.storeLocation.findMany({
    orderBy: { sortOrder: "asc" },
    select: { id: true, name: true, type: true, address: true },
  });
  return NextResponse.json(locations);
}
