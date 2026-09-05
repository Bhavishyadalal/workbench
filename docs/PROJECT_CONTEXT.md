# Workbench — Project Context & Roadmap

This file is a handoff brief for whichever AI assistant picks up this project next.
Read this fully before making changes. It covers what the site is, how it's built,
the design system already in place, and the specific features the owner wants added.

---

## 1. What this project is

**Workbench** is a personal-use, privacy-first browser toolkit — a single Next.js site
hosting ~35 small utility tools (image editing, PDF manipulation, unit/currency
conversion, text/dev formatters, and misc extras like password generation and QR codes).

**Core pitch / non-negotiable principle:** everything runs client-side in the browser.
No file the user works with is ever uploaded to a server. The only exception is the
currency converter, which calls a live exchange-rate API (no upload, just a fetch for
rates). This "nothing uploaded" promise is repeated in the hero copy and footer and
should stay true for any new tool added — don't add server-side processing for user
files without flagging it clearly as an exception.

**Stack:**
- Next.js 16 (App Router, Turbopack build)
- React 19
- TypeScript
- Tailwind CSS v4 (via `@import "tailwindcss"` in globals.css, not a config file)
- Framer Motion for animation
- lucide-react for icons
- Key tool libraries already installed: `browser-image-compression`, `jspdf`, `pdf-lib`,
  `pdfjs-dist`, `qrcode`, `marked` (markdown), `dompurify`, `clsx`, `tailwind-merge`

No backend/database. The only server code is `src/app/api/currency/route.ts`, a single
GET route that proxies `api.exchangerate-api.com` (free, no API key needed) with a
1-hour revalidate cache.

---

## 2. How to run it

```bash
npm install
npm run dev     # local dev server
npm run build    # production build — verify this passes before considering any change done
npm run lint
```

Deployment target is **Vercel** (owner is deploying there, connected via GitHub). Default
Vercel settings work — no special config needed, no environment variables required.

---

## 3. File structure

```
src/
  app/
    layout.tsx              — root layout: renders grid-texture + grain overlays, Sidebar, <main>
    page.tsx                — homepage route, just renders <HomeClient />
    globals.css              — ALL design tokens, animations, and utility classes live here
    api/currency/route.ts    — the one server route (exchange rates proxy)
    tools/<slug>/page.tsx    — one folder per tool, ~35 of them, all "use client"
  components/
    HomeClient.tsx           — homepage: hero, stats strip, category tool grid
    Sidebar.tsx              — desktop sidebar + mobile top bar + mobile drawer, has tool search
    ToolShell.tsx            — wraps every tool page: back link, category tag, title, entrance motion
    ui.tsx                   — shared primitives: Card, Button, Field, inputClass, Dropzone, ResultBar
  lib/
    tools-registry.ts        — SINGLE SOURCE OF TRUTH for every tool: slug, name, short description,
                                category. Also defines categoryMeta (label, blurb, accent color per
                                category). Adding a new tool = add an entry here + create the page file.
    pdfjs.ts                 — pdf.js worker setup helper
public/
  pdf.worker/pdf.worker.min.mjs  — required for pdf.js to work client-side
```

**Important pattern:** every tool page imports `findTool(slug)` from the registry, wraps
its content in `<ToolShell tool={tool}>`, and uses `Card`/`Button`/`inputClass`/`Dropzone`
from `ui.tsx` for consistent styling. **Any new tool should follow this exact pattern** —
look at `src/app/tools/word-counter/page.tsx` for the simplest reference example, or
`src/app/tools/qr-generator/page.tsx` for one with async/canvas work.

---

## 4. Design system (already implemented — read before changing visuals)

The site has gone through several rounds of visual design work. Current direction is a
**dark, purple/violet "AI product" aesthetic** with a selectable accent-theme system —
this superseded an earlier brass/amber "workshop" palette that a prior pass had explored;
if you find references to brass, amber, or `#EFB347` anywhere, they're stale.

Base tokens live in `src/app/globals.css` as CSS custom properties on `:root`:

```css
--bg: #09080A               /* near-black */
--bg-elevated: #111019
--bg-card: #16151F
--bg-card-hover: #1C1A28
--border: #2A2738
--border-soft: #1E1D2A

--text: #F0EEF8
--text-dim: #7B7897

--accent: #A78BFA           /* violet — default AI theme ("cosmic") */
--accent-dim: #7C5CF6
--accent-2: #F472B6         /* rose — second accent, used in gradients */
--accent-3: #38BDF8
--accent-ink: #0D0A1F

--cat-image: #22D3EE
--cat-pdf: #818CF8
--cat-convert: #FBBF24
--cat-text: #A78BFA
--cat-extras: #FB7185

--font-display: 'Outfit', -apple-system, sans-serif
--font-body: 'Plus Jakarta Sans', system-ui, sans-serif
--font-mono: 'JetBrains Mono', monospace
```

**Selectable AI accent themes** — on top of dark/light mode, there's a second axis: a
`data-ai-theme` attribute on `<html>` (set via `useAITheme()` in `src/lib/hooks.ts`,
picked via the `AIThemePicker` component in the sidebar/mobile bar) that overrides just
`--accent`, `--accent-bright`, `--accent-dim`, `--accent-2`, `--accent-3`, `--accent-ink`,
and the glow shadow variables. Four themes exist: `cosmic` (default violet), `cyberpunk`
(cyan/pink), `emerald` (green), `solar` (amber/rose). Adding a 5th theme means adding a
`[data-ai-theme="..."] { ... }` block in globals.css plus an entry in `AI_THEMES` in
`hooks.ts` — don't touch surface/text tokens in a theme block, only accent tokens, or
dark/light mode will visually break when combined with that theme.

**Category colors are functional, not decorative** — they're read from
`categoryMeta[cat].accent` in `tools-registry.ts` and used for the sidebar section
labels, active-nav-item border, category icon, and tool-card hover glow color. Keep
this pattern for any new category or tool.

**Motion:** hero entrance on load, scroll-triggered fade-in on the tool grid, mouse-
tracked radial glow on tool cards (`--mx`/`--my` custom properties set on mousemove,
see `ToolCard` in `HomeClient.tsx`), a first-visit full-screen opening intro
(`OpeningIntro.tsx`, session-gated via `sessionStorage`, hard 2-second minimum before
auto-dismiss, click/Esc/Enter/Space to skip early), and an ambient floating-particle
canvas background (`ParticleCanvas.tsx`, reduced-motion-aware, reads live accent colors
so it re-tints automatically when the AI theme changes).

**Section dividers use soft fades, not hard rules** — `.section-fade-b` / `.section-fade-t`
utility classes (a 1px gradient hairline that fades out at both edges) replace plain
`border-b`/`border-t`/`border-y`. This was a deliberate fix — hard borders between every
homepage section were making it look like a spreadsheet grid. Don't reintroduce solid
`border-[var(--border-soft)]` dividers between sections; use the fade utilities instead,
or no divider at all when sections flow together (e.g. marquee → stats → tool rows).

**Notable CSS utility classes already defined in globals.css:**
- `.grid-texture` — fixed blueprint grid background, masked to fade out
- `.grain` — subtle noise texture overlay
- `.mesh-glow` — animated dual-blob gradient glow used behind the hero
- `.text-gradient` — accent gradient text, used sparingly (hero headline word, stat numbers)
- `.corner-ticks` — small bracket-corner decoration on the logo mark
- `.animate-glow` / `.animate-radar` / `.animate-shimmer` — pulsing/radar/shimmer utilities
- `.stat-underline` — hover underline sweep
- `.section-fade-b` / `.section-fade-t` — soft section dividers (see above)
- `.tool-card` — has a resting inset-shadow + border-glow-on-hover; don't strip the resting
  shadow back to a flat border, that was a deliberate depth fix

**A known layout bug was fixed — don't reintroduce it:** `body` must NOT have
`overflow-x: hidden`. `html` keeps it (guards against horizontal scroll from animated
background blobs), but the same rule on `body` breaks `position: sticky` on the desktop
sidebar for any page taller than one viewport — the sidebar's border/background would
stop exactly at 100vh instead of following the page down. If you need to prevent
horizontal overflow from something new, contain it on the specific element causing it,
not by adding `overflow-x: hidden` back to `body`.

**Typography rule already applied:** don't add tracked-out ALL-CAPS labels, don't bold/
italicize single words in headlines for emphasis, don't add numbered markers (01/02/03)
unless content is genuinely sequential. See `/mnt/skills/public/frontend-design/SKILL.md`
if available in your environment.

Do not regress to rounded-2xl-only cards, single-accent teal, brass/amber, or flat hard-
bordered section dividers — those were explicitly replaced.

---

## 5. Full current tool list (35 tools, 5 categories)

Registry lives in `src/lib/tools-registry.ts`. Current tools by category:

**Image** (`--cat-image`, teal-green): Compress, Resize, Convert Format, Crop, Rotate/Flip,
Add Watermark, Image to Base64

**PDF** (`--cat-pdf`, blue): Compress, Merge, Split, PDF to Images, Images to PDF,
Rotate Pages, Password Protect

**Convert** (`--cat-convert`, amber): Unit Converter, Currency Converter (only tool that
calls an external API), Timezone Converter, Number Base Converter

**Text & Dev** (`--cat-text`, purple): Word/Character Counter, Case Converter, JSON
Formatter, Base64 Encode/Decode, URL Encode/Decode, QR Code Generator, Markdown
Previewer, Lorem Ipsum Generator, Regex Tester, Diff Checker

**Extras** (`--cat-extras`, orange): Password Generator, Color Picker, Age/Date
Calculator, Countdown/Stopwatch, Random Picker, File Hash Generator

---

## 6. Requested features — build these next

The owner asked for feature suggestions and wants a good batch implemented. Below is
the full menu that was proposed. Treat this as a backlog — confirm scope with the owner
if ambiguous, but the intent is clear enough to start building. Prioritize in roughly
this order unless told otherwise, since later items depend on earlier infra:

### Site-wide features
1. **Recently used tools** — track last 5 tools opened in `localStorage`, show as a row
   on the homepage (above or below the hero). No server involved.
2. **Favorites / pins** — star icon on tool cards and in sidebar list items, pinned
   tools shown in a dedicated section at the top of the sidebar. Store in `localStorage`.
3. **Command palette** — a ⌘K / tap-to-open modal for fuzzy-jumping to any tool by name.
   The Sidebar component already has working search-filter logic (see the `filtered`
   memo in `Sidebar.tsx`) — reuse that logic rather than rebuilding it, just present it
   in a centered modal overlay instead of inline in the sidebar.
4. **Keyboard shortcuts** on tool pages — e.g. Enter to run/submit, Esc to clear. Scope
   per-tool since each tool's primary action differs.
5. **Dark/light theme toggle** — site is currently dark-only. Would need a light-mode
   token set added to `globals.css` (e.g. via `[data-theme="light"]` or a `.light` class
   swapping the `:root` custom properties) plus a toggle control, likely in the sidebar
   header near the logo. Persist choice in `localStorage`.
6. **"Copy result" toast confirmation** — several tools already have copy-to-clipboard
   buttons that swap an icon (Copy → Check) briefly; upgrade to a small animated toast/
   snackbar instead of just the icon swap, for consistency across tools.
7. **Better empty states** — tool pages currently show blank inputs before the user
   provides content. Add friendlier placeholder messaging or a small illustration state.

### New homepage sections
8. **"Most popular" / "Trending" row** — can be curated/hardcoded initially (no real
   analytics backend exists), styled consistent with the existing category grid.
9. **"How it works" / trust section** — a 3-step visual explaining the "runs locally,
   nothing uploaded" pitch, since that's the core value prop and currently only stated
   in text (hero line + footer line). This deserves a proper section given how central
   it is to the site's identity.
10. **Changelog / "what's new" strip** — lightweight, could be a simple hardcoded list
    to start.

### New tools to add
Each of these follows the existing tool-page pattern (registry entry + page file using
`ToolShell` + `ui.tsx` primitives):
11. CSV ↔ JSON converter
12. Image background remover (client-side — flag if this turns out to need a model/
    server call, since that would break the "nothing uploaded" promise; discuss with
    owner before adding a server dependency)
13. HTML/CSS/JS minifier or beautifier
14. Text-to-speech / speech-to-text (uses Web Speech API — client-side, fits the model)
15. UUID generator
16. Cron expression parser/explainer
17. Meta tag / Open Graph tag previewer
18. Gradient / CSS generator

### Polish / animation
19. Page transition animation between tool pages (currently each `ToolShell` fades in
    independently on mount; a shared layout transition between routes would be new work)
20. Loading skeletons for async tools (currency converter, QR generator) instead of
    blank states while data loads
21. Small success micro-animation on completed actions (e.g. after a PDF merge finishes)
22. Tactile button press feedback (the `Button` component in `ui.tsx` already has
    `active:scale-[0.97]` — this may just need extending to more interactive elements)

---

## 7. Constraints and conventions to preserve

- **Every new tool must actually run client-side.** Don't introduce a server dependency
  for user file processing without explicitly calling it out — this breaks the site's
  core promise.
- **Reuse `ui.tsx` primitives** (`Card`, `Button`, `Field`, `inputClass`, `Dropzone`,
  `ResultBar`) rather than writing one-off styled elements per tool page. This is what
  keeps 35+ pages visually consistent.
- **New tools need a `tools-registry.ts` entry** (slug, name, short description,
  category) before/alongside creating the page — the sidebar, search, and homepage grid
  all read from that single array automatically.
- **Respect the existing motion restraint** — one hero entrance, functional hover
  states, no blanket scroll-triggered animation on every element.
- **Category colors are semantic** — if adding a 6th category, add both a `--cat-*` CSS
  variable and a `categoryMeta` entry with a distinct, coherent hue (see existing five
  for the palette's saturation/warmth range).
- **Run `npm run build` before considering any change complete** — it's a fast way to
  catch TypeScript/route errors across all 35+ static pages.
- **Mobile-first** — the owner primarily reviews on a phone. Sidebar collapses to a top
  bar + drawer under `lg:` breakpoint already; keep new UI (command palette, theme
  toggle, etc.) mobile-usable, not desktop-only.

---

## 8. What's already been delivered (context, not to redo)

- Full palette/typography/motion redesign (multiple passes, including a switch from an
  earlier brass/workshop palette to the current purple/violet system) — described in
  section 4.
- Selectable AI accent-theme system (`AIThemePicker`, `useAITheme`) — 4 themes on top of
  dark/light mode.
- First-visit opening intro (`OpeningIntro.tsx`) and ambient particle background
  (`ParticleCanvas.tsx`).
- Sidebar sticky-positioning bug fixed (see section 4 — do not add `overflow-x: hidden`
  back to `body`).
- Hard section-divider borders replaced with soft fade utilities (see section 4).
- A static standalone `homepage-preview.html` was generated at one point purely for
  quick mobile viewing without running the dev server — that's a throwaway artifact,
  not part of the actual Next.js app, and doesn't need to be maintained going forward.
- This project has been worked on by more than one AI assistant/tool across sessions
  (this file, `CLAUDE.md`, and `AGENTS.md` all exist as handoff docs for that reason).
  If you land here mid-way through someone else's in-progress feature, check for
  incomplete wiring (e.g. a new component that imports a hook that doesn't exist yet)
  before assuming a build failure is your own change's fault — cross-check against the
  actual current `git log`/deployed state, since local zips handed to an assistant can
  lag behind what's actually pushed.
