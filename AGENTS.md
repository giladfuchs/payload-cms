# Repository Guidelines

## Scope

- This repository contains a Next.js 16 application backed by Payload CMS 3.
- Treat `other/` as explicitly out of scope: do not inspect, edit, format, lint, test, or use files from that directory unless the user specifically asks for it.
- During `/init`, only inspect the repository and create or update agent guidance. Do not run ESLint, TypeScript checks, builds, tests, formatting, development servers, or other validation commands.
- Preserve unrelated user changes. Check `git status --short` before editing and keep patches focused.
- Never read or expose values from `.env`; use `.env.example` to understand configuration.

## Project Layout

- `src/app/(frontend)/`: public App Router pages, including generic pages, `/blog/[slug]`, draft-preview routes, and the frontend layout.
- `src/app/(payload)/`: Payload admin and API routes. Much of this is framework integration or generated code.
- `src/components/blocks/`: Payload block configurations and their React renderers. When adding a block, register both its CMS config and renderer.
- `src/components/layout/`, `src/components/shared/`, `src/components/ui/`: reusable presentation components.
- `src/lib/collections/`: Payload schemas for pages, blog articles/comments, users, site settings, and the general, SEO, and gallery media collections; shared fields and cache-revalidation hooks also live here.
- `src/lib/core/`: runtime configuration, shared types/utilities, and the swappable data-access layer. Shared archive resolution lives in `dal/archive.ts`.
- `src/lib/intl/`: `next-intl` frontend configuration and English/Hebrew messages, plus the Hebrew Payload-admin translation plugin and translation data.
- `src/lib/providers/`: frontend providers and Payload plugin registration, including storage, redirects, SEO, forms, and admin translations.
- `src/lib/seo/`: metadata and structured-data helpers.
- `seed/`: destructive database reset and locale-aware demo-data seeding utilities; source data and seed media are under `seed/data/`.
- `public/`: static assets and locally stored upload collections when cloud storage is disabled.

## Development Commands

- Use Node.js 24 and pnpm 10 or newer.
- `pnpm dev`: start Next.js on port 3355.
- `pnpm build`: create a production build.
- `pnpm typecheck`: run TypeScript without emitting files.
- `pnpm lint`: run ESLint across this repository. For focused work, lint only the changed files with `pnpm exec eslint <files>`.
- `pnpm format`: format the entire repository. Do not run it as routine validation; format only files changed for the task with `pnpm exec prettier --write <files>`.
- `pnpm check`: runs type checking, auto-fixing ESLint, and repository-wide formatting. It mutates files; avoid it unless the user requests a full sweep.
- `pnpm generate:types`: regenerate `src/lib/core/types/payload-types.ts` after changing Payload schemas.
- `pnpm generate:importmap`: regenerate the Payload admin import map when admin components change.
- `pnpm generate:all`: regenerate both Payload types and the admin import map.
- `pnpm reset` and `pnpm seed` are destructive database commands. `pnpm seed` runs a fresh migration before loading demo data; run either only when the user explicitly requests destructive database work.

## Architecture and Conventions

- TypeScript is strict. Use the `@/*`, `@/payload-types`, and `@payload-config` aliases instead of long relative paths.
- Follow the existing style: 2-space indentation, double quotes, semicolons, and imports grouped as external, internal, relative, then type-only.
- Prefer Server Components. Add `"use client"` only when browser APIs, state, effects, or interactive event handlers require it.
- The selected data-access implementation is exported from `src/lib/core/dal/index.ts`; local Payload queries are currently active, and a REST adapter is retained for headless deployments. Keep consumers dependent on the `DalStatic` interface, update both adapters when the interface changes, and put shared response shaping in helpers such as `dal/archive.ts`.
- Payload collections are registered in `src/payload.config.ts` and re-exported from `src/lib/collections/index.ts`. `Media`, `SeoMedia`, and `GalleryMedia` have different intended uses and generated image sizes; use the matching upload relationship rather than treating them as interchangeable.
- Page-builder blocks require schema registration where the layout field is defined and renderer registration in `src/components/blocks/RenderBlocks.tsx`. Blog-specific rendering lives in `blog-components.tsx` and `heros/blog-hero.tsx` rather than in the generic page block map.
- Payload content is cached by tag. Schema or mutation changes must preserve the revalidation behavior in `src/lib/collections/hooks.ts`.
- Locale is selected globally with `NEXT_PUBLIC_LANG`; supported values are `en` and `he`. Keep `src/lib/intl/en.json` and `src/lib/intl/he.json` keys synchronized, preserve RTL behavior, and route Payload-admin Hebrew label changes through `src/lib/intl/admin.ts` and `admin.he.json`.
- Environment access is centralized in `src/lib/core/config.ts`. Add new variables there and document them in `.env.example`; never commit secrets.
- `src/lib/core/types/payload-types.ts` and `src/app/(payload)/admin/importMap.js` are generated artifacts. The root `payload-types.ts` only re-exports the generated types. Prefer generator commands over manual edits.

## Verification

- For ordinary TypeScript changes, run `pnpm typecheck` and ESLint on changed files or use `pnpm lint` for the whole repository.
- Run `pnpm build` for routing, configuration, server/client boundary, or production behavior changes when the required environment and database are available.
- There is currently no automated test suite. Perform a focused manual check for affected pages and Payload admin behavior when practical.
- Report validation that could not run because required services or environment variables were unavailable.
