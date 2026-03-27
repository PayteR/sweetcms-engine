# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

SweetCMS is an open-source, agent-driven headless CMS built on the T3 Stack: Next.js 16 (App Router) + tRPC + Drizzle ORM + Better Auth. PostgreSQL with UUID primary keys. Designed for AI-assisted development — this CLAUDE.md is the product differentiator.

**Tagline:** Agent-driven headless CMS for T3 Stack (Next.js + tRPC + Drizzle)

## Development

- **Package manager:** `bun`
- **Dev server:** `bun run dev` — custom server with Turbopack (port 3000)
- **Entry point:** `src/app/` (Next.js App Router, no locale routing yet)
- **Custom server:** `server.ts` — starts Next.js (Turbopack in dev) + BullMQ workers (controlled by `SERVER_ROLE`)
- **Database:** `bun run db:generate` after schema changes, `bun run db:migrate` to apply, `bun run db:studio` for DB viewer
- **Type check:** `bun run typecheck`
- **Environment config:** Zod-validated env vars in `src/lib/env.ts`

## Architecture Overview

### tRPC Procedures & Usage

**Usage:** Client: `trpc.cms.list.useQuery()` / `trpc.cms.create.useMutation()` from `@/lib/trpc/client`. Server: `const api = await serverTRPC()` from `@/lib/trpc/server`. Client uses `httpBatchStreamLink`.

**Procedure types:** `publicProcedure`, `protectedProcedure`, `staffProcedure`, `sectionProcedure(section)`, `superadminProcedure`.

### Database

PostgreSQL only. All CMS tables prefixed `cms_`. UUID primary keys via `gen_random_uuid()`. Drizzle ORM with schema in `src/server/db/schema/`.

**Tables:**
- `user`, `session`, `account`, `verification` — Better Auth standard
- `cms_posts` — pages and blog posts (type discriminator: `PostType.PAGE=1`, `PostType.BLOG=2`)
- `cms_post_attachments` — file attachments per post
- `cms_categories` — standalone category table
- `cms_content_revisions` — JSONB snapshots for revision history
- `cms_slug_redirects` — automatic redirects when slugs change
- `cms_options` — runtime key-value config (JSONB values)
- `cms_media` — generic file storage

### Content Type Registry

`src/config/cms.ts` — single source of truth for all CMS content types.

Content types: `page` (PostType.PAGE), `blog` (PostType.BLOG), `category` (separate table).

Lookup helpers: `getContentType(id)`, `getContentTypeByPostType(type)`, `getContentTypeByAdminSlug(slug)`.

**To add a new content type:**
1. Add config entry in `src/config/cms.ts`
2. For post-backed types: auto-registered via `cms_posts.type`. For others: create table + router
3. Add admin section page
4. Add sitemap route

### User Roles & Permissions

**Roles:** `user`, `editor`, `admin`, `superadmin` (4 roles).

**How to check permissions:**
- **Server:** `Policy.for(role).can('section.content')` or `Policy.for(role).canAccessAdmin()`
- **Superadmin-only:** `isSuperAdmin(role)` from `@/lib/policy`
- **Never** use hardcoded role strings like `role === 'admin'` — always use `Role.*` consts or `Policy.for(role).can(...)`
- **Invalid roles:** `Policy.for()` normalizes unknown/empty/null to `Role.USER` (fail-closed)

**Admin sections:** `dashboard`, `content`, `media`, `users`, `settings`

**Section capabilities by role:**
| Capability | editor | admin | superadmin |
|---|---|---|---|
| section.dashboard | yes | yes | yes |
| section.content | yes | yes | yes |
| section.media | yes | yes | yes |
| section.users | — | yes | yes |
| section.settings | — | yes | yes |
| privilege.manage_roles | — | yes | yes |

### Shared Utilities — Key Rules

Always use these instead of manual alternatives:

- **Slug uniqueness** (`src/server/utils/admin-crud.ts`): Use `ensureSlugUnique()` — never inline slug uniqueness checks
- **Status counts** (`src/server/utils/admin-crud.ts`): Use `buildStatusCounts()` for admin tab counts
- **Pagination** (`src/server/utils/admin-crud.ts`): Use `parsePagination()` + `paginatedResult()`. Standard response shape: `{ results, total, page, pageSize, totalPages }`
- **Admin lists** (`src/server/utils/admin-crud.ts`): Use `buildAdminList()` — handles conditions, sort, pagination, count in parallel
- **Soft-delete** (`src/server/utils/admin-crud.ts`): Use `softDelete()`, `softRestore()`, `permanentDelete()`
- **Revisions** (`src/server/utils/content-revisions.ts`): Use `createRevision()`, `getRevisions()`, `pickSnapshot()`
- **CMS updates** (`src/server/utils/cms-helpers.ts`): Use `updateWithRevision()` — wraps revision snapshot + slug redirect + update
- **Slugs** (`src/lib/slug.ts`): `slugify()` for URL slugs, `slugifyFilename()` for uploads. Never inline slug regex
- **Translations** (`src/lib/translations.ts`): Use `useBlankTranslations()` in admin components. All user-visible text must be wrapped in `__()` so translations can be enabled later

### Admin Panel (`/dashboard`)

Section-based RBAC — each sidebar group maps to a `section.*` capability. tRPC routers use `sectionProcedure(section)`.

**Admin CSS classes** (`dashboard/assets/admin.css`):
| Class | Usage |
|---|---|
| `.admin-card` | Card containers. Add padding via utility |
| `.admin-thead` | Table header row background |
| `.admin-th` | Table header cells |
| `.admin-h2` | Section headings |
| `.admin-btn` | Base button class |
| `.admin-btn-primary` | Primary action button |
| `.admin-btn-secondary` | Secondary button |
| `.admin-sidebar-link` | Sidebar nav links |

Always use these instead of inline Tailwind equivalents.

**Admin translations:**
```typescript
// ALWAYS use blank translations in admin:
import { useBlankTranslations } from '@/lib/translations';
const __ = useBlankTranslations();

// WRONG in admin:
<h1>Users</h1>

// RIGHT in admin:
<h1>{__('Users')}</h1>
```

### SERVER_ROLE (Production Scaling)

| Role | Next.js | tRPC | BullMQ | Use case |
|---|---|---|---|---|
| `all` (default) | yes | yes | yes | Development, single-instance |
| `frontend` | yes | — | — | Pages only |
| `api` | yes | yes | — | tRPC API only |
| `worker` | — | — | yes | Background jobs only |

## Coding Standards

- No `any` — use `unknown` and narrow, or generics/interfaces
- Use `cn()` from `@/lib/utils` for conditional classes — never template literals or raw `clsx()`
- No plain `Error` in server code — always `TRPCError` with proper code
- Constrain Zod inputs — `.max()` on strings, `.uuid()` on IDs, `.max(N)` on arrays
- Safety `limit` on all `.findMany()` / `.select()` queries
- `getAffectedRows()` from `@/server/db/drizzle-utils` for raw `.execute()` results
- `isNull(deletedAt)` on user-facing queries for soft-deleted tables
- Verify resource ownership — `protectedProcedure` must filter by `ctx.session.user.id`
- UUIDs everywhere — never `number` for primary keys

### CSS & Styling

Tailwind CSS v4 with default config. Use `cn()` for conditional classes. Admin uses dedicated CSS classes (see admin panel section).

### Design Principles

- DRY where it reduces bugs, but type-specific redundancy is OK when abstraction would obscure intent
- Open-closed principle — extend via registration/config, don't edit shared code for new types
- Config-driven over hardcoded — new content types, features, etc. should be addable without touching core logic

### Plans

- Make the plan extremely concise. Sacrifice grammar for the sake of concision.
- At the end of each plan, give a list of unresolved questions, if any.

## Troubleshooting

- **Port 3000 already in use:** Kill stale `bun` or `node` process
- **Type errors after schema change:** Run `bun run db:generate` then restart dev server
- **"Cannot find module" after branch switch:** Run `bun install`
