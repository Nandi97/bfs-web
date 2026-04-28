<div align="center">

<img src="https://assets.vercel.com/image/upload/v1662130559/nextjs/Icon_light_background.png" width="80" alt="Next.js" />

# BFS Web

**Next.js 16 · React 19 · PostgreSQL · Better Auth · Prisma**

![Next.js](https://img.shields.io/badge/Next.js-16-000000?logo=nextdotjs&logoColor=white&style=flat-square)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black&style=flat-square)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white&style=flat-square)
![Prisma](https://img.shields.io/badge/Prisma-ORM-2D3748?logo=prisma&logoColor=white&style=flat-square)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-DB-4169E1?logo=postgresql&logoColor=white&style=flat-square)

</div>

---

## Overview

This is the **system of record** for the BFS platform. It owns:

- The PostgreSQL database and all Prisma migrations
- The Better Auth server (`/api/auth`)
- The REST API consumed by the mobile app (`/api/...`)
- The web dashboard (inventory, staff, operations)

Mobile never reads the database directly — it goes through this server's API routes.

---

## Getting Started

```bash
# 1. Install dependencies
pnpm install

# 2. Copy environment file and fill in values
cp .env.example .env

# 3. Apply database migrations
npx prisma migrate dev

# 4. Seed the database
pnpm db:seed

# 5. Start the dev server (http://localhost:3000)
pnpm dev
```

---

## Commands

| Command | Description |
|---|---|
| `pnpm dev` | Start Next.js dev server on port 3000 |
| `pnpm build` | Production build |
| `pnpm lint` | Run ESLint |
| `pnpm db:seed` | Seed the database with locations, staff, products, orders |
| `npx prisma migrate dev --name <name>` | Create and apply a new migration |
| `npx prisma generate` | Regenerate Prisma client after schema changes |
| `npx prisma validate` | Validate schema without migrating |
| `npx auth@latest generate` | Regenerate Better Auth schemas |

> Always run Prisma commands from inside `web/`. The generated client lives at `app/generated/prisma/`.

---

## Project Structure

```
web/
├── app/
│   ├── api/              # REST API routes (consumed by mobile)
│   │   └── inventory/    # Inventory endpoints
│   ├── actions/          # Server actions (web mutations)
│   ├── generated/prisma/ # Prisma client output
│   └── inventory/        # Inventory web dashboard
├── components/
│   ├── inventory/        # Inventory UI components
│   ├── layout/           # AppSidebar, Header
│   └── ui/               # Shared shadcn-style components
├── lib/
│   ├── auth.ts           # Better Auth server config
│   ├── prisma.ts         # Prisma client singleton
│   └── inventory-access.ts  # Super-inventory access control
└── prisma/
    ├── schema.prisma     # Database schema
    └── seed.ts           # Seed data (16 locations, staff, products, orders)
```

---

## Architecture Notes

- **Server Components** use direct Prisma calls — never `fetch()` inside RSC.
- **Client Components** that mutate data use Server Actions (`"use server"`).
- **`params` and `searchParams` are Promises** in Next.js 16 — always `await` them.
- Import the Prisma client from `@/app/generated/prisma/client`, not `@prisma/client`.

---

## Environment Variables

| Variable | Description |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string |
| `BETTER_AUTH_SECRET` | Secret for Better Auth JWT signing |
| `BETTER_AUTH_URL` | Public URL of this server (used for OAuth redirects) |
