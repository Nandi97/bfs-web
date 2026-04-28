import "dotenv/config";

import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient, StoreType, OrderStatus } from "../app/generated/prisma/client";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) throw new Error("DATABASE_URL is not set");

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString }) });

async function main() {
  // --- Clear (children before parents) ---
  await prisma.purchaseOrderItem.deleteMany();
  await prisma.purchaseOrder.deleteMany();
  await prisma.vendor.deleteMany();
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

  const [deptExec, deptMarketing, deptAccounting, deptInventory, deptWarehouse, deptOps, deptHR] =
    await Promise.all([
      prisma.department.create({ data: { name: "Executive" } }),
      prisma.department.create({ data: { name: "Marketing" } }),
      prisma.department.create({ data: { name: "Accounting & Finance" } }),
      prisma.department.create({ data: { name: "Inventory & Supply Chain" } }),
      prisma.department.create({ data: { name: "Warehouse" } }),
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
    roleSuperInventory,
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
    // Cross-location order visibility — auto-granted to inventory/warehouse/admin depts
    prisma.role.create({ data: { name: "Super Inventory" } }),
  ]);

  // suppress unused-variable warnings — roles exist in the DB for future assignments
  void roleMktCoord, roleAsstMgr, roleAesthetician, roleRetailAssoc, roleReceptionist, roleSuperInventory;

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
      { staffMemberId: priya.id,    departmentId: deptWarehouse.id },
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

  // ── Orders (HQ → store) ───────────────────────────────────────────────────
  // All orders originate from Head Office. Statuses represent the fulfilment
  // lifecycle: CREATED → UPDATED → ORDERED → RAISED → DELIVERED

  const hqLoc = loc["Head Office"];

  await prisma.inventoryTransfer.createMany({
    data: [
      // Delivered
      { productId: pSerum.id,       units: 24, status: OrderStatus.DELIVERED, fromLocationId: hqLoc.id, toLocationId: loc["Burlington (Corporate)"].id, sortOrder: 1 },
      { productId: pCleanser.id,    units: 12, status: OrderStatus.DELIVERED, fromLocationId: hqLoc.id, toLocationId: loc["Limeridge"].id,               sortOrder: 2 },
      { productId: pFoundation.id,  units:  6, status: OrderStatus.DELIVERED, fromLocationId: hqLoc.id, toLocationId: loc["Rymal"].id,                   sortOrder: 3 },
      // Raised
      { productId: pWax.id,         units: 40, status: OrderStatus.RAISED,    fromLocationId: hqLoc.id, toLocationId: loc["Square One"].id,              sortOrder: 4 },
      { productId: pPrimer.id,      units: 18, status: OrderStatus.RAISED,    fromLocationId: hqLoc.id, toLocationId: loc["Oakville (Corporate)"].id,    sortOrder: 5 },
      // Ordered
      { productId: pSerum.id,       units: 36, status: OrderStatus.ORDERED,   fromLocationId: hqLoc.id, toLocationId: loc["Upper Canada Mall"].id,       sortOrder: 6 },
      { productId: pCleanser.id,    units: 24, status: OrderStatus.ORDERED,   fromLocationId: hqLoc.id, toLocationId: loc["Bayshore Mall"].id,           sortOrder: 7 },
      { productId: pLaserGel.id,    units: 10, status: OrderStatus.ORDERED,   fromLocationId: hqLoc.id, toLocationId: loc["Hillcrest Mall"].id,          sortOrder: 8 },
      // Updated
      { productId: pFoundation.id,  units: 12, status: OrderStatus.UPDATED,   fromLocationId: hqLoc.id, toLocationId: loc["Bolton"].id,                  sortOrder: 9 },
      { productId: pWax.id,         units: 20, status: OrderStatus.UPDATED,   fromLocationId: hqLoc.id, toLocationId: loc["Oakville (Franchise)"].id,    sortOrder: 10 },
      // Created
      { productId: pPrimer.id,      units: 30, status: OrderStatus.CREATED,   fromLocationId: hqLoc.id, toLocationId: loc["Dixie Mall"].id,              sortOrder: 11 },
      { productId: pSerum.id,       units: 48, status: OrderStatus.CREATED,   fromLocationId: hqLoc.id, toLocationId: loc["Limeridge"].id,               sortOrder: 12 },
    ],
  });

  // ── Vendors ───────────────────────────────────────────────────────────────

  const [vInverness, vDepileve, vDermalogica, vGigi] = await Promise.all([
    prisma.vendor.create({ data: { name: "Inverness",    email: "orders@inverness.com",      address: "1000 Inverness Dr, Toronto, ON" } }),
    prisma.vendor.create({ data: { name: "Depilève",     email: "orders@depileve.ca",         address: "300 Labrosse Ave, Pointe-Claire, QC" } }),
    prisma.vendor.create({ data: { name: "Dermalogica",  email: "wholesale@dermalogica.com",  address: "1 Dermalogica Way, Carson, CA" } }),
    prisma.vendor.create({ data: { name: "GiGi",         email: "orders@gigiwax.com",         address: "2220 Gaspar Ave, Los Angeles, CA" } }),
  ]);

  // ── Purchase orders (store → vendor procurement via HQ) ──────────────────
  // locationId = the store that requested the stock.
  // All orders go through Head Office fulfilment before reaching the store.

  const burlington  = loc["Burlington (Corporate)"];
  const limeridge   = loc["Limeridge"];
  const squareOne   = loc["Square One"];
  const oakvilleCo  = loc["Oakville (Corporate)"];
  const rymal       = loc["Rymal"];
  const bayshore    = loc["Bayshore Mall"];

  // Helper: create a full purchase order with items in one call
  async function createPO(data: {
    refNumber:  number;
    status:     OrderStatus;
    vendorId:   string;
    locationId: string;
    orderedAt?: Date;
    raisedAt?:  Date;
    deliveredAt?: Date;
    invoiceNumber?: string;
    isInvoicePaid?: boolean;
    dateOfDelivery?: Date;
    notes?: string;
    items: {
      productId: string;
      vendorPartNumber?: string;
      retailRaised:      number;
      consumableRaised:  number;
      retailReceived?:   number;
      consumableReceived?: number;
    }[];
  }) {
    return prisma.purchaseOrder.create({
      data: {
        orderRefNumber:  data.refNumber,
        status:          data.status,
        vendorId:        data.vendorId,
        locationId:      data.locationId,
        orderedAt:       data.orderedAt,
        raisedAt:        data.raisedAt,
        deliveredAt:     data.deliveredAt,
        invoiceNumber:   data.invoiceNumber,
        isInvoicePaid:   data.isInvoicePaid ?? false,
        dateOfDelivery:  data.dateOfDelivery,
        notes:           data.notes,
        items: {
          create: data.items.map((item) => ({
            productId:          item.productId,
            vendorPartNumber:   item.vendorPartNumber,
            retailRaised:       item.retailRaised,
            consumableRaised:   item.consumableRaised,
            retailReceived:     item.retailReceived      ?? 0,
            consumableReceived: item.consumableReceived  ?? 0,
          })),
        },
      },
    });
  }

  const now = new Date("2026-04-27T14:32:00Z");
  const d   = (h: number) => new Date(now.getTime() + h * 3_600_000);

  await Promise.all([
    // PO 3901 — DELIVERED: Burlington ← Dermalogica (serums + cleanser)
    createPO({
      refNumber: 3901, status: OrderStatus.DELIVERED,
      vendorId: vDermalogica.id, locationId: burlington.id,
      orderedAt: d(0), raisedAt: d(1), deliveredAt: d(48),
      invoiceNumber: "DL-22871", isInvoicePaid: true,
      dateOfDelivery: d(48),
      items: [
        { productId: pSerum.id,    vendorPartNumber: "DL-SRM-30",  retailRaised: 12, consumableRaised: 12, retailReceived: 12, consumableReceived: 12 },
        { productId: pCleanser.id, vendorPartNumber: "DL-CLN-200", retailRaised:  6, consumableRaised:  6, retailReceived:  6, consumableReceived:  6 },
      ],
    }),

    // PO 3902 — DELIVERED: Limeridge ← GiGi (wax cartridges)
    createPO({
      refNumber: 3902, status: OrderStatus.DELIVERED,
      vendorId: vGigi.id, locationId: limeridge.id,
      orderedAt: d(0), raisedAt: d(2), deliveredAt: d(72),
      invoiceNumber: "GG-10044", isInvoicePaid: true,
      dateOfDelivery: d(72),
      items: [
        { productId: pWax.id, vendorPartNumber: "GG-WAX-CASS", retailRaised: 0, consumableRaised: 40, retailReceived: 0, consumableReceived: 40 },
      ],
    }),

    // PO 3903 — RAISED: Square One ← Dermalogica (foundation + primer)
    createPO({
      refNumber: 3903, status: OrderStatus.RAISED,
      vendorId: vDermalogica.id, locationId: squareOne.id,
      orderedAt: d(0), raisedAt: d(1),
      items: [
        { productId: pFoundation.id, vendorPartNumber: "DL-FDN-FC",  retailRaised: 8, consumableRaised: 0 },
        { productId: pPrimer.id,     vendorPartNumber: "DL-PRM-MAT", retailRaised: 6, consumableRaised: 0 },
      ],
    }),

    // PO 3904 — RAISED: Oakville Corporate ← Depilève (laser cooling gel)
    createPO({
      refNumber: 3904, status: OrderStatus.RAISED,
      vendorId: vDepileve.id, locationId: oakvilleCo.id,
      orderedAt: d(0), raisedAt: d(3),
      items: [
        { productId: pLaserGel.id, vendorPartNumber: "DP-LCG-500", retailRaised: 0, consumableRaised: 24 },
      ],
    }),

    // PO 3905 — ORDERED: Bayshore ← Inverness (mixed retail)
    createPO({
      refNumber: 3905, status: OrderStatus.ORDERED,
      vendorId: vInverness.id, locationId: bayshore.id,
      orderedAt: d(0),
      items: [
        { productId: pSerum.id,      vendorPartNumber: "INV-SRM",  retailRaised: 6,  consumableRaised: 0 },
        { productId: pFoundation.id, vendorPartNumber: "INV-FDN",  retailRaised: 4,  consumableRaised: 0 },
        { productId: pPrimer.id,     vendorPartNumber: "INV-PRM",  retailRaised: 4,  consumableRaised: 0 },
        { productId: pCleanser.id,   vendorPartNumber: "INV-CLN",  retailRaised: 4,  consumableRaised: 0 },
      ],
    }),

    // PO 3906 — UPDATED: Rymal ← GiGi (consumable wax)
    createPO({
      refNumber: 3906, status: OrderStatus.UPDATED,
      vendorId: vGigi.id, locationId: rymal.id,
      items: [
        { productId: pWax.id, vendorPartNumber: "GG-WAX-CASS", retailRaised: 0, consumableRaised: 20 },
      ],
    }),

    // PO 3907 — CREATED: Burlington ← Depilève (laser gel for services)
    createPO({
      refNumber: 3907, status: OrderStatus.CREATED,
      vendorId: vDepileve.id, locationId: burlington.id,
      items: [
        { productId: pLaserGel.id, vendorPartNumber: "DP-LCG-500", retailRaised: 0, consumableRaised: 12 },
      ],
    }),
  ]);

  console.log(
    "Seed complete — 16 locations, 7 departments, 14 roles, " +
    "12 staff, 6 products, 30 stock levels, 12 internal transfers, " +
    "4 vendors, 7 purchase orders."
  );
}

main()
  .then(async () => { await prisma.$disconnect(); })
  .catch(async (error) => { console.error(error); await prisma.$disconnect(); process.exit(1); });
