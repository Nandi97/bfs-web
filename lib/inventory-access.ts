import { getSession } from "@/lib/auth-guard";
import { prisma } from "@/lib/prisma";

type SessionUser = {
  id: string;
  name?: string | null;
  email?: string | null;
};

type AccessibleLocation = {
  id: string;
  name: string;
  type: string;
};

const SUPER_INVENTORY_DEPARTMENTS = [
  "Inventory & Supply Chain",
  "Warehouse",
  "Executive",
];

const staffAccessSelect = {
  id: true,
  name: true,
  email: true,
  userId: true,
  departments: {
    select: {
      department: {
        select: { name: true },
      },
    },
  },
  assignments: {
    orderBy: { createdAt: "asc" as const },
    select: {
      isPrimary: true,
      role: {
        select: { name: true },
      },
      location: {
        select: { id: true, name: true, type: true },
      },
    },
  },
};

async function ensureStaffMemberForUser(user: SessionUser) {
  const displayName = user.name?.trim() || user.email?.trim() || "BFS User";
  const email = user.email?.trim() || null;

  const linked = await prisma.staffMember.findUnique({
    where: { userId: user.id },
    select: staffAccessSelect,
  });

  if (linked) {
    if (linked.name !== displayName || linked.email !== email) {
      return prisma.staffMember.update({
        where: { id: linked.id },
        data: {
          name: displayName,
          email,
        },
        select: staffAccessSelect,
      });
    }

    return linked;
  }

  if (email) {
    const matchedByEmail = await prisma.staffMember.findUnique({
      where: { email },
      select: staffAccessSelect,
    });

    if (matchedByEmail) {
      return prisma.staffMember.update({
        where: { id: matchedByEmail.id },
        data: {
          userId: user.id,
          name: displayName,
        },
        select: staffAccessSelect,
      });
    }
  }

  return prisma.staffMember.create({
    data: {
      userId: user.id,
      name: displayName,
      email,
    },
    select: staffAccessSelect,
  });
}

function uniqueLocations(
  assignments: Array<{
    location: AccessibleLocation;
  }>
) {
  return Array.from(
    new Map(assignments.map((assignment) => [assignment.location.id, assignment.location])).values()
  );
}

export async function getCurrentStaffAccess() {
  const session = await getSession();

  if (!session) {
    return null;
  }

  const staff = await ensureStaffMemberForUser(session.user);
  const departmentNames = staff.departments.map((entry) => entry.department.name);
  const roleNames = staff.assignments.map((entry) => entry.role.name);
  const isSuperInventory =
    departmentNames.some((name) => SUPER_INVENTORY_DEPARTMENTS.includes(name)) ||
    roleNames.includes("Super Inventory");

  const accessibleLocations = isSuperInventory
    ? await prisma.storeLocation.findMany({
        orderBy: { sortOrder: "asc" },
        select: { id: true, name: true, type: true },
      })
    : uniqueLocations(staff.assignments).sort((left, right) => left.name.localeCompare(right.name));

  const primaryLocationId =
    staff.assignments.find((assignment) => assignment.isPrimary)?.location.id ??
    accessibleLocations[0]?.id ??
    null;

  return {
    session,
    staff,
    isSuperInventory,
    accessibleLocations,
    primaryLocationId,
  };
}

export async function hasSuperInventoryAccess(staffMemberId: string): Promise<boolean> {
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
