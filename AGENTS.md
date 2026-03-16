# Agent Notes

This file is both guidance for AI agents and a notebook for durable project-specific learnings.
If you encounter something surprising, non-obvious, or confusing while working on this project,
document it below so the next agent benefits.

## Commands

```bash
bun dev              # Start dev server
bun run build        # Production build
bun run lint         # Lint with oxlint (src/ only)
bun run format       # Format with prettier
bun run format:check # Check formatting
```

No test suite is configured.

## Architecture

Life Calendar generates dynamic calendar wallpaper images for phones. Users configure settings in a client-side UI, which constructs a URL to the server-side image API.

**Core flow:** Client UI → URL query params → `/api/og` route → `ImageResponse` (PNG)

### Key areas

- **`src/app/api/og/route.tsx`** — Server-side image generation using Next.js `ImageResponse`. Renders one of 5 calendar views (days, months, quarters, life, goal) as PNG. Contains all layout/sizing logic with responsive dot calculations based on canvas dimensions. This is the most complex file.
- **`src/lib/calendar-utils.ts`** — Pure functions that compute calendar dot grids. Each view type has its own function returning a 2D array of dots with state (`past`/`current`/`future`). Uses date-fns for all date math.
- **`src/app/(home)/home.tsx`** — Client component with configuration form. Builds query string from state and renders live preview via `<img src="/api/og?...">`.
- **`src/components/setup-guide.tsx`** — Tabbed instructions for iOS Shortcuts and Android MacroDroid automation.

### Patterns

- **Route group `(home)`** with thin `page.tsx` re-exporting from a descriptively-named file.
- **shadcn/ui** (new-york style) with Radix UI primitives. Add components via `bunx shadcn add <name>`.
- **No state persistence** — all configuration is URL-driven.
- **OG route sizing** — dot sizes, gaps, and padding are computed proportionally from image width/height, not hardcoded pixel values. The months view has a `scale` parameter that adjusts dot/gap sizes while keeping the top position anchored.
- **Theme colors** — defined in `getThemeColors()` in the OG route (dark: white-on-black, light: black-on-light-gray). The highlight color is orange.
- **Satori constraints** — the OG image renderer (satori) does not support CSS grid, and `undefined` style values will crash it. Use flex layout only.

## Style

- Prettier: double quotes, trailing commas, 100-char print width, Tailwind class sorting
- TypeScript strict mode with `@/*` path alias → `./src/*`
- React Compiler enabled in next.config.ts

## Temporary Artifacts

- Save MCP Playwright screenshots and other temporary browser artifacts under `.tmp/playwright/`.
- `.tmp/` is gitignored. Clean up files you created there once the task is done unless the user
  explicitly asks to keep them.

## Learnings

- Only add entries that are likely to stay useful for future agents.
- Prefer repo-specific facts, debugging traps, renderer quirks, deployment gotchas, or workflow
  issues that caused real confusion or wasted time.
- Do not log transient incidents or personal scratch notes.
- If an entry becomes outdated or is disproven, update or remove it instead of stacking
  contradictory notes.
- Keep entries short and actionable.

Suggested format:

- `YYYY-MM-DD` - what surprised you, why it mattered, and how to avoid the issue next time.

<!-- Add entries here as you discover them -->

- 2026-03-16 - Native `input[type="date"]` controls rendered inconsistently across mobile Safari and Firefox in the home form; prefer the shared shadcn `Calendar` + `Popover` date picker instead of trying to skin the native control.
