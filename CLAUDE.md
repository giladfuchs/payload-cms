# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Scope

- Next.js 16 (App Router) application backed by Payload CMS 3, using Postgres.
- Treat `other/` as out of scope: do not inspect, edit, format, lint, test, or reference files from that directory unless the user explicitly asks for it.
- Never read or expose values from `.env`; use `.env.example` to understand configuration.

## Development Commands

- Requires Node.js 24 and pnpm 10+.
- `pnpm dev` — start Next.js on port 3355.
- `pnpm build` — production build.
- `pnpm typecheck` — `tsc --noEmit`.
- `pnpm lint` / `pnpm lint:fix` — ESLint across the repo; for focused work, prefer `pnpm exec eslint <files>` scoped to changed files.
- `pnpm format` — Prettier across the repo; prefer `pnpm exec prettier --write <files>` scoped to changed files rather than running it repo-wide.
- `pnpm check` — typecheck + lint:fix + format, all repo-wide; mutates files, avoid unless the user asks for a full sweep.
- `pnpm generate:types` — regenerate `src/lib/core/types/payload-types.ts` (root `payload-types.ts` only re-exports it) after changing any Payload collection/global schema.
- `pnpm generate:importmap` — regenerate `src/app/(payload)/admin/importMap.js` after changing admin-facing custom components.
- `pnpm generate:all` — runs both of the above.
- `pnpm reset` and `pnpm seed` are **destructive** database commands (`payload migrate:fresh`, then `seed` also loads demo data via `seed/run.ts`). Only run when explicitly requested.
- There is no automated test suite; validate manually (dev server / admin UI) when practical.

## Architecture

### Data access layer (DAL) — swappable fetch strategy

`src/lib/core/dal/index.ts` exports a single `DAL` object that all data-fetching code depends on (via the `DalStatic` interface in `src/lib/core/types/types.ts`), never a concrete adapter directly. Two implementations exist and are swapped by editing which import is active in `index.ts`:

- `queries.ts` (default/active) — uses the local Payload SDK directly; Payload and Next.js share one runtime (monolith mode).
- `api.ts` — fetches through Payload's REST endpoints (`/api/...`) via `fetch()`, for headless/decoupled deployments. In this mode, `revalidateTag()` must NOT be called from inside Payload collection hooks — a separate Next.js revalidation endpoint must be triggered after mutations instead.
- `archive.ts` — shared, adapter-agnostic resolution logic for the Archive block (`populateBy: "collection"` vs `"selection"`), consumed by both adapters so the "which docs does this archive show" logic isn't duplicated.

When adding data-fetching logic, extend the `DalStatic` interface and implement it in both adapters, or the inactive adapter silently drifts out of sync.

### Content model & caching

- Collections/globals live in `src/lib/collections/` (`Pages`, `Blog`, `BlogComments`, `Media`, `SeoMedia`, `GalleryMedia`, `Users`, `SiteSettings`) and are registered in `src/payload.config.ts` / re-exported from `src/lib/collections/index.ts`.
- `Media`, `SeoMedia`, and `GalleryMedia` are separate upload collections with different intended uses and generated image sizes (see comments in each file): `Media` is generic hero/content-block images with no size variants (editors crop manually); `SeoMedia` always generates `og` (1200x630) and `card` (480x320) variants for the SEO tab's meta image; `GalleryMedia` generates one small variant for the Gallery block. Use the matching upload relationship rather than treating them as interchangeable.
- `src/lib/collections/hooks.ts` implements tag-based revalidation: `makeRevalidateHooks(collection)` builds `afterChange`/`afterDelete` hooks that call `revalidateTag` on `${collection}-${slug}` (old and new slug on rename) plus the sitemap tag. Redirects have their own `revalidateRedirect`/`revalidateDeleteRedirects` keyed by the `from` field. Any schema or mutation change must preserve this tagging convention or cached pages will go stale.
- `mediaTransformUploadHook` (also in `hooks.ts`) intercepts image uploads, converts non-webp images to webp via `sharp`, and rewrites filename/size/dimensions on the upload record before it's persisted — applies to both local and cloud storage upload paths.
- Media storage is provider-swappable via `STORAGE_PROVIDER` (`vercel` | `s3` | unset = local disk), read through `src/lib/core/config.ts`. S3-compatible config supports AWS S3, Cloudflare R2, MinIO, etc.

### Blocks (page-builder pattern)

Payload "layout" blocks are a two-sided registration: a Payload field config (defines the CMS schema/admin UI) and a React renderer, both under `src/components/blocks/<Name>/`. `src/components/blocks/RenderBlocks.tsx` maps `blockType` strings to renderer components in a single lookup object — when adding a new block, register it in both places (collection field config where blocks are used, e.g. `Pages`, and the `blockComponents` map in `RenderBlocks.tsx`). Blog-specific rendering (article card/list, hero) lives outside that generic map, in `src/components/blocks/blog-components.tsx` and `src/components/blocks/heros/blog-hero.tsx`, and is wired in directly where blog content is rendered rather than through `blockType`.

### Routing

- `src/app/(frontend)/` — public site: `[slug]/page.tsx` (generic page renderer), `blog/` and `blog/[slug]` (article list/detail), `preview/` (draft preview enter/exit/reset routes), plus `layout.tsx`, `error.tsx`, `not-found.tsx`, `loading.tsx`.
- `src/app/(payload)/` — Payload admin (`admin/[[...segments]]`) and the REST API catch-all (`api/[...slug]`). Largely framework/generated integration code.
- `robots.ts` / `sitemap.ts` at the `src/app/` root.

### Configuration

- All env var access is centralized in `src/lib/core/config.ts` (`appConfig`), typed via `AppConfig`. Add new variables there (not scattered `process.env` reads) and document them in `.env.example`.
- Locale is a single global switch: `NEXT_PUBLIC_LANG` (`en` | `he`), resolved to a `LocaleConfig` (dir, Intl locale, timezone, RTL flag) in `config.ts`. `next-intl` frontend message files are `src/lib/intl/en.json` / `he.json` — keep keys in sync between them and preserve RTL behavior for `he`. Payload-admin Hebrew UI translations are separate, routed through `src/lib/intl/admin.ts` (collection/block label maps) and `src/lib/intl/admin.he.json` — don't conflate the two i18n systems.

### Seeding

- `seed/index.ts` (`SeedService`) resets the DB (`payload migrate:fresh`-driven) and loads locale-specific demo data from `seed/data/mock-data-${NEXT_PUBLIC_LANG}.json` (`mock-data-en.json` / `mock-data-he.json`); `mock-data-example.json` is a non-loaded reference/example dataset. `seed/helpers.ts` provides `hydrateSeedRichText`, which expands the seed JSON's shorthand `{ "__richText": "markdown-ish string" }` nodes into full Lexical rich-text trees, and other authoring shortcuts (e.g. `__PLACEHOLDER__` string tokens that `SeedService.injectData` replaces with real uploaded-media/document IDs after creation).
- Seed JSON top-level keys must match `SeedService.mockData` (`siteSettings`, `forms`, `pages`, `blog`) and each blog article's field names must match `Blog`/`BlogComments` schema (e.g. `relatedArticles`, not `relatedPosts`); a stale key silently fails to seed rather than erroring.

## Conventions

- TypeScript strict mode. Use path aliases `@/*`, `@/payload-types`, `@payload-config` instead of long relative imports.
- 2-space indentation, double quotes, semicolons; imports grouped as external, internal (`@/...`), relative, then type-only.
- Prefer Server Components; add `"use client"` only when browser APIs, state, effects, or event handlers require it.
- `src/lib/core/types/payload-types.ts` (and its root re-export `payload-types.ts`) and `src/app/(payload)/admin/importMap.js` are generated — use their generator commands rather than hand-editing.

## Verification

- For ordinary TypeScript changes: `pnpm typecheck` and ESLint scoped to changed files (or `pnpm exec eslint .`).
- For routing, config, server/client boundary, or production-behavior changes: `pnpm build` when the required env vars and database are available.
- Manually check affected frontend pages and Payload admin behavior when automated checks can't cover the change; report any validation that couldn't run due to missing services/env.
