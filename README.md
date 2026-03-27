# SweetCMS

**Agent-driven headless CMS for T3 Stack (Next.js + tRPC + Drizzle)**

Open-source CMS built for AI-assisted development. The `CLAUDE.md` file is the product differentiator — it provides comprehensive guidance for AI coding assistants working in the codebase.

## Tech Stack

- **Next.js 16** — App Router, React Server Components, Turbopack
- **tRPC** — End-to-end type-safe API with `httpBatchStreamLink`
- **Drizzle ORM** — PostgreSQL with UUID primary keys
- **Better Auth** — Authentication with role-based access control
- **BullMQ** — Background job processing (email, etc.)
- **Tailwind CSS v4** — Styling
- **Zod** — Input validation
- **TypeScript** — Strict mode, no `any`

## Quick Start

### Prerequisites

- [Bun](https://bun.sh/) (v1.0+)
- PostgreSQL 16+
- Redis (optional — for BullMQ)

### 1. Clone and install

```bash
git clone https://github.com/sweetai/sai_sweetcms.git
cd sai_sweetcms
bun install
```

### 2. Start infrastructure

```bash
docker compose up -d
```

Or manually set up PostgreSQL and update `DATABASE_URL` in `.env`.

### 3. Configure environment

```bash
cp .env.example .env
# Edit .env with your database credentials
```

### 4. Run database migrations

```bash
bun run db:generate
bun run db:migrate
```

### 5. Start development server

```bash
bun run dev
```

Open [http://localhost:3000](http://localhost:3000) — homepage with link to admin dashboard.

## Project Structure

```
src/
  app/
    api/auth/[...all]/     # Better Auth API routes
    api/trpc/[trpc]/       # tRPC API handler
    dashboard/             # Admin panel
      cms/[section]/       # CMS content management
    (public)/              # Public-facing pages
      [...slug]/           # Catch-all CMS route
      blog/                # Blog list page
  components/admin/        # Admin UI components
  config/
    cms.ts                 # Content type registry
    site.ts                # Site configuration
  lib/
    auth.ts                # Better Auth setup
    env.ts                 # Zod-validated environment
    policy.ts              # RBAC policy system
    slug.ts                # Slug utilities
    trpc/                  # tRPC client/server/provider
  server/
    db/schema/             # Drizzle schema (PostgreSQL)
    routers/               # tRPC routers (cms, categories, media, auth)
    storage/               # File storage providers
    utils/                 # Shared utilities (CRUD, revisions, etc.)
    jobs/                  # BullMQ job processing
  types/                   # Shared TypeScript types
```

## Content Types

Registered in `src/config/cms.ts`. Currently includes:

| Type | URL Pattern | Admin Path |
|------|-------------|------------|
| Page | `/{slug}` | `/dashboard/cms/pages` |
| Blog | `/blog/{slug}` | `/dashboard/cms/blog` |
| Category | `/category/{slug}` | `/dashboard/cms/categories` |

Add new types by extending the `CONTENT_TYPES` array — no core code changes needed.

## Roles & Permissions

| Role | Dashboard | Content | Media | Users | Settings |
|------|-----------|---------|-------|-------|----------|
| user | — | — | — | — | — |
| editor | yes | yes | yes | — | — |
| admin | yes | yes | yes | yes | yes |
| superadmin | yes | yes | yes | yes | yes |

## Scripts

| Command | Description |
|---------|-------------|
| `bun run dev` | Start dev server (Turbopack) |
| `bun run build` | Production build |
| `bun run typecheck` | TypeScript check |
| `bun run db:generate` | Generate Drizzle migrations |
| `bun run db:migrate` | Apply migrations |
| `bun run db:studio` | Open Drizzle Studio |

## AI-First Development

This project includes a comprehensive `CLAUDE.md` that serves as the primary documentation for AI coding assistants. It covers architecture, conventions, utilities, and patterns — enabling agents to make confident, correct changes without extensive codebase exploration.

## License

MIT
