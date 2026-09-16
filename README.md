# GitHub Repo Tracker

Monorepo dashboard for searching GitHub repositories, tracking favorites, and monitoring stars, open issues, and last commit dates.

## Stack

- React 19 + TypeScript
- Redux Toolkit + localStorage persistence
- MUI
- GitHub REST API
- pnpm workspaces + Turborepo
- Vite app deployed on Vercel

## Packages

| Path | Name | Role |
|------|------|------|
| `apps/web` | `web` | Dashboard UI and routing |
| `packages/ui` | `@repo/ui` | Shared MUI components |
| `packages/plots` | `@repo/plots` | Stars bar chart |
| `packages/api` | `@repo/api` | Typed GitHub REST client |
| `packages/store` | `@repo/store` | Redux Toolkit store, thunks, persistence |

## Local development

```bash
pnpm install
pnpm dev
```

### Optional GitHub token

Unauthenticated GitHub API access is limited to 60 requests/hour. For local use, create a fine-scoped personal access token and add:

```bash
# apps/web/.env.local
VITE_GITHUB_TOKEN=ghp_your_token_here
```

Restart the dev server after adding the token.

## Scripts

```bash
pnpm build       # build all packages + web
pnpm typecheck   # TypeScript checks
pnpm lint        # lint web app
```

## Deploy on Vercel

1. Import the repository in Vercel
2. Root directory stays the monorepo root (`vercel.json` is already configured)
3. Optionally set `VITE_GITHUB_TOKEN` in project environment variables
4. Deploy

Build output: `apps/web/dist`

## Core features

- Debounced repository search
- Track / untrack repositories
- Tracked view with per-repo refresh and refresh-all
- Independent loading and error state per repository
- Persisted tracked repos via localStorage
- Stars bar chart for tracked repositories
