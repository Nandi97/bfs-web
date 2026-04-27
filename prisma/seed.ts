import "dotenv/config";

import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient, StoreType } from "../app/generated/prisma/client";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) throw new Error("DATABASE_URL is not set");

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString }) });

async function main() {
  // --- Clear (children before parents) ---
  await prisma.stockLevel.deleteMany();
  await prisma.staffDepartment.deleteMany();
  await prisma.staffAssignment.deleteMany();
  await prisma.inventoryTransfer.deleteMany();
  await prisma.operationalTask.deleteMany();
  await prisma.serviceAppointment.deleteMany();
  await prisma.staffMember.deleteMany();
  await prisma.storeLocation.deleteMany();
  await prisma.product.deleteMany();
  await prisma.unit.deleteMany();
  await prisma.department.deleteMany();
  await prisma.role.deleteMany();

  // ── Units of measure ─────────────────────────────────────────────────────
  // Starter list for cosmetics — extend via the admin UI as needed.

  const [uBottle, uTube, uCartridge, uPiece, uSachet, uKit, uBox, uPump] =
    await Promise.all([
      prisma.unit.create({ data: { name: "Bottle",    abbreviation: "btl"  } }),
      prisma.unit.create({ data: { name: "Tube",      abbreviation: "tube" } }),
      prisma.unit.create({ data: { name: "Cartridge", abbreviation: "crt"  } }),
      prisma.unit.create({ data: { name: "Piece",     abbreviation: "pc"   } }),
      prisma.unit.create({ data: { name: "Sachet",    abbreviation: "sct"  } }),
      prisma.unit.create({ data: { name: "Kit",       abbreviation: "kit"  } }),
      prisma.unit.create({ data: { name: "Box",       abbreviation: "box"  } }),
      prisma.unit.create({ data: { name: "Pump",      abbreviation: "pump" } }),
    ]);

  // suppress unused-variable warnings — units exist in the DB for future products
  void uPiece, uSachet, uKit, uBox, uPump;

  // ── Departments (head-office groupings only) ──────────────────────────────

  const [deptExec, deptMarketing, deptAccounting, deptInventory, deptOps, deptHR] =
    await Promise.all([
      prisma.department.create({ data: { name: "Executive" } }),
      prisma.department.create({ data: { name: "Marketing" } }),
      prisma.department.create({ data: { name: "Accounting & Finance" } }),
      prisma.department.create({ data: { name: "Inventory & Supply Chain" } }),
      prisma.department.create({ data: { name: "Operations" } }),
      prisma.department.create({ data: { name: "Human Resources" } }),
    ]);

  // ── Roles (shared across all location types) ──────────────────────────────

  const [
    roleCEO,
    roleOpsDir,
    roleInvMgr,
    roleMktMgr,
    roleMktCoord,
    roleAccountant,
    roleHR,
    roleFranchiseOwner,
    roleStoreMgr,
    roleAsstMgr,
    roleAesthetician,
    roleRetailAssoc,
    roleReceptionist,
  ] = await Promise.all([
    prisma.role.create({ data: { name: "CEO" } }),
    prisma.role.create({ data: { name: "Operations Director" } }),
    prisma.role.create({ data: { name: "Inventory Manager" } }),
    prisma.role.create({ data: { name: "Marketing Manager" } }),
    prisma.role.create({ data: { name: "Marketing Coordinator" } }),
    prisma.role.create({ data: { name: "Accountant" } }),
    prisma.role.create({ data: { name: "HR Coordinator" } }),
    prisma.role.create({ data: { name: "Franchise Owner" } }),
    prisma.role.create({ data: { name: "Store Manager" } }),
    prisma.role.create({ data: { name: "Assistant Manager" } }),
    prisma.role.create({ data: { name: "Aesthetician" } }),
    prisma.role.create({ data: { name: "Retail Associate" } }),
    prisma.role.create({ data: { name: "Receptionist" } }),
  ]);

  // suppress unused-variable warnings — roles exist in the DB for future assignments
  void roleMktCoord, roleAsstMgr, roleAesthetician, roleRetailAssoc, roleReceptionist;

  // ── Locations ─────────────────────────────────────────────────────────────
  // Addresses are approximate — update unit numbers / suite numbers as needed.

  const locations = await Promise.all([
    // Head office
    prisma.storeLocation.create({
      data: {
        name: "Head Office",
        type: StoreType.HEAD_OFFICE,
        address: "100 Sheppard Ave E, Suite 400, Toronto, ON M2N 6N5",
        sortOrder: 0,
      },
    }),

    // ── Corporate-owned stores (sortOrder 1–4) ──
    prisma.storeLocation.create({
      data: {
        name: "Burlington (Corporate)",
        type: StoreType.CORPORATE,
        address: "2025 Guelph Line, Burlington, ON L7P 4M8",
        serviceQueueLabel: "11 bookings",
        stockAlert: "Foundation short",
        sortOrder: 1,
      },
    }),
    prisma.storeLocation.create({
      data: {
        name: "Limeridge",
        type: StoreType.CORPORATE,
        address: "999 Upper Wentworth St, Hamilton, ON L9A 4X5",
        serviceQueueLabel: "8 bookings",
        stockAlert: "Tester reorder",
        sortOrder: 2,
      },
    }),
    prisma.storeLocation.create({
      data: {
        name: "Oakville (Corporate)",
        type: StoreType.CORPORATE,
        address: "350 Oak Walk Dr, Oakville, ON L6H 0A5",
        serviceQueueLabel: "6 bookings",
        stockAlert: "No alert",
        sortOrder: 3,
      },
    }),
    prisma.storeLocation.create({
      data: {
        name: "Square One",
        type: StoreType.CORPORATE,
        address: "100 City Centre Dr, Mississauga, ON L5B 2C9",
        serviceQueueLabel: "14 bookings",
        stockAlert: "Wax refill",
        sortOrder: 4,
      },
    }),

    // ── Franchise stores (sortOrder 5–15) ──
    prisma.storeLocation.create({
      data: {
        name: "Bolton",
        type: StoreType.FRANCHISE,
        address: "12 King St W, Bolton, ON L7E 1C8",
        serviceQueueLabel: "7 bookings",
        stockAlert: "No alert",
        sortOrder: 5,
      },
    }),
    prisma.storeLocation.create({
      data: {
        name: "Burlington (Franchise)",
        type: StoreType.FRANCHISE,
        address: "777 Guelph Line, Burlington, ON L7R 3N2",
        serviceQueueLabel: "9 bookings",
        stockAlert: "Serum reorder",
        sortOrder: 6,
      },
    }),
    prisma.storeLocation.create({
      data: {
        name: "Milton",
        type: StoreType.FRANCHISE,
        address: "55 Ontario St S, Milton, ON L9T 2M3",
        serviceQueueLabel: "5 bookings",
        stockAlert: "No alert",
        sortOrder: 7,
      },
    }),
    prisma.storeLocation.create({
      data: {
        name: "Oakville (Franchise)",
        type: StoreType.FRANCHISE,
        address: "240 Leighland Ave, Oakville, ON L6H 3H6",
        serviceQueueLabel: "12 bookings",
        stockAlert: "Wax cartridge low",
        sortOrder: 8,
      },
    }),
    prisma.storeLocation.create({
      data: {
        name: "Ottawa-Kanata",
        type: StoreType.FRANCHISE,
        address: "1000 Kanata Ave, Kanata, ON K2T 1H6",
        serviceQueueLabel: "10 bookings",
        stockAlert: "No alert",
        sortOrder: 9,
      },
    }),
    prisma.storeLocation.create({
      data: {
        name: "Rymal",
        type: StoreType.FRANCHISE,
        address: "1585 Upper James St, Hamilton, ON L9B 1K3",
        serviceQueueLabel: "6 bookings",
        stockAlert: "Cleanser low",
        sortOrder: 10,
      },
    }),
    prisma.storeLocation.create({
      data: {
        name: "Bayshore Mall",
        type: StoreType.FRANCHISE,
        address: "100 Bayshore Dr, Ottawa, ON K2B 8C1",
        serviceQueueLabel: "11 bookings",
        stockAlert: "No alert",
        sortOrder: 11,
      },
    }),
    prisma.storeLocation.create({
      data: {
        name: "Dixie Mall",
        type: StoreType.FRANCHISE,
        address: "1250 S Service Rd, Mississauga, ON L5E 1V4",
        serviceQueueLabel: "8 bookings",
        stockAlert: "Toner reorder",
        sortOrder: 12,
      },
    }),
    prisma.storeLocation.create({
      data: {
        name: "Hillcrest Mall",
        type: StoreType.FRANCHISE,
        address: "9350 Yonge St, Richmond Hill, ON L4C 5G2",
        serviceQueueLabel: "9 bookings",
        stockAlert: "No alert",
        sortOrder: 13,
      },
    }),
    prisma.storeLocation.create({
      data: {
        name: "Upper Canada Mall",
        type: StoreType.FRANCHISE,
        address: "17600 Yonge St, Newmarket, ON L3Y 4Z1",
        serviceQueueLabel: "7 bookings",
        stockAlert: "No alert",
        sortOrder: 14,
      },
    }),
    prisma.storeLocation.create({
      data: {
        name: "Yonge & Eglinton",
        type: StoreType.FRANCHISE,
        address: "2300 Yonge St, Toronto, ON M4P 1E4",
        serviceQueueLabel: "13 bookings",
        stockAlert: "Primer reorder",
        sortOrder: 15,
      },
    }),
  ]);

  const loc = Object.fromEntries(locations.map((l) => [l.name, l]));

  // ── Products ──────────────────────────────────────────────────────────────
  // isConsumable = used internally in service delivery
  // isRetail     = sold to end customers (in-store or online via Shopify)
  // Both flags can be true simultaneously.

  const [pSerum, pCleanser, pWax, pFoundation, pPrimer, pLaserGel] = await Promise.all([
    prisma.product.create({
      data: {
        name: "Tint Serum 30ml",
        productCode: "BFS-SRM-001",
        brand: "BFS Pro",
        category: "Serums",
        subCategory: "Tinting",
        businessUnit: "Retail",
        description: "Lightweight tinting serum for daily use and in-treatment application.",
        unitId: uBottle.id,
        msrp: 48.00,
        amount: 22.00,
        isConsumable: true,
        isRetail: true,
        hasCommission: true,
        commissionType: "PERCENTAGE",
        commissionAdjustment: 0.08,
        tags: ["serum", "tinting", "retail", "consumable"],
      },
    }),
    prisma.product.create({
      data: {
        name: "Hydra Cleanser",
        productCode: "BFS-CLN-001",
        brand: "BFS Pro",
        category: "Cleansers",
        subCategory: "Hydrating",
        businessUnit: "Retail",
        description: "Gentle hydrating cleanser suitable for all skin types.",
        unitId: uBottle.id,
        msrp: 36.00,
        amount: 16.50,
        isConsumable: true,
        isRetail: true,
        hasCommission: true,
        commissionType: "PERCENTAGE",
        commissionAdjustment: 0.08,
        tags: ["cleanser", "hydrating", "retail", "consumable"],
      },
    }),
    prisma.product.create({
      data: {
        name: "Wax Cartridge",
        productCode: "BFS-WAX-001",
        brand: "BFS Pro",
        category: "Service Supplies",
        subCategory: "Waxing",
        businessUnit: "Services",
        description: "Professional-grade wax cartridge for body and facial waxing services.",
        unitId: uCartridge.id,
        msrp: null,   // not sold retail; no MSRP
        amount: 8.75,
        isConsumable: true,
        isRetail: false,
        hasCommission: false,
        tags: ["wax", "consumable", "service-only"],
      },
    }),
    prisma.product.create({
      data: {
        name: "Full Cover Foundation",
        productCode: "BFS-FDN-001",
        brand: "BFS Pro",
        category: "Face",
        subCategory: "Foundation",
        businessUnit: "Retail",
        description: "High-coverage buildable foundation with SPF 20.",
        unitId: uBottle.id,
        msrp: 62.00,
        amount: 28.00,
        isConsumable: false,
        isRetail: true,
        hasCommission: true,
        commissionType: "PERCENTAGE",
        commissionAdjustment: 0.10,
        tags: ["foundation", "face", "retail"],
      },
    }),
    prisma.product.create({
      data: {
        name: "Mattifying Primer",
        productCode: "BFS-PRM-001",
        brand: "BFS Pro",
        category: "Face",
        subCategory: "Primer",
        businessUnit: "Retail",
        description: "Pore-minimising primer for oily to combination skin.",
        unitId: uTube.id,
        msrp: 42.00,
        amount: 19.00,
        isConsumable: false,
        isRetail: true,
        hasCommission: true,
        commissionType: "PERCENTAGE",
        commissionAdjustment: 0.08,
        tags: ["primer", "face", "retail"],
      },
    }),
    prisma.product.create({
      data: {
        name: "Laser Cooling Gel",
        productCode: "BFS-LCG-001",
        brand: "BFS Pro",
        category: "Service Supplies",
        subCategory: "Laser",
        businessUnit: "Services",
        description: "Cooling and soothing gel used during and after laser hair removal treatments.",
        unitId: uTube.id,
        msrp: null,
        amount: 14.00,
        isConsumable: true,
        isRetail: false,
        hasCommission: false,
        tags: ["laser", "cooling", "consumable", "service-only"],
      },
    }),
  ]);

  // ── Stock levels (managed locations only: HQ + 4 corporate stores) ────────
  // Quantities are illustrative. Franchise store stock should be entered via the app.
  // reorderAt = alert threshold; null means no automatic alert configured yet.

  await prisma.stockLevel.createMany({
    data: [
      // Head Office (central warehouse + Shopify fulfilment)
      { productId: pSerum.id,      locationId: loc["Head Office"].id,            quantity: 480, reorderAt: 100 },
      { productId: pCleanser.id,   locationId: loc["Head Office"].id,            quantity: 360, reorderAt: 80  },
      { productId: pWax.id,        locationId: loc["Head Office"].id,            quantity: 600, reorderAt: 150 },
      { productId: pFoundation.id, locationId: loc["Head Office"].id,            quantity: 240, reorderAt: 60  },
      { productId: pPrimer.id,     locationId: loc["Head Office"].id,            quantity: 200, reorderAt: 50  },
      { productId: pLaserGel.id,   locationId: loc["Head Office"].id,            quantity: 180, reorderAt: 40  },

      // Burlington (Corporate)
      { productId: pSerum.id,      locationId: loc["Burlington (Corporate)"].id, quantity: 32,  reorderAt: 8   },
      { productId: pCleanser.id,   locationId: loc["Burlington (Corporate)"].id, quantity: 28,  reorderAt: 8   },
      { productId: pWax.id,        locationId: loc["Burlington (Corporate)"].id, quantity: 45,  reorderAt: 10  },
      { productId: pFoundation.id, locationId: loc["Burlington (Corporate)"].id, quantity: 18,  reorderAt: 5   },
      { productId: pPrimer.id,     locationId: loc["Burlington (Corporate)"].id, quantity: 22,  reorderAt: 5   },
      { productId: pLaserGel.id,   locationId: loc["Burlington (Corporate)"].id, quantity: 14,  reorderAt: 4   },

      // Limeridge
      { productId: pSerum.id,      locationId: loc["Limeridge"].id,              quantity: 20,  reorderAt: 6   },
      { productId: pCleanser.id,   locationId: loc["Limeridge"].id,              quantity: 16,  reorderAt: 6   },
      { productId: pWax.id,        locationId: loc["Limeridge"].id,              quantity: 30,  reorderAt: 8   },
      { productId: pFoundation.id, locationId: loc["Limeridge"].id,              quantity: 12,  reorderAt: 4   },
      { productId: pPrimer.id,     locationId: loc["Limeridge"].id,              quantity: 15,  reorderAt: 4   },
      { productId: pLaserGel.id,   locationId: loc["Limeridge"].id,              quantity: 10,  reorderAt: 3   },

      // Oakville (Corporate)
      { productId: pSerum.id,      locationId: loc["Oakville (Corporate)"].id,   quantity: 24,  reorderAt: 6   },
      { productId: pCleanser.id,   locationId: loc["Oakville (Corporate)"].id,   quantity: 20,  reorderAt: 6   },
      { productId: pWax.id,        locationId: loc["Oakville (Corporate)"].id,   quantity: 38,  reorderAt: 10  },
      { productId: pFoundation.id, locationId: loc["Oakville (Corporate)"].id,   quantity: 14,  reorderAt: 4   },
      { productId: pPrimer.id,     locationId: loc["Oakville (Corporate)"].id,   quantity: 11,  reorderAt: 4   },
      { productId: pLaserGel.id,   locationId: loc["Oakville (Corporate)"].id,   quantity: 8,   reorderAt: 3   },

      // Square One
      { productId: pSerum.id,      locationId: loc["Square One"].id,             quantity: 40,  reorderAt: 10  },
      { productId: pCleanser.id,   locationId: loc["Square One"].id,             quantity: 34,  reorderAt: 8   },
      { productId: pWax.id,        locationId: loc["Square One"].id,             quantity: 52,  reorderAt: 12  },
      { productId: pFoundation.id, locationId: loc["Square One"].id,             quantity: 22,  reorderAt: 6   },
      { productId: pPrimer.id,     locationId: loc["Square One"].id,             quantity: 18,  reorderAt: 5   },
      { productId: pLaserGel.id,   locationId: loc["Square One"].id,             quantity: 16,  reorderAt: 4   },
    ],
  });

  // ── Staff members ─────────────────────────────────────────────────────────

  const [sarah, marcus, priya, danielle, james, nina] = await Promise.all([
    prisma.staffMember.create({ data: { name: "Sarah Chen",      email: "sarah.chen@bfs.ca"      } }),
    // Marcus: Operations Director at HQ + franchise owner of Bolton
    prisma.staffMember.create({ data: { name: "Marcus Williams", email: "marcus.williams@bfs.ca" } }),
    prisma.staffMember.create({ data: { name: "Priya Sharma",    email: "priya.sharma@bfs.ca"    } }),
    prisma.staffMember.create({ data: { name: "Danielle Osei",   email: "danielle.osei@bfs.ca"   } }),
    prisma.staffMember.create({ data: { name: "James Kowalski",  email: "james.kowalski@bfs.ca"  } }),
    prisma.staffMember.create({ data: { name: "Nina Patel",      email: "nina.patel@bfs.ca"      } }),
  ]);

  const [ama, michael, yuki, thomas] = await Promise.all([
    prisma.staffMember.create({ data: { name: "Ama Mensah",   email: "ama.mensah@bfs.ca"   } }),
    prisma.staffMember.create({ data: { name: "Michael Li",   email: "michael.li@bfs.ca"   } }),
    prisma.staffMember.create({ data: { name: "Yuki Tanaka",  email: "yuki.tanaka@bfs.ca"  } }),
    prisma.staffMember.create({ data: { name: "Thomas Amoah", email: "thomas.amoah@bfs.ca" } }),
  ]);

  // Franchise managers — visible to us, but hired and managed by the franchise
  const [clara, lina] = await Promise.all([
    prisma.staffMember.create({ data: { name: "Clara Osei",   email: "clara@oakville-franchise.ca", isFranchiseManaged: true } }),
    prisma.staffMember.create({ data: { name: "Lina Boateng", email: "lina@rymal-franchise.ca",     isFranchiseManaged: true } }),
  ]);

  // ── Department memberships ────────────────────────────────────────────────

  await prisma.staffDepartment.createMany({
    data: [
      { staffMemberId: sarah.id,    departmentId: deptExec.id      },
      { staffMemberId: marcus.id,   departmentId: deptOps.id       },
      { staffMemberId: priya.id,    departmentId: deptInventory.id },
      { staffMemberId: danielle.id, departmentId: deptMarketing.id },
      { staffMemberId: james.id,    departmentId: deptAccounting.id},
      { staffMemberId: nina.id,     departmentId: deptHR.id        },
    ],
  });

  // ── Staff assignments ─────────────────────────────────────────────────────

  const hqId = loc["Head Office"].id;

  await prisma.staffAssignment.createMany({
    data: [
      // Head office
      { staffMemberId: sarah.id,    locationId: hqId,                                 roleId: roleCEO.id,            isPrimary: true  },
      { staffMemberId: marcus.id,   locationId: hqId,                                 roleId: roleOpsDir.id,         isPrimary: true  },
      { staffMemberId: priya.id,    locationId: hqId,                                 roleId: roleInvMgr.id,         isPrimary: true  },
      { staffMemberId: danielle.id, locationId: hqId,                                 roleId: roleMktMgr.id,         isPrimary: true  },
      { staffMemberId: james.id,    locationId: hqId,                                 roleId: roleAccountant.id,     isPrimary: true  },
      { staffMemberId: nina.id,     locationId: hqId,                                 roleId: roleHR.id,             isPrimary: true  },

      // Cross-functional: Marcus also owns the Bolton franchise
      { staffMemberId: marcus.id,   locationId: loc["Bolton"].id,                     roleId: roleFranchiseOwner.id, isPrimary: false },

      // Corporate store managers
      { staffMemberId: ama.id,      locationId: loc["Burlington (Corporate)"].id,     roleId: roleStoreMgr.id,       isPrimary: true  },
      { staffMemberId: michael.id,  locationId: loc["Limeridge"].id,                  roleId: roleStoreMgr.id,       isPrimary: true  },
      { staffMemberId: yuki.id,     locationId: loc["Oakville (Corporate)"].id,       roleId: roleStoreMgr.id,       isPrimary: true  },
      { staffMemberId: thomas.id,   locationId: loc["Square One"].id,                 roleId: roleStoreMgr.id,       isPrimary: true  },

      // Franchise store managers (visible, franchise-managed)
      { staffMemberId: clara.id,    locationId: loc["Oakville (Franchise)"].id,       roleId: roleStoreMgr.id,       isPrimary: true  },
      { staffMemberId: lina.id,     locationId: loc["Rymal"].id,                      roleId: roleStoreMgr.id,       isPrimary: true  },
    ],
  });

  // ── Service appointments (corporate stores — we schedule these) ──────────

  await prisma.serviceAppointment.createMany({
    data: [
      {
        storeId: loc["Burlington (Corporate)"].id,
        windowLabel: "10:00 – 12:00",
        note: "Bridal package consultation + skin analysis, 3 clients",
        sortOrder: 1,
      },
      {
        storeId: loc["Limeridge"].id,
        windowLabel: "13:00 – 15:00",
        note: "Laser hair removal block, 6 clients at 80% capacity",
        sortOrder: 2,
      },
      {
        storeId: loc["Square One"].id,
        windowLabel: "16:00 – 18:00",
        note: "Walk-in overflow expected from mall traffic post-3 pm",
        sortOrder: 3,
      },
    ],
  });

  // ── Operational tasks ─────────────────────────────────────────────────────

  await prisma.operationalTask.createMany({
    data: [
      { title: "Approve Burlington → Rymal transfer before 11:30",         sortOrder: 1 },
      { title: "Review late closeout reports from 3 franchise locations",   sortOrder: 2 },
      { title: "Confirm Saturday aesthetician cover for Limeridge",         sortOrder: 3 },
      { title: "Publish updated tester replenishment counts for Q2",        sortOrder: 4 },
      { title: "Follow up on Bayshore Mall delayed inventory submission",   sortOrder: 5 },
    ],
  });

  // ── Inventory transfers ───────────────────────────────────────────────────

  await prisma.inventoryTransfer.createMany({
    data: [
      {
        productId:      pSerum.id,
        units:          24,
        fromLocationId: loc["Burlington (Corporate)"].id,
        toLocationId:   loc["Rymal"].id,
        sortOrder:      1,
      },
      {
        productId:      pCleanser.id,
        units:          12,
        fromLocationId: loc["Limeridge"].id,
        toLocationId:   loc["Oakville (Franchise)"].id,
        sortOrder:      2,
      },
      {
        productId:      pWax.id,
        units:          40,
        fromLocationId: loc["Square One"].id,
        toLocationId:   loc["Upper Canada Mall"].id,
        sortOrder:      3,
      },
    ],
  });

  console.log(
    "Seed complete — 16 locations, 6 departments, 13 roles, " +
    "12 staff, 6 products, 30 stock levels, 3 transfers."
  );
}

main()
  .then(async () => { await prisma.$disconnect(); })
  .catch(async (error) => { console.error(error); await prisma.$disconnect(); process.exit(1); });
