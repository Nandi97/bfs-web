This Next.js app is the BFS backend and web client.

## Responsibilities

- Owns the Prisma schema and migrations.
- Owns the Better Auth server and `/api/auth` routes.
- Serves as the authentication source of truth for both web and mobile.

## Getting Started

Copy `.env.example` to `.env`, then run the development server:

```bash
pnpm dev
```

## Auth And Prisma

Generate Better Auth schema updates with:

```bash
pnpm dlx auth@latest generate
```

Run Prisma migrations with:

```bash
pnpm prisma migrate dev
```
