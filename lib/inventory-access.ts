import { prisma } from "@/lib/prisma";

// Departments whose members automatically get cross-location order visibility.
// Executive = admin, Inventory & Supply Chain and Warehouse = ops fulfilment.
const SUPER_INVENTORY_DEPARTMENTS = [
  "Inventory & Supply Chain",
  "Warehouse",
  "Executive",
];

/**
 * Returns true when the given staff member should see orders from all locations.
 * Access is granted if the member belongs to a privileged department OR holds
 * the "Super Inventory" role on any assignment.
 */
export async function hasSuperInventoryAccess(
  staffMemberId: string
): Promise<boolean> {
  const staff = await prisma.staffMember.findUnique({
    where: { id: staffMemberId },
    select: {
      departments: {
        select: { department: { select: { name: true } } },
      },
      assignments: {
        select: { role: { select: { name: true } } },
      },
    },
  });

  if (!staff) return false;

  const deptNames = staff.departments.map((d) => d.department.name);
  const roleNames = staff.assignments.map((a) => a.role.name);

  return (
    deptNames.some((d) => SUPER_INVENTORY_DEPARTMENTS.includes(d)) ||
    roleNames.includes("Super Inventory")
  );
}
