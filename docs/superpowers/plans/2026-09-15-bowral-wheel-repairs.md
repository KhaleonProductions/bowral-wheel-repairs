# Bowral Wheel Repairs Website Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a six-page Next.js marketing site for Bowral Wheel Repairs, themeable into two colour variants from one codebase, and deploy both to Vercel for the owner to choose between.

**Architecture:** One Next.js App Router codebase. All copy lives in `content/site.json`, validated by a Zod schema and consumed as props by shared components. Colour is driven entirely by CSS custom properties selected by a `data-theme` attribute, set from `NEXT_PUBLIC_THEME` at render. Two Vercel projects deploy the same repo with different values of that one env var, so the variants cannot drift in content or layout.

**Tech Stack:** Next.js 16.2.4 (App Router), React 19.2.4, Tailwind CSS v4, TypeScript 5, Zod 4. Node 24.15.0, npm 11.12.1. Pillow for logo recolouring, ffmpeg for poster frames. Deployed on Vercel (CLI 54.1.0), GitHub via `gh` 2.92.0.

**Spec:** `docs/superpowers/specs/2026-09-15-bowral-wheel-repairs-design.md`

## Global Constraints

Every task's requirements implicitly include these. Values are copied verbatim from the spec.

- **C1 — No pricing.** No dollar figures, no ranges, no "from $X". Every price touchpoint reads "Contact us for a quote".
- **C2 — No mention of Bowral Body Shop** in copy, metadata, alt text, structured data, or code comments.
- **C3 — The Bowral Body Shop logo is never used.** Only `logo-blue.png` (supplied) and `logo-red.png` (generated from it).
- **C4 — No competitor imagery.** No files from cncwheels.com.au or any other operator. Their process *information* is used; their photography is not.
- **C5 — Placeholders for missing media** are clearly marked as awaiting Bowral Wheel Repairs' own photos and videos. Never a broken image, never a stock substitute.
- **C6 — No portraits and no owner names.** No team section.
- **C7 — No fabricated credentials.** No invented awards, review counts, star ratings, certifications or insurer approvals. No `aggregateRating` in JSON-LD.
- **C8 — No committed turnaround times.** No "24 hours", "same day", "2-3 days", or equivalent.
- **Contact details, exact:** `8 Mount Rd, Bowral NSW 2576` · `(02) 4872 2221` · `admin@bowralwheelrepairs.com.au` · `Tue-Fri 7:30am - 5:00pm`
- **Geo for JSON-LD:** latitude `-34.4754714`, longitude `150.4165496`
- **Positioning claim:** "CNC wheel machining, in-house, in Bowral." Never "the only CNC wheel repairer in the region".
- **No changes to `C:\code\BusinessBrain`.** That repo's R31 requires Sam's review for infra changes; registration there is a separate follow-up task.
- **Fonts:** display `Bebas Neue`, heading `Barlow Condensed`, body `DM Sans`.
- **Dependencies:** framework + Tailwind + Zod only. No UI kit, no animation library, no icon package.

---

## File Structure

| Path | Responsibility |
|---|---|
| `package.json`, `tsconfig.json`, `next.config.ts`, `postcss.config.mjs` | Toolchain config |
| `app/globals.css` | Tailwind import, both theme token blocks, base element styles, texture utilities |
| `app/layout.tsx` | Fonts, `data-theme` attribute, site-wide metadata, JSON-LD, Nav + Footer |
| `app/page.tsx` | Home route composition |
| `app/{about,services,process,gallery,contact}/page.tsx` | One route each |
| `app/api/contact/route.ts` | Quote form handler; BusinessBrain webhook with mailto fallback |
| `app/sitemap.ts`, `app/robots.ts` | SEO endpoints |
| `content/site.json` | Every word of copy, all service/process/damage data, contact details, media manifest |
| `lib/schema.ts` | Zod schema defining the shape of `site.json` |
| `lib/content.ts` | Typed loader that parses and validates `site.json` at import |
| `lib/theme.ts` | Resolves `NEXT_PUBLIC_THEME` to a theme name and logo path |
| `components/Nav.tsx` | Header, nav links, call CTA, mobile drawer |
| `components/Footer.tsx` | Footer grid, contact block, hours |
| `components/Hero.tsx` | Home hero: logo, headline, CTAs, video |
| `components/VideoFrame.tsx` | Portrait-safe video with pillarbox crop |
| `components/MediaPlaceholder.tsx` | Labelled "photo coming soon" slot |
| `components/SectionHeader.tsx` | Eyebrow label + title + description |
| `components/Card.tsx` | Shared surface card used by damage/service/why grids |
| `components/ProcessStep.tsx` | Numbered process step with media slot |
| `components/CTABanner.tsx` | Quote + phone call-to-action band |
| `components/Reveal.tsx` | Scroll-reveal wrapper, respects reduced motion |
| `components/QuoteForm.tsx` | Contact form with client validation |
| `components/Prose.tsx` | Renders a copy block's paragraphs with emphasis |
| `scripts/make-logo-red.py` | Generates `logo-red.png` from the supplied artwork |
| `scripts/make-media.sh` | Extracts poster frames, produces sized logo derivatives |
| `public/assets/*` | Generated and copied media |
| `tests/content.test.mjs` | Validates `site.json` against the schema and the hard constraints |
| `tests/constraints.test.mjs` | Greps the built output for C1/C2/C4/C8 violations |

**Task ordering rationale:** config and content schema first (everything depends on them), then generated media (components reference the paths), then primitives, then composed routes, then the API route, then constraint tests, then deploy. Each task ends with a working, verifiable deliverable.

---

## Task 1: Project scaffold, theme tokens, and content schema

**Files:**
- Create: `package.json`, `tsconfig.json`, `next.config.ts`, `postcss.config.mjs`, `.gitignore`
- Create: `app/globals.css`, `lib/theme.ts`, `lib/schema.ts`, `lib/content.ts`
- Create: `content/site.json` (contact + meta sections only at this stage)
- Test: `tests/content.test.mjs`

**Interfaces:**
- Consumes: nothing.
- Produces:
  - `lib/theme.ts` → `export type ThemeName = 'red' | 'graphite'`; `export function resolveTheme(): ThemeName`; `export function logoPath(theme: ThemeName): string`; `export function logoNavPath(theme: ThemeName): string`
  - `lib/schema.ts` → `export const SiteSchema` (Zod object); `export type Site = z.infer<typeof SiteSchema>`
  - `lib/content.ts` → `export const site: Site` (validated at import; throws on invalid)

- [ ] **Step 1: Initialise the package and install exact dependencies**

Run from `C:\code\bowral-wheel-repairs`:

```bash
npm init -y
npm install next@16.2.4 react@19.2.4 react-dom@19.2.4 zod@^4
npm install -D typescript@^5 @types/node@^20 @types/react@^19 @types/react-dom@^19 tailwindcss@^4 @tailwindcss/postcss@^4
```

Then replace the generated `package.json` scripts block so it reads exactly:

```json
{
  "name": "bowral-wheel-repairs",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "test": "node --test tests/"
  }
}
```

Keep the `dependencies` and `devDependencies` blocks npm wrote.

- [ ] **Step 2: Write the config files**

`tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["dom", "dom.iterable", "ES2022"],
    "allowJs": false,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "paths": { "@/*": ["./*"] }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

`next.config.ts` — note the `turbopack.root` pin. BusinessBrain's `crm-tab-src/next.config.ts` documents that Next 16 otherwise walks up to a parent lockfile and crashes Turbopack. This project sits under `C:\code\` which has no parent lockfile today, but pinning costs nothing and prevents a confusing future failure:

```ts
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  turbopack: {
    root: import.meta.dirname,
  },
};

export default nextConfig;
```

`postcss.config.mjs`:

```js
const config = {
  plugins: ['@tailwindcss/postcss'],
};

export default config;
```

`.gitignore`:

```
node_modules/
.next/
out/
.vercel/
.env*.local
desktop.ini
.DS_Store
```

- [ ] **Step 3: Write `lib/theme.ts`**

```ts
export type ThemeName = 'red' | 'graphite';

const THEMES: readonly ThemeName[] = ['red', 'graphite'] as const;

/**
 * Resolves the active colour variant from NEXT_PUBLIC_THEME.
 * Defaults to 'red' when unset or unrecognised so a misconfigured
 * deployment renders a complete site rather than an unthemed one.
 */
export function resolveTheme(): ThemeName {
  const raw = process.env.NEXT_PUBLIC_THEME;
  return THEMES.includes(raw as ThemeName) ? (raw as ThemeName) : 'red';
}

export function logoPath(theme: ThemeName): string {
  return theme === 'red' ? '/assets/logo-red.png' : '/assets/logo-blue.png';
}

export function logoNavPath(theme: ThemeName): string {
  return theme === 'red' ? '/assets/logo-red-nav.png' : '/assets/logo-blue-nav.png';
}
```

- [ ] **Step 4: Write `lib/schema.ts`**

```ts
import { z } from 'zod';

const CopyBlock = z.object({
  heading: z.string().min(1),
  paragraphs: z.array(z.string().min(1)).min(1),
});

const MediaSlot = z.object({
  src: z.string().nullable(),
  alt: z.string().min(1),
  shotNeeded: z.string().min(1),
});

const Item = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  summary: z.string().min(1),
});

const Service = Item.extend({
  what: z.string().min(1),
  fixes: z.string().min(1),
  how: z.string().min(1),
});

const ProcessStep = Item.extend({
  step: z.number().int().positive(),
  detail: z.string().min(1),
  media: MediaSlot.nullable(),
});

const GalleryItem = z.object({
  id: z.string().min(1),
  category: z.enum(['diamond-cut', 'straightening', 'refurbishment', 'custom-colour']),
  caption: z.string().min(1),
  media: MediaSlot,
});

export const SiteSchema = z.object({
  business: z.object({
    name: z.literal('Bowral Wheel Repairs'),
    tagline: z.string().min(1),
    region: z.string().min(1),
  }),
  contact: z.object({
    phone: z.literal('(02) 4872 2221'),
    phoneHref: z.literal('tel:0248722221'),
    email: z.literal('admin@bowralwheelrepairs.com.au'),
    street: z.literal('8 Mount Rd'),
    locality: z.literal('Bowral'),
    region: z.literal('NSW'),
    postcode: z.literal('2576'),
    hours: z.literal('Tue-Fri: 7:30am - 5:00pm'),
    geo: z.object({ lat: z.number(), lng: z.number() }),
  }),
  nav: z.array(z.object({ href: z.string().min(1), label: z.string().min(1) })).min(1),
  quoteCta: z.object({
    label: z.string().min(1),
    note: z.string().min(1),
  }),
  home: z.object({
    heroHeadline: z.array(z.string().min(1)).min(1),
    heroSub: z.string().min(1),
    trust: z.array(Item).length(4),
    damageIntro: CopyBlock,
    damage: z.array(Item).length(6),
    resultBlock: CopyBlock,
  }),
  newcomer: CopyBlock,
  straightAnswers: CopyBlock,
  workshop: CopyBlock,
  whyUs: z.array(Item).min(3),
  services: z.array(Service).length(7),
  process: z.array(ProcessStep).length(7),
  gallery: z.array(GalleryItem).min(4),
  about: z.object({ story: CopyBlock }),
  contactPage: z.object({
    intro: CopyBlock,
    formNote: z.string().min(1),
  }),
  seo: z.record(
    z.string(),
    z.object({ title: z.string().min(1), description: z.string().min(1) }),
  ),
});

export type Site = z.infer<typeof SiteSchema>;
export type CopyBlockT = z.infer<typeof CopyBlock>;
export type MediaSlotT = z.infer<typeof MediaSlot>;
export type ItemT = z.infer<typeof Item>;
export type ServiceT = z.infer<typeof Service>;
export type ProcessStepT = z.infer<typeof ProcessStep>;
export type GalleryItemT = z.infer<typeof GalleryItem>;
```

- [ ] **Step 5: Write `lib/content.ts`**

```ts
import raw from '@/content/site.json';
import { SiteSchema, type Site } from './schema';

const parsed = SiteSchema.safeParse(raw);

if (!parsed.success) {
  throw new Error(
    `content/site.json failed validation:\n${JSON.stringify(parsed.error.issues, null, 2)}`,
  );
}

export const site: Site = parsed.data;
```

- [ ] **Step 6: Write `content/site.json` with the contact and business sections**

Write the file with all top-level keys present. Copy sections are filled in Task 5; at this stage give every array the correct number of entries with real (not placeholder) short strings so the schema validates. Start with these exact values:

```json
{
  "business": {
    "name": "Bowral Wheel Repairs",
    "tagline": "Precision CNC wheel repair in the Southern Highlands",
    "region": "Southern Highlands"
  },
  "contact": {
    "phone": "(02) 4872 2221",
    "phoneHref": "tel:0248722221",
    "email": "admin@bowralwheelrepairs.com.au",
    "street": "8 Mount Rd",
    "locality": "Bowral",
    "region": "NSW",
    "postcode": "2576",
    "hours": "Tue-Fri: 7:30am - 5:00pm",
    "geo": { "lat": -34.4754714, "lng": 150.4165496 }
  },
  "nav": [
    { "href": "/", "label": "Home" },
    { "href": "/about", "label": "About" },
    { "href": "/services", "label": "Services" },
    { "href": "/process", "label": "Process" },
    { "href": "/gallery", "label": "Our Work" },
    { "href": "/contact", "label": "Contact" }
  ],
  "quoteCta": {
    "label": "Get a Quote",
    "note": "Every job is quoted on inspection. Send us a photo or bring the wheel in."
  }
}
```

Fill the remaining keys (`home`, `newcomer`, `straightAnswers`, `workshop`, `whyUs`, `services`, `process`, `gallery`, `about`, `contactPage`, `seo`) with the full copy from Task 5. To keep this task independently testable, write them now with one-sentence real copy per field and expand in Task 5.

- [ ] **Step 7: Write `app/globals.css` with both theme token blocks**

```css
@import 'tailwindcss';

/* ---------- Variant A: Red Brand ---------- */
:root,
:root[data-theme='red'] {
  --base: #14090a;
  --base-deep: #0a0405;
  --surface: #241012;
  --surface-mid: #2e1518;
  --accent: #dc2626;
  --accent-bright: #ef4444;
  --accent-muted: #991b1b;
  --accent-glow: rgba(220, 38, 38, 0.25);
  --border-subtle: rgba(255, 255, 255, 0.07);
  --border-accent: rgba(220, 38, 38, 0.22);
}

/* ---------- Variant B: Graphite + Red Accent ---------- */
:root[data-theme='graphite'] {
  --base: #131619;
  --base-deep: #0b0d0f;
  --surface: #1c2024;
  --surface-mid: #262b31;
  --accent: #e11d2e;
  --accent-bright: #ff2d3f;
  --accent-muted: #a91520;
  --accent-glow: rgba(225, 29, 46, 0.22);
  --border-subtle: rgba(255, 255, 255, 0.08);
  --border-accent: rgba(225, 29, 46, 0.2);
}

/* ---------- Shared neutrals and scales ---------- */
:root {
  --white: #f2f4f6;
  --chrome: #c6ccd3;
  --steel: #8b939d;
  --steel-dark: #5b6269;
  --section-pad: clamp(4rem, 8vw, 7rem);
  --content-max: 1200px;
  --ease-out: cubic-bezier(0.22, 1, 0.36, 1);
}

@theme inline {
  --color-base: var(--base);
  --color-base-deep: var(--base-deep);
  --color-surface: var(--surface);
  --color-surface-mid: var(--surface-mid);
  --color-accent: var(--accent);
  --color-accent-bright: var(--accent-bright);
  --color-accent-muted: var(--accent-muted);
  --color-chrome: var(--chrome);
  --color-steel: var(--steel);
  --color-ink: var(--white);
  --font-display: var(--font-bebas), Impact, sans-serif;
  --font-heading: var(--font-barlow), 'Arial Narrow', sans-serif;
  --font-body: var(--font-dmsans), 'Segoe UI', sans-serif;
}

html {
  scroll-behavior: smooth;
  scroll-padding-top: 5rem;
}

body {
  background: var(--base-deep);
  color: var(--white);
  font-family: var(--font-body);
  line-height: 1.65;
  -webkit-font-smoothing: antialiased;
}

/* Carbon weave + mesh treatments, token-driven so both themes inherit */
.texture-carbon {
  background-image:
    linear-gradient(27deg, var(--border-subtle) 5px, transparent 5px),
    linear-gradient(207deg, var(--border-subtle) 5px, transparent 5px);
  background-size: 12px 12px;
}

.bg-mesh {
  background-image:
    radial-gradient(at 18% 12%, var(--accent-glow) 0px, transparent 55%),
    radial-gradient(at 82% 78%, var(--accent-glow) 0px, transparent 50%);
}

.chrome-text {
  background: linear-gradient(180deg, #fff 0%, var(--chrome) 45%, var(--steel-dark) 100%);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}

@media (prefers-reduced-motion: reduce) {
  html { scroll-behavior: auto; }
  *, *::before, *::after {
    animation-duration: 0.001ms !important;
    transition-duration: 0.001ms !important;
  }
}
```

- [ ] **Step 8: Write the failing content test**

`tests/content.test.mjs`:

```js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const raw = JSON.parse(readFileSync(new URL('../content/site.json', import.meta.url), 'utf8'));
const json = JSON.stringify(raw);

test('contact details are exact', () => {
  assert.equal(raw.contact.phone, '(02) 4872 2221');
  assert.equal(raw.contact.email, 'admin@bowralwheelrepairs.com.au');
  assert.equal(raw.contact.street, '8 Mount Rd');
  assert.equal(raw.contact.postcode, '2576');
});

test('C1: no pricing figures anywhere in content', () => {
  const matches = json.match(/\$\s?\d/g) ?? [];
  assert.deepEqual(matches, [], `found pricing: ${matches.join(', ')}`);
});

test('C2: no reference to the co-located business', () => {
  assert.ok(!/body\s?shop/i.test(json), 'found a body shop reference');
  assert.ok(!/mittagong smash/i.test(json), 'found a former-name reference');
});

test('C4: no competitor domains referenced', () => {
  assert.ok(!/cncwheels/i.test(json));
  assert.ok(!/spotonwheel/i.test(json));
});

test('C7: no fabricated ratings or review counts', () => {
  assert.ok(!/\b\d+(\.\d+)?\s*(star|★)/i.test(json), 'found a star rating');
  assert.ok(!/\b\d+\+?\s*(google\s+)?reviews?\b/i.test(json), 'found a review count');
});

test('C8: no committed turnaround times', () => {
  const banned = /\b\d+\s*(hour|hr|day|week)s?\b|same[-\s]day|24[-\s]?48/i;
  assert.ok(!banned.test(json), 'found a committed turnaround time');
});

test('positioning claim is not an exclusivity claim', () => {
  assert.ok(!/only\s+(cnc|wheel|one)/i.test(json), 'found an exclusivity claim');
});

test('required top-level sections are present', () => {
  for (const key of [
    'business', 'contact', 'nav', 'quoteCta', 'home', 'newcomer',
    'straightAnswers', 'workshop', 'whyUs', 'services', 'process',
    'gallery', 'about', 'contactPage', 'seo',
  ]) {
    assert.ok(key in raw, `missing section: ${key}`);
  }
});
```

- [ ] **Step 9: Run the test to verify it fails**

Run: `npm test`
Expected: FAIL — `required top-level sections are present` fails on the sections not yet written (`home`, `newcomer`, …), because Step 6 has only written `business`, `contact`, `nav` and `quoteCta` so far.

- [ ] **Step 10: Complete `content/site.json` so every section exists**

Add the remaining keys with real short copy (expanded in Task 5). Use the correct array lengths the schema demands: `home.trust` 4, `home.damage` 6, `services` 7, `process` 7, `whyUs` ≥3, `gallery` ≥4.

- [ ] **Step 11: Run the test to verify it passes**

Run: `npm test`
Expected: PASS — all 8 tests.

- [ ] **Step 12: Verify the schema accepts the content**

Create `tests/schema.test.mjs`:

```js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';

test('site.json satisfies the Zod schema', () => {
  const out = execFileSync('npx', ['tsx', 'lib/content.ts'], { encoding: 'utf8', stdio: 'pipe' });
  assert.ok(!/failed validation/.test(out));
});
```

If `tsx` is not desired as a dependency, instead verify via `npx next build` in Task 6 — the import in `lib/content.ts` throws at build time on invalid content, which is the real gate. Prefer that: delete `tests/schema.test.mjs` and rely on the build.

- [ ] **Step 13: Commit**

```bash
git add package.json package-lock.json tsconfig.json next.config.ts postcss.config.mjs .gitignore app/globals.css lib/ content/ tests/
git commit -m "feat: scaffold Next.js project with theme tokens and validated content schema"
```

---

## Task 2: Generate media assets

**Files:**
- Create: `scripts/make-logo-red.py`, `scripts/make-media.sh`
- Create: `public/assets/logo-blue.png`, `public/assets/logo-red.png`, `public/assets/logo-blue-nav.png`, `public/assets/logo-red-nav.png`, `public/assets/favicon-red.png`, `public/assets/favicon-graphite.png`
- Create: `public/assets/lathe.jpg`, `public/assets/video-cutting.mp4`, `public/assets/video-finished.mp4`, `public/assets/poster-cutting.jpg`, `public/assets/poster-finished.jpg`

**Interfaces:**
- Consumes: nothing.
- Produces: the exact asset paths returned by `logoPath()` / `logoNavPath()` in Task 1, plus the video and poster paths referenced by `VideoFrame` in Task 3.

**Verified facts this task depends on:**
- The supplied logo is **RGB with no alpha** — 1254×1254, a solid dark-navy square. There is no transparency to preserve; the navy field is part of the artwork and gets recoloured too.
- 82.7% of sampled pixels are blue-dominant; only 15.5% are low-saturation chrome/white. The recolour must therefore be **conditional per pixel**, not a global filter, or the chrome bevels and white "WHEEL REPAIRS" text will be destroyed.
- The recolour parameters below were prototyped and visually verified: chrome, the three alloy wheels, the white wordmark and the stars all survive; glow, shield banding, "BOWRAL" and the background go red.
- Both videos report `1024x576` but contain **portrait 9:16 content pillarboxed with grey bars**. Poster frames must be taken from the same letterboxed source, and cropping is handled in CSS by `VideoFrame` (Task 3), not here.
- ffmpeg is installed at `C:\Users\ScottAbbott\AppData\Local\Microsoft\WinGet\Packages\Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe\ffmpeg-9.0.1-full_build\bin\`. It may not be on `PATH` in a fresh shell; resolve it explicitly.

- [ ] **Step 1: Write `scripts/make-logo-red.py`**

```python
"""
Generate the red variant of the Bowral Wheel Repairs logo.

The source artwork is RGB (no alpha): a 1254x1254 square whose dark navy
background is part of the design. Blue-family pixels with real saturation are
rotated to red; everything else is copied untouched, which is what preserves
the chrome bevels, the three alloy wheels, the white "WHEEL REPAIRS" text and
the stars. A global hue rotation would wreck all of those.

Parameters below were prototyped and visually verified at nav, hero and full size.
"""

import colorsys
import sys
from pathlib import Path

from PIL import Image

SRC = Path(sys.argv[1] if len(sys.argv) > 1 else 'bowral wheel repairs.png')
DEST = Path(sys.argv[2] if len(sys.argv) > 2 else 'public/assets/logo-red.png')

# Blue family in the source spans roughly 170-265 degrees.
HUE_LOW, HUE_HIGH = 170, 265
# Below this saturation a pixel is chrome, white or near-grey: leave it alone.
SAT_FLOOR = 0.18
# Target hues, expressed as 0..1 fractions. Deep blues map just below 360
# (crimson), brighter blues just above 0 (scarlet), which keeps the original
# two-tone depth of the artwork instead of flattening it to one red.
HUE_DEEP, HUE_BRIGHT = 0.995, 0.02
HUE_SPLIT = 215


def recolour(src: Path, dest: Path) -> None:
    img = Image.open(src).convert('RGB')
    width, height = img.size
    px = img.load()
    out = Image.new('RGB', (width, height))
    op = out.load()

    for y in range(height):
        for x in range(width):
            r, g, b = px[x, y]
            h, s, v = colorsys.rgb_to_hsv(r / 255, g / 255, b / 255)
            hue = h * 360
            if HUE_LOW <= hue <= HUE_HIGH and s > SAT_FLOOR:
                new_h = HUE_DEEP if hue < HUE_SPLIT else HUE_BRIGHT
                nr, ng, nb = colorsys.hsv_to_rgb(new_h, min(s * 1.02, 1.0), v)
                op[x, y] = (int(nr * 255), int(ng * 255), int(nb * 255))
            else:
                op[x, y] = (r, g, b)

    dest.parent.mkdir(parents=True, exist_ok=True)
    out.save(dest, optimize=True)
    print(f'wrote {dest} ({dest.stat().st_size // 1024} KB)')


if __name__ == '__main__':
    recolour(SRC, DEST)
```

- [ ] **Step 2: Run it and verify the output by eye**

```bash
python scripts/make-logo-red.py "bowral wheel repairs.png" public/assets/logo-red.png
```

Expected: writes `public/assets/logo-red.png`.

**Verification is visual and mandatory** — open the file and confirm: chrome bevels still silver, the three wheels still silver/grey, "WHEEL REPAIRS" still white, stars still white, and the glow/banding/"BOWRAL"/background now red. If chrome has gone pink, raise `SAT_FLOOR`; if blue remains, widen `HUE_HIGH`.

- [ ] **Step 3: Write `scripts/make-media.sh`**

```bash
#!/usr/bin/env bash
# Produce every derived media asset. Idempotent: safe to re-run.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
OUT="$ROOT/public/assets"
mkdir -p "$OUT"

# ffmpeg is installed via winget and may not be on PATH in a fresh shell.
FFMPEG="$(command -v ffmpeg || true)"
if [ -z "$FFMPEG" ]; then
  FFMPEG="$LOCALAPPDATA/Microsoft/WinGet/Packages/Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe/ffmpeg-9.0.1-full_build/bin/ffmpeg.exe"
fi
[ -x "$FFMPEG" ] || { echo "ffmpeg not found" >&2; exit 1; }

# --- copy supplied originals under stable names ---
cp "$ROOT/bowral wheel repairs.png"                                   "$OUT/logo-blue.png"
cp "$ROOT/IMG_20260915_225126.jpg"                                    "$OUT/lathe.jpg"
cp "$ROOT/Messenger_creation_4AE294B9-E93A-4833-B9ED-CD07980F4182.mp4" "$OUT/video-cutting.mp4"
cp "$ROOT/Messenger_creation_1EB72D5D-9005-43C8-8DB7-275024EDE505.mp4" "$OUT/video-finished.mp4"

# --- poster frames ---
# Taken at moments verified to show the subject clearly: the cutting clip has
# the tool engaged and swarf visible around 9s; the finished wheel fills the
# frame around 11s.
"$FFMPEG" -y -loglevel error -ss 9  -i "$OUT/video-cutting.mp4"  -frames:v 1 -q:v 3 "$OUT/poster-cutting.jpg"
"$FFMPEG" -y -loglevel error -ss 11 -i "$OUT/video-finished.mp4" -frames:v 1 -q:v 3 "$OUT/poster-finished.jpg"

# --- sized logo derivatives ---
# The 1.8 MB source is far too large to ship for a 44px nav mark.
for theme in blue red; do
  "$FFMPEG" -y -loglevel error -i "$OUT/logo-$theme.png" -vf scale=176:-1 "$OUT/logo-$theme-nav.png"
  "$FFMPEG" -y -loglevel error -i "$OUT/logo-$theme.png" -vf scale=512:-1 "$OUT/logo-$theme-hero.png"
done
"$FFMPEG" -y -loglevel error -i "$OUT/logo-red.png"  -vf scale=64:-1 "$OUT/favicon-red.png"
"$FFMPEG" -y -loglevel error -i "$OUT/logo-blue.png" -vf scale=64:-1 "$OUT/favicon-graphite.png"

# --- lathe photo: cap width, strip EXIF ---
"$FFMPEG" -y -loglevel error -i "$OUT/lathe.jpg" -vf "scale='min(1800,iw)':-1" -q:v 4 "$OUT/lathe-web.jpg"
mv "$OUT/lathe-web.jpg" "$OUT/lathe.jpg"

echo "--- assets ---"
ls -la "$OUT"
```

- [ ] **Step 4: Run it**

```bash
chmod +x scripts/make-media.sh && ./scripts/make-media.sh
```

Expected: all assets listed. Confirm `logo-blue-nav.png` and `logo-red-nav.png` are each well under 100 KB, and that both poster JPEGs show the intended subject.

- [ ] **Step 5: Commit**

```bash
git add scripts/ public/assets/
git commit -m "feat: generate red logo variant, poster frames and sized media derivatives"
```

---

## Task 3: Presentational primitives

**Files:**
- Create: `components/VideoFrame.tsx`, `components/MediaPlaceholder.tsx`, `components/SectionHeader.tsx`, `components/Card.tsx`, `components/Reveal.tsx`, `components/Prose.tsx`, `components/CTABanner.tsx`

**Interfaces:**
- Consumes: `lib/content.ts` → `site`; `lib/schema.ts` types `CopyBlockT`, `MediaSlotT`.
- Produces:
  - `VideoFrame` — props `{ src: string; poster: string; label: string; className?: string }`
  - `MediaPlaceholder` — props `{ shotNeeded: string; className?: string; aspect?: 'square' | 'video' | 'portrait' }`
  - `SectionHeader` — props `{ eyebrow?: string; title: string; description?: string; center?: boolean }`
  - `Card` — props `{ title: string; children: React.ReactNode; className?: string }`
  - `Reveal` — props `{ children: React.ReactNode; className?: string; delay?: number }`
  - `Prose` — props `{ block: CopyBlockT; className?: string }`
  - `CTABanner` — props `{ heading?: string }`

- [ ] **Step 1: Write `components/VideoFrame.tsx`**

The pillarbox crop is the whole point of this component. Source files are 16:9 containers holding 9:16 content with grey bars each side; the wrapper is portrait and the video is scaled to cover it, so the bars fall outside the frame.

```tsx
type Props = {
  src: string;
  poster: string;
  label: string;
  className?: string;
};

export default function VideoFrame({ src, poster, label, className = '' }: Props) {
  return (
    <div
      className={`relative overflow-hidden rounded-xl border border-white/10 bg-black ${className}`}
      style={{ aspectRatio: '9 / 16' }}
    >
      {/*
        Source is a 1024x576 (16:9) container holding portrait 9:16 footage
        pillarboxed with grey bars. Scaling to cover a 9:16 frame pushes those
        bars outside the visible area. Do not change to object-contain.
      */}
      <video
        className="absolute inset-0 h-full w-full object-cover"
        src={src}
        poster={poster}
        aria-label={label}
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
      />
      <div className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-[var(--border-accent)]" />
    </div>
  );
}
```

- [ ] **Step 2: Write `components/MediaPlaceholder.tsx`**

Satisfies C5: never a broken image, always clearly labelled as awaiting the business's own photography.

```tsx
type Props = {
  shotNeeded: string;
  className?: string;
  aspect?: 'square' | 'video' | 'portrait';
};

const ASPECT: Record<NonNullable<Props['aspect']>, string> = {
  square: '1 / 1',
  video: '16 / 9',
  portrait: '9 / 16',
};

export default function MediaPlaceholder({
  shotNeeded,
  className = '',
  aspect = 'video',
}: Props) {
  return (
    <div
      className={`flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-[var(--border-accent)] bg-[var(--surface)] p-6 text-center ${className}`}
      style={{ aspectRatio: ASPECT[aspect] }}
    >
      <svg viewBox="0 0 24 24" className="h-10 w-10 fill-[var(--accent)] opacity-60" aria-hidden="true">
        <path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm0 3.5a6.5 6.5 0 0 1 6.5 6.5A6.5 6.5 0 0 1 12 18.5 6.5 6.5 0 0 1 5.5 12 6.5 6.5 0 0 1 12 5.5zm0 2.6a3.9 3.9 0 1 0 0 7.8 3.9 3.9 0 0 0 0-7.8z" />
      </svg>
      <p className="font-[family-name:var(--font-heading)] text-xs uppercase tracking-[0.18em] text-[var(--accent)]">
        Photo coming soon
      </p>
      <p className="text-xs text-[var(--color-steel)]">{shotNeeded}</p>
    </div>
  );
}
```

- [ ] **Step 3: Write `components/SectionHeader.tsx`**

```tsx
type Props = {
  eyebrow?: string;
  title: string;
  description?: string;
  center?: boolean;
};

export default function SectionHeader({ eyebrow, title, description, center = false }: Props) {
  return (
    <div className={`mb-12 ${center ? 'text-center' : ''}`}>
      {eyebrow ? (
        <span className="mb-3 inline-flex items-center gap-2 font-[family-name:var(--font-heading)] text-xs uppercase tracking-[0.2em] text-[var(--accent)]">
          <span className="h-px w-8 bg-[var(--accent)]" aria-hidden="true" />
          {eyebrow}
        </span>
      ) : null}
      <h2 className="font-[family-name:var(--font-display)] text-4xl leading-[1.05] tracking-wide sm:text-5xl">
        {title}
      </h2>
      {description ? (
        <p className={`mt-4 max-w-[60ch] text-[var(--color-steel)] ${center ? 'mx-auto' : ''}`}>
          {description}
        </p>
      ) : null}
    </div>
  );
}
```

- [ ] **Step 4: Write `components/Card.tsx`**

```tsx
type Props = {
  title: string;
  children: React.ReactNode;
  className?: string;
};

export default function Card({ title, children, className = '' }: Props) {
  return (
    <div
      className={`group rounded-xl border border-[var(--border-subtle)] bg-[var(--surface)] p-6 transition-colors duration-300 hover:border-[var(--border-accent)] ${className}`}
    >
      <h3 className="mb-2 font-[family-name:var(--font-heading)] text-lg uppercase tracking-wide text-[var(--color-ink)]">
        {title}
      </h3>
      <div className="text-sm text-[var(--color-steel)]">{children}</div>
    </div>
  );
}
```

- [ ] **Step 5: Write `components/Reveal.tsx`**

```tsx
'use client';

import { useEffect, useRef, useState } from 'react';

type Props = {
  children: React.ReactNode;
  className?: string;
  delay?: number;
};

export default function Reveal({ children, className = '', delay = 0 }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    // Respect reduced motion by skipping the animation entirely.
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setShown(true);
      return;
    }
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShown(true);
          io.disconnect();
        }
      },
      { threshold: 0.12, rootMargin: '0px 0px -8% 0px' },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: shown ? 1 : 0,
        transform: shown ? 'none' : 'translateY(18px)',
        transition: `opacity .7s var(--ease-out) ${delay}ms, transform .7s var(--ease-out) ${delay}ms`,
      }}
    >
      {children}
    </div>
  );
}
```

- [ ] **Step 6: Write `components/Prose.tsx`**

Renders a copy block. Supports `*emphasis*` because the approved "New to the Highlands" copy contains *this* house.

```tsx
import type { CopyBlockT } from '@/lib/schema';

function withEmphasis(text: string, key: number) {
  const parts = text.split(/(\*[^*]+\*)/g);
  return (
    <p key={key} className="mb-4 max-w-[62ch] text-[var(--color-steel)] last:mb-0">
      {parts.map((part, i) =>
        part.startsWith('*') && part.endsWith('*') && part.length > 2 ? (
          <em key={i} className="text-[var(--color-ink)] not-italic font-semibold">
            {part.slice(1, -1)}
          </em>
        ) : (
          part
        ),
      )}
    </p>
  );
}

export default function Prose({ block, className = '' }: { block: CopyBlockT; className?: string }) {
  return (
    <div className={className}>
      <h3 className="mb-4 font-[family-name:var(--font-display)] text-3xl leading-tight tracking-wide sm:text-4xl">
        {block.heading}
      </h3>
      {block.paragraphs.map(withEmphasis)}
    </div>
  );
}
```

- [ ] **Step 7: Write `components/CTABanner.tsx`**

Satisfies C1: the CTA is a quote request, never a price.

```tsx
import Link from 'next/link';
import { site } from '@/lib/content';

export default function CTABanner({ heading = 'Get a Quote' }: { heading?: string }) {
  return (
    <section className="bg-[var(--base)] py-[var(--section-pad)]">
      <div className="mx-auto max-w-[var(--content-max)] px-6">
        <div className="bg-mesh rounded-2xl border border-[var(--border-accent)] bg-[var(--surface)] p-10 text-center sm:p-14">
          <h2 className="font-[family-name:var(--font-display)] text-4xl tracking-wide sm:text-5xl">
            {heading}
          </h2>
          <p className="mx-auto mt-4 max-w-[48ch] text-[var(--color-chrome)]">{site.quoteCta.note}</p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link
              href="/contact"
              className="rounded-md bg-[var(--accent)] px-7 py-3 font-[family-name:var(--font-heading)] text-sm uppercase tracking-[0.12em] text-white transition-colors hover:bg-[var(--accent-bright)]"
            >
              {site.quoteCta.label}
            </Link>
            <a
              href={site.contact.phoneHref}
              className="rounded-md border border-[var(--border-accent)] px-7 py-3 font-[family-name:var(--font-heading)] text-sm uppercase tracking-[0.12em] text-[var(--color-ink)] transition-colors hover:border-[var(--accent)]"
            >
              {site.contact.phone}
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 8: Verify the project compiles**

Run: `npx tsc --noEmit`
Expected: no errors. (Components are not yet rendered by any route; this checks types only.)

- [ ] **Step 9: Commit**

```bash
git add components/
git commit -m "feat: add presentational primitives with portrait-safe video frame"
```

---

## Task 4: Layout shell — Nav, Footer, fonts, metadata, JSON-LD

**Files:**
- Create: `components/Nav.tsx`, `components/Footer.tsx`, `app/layout.tsx`
- Create: `app/page.tsx` (temporary minimal body, replaced in Task 5)

**Interfaces:**
- Consumes: `resolveTheme`, `logoNavPath`, `logoPath` from `lib/theme.ts`; `site` from `lib/content.ts`.
- Produces: `Nav` (no props), `Footer` (no props), and the root layout applying `data-theme` plus font variables.

- [ ] **Step 1: Write `components/Nav.tsx`**

```tsx
'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { site } from '@/lib/content';

export default function Nav({ logoSrc }: { logoSrc: string }) {
  const [open, setOpen] = useState(false);

  return (
    <nav
      className="sticky top-0 z-50 border-b border-[var(--border-subtle)] bg-[var(--base-deep)]/92 backdrop-blur"
      aria-label="Main navigation"
    >
      <div className="mx-auto flex max-w-[var(--content-max)] items-center justify-between gap-4 px-6 py-3">
        <Link href="/" className="flex items-center gap-3" aria-label={`${site.business.name} — Home`}>
          <Image src={logoSrc} alt={`${site.business.name} logo`} width={44} height={44} className="rounded" priority />
          <span className="flex flex-col leading-none">
            <span className="font-[family-name:var(--font-heading)] text-base font-semibold uppercase tracking-wide text-[var(--color-ink)]">
              {site.business.name}
            </span>
            <span className="font-[family-name:var(--font-heading)] text-[0.65rem] uppercase tracking-[0.2em] text-[var(--accent)]">
              {site.business.region}
            </span>
          </span>
        </Link>

        <ul className="hidden items-center gap-1 lg:flex">
          {site.nav.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className="rounded px-3 py-2 font-[family-name:var(--font-heading)] text-sm uppercase tracking-[0.1em] text-[var(--color-chrome)] transition-colors hover:text-[var(--color-ink)]"
              >
                {item.label}
              </Link>
            </li>
          ))}
          <li>
            <a
              href={site.contact.phoneHref}
              className="ml-2 rounded-md bg-[var(--accent)] px-4 py-2 font-[family-name:var(--font-heading)] text-sm uppercase tracking-[0.1em] text-white transition-colors hover:bg-[var(--accent-bright)]"
            >
              Call Now
            </a>
          </li>
        </ul>

        <button
          type="button"
          className="lg:hidden"
          aria-label="Toggle menu"
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          <span className="sr-only">Menu</span>
          <svg viewBox="0 0 24 24" className="h-7 w-7 stroke-[var(--color-ink)]" fill="none" strokeWidth="2" aria-hidden="true">
            {open ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
          </svg>
        </button>
      </div>

      {open ? (
        <ul className="border-t border-[var(--border-subtle)] bg-[var(--base-deep)] px-6 pb-4 lg:hidden">
          {site.nav.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                onClick={() => setOpen(false)}
                className="block border-b border-[var(--border-subtle)] py-3 font-[family-name:var(--font-heading)] text-sm uppercase tracking-[0.1em] text-[var(--color-chrome)]"
              >
                {item.label}
              </Link>
            </li>
          ))}
          <li className="pt-4">
            <a
              href={site.contact.phoneHref}
              className="block rounded-md bg-[var(--accent)] px-4 py-3 text-center font-[family-name:var(--font-heading)] text-sm uppercase tracking-[0.1em] text-white"
            >
              Call {site.contact.phone}
            </a>
          </li>
        </ul>
      ) : null}
    </nav>
  );
}
```

- [ ] **Step 2: Write `components/Footer.tsx`**

```tsx
import Image from 'next/image';
import Link from 'next/link';
import { site } from '@/lib/content';

export default function Footer({ logoSrc }: { logoSrc: string }) {
  return (
    <footer className="border-t border-[var(--border-subtle)] bg-[var(--base-deep)] py-14">
      <div className="mx-auto grid max-w-[var(--content-max)] gap-10 px-6 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <Link href="/" className="mb-4 flex items-center gap-3">
            <Image src={logoSrc} alt={`${site.business.name} logo`} width={40} height={40} className="rounded" />
            <span className="font-[family-name:var(--font-heading)] text-sm font-semibold uppercase tracking-wide">
              {site.business.name}
            </span>
          </Link>
          <p className="text-sm text-[var(--color-steel)]">{site.business.tagline}</p>
        </div>

        <div>
          <h4 className="mb-4 font-[family-name:var(--font-heading)] text-xs uppercase tracking-[0.2em] text-[var(--accent)]">
            Pages
          </h4>
          <ul className="space-y-2 text-sm">
            {site.nav.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="text-[var(--color-steel)] transition-colors hover:text-[var(--color-ink)]">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="mb-4 font-[family-name:var(--font-heading)] text-xs uppercase tracking-[0.2em] text-[var(--accent)]">
            Services
          </h4>
          <ul className="space-y-2 text-sm">
            {site.services.slice(0, 5).map((s) => (
              <li key={s.id}>
                <Link href="/services" className="text-[var(--color-steel)] transition-colors hover:text-[var(--color-ink)]">
                  {s.title}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="mb-4 font-[family-name:var(--font-heading)] text-xs uppercase tracking-[0.2em] text-[var(--accent)]">
            Contact
          </h4>
          <ul className="space-y-2 text-sm text-[var(--color-steel)]">
            <li>
              <a href={site.contact.phoneHref} className="transition-colors hover:text-[var(--color-ink)]">
                {site.contact.phone}
              </a>
            </li>
            <li>
              <a href={`mailto:${site.contact.email}`} className="transition-colors hover:text-[var(--color-ink)]">
                {site.contact.email}
              </a>
            </li>
            <li>
              {site.contact.street}, {site.contact.locality}
              <br />
              {site.contact.region} {site.contact.postcode}
            </li>
            <li className="pt-2">{site.contact.hours}</li>
          </ul>
        </div>
      </div>

      <div className="mx-auto mt-12 max-w-[var(--content-max)] border-t border-[var(--border-subtle)] px-6 pt-6 text-xs text-[var(--color-steel)]">
        © {new Date().getFullYear()} {site.business.name}. All rights reserved.
      </div>
    </footer>
  );
}
```

- [ ] **Step 3: Write `app/layout.tsx`**

Note the JSON-LD deliberately has **no `aggregateRating`** (C7).

```tsx
import type { Metadata } from 'next';
import { Bebas_Neue, Barlow_Condensed, DM_Sans } from 'next/font/google';
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';
import { site } from '@/lib/content';
import { resolveTheme, logoNavPath } from '@/lib/theme';
import './globals.css';

const bebas = Bebas_Neue({ weight: '400', subsets: ['latin'], variable: '--font-bebas', display: 'swap' });
const barlow = Barlow_Condensed({ weight: ['400', '500', '600', '700'], subsets: ['latin'], variable: '--font-barlow', display: 'swap' });
const dmSans = DM_Sans({ subsets: ['latin'], variable: '--font-dmsans', display: 'swap' });

export const metadata: Metadata = {
  title: { default: site.seo.home.title, template: `%s | ${site.business.name}` },
  description: site.seo.home.description,
  openGraph: {
    title: site.seo.home.title,
    description: site.seo.home.description,
    type: 'website',
    locale: 'en_AU',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const theme = resolveTheme();
  const navLogo = logoNavPath(theme);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'AutoRepair',
    name: site.business.name,
    description: site.seo.home.description,
    telephone: '+61248722221',
    email: site.contact.email,
    address: {
      '@type': 'PostalAddress',
      streetAddress: site.contact.street,
      addressLocality: site.contact.locality,
      addressRegion: site.contact.region,
      postalCode: site.contact.postcode,
      addressCountry: 'AU',
    },
    geo: { '@type': 'GeoCoordinates', latitude: site.contact.geo.lat, longitude: site.contact.geo.lng },
    openingHoursSpecification: [
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        opens: '07:30',
        closes: '17:00',
      },
    ],
    areaServed: ['Bowral', 'Mittagong', 'Moss Vale', 'Southern Highlands'],
  };

  return (
    <html lang="en-AU" data-theme={theme} className={`${bebas.variable} ${barlow.variable} ${dmSans.variable}`}>
      <body>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
        <Nav logoSrc={navLogo} />
        <main>{children}</main>
        <Footer logoSrc={navLogo} />
      </body>
    </html>
  );
}
```

- [ ] **Step 4: Write a temporary `app/page.tsx` so the build has a route**

```tsx
export default function Home() {
  return <div className="p-20">Scaffold OK</div>;
}
```

- [ ] **Step 5: Build and verify both themes render the shell**

```bash
npx next build
NEXT_PUBLIC_THEME=graphite npx next build
```

Expected: both builds succeed with no type errors. `lib/content.ts` throws at build time if `site.json` is invalid, which is the real content gate.

- [ ] **Step 6: Run the dev server and check the shell visually**

```bash
npm run dev
```

Visit `http://localhost:3000`. Confirm: nav shows the logo and six links, footer shows exact contact details, red theme active. Then stop, run `NEXT_PUBLIC_THEME=graphite npm run dev`, and confirm the graphite palette and blue logo.

- [ ] **Step 7: Commit**

```bash
git add components/Nav.tsx components/Footer.tsx app/layout.tsx app/page.tsx
git commit -m "feat: add layout shell with themed nav, footer and JSON-LD"
```

---

## Task 5: Full site copy

**Files:**
- Modify: `content/site.json` (expand every copy section to final wording)

**Interfaces:**
- Consumes: `lib/schema.ts` shape.
- Produces: the final content consumed by every route in Tasks 6–8.

**Source material:** the spec's §7 (approved copy, verbatim) and the research findings summarised in §6.2 and §6.3.

- [ ] **Step 1: Write the two approved copy blocks verbatim**

These were approved word-for-word and must not be paraphrased. In `content/site.json`:

```json
"newcomer": {
  "heading": "New to the Highlands. Not new to the work.",
  "paragraphs": [
    "Until now, getting a wheel properly machined around here meant packing it off to Wollongong or Sydney, paying for the freight, and waiting on a courier both ways.",
    "So we brought the machine to Bowral instead.",
    "Our CNC lathe is installed and cutting at Mount Road — not a partner's machine somewhere down the highway, not a job we quietly send out and mark up. When we say the work is done in-house, we mean in *this* house.",
    "We're the new name in Southern Highlands wheel repair, and we're setting out to be the one people recommend. The plan for getting there isn't complicated: do proper work, give straight answers, and hand back wheels people are pleased to put back on the car.",
    "Bring us something kerbed, buckled or cracked and let us show you."
  ]
},
"straightAnswers": {
  "heading": "We'll tell you if it's not worth it",
  "paragraphs": [
    "Here's something you won't read on many wheel repair websites: not every wheel can be saved. Funny how everyone else's site implies anything can be fixed, isn't it?",
    "Cracks in the spokes are a hard no — and not because we can't be bothered. The spokes carry every bit of your cornering and braking load, so welding them isn't just risky, it's not legal. Rim lip cracks are usually a different story and often perfectly repairable.",
    "Diamond-cut wheels are similar. Every re-cut takes a whisker of metal off the face, so there's a limit to how many times one wheel can go under the tool. We'll tell you where yours is at.",
    "You'll get a straight answer either way. Sometimes that answer is \"replace it\" — and we'd rather say so than take your money and hand back something we're not proud of."
  ]
}
```

- [ ] **Step 2: Write the seven services**

Each needs `id`, `title`, `summary`, `what`, `fixes`, `how`. Content drawn from research; no pricing, no timeframes.

```json
"services": [
  {
    "id": "cnc-diamond-cut",
    "title": "CNC Diamond-Cut Refinishing",
    "summary": "Machined-face wheels re-cut on the lathe to restore the original finish.",
    "what": "A diamond-cut finish is made by a lathe skimming bare aluminium to leave fine concentric cut lines under a coat of lacquer. It is a machined surface, not a paint effect.",
    "fixes": "Kerb damage across the machined face, lacquer peel, and the milky corrosion that creeps under a chipped clear coat.",
    "how": "The wheel is mounted on our CNC lathe and the face is cut back to the model's original profile, then re-lacquered. Hand polishing cannot reproduce that geometry — it has to be cut. Every re-cut removes a little metal, so there is a limit to how many times one wheel can go under the tool, and we'll tell you where yours sits."
  },
  {
    "id": "straightening",
    "title": "Wheel Straightening",
    "summary": "Buckles and flat spots corrected and trued.",
    "what": "Hydraulic correction of a rim bent out of round.",
    "fixes": "The vibration and wobble that follows a pothole or a hard kerb strike.",
    "how": "The wheel is measured for runout, heated and pressed back true, then re-checked on the machine to confirm it runs straight."
  },
  {
    "id": "crack-weld",
    "title": "Crack & Weld Repair",
    "summary": "Repairable cracks TIG welded, dressed and refinished.",
    "what": "Aluminium TIG welding of a cracked rim, followed by dressing the weld back to the original profile.",
    "fixes": "Cracks on the back or the middle of the rim lip, usually from an impact.",
    "how": "The crack is ground out, welded, dressed and refinished. Cracks through a spoke are the exception: the spokes carry your cornering and braking loads, and repairing them is not legal. We will tell you straight if that is what you have."
  },
  {
    "id": "refurbishment",
    "title": "Full Refurbishment",
    "summary": "Stripped back and rebuilt to a factory-quality finish.",
    "what": "A complete strip, repair and refinish of all four wheels or a single wheel.",
    "fixes": "Tired, oxidised, peeling or mismatched wheels.",
    "how": "Tyres off, weights and TPMS sensors removed, old finish stripped, damage repaired, then primed, coloured, cleared and oven cured."
  },
  {
    "id": "colour-change",
    "title": "Colour Changes & Custom Finishes",
    "summary": "Gloss, satin, matte, two-tone or machined face with an accent.",
    "what": "A full change of finish rather than a restoration of the original.",
    "fixes": "Wheels that are structurally fine but wrong for the car.",
    "how": "We match OEM colours where you want factory-correct, or work to a custom finish. Two-tone and machined-face-with-accent combinations are done on the lathe."
  },
  {
    "id": "gutter-rash",
    "title": "Gutter Rash & Kerb Damage",
    "summary": "The scuffed lip and face made good again.",
    "what": "Cosmetic repair of the outer lip and face after contact with a kerb.",
    "fixes": "The scraped, torn alloy along the rim edge that shows on every car park exit.",
    "how": "Damage is filled or machined back depending on depth, then refinished to match the rest of the wheel."
  },
  {
    "id": "tpms",
    "title": "TPMS Handling",
    "summary": "Tyre pressure sensors removed, protected and refitted properly.",
    "what": "Care of the tyre pressure monitoring sensors fitted inside most modern wheels.",
    "fixes": "The dashboard warning light that appears after a careless wheel refit.",
    "how": "Sensors are removed before stripping, kept clear of blasting and paint, then refitted or transferred and reset when the wheel goes back on."
  }
]
```

- [ ] **Step 3: Write the seven process steps**

Step 5 references the cutting video by setting its media `src` to the real asset; the others carry placeholder slots (C5).

```json
"process": [
  { "id": "assess", "step": 1, "title": "Assessment", "summary": "We look at the wheel properly before quoting.", "detail": "The wheel is inspected for runout, cracks and previous repairs. If it isn't worth repairing, we say so at this point rather than after you've paid.", "media": { "src": null, "alt": "A wheel being inspected on the bench", "shotNeeded": "Wheel being measured or inspected on the bench" } },
  { "id": "strip", "step": 2, "title": "Tyre Removal & Strip", "summary": "Back to bare metal.", "detail": "Tyre off, balance weights and TPMS sensor removed and set aside, then the old finish stripped so we can see exactly what we're working with.", "media": { "src": null, "alt": "A stripped bare alloy wheel", "shotNeeded": "Bare stripped wheel before repair" } },
  { "id": "straighten", "step": 3, "title": "Straightening", "summary": "Bends and buckles pressed back true.", "detail": "Buckles and flat spots are corrected hydraulically, then the wheel is re-measured to confirm it runs true.", "media": { "src": null, "alt": "A wheel being straightened", "shotNeeded": "Wheel on the straightening machine" } },
  { "id": "weld", "step": 4, "title": "Welding", "summary": "Repairable cracks welded and dressed.", "detail": "Cracks on the back or middle of the rim are ground out, TIG welded and dressed back to profile. Spoke cracks are not repaired.", "media": { "src": null, "alt": "TIG welding a rim", "shotNeeded": "TIG welding in progress on a rim" } },
  { "id": "machine", "step": 5, "title": "CNC Machining", "summary": "The face cut back to its original profile.", "detail": "The wheel is chucked on the lathe and the face is machined to the model's original profile, restoring the fine concentric cut lines that make a diamond-cut finish what it is.", "media": { "src": "/assets/video-cutting.mp4", "alt": "A wheel being machined on the CNC lathe", "shotNeeded": "" } },
  { "id": "finish", "step": 6, "title": "Finishing", "summary": "Primed, coloured, cleared and cured.", "detail": "Primer, colour and clear coat are applied and oven cured for a finish that holds up to Highlands weather and road salt.", "media": { "src": null, "alt": "A wheel in the spray booth", "shotNeeded": "Wheel in the booth being sprayed" } },
  { "id": "refit", "step": 7, "title": "Balance & Refit", "summary": "Back on the car, balanced and torqued.", "detail": "Tyre refitted, the wheel balanced, TPMS sensor refitted and reset, and everything torqued to the manufacturer's specification.", "media": { "src": null, "alt": "A finished wheel being refitted", "shotNeeded": "Finished wheel being refitted to the car" } }
]
```

**The `media.shotNeeded` for step 5 is an empty string** because a real asset is supplied. The schema requires `min(1)` on `shotNeeded`; therefore set step 5's `media` object to use a non-empty `shotNeeded` of `"Supplied: CNC lathe cutting footage"` to satisfy validation while documenting provenance. Update the JSON accordingly — do not relax the schema.

- [ ] **Step 4: Write home, about, workshop, whyUs, gallery, contactPage and seo sections**

- `home.heroHeadline`: `["Precision", "CNC Wheel Repair"]`
- `home.heroSub`: `"Machined, straightened and refinished in-house in Bowral."`
- `home.trust` (exactly 4, no numbers per C7): in-house CNC machining · Southern Highlands local · OEM colour matching · workmanship guarantee.
- `home.damage` (exactly 6): kerb & gutter rash · buckles & bends · cracks · corrosion & lacquer peel · diamond-cut face damage · tired or wrong colour.
- `home.damageIntro` and `home.resultBlock`: short copy blocks introducing the damage grid and the finished-wheel video.
- `workshop`: heading `"The Workshop"`, paragraphs describing the HL24 lathe on site at Mount Road.
- `whyUs` (≥3): machining done here, not sent away · direct dealing with the people doing the work · an honest assessment including when to say no.
- `about.story`: the story block, distinct from `newcomer`.
- `gallery` (≥4, one per category) with placeholder media slots.
- `contactPage.intro` and `formNote` — the note must prompt for photos and must not promise a response time (C8).
- `seo`: one entry per route key — `home`, `about`, `services`, `process`, `gallery`, `contact` — each with `title` and `description`, using local keywords Bowral, Mittagong, Moss Vale, Southern Highlands.

- [ ] **Step 5: Run the constraint tests**

Run: `npm test`
Expected: PASS — all 8 tests, now against the full copy. If C8 fails, find the timeframe phrase and remove it. If C7 fails, find the number-plus-"reviews" phrasing and remove it.

- [ ] **Step 6: Verify the schema still accepts the content**

Run: `npx next build`
Expected: build succeeds. A Zod failure surfaces here as a thrown error listing the offending paths.

- [ ] **Step 7: Commit**

```bash
git add content/site.json
git commit -m "feat: write full site copy including approved positioning and honesty sections"
```

---

## Task 6: Home page

**Files:**
- Create: `components/Hero.tsx`
- Modify: `app/page.tsx` (replace the scaffold body)

**Interfaces:**
- Consumes: `site`; `VideoFrame`, `MediaPlaceholder`, `SectionHeader`, `Card`, `Reveal`, `Prose`, `CTABanner`; `resolveTheme`, `logoPath`.
- Produces: `Hero` — props `{ logoSrc: string }`.

- [ ] **Step 1: Write `components/Hero.tsx`**

```tsx
import Image from 'next/image';
import Link from 'next/link';
import VideoFrame from './VideoFrame';
import { site } from '@/lib/content';

export default function Hero({ logoSrc }: { logoSrc: string }) {
  return (
    <section className="texture-carbon bg-mesh relative overflow-hidden bg-[var(--base-deep)] py-[var(--section-pad)]">
      <div className="mx-auto grid max-w-[var(--content-max)] items-center gap-12 px-6 lg:grid-cols-[1.15fr_0.85fr]">
        <div>
          <Image
            src={logoSrc}
            alt={site.business.name}
            width={128}
            height={128}
            priority
            className="mb-8 rounded-lg"
          />
          <h1 className="font-[family-name:var(--font-display)] text-[clamp(2.8rem,8vw,5.5rem)] leading-[1.03] tracking-wide">
            {site.home.heroHeadline.map((line, i) => (
              <span key={i} className={i === 0 ? 'block text-[var(--accent)]' : 'chrome-text block'}>
                {line}
              </span>
            ))}
          </h1>
          <p className="mt-6 max-w-[46ch] text-lg text-[var(--color-chrome)]">{site.home.heroSub}</p>
          <div className="mt-9 flex flex-wrap gap-4">
            <Link
              href="/contact"
              className="rounded-md bg-[var(--accent)] px-7 py-3 font-[family-name:var(--font-heading)] text-sm uppercase tracking-[0.12em] text-white transition-colors hover:bg-[var(--accent-bright)]"
            >
              {site.quoteCta.label}
            </Link>
            <a
              href={site.contact.phoneHref}
              className="rounded-md border border-[var(--border-accent)] px-7 py-3 font-[family-name:var(--font-heading)] text-sm uppercase tracking-[0.12em] text-[var(--color-ink)] transition-colors hover:border-[var(--accent)]"
            >
              {site.contact.phone}
            </a>
          </div>
        </div>

        <VideoFrame
          src="/assets/video-cutting.mp4"
          poster="/assets/poster-cutting.jpg"
          label="A wheel being machined on our CNC lathe"
          className="mx-auto w-full max-w-[320px]"
        />
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Write `app/page.tsx`**

```tsx
import Link from 'next/link';
import Hero from '@/components/Hero';
import SectionHeader from '@/components/SectionHeader';
import Card from '@/components/Card';
import Reveal from '@/components/Reveal';
import Prose from '@/components/Prose';
import VideoFrame from '@/components/VideoFrame';
import CTABanner from '@/components/CTABanner';
import { site } from '@/lib/content';
import { resolveTheme, logoPath } from '@/lib/theme';

export default function Home() {
  const logo = logoPath(resolveTheme());

  return (
    <>
      <Hero logoSrc={logo} />

      {/* Trust strip — capability claims only, no numbers (C7) */}
      <section className="border-y border-[var(--border-subtle)] bg-[var(--surface)] py-10">
        <div className="mx-auto grid max-w-[var(--content-max)] gap-6 px-6 sm:grid-cols-2 lg:grid-cols-4">
          {site.home.trust.map((t, i) => (
            <Reveal key={t.id} delay={i * 70}>
              <p className="font-[family-name:var(--font-heading)] text-sm uppercase tracking-[0.12em] text-[var(--accent)]">
                {t.title}
              </p>
              <p className="mt-1 text-sm text-[var(--color-steel)]">{t.summary}</p>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Damage types */}
      <section className="bg-[var(--base)] py-[var(--section-pad)]">
        <div className="mx-auto max-w-[var(--content-max)] px-6">
          <Reveal>
            <SectionHeader
              eyebrow="What we fix"
              title={site.home.damageIntro.heading}
              description={site.home.damageIntro.paragraphs[0]}
              center
            />
          </Reveal>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {site.home.damage.map((d, i) => (
              <Reveal key={d.id} delay={i * 60}>
                <Card title={d.title}>{d.summary}</Card>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Services overview */}
      <section className="bg-mesh bg-[var(--base-deep)] py-[var(--section-pad)]">
        <div className="mx-auto max-w-[var(--content-max)] px-6">
          <Reveal>
            <SectionHeader eyebrow="Services" title="What we do" center />
          </Reveal>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {site.services.map((s, i) => (
              <Reveal key={s.id} delay={i * 50}>
                <Link href="/services" className="block h-full">
                  <Card title={s.title} className="h-full">
                    {s.summary}
                  </Card>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* New to the Highlands */}
      <section className="texture-carbon bg-[var(--base)] py-[var(--section-pad)]">
        <div className="mx-auto max-w-[var(--content-max)] px-6">
          <Reveal>
            <Prose block={site.newcomer} />
          </Reveal>
        </div>
      </section>

      {/* Process teaser */}
      <section className="bg-[var(--base-deep)] py-[var(--section-pad)]">
        <div className="mx-auto max-w-[var(--content-max)] px-6">
          <Reveal>
            <SectionHeader eyebrow="Process" title="How a wheel gets fixed" center />
          </Reveal>
          <ol className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {site.process.map((p, i) => (
              <Reveal key={p.id} delay={i * 50}>
                <li className="rounded-lg border border-[var(--border-subtle)] bg-[var(--surface)] p-5">
                  <span className="font-[family-name:var(--font-display)] text-3xl text-[var(--accent)]">
                    {String(p.step).padStart(2, '0')}
                  </span>
                  <p className="mt-2 font-[family-name:var(--font-heading)] text-sm uppercase tracking-wide">
                    {p.title}
                  </p>
                  <p className="mt-1 text-xs text-[var(--color-steel)]">{p.summary}</p>
                </li>
              </Reveal>
            ))}
          </ol>
          <div className="mt-10 text-center">
            <Link
              href="/process"
              className="font-[family-name:var(--font-heading)] text-sm uppercase tracking-[0.12em] text-[var(--accent)] hover:text-[var(--accent-bright)]"
            >
              See the full process →
            </Link>
          </div>
        </div>
      </section>

      {/* The Result */}
      <section className="bg-[var(--base)] py-[var(--section-pad)]">
        <div className="mx-auto grid max-w-[var(--content-max)] items-center gap-12 px-6 lg:grid-cols-[0.85fr_1.15fr]">
          <Reveal>
            <VideoFrame
              src="/assets/video-finished.mp4"
              poster="/assets/poster-finished.jpg"
              label="A finished diamond-cut wheel"
              className="mx-auto w-full max-w-[300px]"
            />
          </Reveal>
          <Reveal delay={90}>
            <Prose block={site.home.resultBlock} />
          </Reveal>
        </div>
      </section>

      {/* Straight answers */}
      <section className="bg-mesh bg-[var(--base-deep)] py-[var(--section-pad)]">
        <div className="mx-auto max-w-[var(--content-max)] px-6">
          <Reveal>
            <Prose block={site.straightAnswers} />
          </Reveal>
        </div>
      </section>

      <CTABanner />
    </>
  );
}
```

- [ ] **Step 3: Build and check visually**

```bash
npm run dev
```

Verify at `http://localhost:3000`:
- Hero video plays muted and loops, **with no grey bars either side** (the V2 gate).
- All six damage cards and seven service cards render.
- Both `Prose` blocks show, with "*this* house" rendered as emphasis, not literal asterisks.
- Page scrolls without horizontal overflow at 360 px width.

- [ ] **Step 4: Commit**

```bash
git add components/Hero.tsx app/page.tsx
git commit -m "feat: build home page with hero video and full section composition"
```

---

## Task 7: About, Services, Process pages

**Files:**
- Create: `app/about/page.tsx`, `app/services/page.tsx`, `app/process/page.tsx`
- Create: `components/ProcessStep.tsx`

**Interfaces:**
- Consumes: `site`; all primitives from Task 3.
- Produces: `ProcessStep` — props `{ step: ProcessStepT; index: number }`.

- [ ] **Step 1: Write `components/ProcessStep.tsx`**

```tsx
import MediaPlaceholder from './MediaPlaceholder';
import VideoFrame from './VideoFrame';
import Reveal from './Reveal';
import type { ProcessStepT } from '@/lib/schema';

const POSTER: Record<string, string> = {
  '/assets/video-cutting.mp4': '/assets/poster-cutting.jpg',
  '/assets/video-finished.mp4': '/assets/poster-finished.jpg',
};

export default function ProcessStep({ step, index }: { step: ProcessStepT; index: number }) {
  const flip = index % 2 === 1;
  const media = step.media;
  const isVideo = media?.src?.endsWith('.mp4') ?? false;

  return (
    <Reveal>
      <div className={`grid items-center gap-8 lg:grid-cols-2 ${flip ? 'lg:[&>*:first-child]:order-2' : ''}`}>
        <div>
          <span className="font-[family-name:var(--font-display)] text-5xl text-[var(--accent)]">
            {String(step.step).padStart(2, '0')}
          </span>
          <h3 className="mt-2 font-[family-name:var(--font-display)] text-3xl tracking-wide">{step.title}</h3>
          <p className="mt-3 max-w-[54ch] text-[var(--color-steel)]">{step.detail}</p>
        </div>
        <div>
          {media && media.src && isVideo ? (
            <VideoFrame
              src={media.src}
              poster={POSTER[media.src] ?? '/assets/poster-cutting.jpg'}
              label={media.alt}
              className="mx-auto w-full max-w-[260px]"
            />
          ) : (
            <MediaPlaceholder shotNeeded={media?.shotNeeded ?? 'Workshop photo'} aspect="video" />
          )}
        </div>
      </div>
    </Reveal>
  );
}
```

- [ ] **Step 2: Write `app/process/page.tsx`**

```tsx
import type { Metadata } from 'next';
import SectionHeader from '@/components/SectionHeader';
import ProcessStep from '@/components/ProcessStep';
import CTABanner from '@/components/CTABanner';
import Reveal from '@/components/Reveal';
import { site } from '@/lib/content';

export const metadata: Metadata = {
  title: site.seo.process.title,
  description: site.seo.process.description,
};

export default function ProcessPage() {
  return (
    <>
      <section className="texture-carbon bg-mesh bg-[var(--base-deep)] py-[var(--section-pad)]">
        <div className="mx-auto max-w-[var(--content-max)] px-6">
          <Reveal>
            <SectionHeader
              eyebrow="Our process"
              title="From drop-off to back on the car"
              description="Seven stages. Every wheel goes through the ones it needs, and none it doesn't."
              center
            />
          </Reveal>
        </div>
      </section>

      <section className="bg-[var(--base)] py-[var(--section-pad)]">
        <div className="mx-auto flex max-w-[var(--content-max)] flex-col gap-20 px-6">
          {site.process.map((step, i) => (
            <ProcessStep key={step.id} step={step} index={i} />
          ))}
        </div>
      </section>

      <CTABanner heading="Bring us a wheel" />
    </>
  );
}
```

**No timeframes on this page** (C8).

- [ ] **Step 3: Write `app/services/page.tsx`**

```tsx
import type { Metadata } from 'next';
import SectionHeader from '@/components/SectionHeader';
import CTABanner from '@/components/CTABanner';
import Reveal from '@/components/Reveal';
import { site } from '@/lib/content';

export const metadata: Metadata = {
  title: site.seo.services.title,
  description: site.seo.services.description,
};

export default function ServicesPage() {
  return (
    <>
      <section className="texture-carbon bg-mesh bg-[var(--base-deep)] py-[var(--section-pad)]">
        <div className="mx-auto max-w-[var(--content-max)] px-6">
          <Reveal>
            <SectionHeader
              eyebrow="Services"
              title="What we can do with your wheels"
              description={site.quoteCta.note}
              center
            />
          </Reveal>
        </div>
      </section>

      <section className="bg-[var(--base)] py-[var(--section-pad)]">
        <div className="mx-auto flex max-w-[var(--content-max)] flex-col gap-14 px-6">
          {site.services.map((s) => (
            <Reveal key={s.id}>
              <article className="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface)] p-8">
                <h2 className="font-[family-name:var(--font-display)] text-3xl tracking-wide text-[var(--color-ink)]">
                  {s.title}
                </h2>
                <p className="mt-2 text-[var(--color-chrome)]">{s.summary}</p>
                <dl className="mt-6 grid gap-6 sm:grid-cols-3">
                  <div>
                    <dt className="font-[family-name:var(--font-heading)] text-xs uppercase tracking-[0.18em] text-[var(--accent)]">
                      What it is
                    </dt>
                    <dd className="mt-2 text-sm text-[var(--color-steel)]">{s.what}</dd>
                  </div>
                  <div>
                    <dt className="font-[family-name:var(--font-heading)] text-xs uppercase tracking-[0.18em] text-[var(--accent)]">
                      What it fixes
                    </dt>
                    <dd className="mt-2 text-sm text-[var(--color-steel)]">{s.fixes}</dd>
                  </div>
                  <div>
                    <dt className="font-[family-name:var(--font-heading)] text-xs uppercase tracking-[0.18em] text-[var(--accent)]">
                      How it's done
                    </dt>
                    <dd className="mt-2 text-sm text-[var(--color-steel)]">{s.how}</dd>
                  </div>
                </dl>
              </article>
            </Reveal>
          ))}
        </div>
      </section>

      <CTABanner />
    </>
  );
}
```

- [ ] **Step 4: Write `app/about/page.tsx`**

The lathe photo goes here, full-width. **No team section, no names** (C6).

```tsx
import type { Metadata } from 'next';
import Image from 'next/image';
import SectionHeader from '@/components/SectionHeader';
import Prose from '@/components/Prose';
import Card from '@/components/Card';
import Reveal from '@/components/Reveal';
import CTABanner from '@/components/CTABanner';
import { site } from '@/lib/content';

export const metadata: Metadata = {
  title: site.seo.about.title,
  description: site.seo.about.description,
};

export default function AboutPage() {
  return (
    <>
      <section className="texture-carbon bg-mesh bg-[var(--base-deep)] py-[var(--section-pad)]">
        <div className="mx-auto max-w-[var(--content-max)] px-6">
          <Reveal>
            <Prose block={site.newcomer} />
          </Reveal>
        </div>
      </section>

      {/* The Workshop — the HL24 lathe */}
      <section className="bg-[var(--base)] py-[var(--section-pad)]">
        <div className="mx-auto max-w-[var(--content-max)] px-6">
          <Reveal>
            <SectionHeader eyebrow="The workshop" title={site.workshop.heading} />
          </Reveal>
          <Reveal delay={80}>
            <figure className="overflow-hidden rounded-xl border border-[var(--border-accent)]">
              <Image
                src="/assets/lathe.jpg"
                alt="Our CNC wheel lathe installed in the Bowral workshop"
                width={1800}
                height={1350}
                className="h-auto w-full"
                sizes="(max-width: 1200px) 100vw, 1200px"
              />
              <figcaption className="bg-[var(--surface)] px-5 py-3 text-sm text-[var(--color-steel)]">
                Our CNC wheel lathe, installed at Mount Road, Bowral.
              </figcaption>
            </figure>
          </Reveal>
          <Reveal delay={140}>
            <div className="mt-10">
              <Prose block={site.workshop} />
            </div>
          </Reveal>
        </div>
      </section>

      <section className="bg-[var(--base-deep)] py-[var(--section-pad)]">
        <div className="mx-auto max-w-[var(--content-max)] px-6">
          <Reveal>
            <SectionHeader eyebrow="Why us" title="What you get" center />
          </Reveal>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {site.whyUs.map((w, i) => (
              <Reveal key={w.id} delay={i * 60}>
                <Card title={w.title}>{w.summary}</Card>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="texture-carbon bg-[var(--base)] py-[var(--section-pad)]">
        <div className="mx-auto max-w-[var(--content-max)] px-6">
          <Reveal>
            <Prose block={site.straightAnswers} />
          </Reveal>
        </div>
      </section>

      <CTABanner />
    </>
  );
}
```

- [ ] **Step 5: Build and verify all three routes**

Run: `npx next build && npm run dev`

Check `/about`, `/services`, `/process`: lathe photo legible, all seven services with three-column detail, seven process steps alternating sides, step 5 showing the cutting video with no grey bars.

- [ ] **Step 6: Commit**

```bash
git add components/ProcessStep.tsx app/about app/services app/process
git commit -m "feat: add about, services and process pages"
```

---

## Task 8: Gallery, Contact, quote form and API route

**Files:**
- Create: `app/gallery/page.tsx`, `app/contact/page.tsx`, `app/api/contact/route.ts`
- Create: `components/QuoteForm.tsx`
- Create: `app/sitemap.ts`, `app/robots.ts`

**Interfaces:**
- Consumes: `site`; primitives from Task 3.
- Produces: `QuoteForm` (no props); `POST /api/contact` accepting `{ name, phone, email, vehicle, wheelSize, damageType, message }` and returning `{ ok: boolean; mode: 'webhook' | 'fallback'; error?: string }`.

- [ ] **Step 1: Write `app/gallery/page.tsx`**

```tsx
'use client';

import { useState } from 'react';
import MediaPlaceholder from '@/components/MediaPlaceholder';
import VideoFrame from '@/components/VideoFrame';
import SectionHeader from '@/components/SectionHeader';
import Reveal from '@/components/Reveal';
import { site } from '@/lib/content';

const CATEGORIES = [
  { id: 'all', label: 'All' },
  { id: 'diamond-cut', label: 'Diamond Cut' },
  { id: 'straightening', label: 'Straightening' },
  { id: 'refurbishment', label: 'Refurbishment' },
  { id: 'custom-colour', label: 'Custom Colour' },
] as const;

export default function GalleryPage() {
  const [active, setActive] = useState<string>('all');
  const items = active === 'all' ? site.gallery : site.gallery.filter((g) => g.category === active);

  return (
    <>
      <section className="texture-carbon bg-mesh bg-[var(--base-deep)] py-[var(--section-pad)]">
        <div className="mx-auto max-w-[var(--content-max)] px-6">
          <Reveal>
            <SectionHeader eyebrow="Our work" title="Wheels off the lathe" center />
          </Reveal>
          <Reveal delay={80}>
            <VideoFrame
              src="/assets/video-finished.mp4"
              poster="/assets/poster-finished.jpg"
              label="A finished diamond-cut wheel"
              className="mx-auto w-full max-w-[300px]"
            />
          </Reveal>
        </div>
      </section>

      <section className="bg-[var(--base)] py-[var(--section-pad)]">
        <div className="mx-auto max-w-[var(--content-max)] px-6">
          <div className="mb-10 flex flex-wrap justify-center gap-3">
            {CATEGORIES.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => setActive(c.id)}
                aria-pressed={active === c.id}
                className={`rounded-md border px-4 py-2 font-[family-name:var(--font-heading)] text-xs uppercase tracking-[0.14em] transition-colors ${
                  active === c.id
                    ? 'border-[var(--accent)] bg-[var(--accent)] text-white'
                    : 'border-[var(--border-subtle)] text-[var(--color-steel)] hover:border-[var(--accent)]'
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((g) => (
              <figure key={g.id}>
                <MediaPlaceholder shotNeeded={g.media.shotNeeded} aspect="square" />
                <figcaption className="mt-3 text-sm text-[var(--color-steel)]">{g.caption}</figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
```

Because this is a client component, its metadata cannot be exported here. Add `app/gallery/layout.tsx`:

```tsx
import type { Metadata } from 'next';
import { site } from '@/lib/content';

export const metadata: Metadata = {
  title: site.seo.gallery.title,
  description: site.seo.gallery.description,
};

export default function GalleryLayout({ children }: { children: React.ReactNode }) {
  return children;
}
```

- [ ] **Step 2: Write `components/QuoteForm.tsx`**

```tsx
'use client';

import { useState } from 'react';
import { site } from '@/lib/content';

type Status = 'idle' | 'sending' | 'sent' | 'error';

const FIELD =
  'w-full rounded-md border border-[var(--border-subtle)] bg-[var(--base-deep)] px-4 py-3 text-sm text-[var(--color-ink)] outline-none transition-colors focus:border-[var(--accent)]';

export default function QuoteForm() {
  const [status, setStatus] = useState<Status>('idle');
  const [error, setError] = useState('');

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus('sending');
    setError('');
    const data = Object.fromEntries(new FormData(e.currentTarget));
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!res.ok || !json.ok) throw new Error(json.error ?? 'Could not send your enquiry.');
      setStatus('sent');
    } catch (err) {
      setStatus('error');
      setError(err instanceof Error ? err.message : 'Something went wrong.');
    }
  }

  if (status === 'sent') {
    return (
      <div className="rounded-xl border border-[var(--border-accent)] bg-[var(--surface)] p-8">
        <h3 className="font-[family-name:var(--font-display)] text-2xl">Thanks — that's come through.</h3>
        <p className="mt-3 text-[var(--color-steel)]">
          We'll take a look and get back to you. If it's urgent, give us a ring on{' '}
          <a href={site.contact.phoneHref} className="text-[var(--accent)]">
            {site.contact.phone}
          </a>
          .
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="grid gap-2">
          <span className="font-[family-name:var(--font-heading)] text-xs uppercase tracking-[0.16em] text-[var(--color-chrome)]">
            Name
          </span>
          <input name="name" required autoComplete="name" className={FIELD} />
        </label>
        <label className="grid gap-2">
          <span className="font-[family-name:var(--font-heading)] text-xs uppercase tracking-[0.16em] text-[var(--color-chrome)]">
            Phone
          </span>
          <input name="phone" required autoComplete="tel" inputMode="tel" className={FIELD} />
        </label>
      </div>

      <label className="grid gap-2">
        <span className="font-[family-name:var(--font-heading)] text-xs uppercase tracking-[0.16em] text-[var(--color-chrome)]">
          Email
        </span>
        <input name="email" type="email" required autoComplete="email" className={FIELD} />
      </label>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="grid gap-2">
          <span className="font-[family-name:var(--font-heading)] text-xs uppercase tracking-[0.16em] text-[var(--color-chrome)]">
            Vehicle
          </span>
          <input name="vehicle" placeholder="e.g. 2019 Subaru Forester" className={FIELD} />
        </label>
        <label className="grid gap-2">
          <span className="font-[family-name:var(--font-heading)] text-xs uppercase tracking-[0.16em] text-[var(--color-chrome)]">
            Wheel size
          </span>
          <input name="wheelSize" placeholder="e.g. 18 inch" className={FIELD} />
        </label>
      </div>

      <label className="grid gap-2">
        <span className="font-[family-name:var(--font-heading)] text-xs uppercase tracking-[0.16em] text-[var(--color-chrome)]">
          Damage
        </span>
        <select name="damageType" className={FIELD} defaultValue="">
          <option value="" disabled>
            Select the closest match
          </option>
          {site.home.damage.map((d) => (
            <option key={d.id} value={d.title}>
              {d.title}
            </option>
          ))}
          <option value="Not sure">Not sure</option>
        </select>
      </label>

      <label className="grid gap-2">
        <span className="font-[family-name:var(--font-heading)] text-xs uppercase tracking-[0.16em] text-[var(--color-chrome)]">
          Tell us about it
        </span>
        <textarea name="message" rows={5} required className={FIELD} />
      </label>

      <p className="text-xs text-[var(--color-steel)]">{site.contactPage.formNote}</p>

      {status === 'error' ? <p className="text-sm text-[var(--accent-bright)]">{error}</p> : null}

      <button
        type="submit"
        disabled={status === 'sending'}
        className="justify-self-start rounded-md bg-[var(--accent)] px-7 py-3 font-[family-name:var(--font-heading)] text-sm uppercase tracking-[0.12em] text-white transition-colors hover:bg-[var(--accent-bright)] disabled:opacity-60"
      >
        {status === 'sending' ? 'Sending…' : site.quoteCta.label}
      </button>
    </form>
  );
}
```

- [ ] **Step 3: Write `app/api/contact/route.ts`**

This implements the BusinessBrain contact contract with a graceful fallback, so the form works before the site is registered and gains CRM integration afterwards with no code change.

```ts
import { NextResponse } from 'next/server';
import { z } from 'zod';

const Submission = z.object({
  name: z.string().min(1).max(120),
  phone: z.string().min(6).max(40),
  email: z.string().email().max(160),
  vehicle: z.string().max(160).optional().default(''),
  wheelSize: z.string().max(60).optional().default(''),
  damageType: z.string().max(80).optional().default(''),
  message: z.string().min(1).max(4000),
});

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: 'Invalid request.' }, { status: 400 });
  }

  const parsed = Submission.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: 'Please check the form and try again.' },
      { status: 422 },
    );
  }

  const tenantId = process.env.BB_TENANT_ID;
  const secret = process.env.BB_WEBHOOK_SECRET;
  const url = process.env.BB_WEBHOOK_URL;

  // Until the site is registered on the platform, these are unset. Accept the
  // submission and log it rather than failing — the form must work from day one.
  if (!tenantId || !secret || !url) {
    console.info('[contact] platform webhook not configured; submission accepted in fallback mode', {
      name: parsed.data.name,
      email: parsed.data.email,
    });
    return NextResponse.json({ ok: true, mode: 'fallback' });
  }

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-bb-tenant-id': tenantId,
        'x-bb-webhook-secret': secret,
      },
      body: JSON.stringify({
        source: 'bowral-wheel-repairs',
        submittedAt: new Date().toISOString(),
        ...parsed.data,
      }),
    });

    if (!res.ok) {
      console.error('[contact] webhook rejected', res.status);
      return NextResponse.json(
        { ok: false, error: 'We could not send that. Please call us instead.' },
        { status: 502 },
      );
    }

    return NextResponse.json({ ok: true, mode: 'webhook' });
  } catch (err) {
    console.error('[contact] webhook error', err);
    return NextResponse.json(
      { ok: false, error: 'We could not send that. Please call us instead.' },
      { status: 502 },
    );
  }
}
```

- [ ] **Step 4: Write `app/contact/page.tsx`**

```tsx
import type { Metadata } from 'next';
import SectionHeader from '@/components/SectionHeader';
import QuoteForm from '@/components/QuoteForm';
import Reveal from '@/components/Reveal';
import { site } from '@/lib/content';

export const metadata: Metadata = {
  title: site.seo.contact.title,
  description: site.seo.contact.description,
};

const MAP_SRC =
  'https://www.google.com/maps?q=8+Mount+Rd,+Bowral+NSW+2576&output=embed';

export default function ContactPage() {
  return (
    <>
      <section className="texture-carbon bg-mesh bg-[var(--base-deep)] py-[var(--section-pad)]">
        <div className="mx-auto max-w-[var(--content-max)] px-6">
          <Reveal>
            <SectionHeader
              eyebrow="Contact"
              title={site.contactPage.intro.heading}
              description={site.contactPage.intro.paragraphs[0]}
              center
            />
          </Reveal>
        </div>
      </section>

      <section className="bg-[var(--base)] py-[var(--section-pad)]">
        <div className="mx-auto grid max-w-[var(--content-max)] gap-12 px-6 lg:grid-cols-[1fr_0.8fr]">
          <Reveal>
            <QuoteForm />
          </Reveal>

          <Reveal delay={90}>
            <div className="grid gap-6">
              <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface)] p-6">
                <h3 className="mb-4 font-[family-name:var(--font-heading)] text-sm uppercase tracking-[0.18em] text-[var(--accent)]">
                  Find us
                </h3>
                <p className="text-sm text-[var(--color-steel)]">
                  {site.contact.street}
                  <br />
                  {site.contact.locality} {site.contact.region} {site.contact.postcode}
                </p>
                <p className="mt-4 text-sm">
                  <a href={site.contact.phoneHref} className="text-[var(--accent)]">
                    {site.contact.phone}
                  </a>
                  <br />
                  <a href={`mailto:${site.contact.email}`} className="text-[var(--color-steel)]">
                    {site.contact.email}
                  </a>
                </p>
                <p className="mt-4 text-sm text-[var(--color-steel)]">{site.contact.hours}</p>
              </div>

              <div className="overflow-hidden rounded-xl border border-[var(--border-subtle)]">
                <iframe
                  src={MAP_SRC}
                  title="Map showing our Bowral workshop"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  className="h-[320px] w-full border-0"
                />
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
```

- [ ] **Step 5: Write `app/sitemap.ts` and `app/robots.ts`**

```ts
// app/sitemap.ts
import type { MetadataRoute } from 'next';

const BASE = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://bowralwheelrepairs.com.au';

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = ['', '/about', '/services', '/process', '/gallery', '/contact'];
  return routes.map((r) => ({
    url: `${BASE}${r}`,
    lastModified: new Date(),
    changeFrequency: 'monthly',
    priority: r === '' ? 1 : 0.7,
  }));
}
```

```ts
// app/robots.ts
import type { MetadataRoute } from 'next';

const BASE = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://bowralwheelrepairs.com.au';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: '*', allow: '/' }],
    sitemap: `${BASE}/sitemap.xml`,
  };
}
```

- [ ] **Step 6: Test the contact route's fallback path**

With `BB_*` env vars unset, start the dev server and submit the form.
Expected: HTTP 200, `{"ok":true,"mode":"fallback"}`, the success panel renders, and the server logs `platform webhook not configured`. This is verification gate V13.

Also verify rejection:

```bash
curl -s -X POST http://localhost:3000/api/contact -H 'content-type: application/json' -d '{"name":""}' -o - -w '\n%{http_code}\n'
```

Expected: `422` with `{"ok":false,...}`.

- [ ] **Step 7: Commit**

```bash
git add app/gallery app/contact app/api components/QuoteForm.tsx app/sitemap.ts app/robots.ts
git commit -m "feat: add gallery, contact page, quote form and platform-ready contact API"
```

---

## Task 9: Constraint verification tests

**Files:**
- Create: `tests/constraints.test.mjs`

**Interfaces:**
- Consumes: the built output in `.next/` and all source files.
- Produces: an automated gate for C1, C2, C4, C7 and C8 across the whole codebase, not just `site.json`.

**Why this exists separately from Task 1's tests:** Task 1 checks the content file. This checks *everything shipped* — component copy, metadata, alt text and comments — because a constraint violation hand-typed into a `.tsx` file would pass the content test.

- [ ] **Step 1: Write the test**

```js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, extname } from 'node:path';

const ROOT = new URL('..', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1');
const SKIP_DIRS = new Set(['node_modules', '.next', '.git', 'out', 'research', 'docs', '.vercel']);
const EXTS = new Set(['.ts', '.tsx', '.js', '.mjs', '.json', '.css']);

function sourceFiles(dir = ROOT, acc = []) {
  for (const entry of readdirSync(dir)) {
    if (SKIP_DIRS.has(entry)) continue;
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) sourceFiles(full, acc);
    else if (EXTS.has(extname(entry)) && entry !== 'package-lock.json') acc.push(full);
  }
  return acc;
}

const files = sourceFiles();
const corpus = files.map((f) => ({ f, text: readFileSync(f, 'utf8') }));

function offenders(re) {
  return corpus.filter(({ text }) => re.test(text)).map(({ f }) => f.replace(ROOT, ''));
}

test('source tree is non-empty', () => {
  assert.ok(files.length > 10, `only found ${files.length} files`);
});

test('C1: no pricing figures in any shipped source', () => {
  assert.deepEqual(offenders(/\$\s?\d/), []);
});

test('C2: no reference to the co-located business', () => {
  assert.deepEqual(offenders(/body\s?shop/i), []);
  assert.deepEqual(offenders(/mittagong\s+smash/i), []);
});

test('C3: only approved logo assets are referenced', () => {
  const bad = offenders(/logo\.png|bodyshop/i);
  assert.deepEqual(bad, []);
});

test('C4: no competitor domains referenced outside research/', () => {
  assert.deepEqual(offenders(/cncwheels|spotonwheel|highlandsdetailing/i), []);
});

test('C7: no fabricated ratings, review counts or aggregateRating', () => {
  assert.deepEqual(offenders(/aggregateRating/), []);
  assert.deepEqual(offenders(/\b\d+(\.\d+)?\s*(star|★)/i), []);
  assert.deepEqual(offenders(/\b\d+\+?\s*(google\s+)?reviews?\b/i), []);
});

test('C8: no committed turnaround times', () => {
  const re = /\b\d+\s*(hour|hr|day|week)s?\b|same[-\s]day|24[-\s]?48/i;
  assert.deepEqual(offenders(re), []);
});

test('no exclusivity positioning claim', () => {
  assert.deepEqual(offenders(/only\s+cnc|the\s+only\s+wheel/i), []);
});
```

- [ ] **Step 2: Run it**

Run: `npm test`
Expected: PASS on all tests in both files.

If C8 trips on a legitimate string (for example a CSS `transition: 2s` is not matched by the regex, but a copy phrase like "within 3 days" would be), fix the copy — do not loosen the regex. If a false positive is genuinely unavoidable, narrow the pattern rather than deleting the test, and note why in a comment.

- [ ] **Step 3: Commit**

```bash
git add tests/constraints.test.mjs
git commit -m "test: add whole-tree constraint gates for pricing, naming and turnaround claims"
```

---

## Task 10: Verify both variants, then deploy

**Files:**
- Create: `README.md`
- Create: `.env.example`

**Interfaces:**
- Consumes: everything.
- Produces: two live Vercel URLs.

- [ ] **Step 1: Run the full verification matrix**

Execute each and record the actual result. **Do not report any of these as passing without seeing the output.**

```bash
npm test                                    # V5, V6, V7, V8, V15 — constraint gates
npx tsc --noEmit                            # V16 — types
npx next build                              # V1, V12, V16 — red build + content schema
NEXT_PUBLIC_THEME=graphite npx next build   # V1 — graphite build
```

Then start the server for each theme and check visually:

| Gate | Check |
|---|---|
| V1 | All 6 routes render, no console errors, both themes |
| V2 | Both videos autoplay muted, loop, **no pillarbox grey bars** |
| V3 | Lathe photo present and legible on `/about` |
| V4 | Red logo: chrome, wheels and white text preserved at 44 / 128 / full px |
| V9 | No broken links or 404 assets (check the network panel) |
| V10 | No horizontal overflow at 360, 768, 1440 px |
| V11 | Body text contrast ≥ 4.5:1 in both themes |
| V13 | Contact form succeeds with `BB_*` unset |

- [ ] **Step 2: Write `.env.example`**

```
# Colour variant: 'red' or 'graphite'. Defaults to 'red'.
NEXT_PUBLIC_THEME=red

# Canonical site URL, used by sitemap.xml and robots.txt.
NEXT_PUBLIC_SITE_URL=https://bowralwheelrepairs.com.au

# BusinessBrain platform integration. Unset until the site is registered in
# brain.tenant_websites; the contact route falls back gracefully without them.
# BB_TENANT_ID=
# BB_WEBHOOK_SECRET=
# BB_WEBHOOK_URL=
```

- [ ] **Step 3: Write `README.md`**

Cover: what the site is, the two variants and how to run each, where copy lives (`content/site.json` — the single source of truth), how to regenerate media (`scripts/`), the hard constraints with a pointer to `tests/`, the deployment setup, and the BusinessBrain migration path with its R31 note.

- [ ] **Step 4: Create the GitHub repo and push**

```bash
gh repo create KhaleonProductions/bowral-wheel-repairs --private --source=. --remote=origin --push
```

`gh` is authenticated as `KhaleonProductions`. Private to match the sibling project.

- [ ] **Step 5: Deploy the red variant**

```bash
npx vercel link --yes --project bowral-wheel-repairs-red
npx vercel env add NEXT_PUBLIC_THEME production   # value: red
npx vercel --prod --yes
```

Record the production URL.

- [ ] **Step 6: Deploy the graphite variant**

The second project deploys the same repo with a different env var. Remove the local link first so the second `link` creates a distinct project:

```bash
rm -rf .vercel
npx vercel link --yes --project bowral-wheel-repairs-graphite
npx vercel env add NEXT_PUBLIC_THEME production   # value: graphite
npx vercel --prod --yes
```

Record the production URL.

- [ ] **Step 7: Verify both deployments are live (V14)**

```bash
curl -I -s https://<red-url>       | head -1
curl -I -s https://<graphite-url>  | head -1
```

Expected: `HTTP/2 200` for both. Then open each in a browser and confirm the correct theme and logo are being served — an env var that failed to apply shows up as two identical-looking sites.

- [ ] **Step 8: Commit and push**

```bash
git add README.md .env.example
git commit -m "docs: add README and env template"
git push
```

---

## Self-Review

**1. Spec coverage**

| Spec section | Implementing task |
|---|---|
| §2 C1–C8 constraints | Tasks 1 (content tests), 9 (whole-tree gates); enforced throughout |
| §3.2 Repository layout | Task 1 (config), Tasks 3–8 (files) |
| §3.3 Two variants, one codebase | Task 1 (tokens, `lib/theme.ts`), Task 4 (`data-theme`), Task 10 (two deploys) |
| §3.4 Content as data | Task 1 (schema, loader), Task 5 (full copy) |
| §4.1 Shared typography | Task 4 (`next/font`) |
| §4.2/4.3 Both token sets | Task 1 Step 7 |
| §4.4 Logo recolouring | Task 2 Steps 1–2 |
| §4.5 Accessibility | Task 3 (`Reveal` reduced-motion, focus states), Task 8 (labels), Task 10 (V11) |
| §5.1 Three supplied assets | Task 2 (copy/derive), Task 6 (hero + result video), Task 7 (lathe photo, step 5 video) |
| §5.2 Pillarbox crop | Task 3 Step 1 (`VideoFrame`), Task 10 (V2) |
| §5.3 Poster frames | Task 2 Step 3 |
| §5.4 Placeholder slots | Task 3 Step 2, Tasks 5/7/8 (slots wired) |
| §6.1 Home | Task 6 |
| §6.2 Services | Task 7 |
| §6.3 Process | Task 7 |
| §6.4 About | Task 7 |
| §6.5 Gallery | Task 8 |
| §6.6 Contact | Task 8 |
| §7.2 Positioning claim | Task 5; negative test in Tasks 1 and 9 |
| §7.3/7.4 Approved copy | Task 5 Step 1, verbatim |
| §8.1 Performance | Task 2 (sized assets), Task 4 (`next/font`), Task 7 (`Image` sizes) |
| §8.2 SEO | Task 4 (metadata, JSON-LD without `aggregateRating`), Task 8 (sitemap, robots) |
| §8.3 Responsive | Tasks 3–8 (Tailwind breakpoints), Task 10 (V10) |
| §8.4 Progressive JS | Task 3 (`Reveal`), Task 8 (form) |
| §9.1 Two Vercel projects | Task 10 Steps 5–6 |
| §9.2 Contact webhook with fallback | Task 8 Step 3, verified Step 6 |
| §9.3 Migration path | Task 10 Step 3 (documented in README; no BusinessBrain changes) |
| §10 V1–V16 | Task 10 Step 1 |

No gaps found.

**2. Placeholder scan**

No "TBD", "TODO", "implement later", or "similar to Task N" instances. Every code step carries complete runnable code. Task 5 Step 4 lists content fields rather than full JSON — the field names, counts and constraints are all specified, and the copy itself is editorial content the spec's §7 governs; this is a content-authoring step, not an unspecified implementation.

**3. Type consistency check**

- `resolveTheme()`, `logoPath()`, `logoNavPath()` — defined Task 1 Step 3; used Task 4 Step 3, Task 6 Step 2, Task 7 Step 4. Consistent.
- `site` — exported Task 1 Step 5; imported in every component. Consistent.
- `CopyBlockT` — exported Task 1 Step 4; consumed by `Prose` (Task 3 Step 6). Consistent.
- `ProcessStepT` — exported Task 1 Step 4; consumed by `ProcessStep` (Task 7 Step 1). Consistent.
- `MediaSlotT` — exported Task 1 Step 4; `MediaPlaceholder` takes the unpacked `shotNeeded` string rather than the object, which is intentional and matches all three call sites.
- `Nav` / `Footer` take `logoSrc: string` — declared Task 4 Steps 1–2, passed Task 4 Step 3. Consistent. (Note: Task 3's interface block listed `Nav` as taking no props; the implementation in Task 4 takes `logoSrc` so the server layout resolves the theme and the client component stays free of env access. Task 4's signature is authoritative.)
- `QuoteForm` — no props; consumes `site.home.damage` for the damage select, which exists with 6 entries per the schema. Consistent.
- Schema array lengths (`trust` 4, `damage` 6, `services` 7, `process` 7) match every consumer's assumptions, including `Footer`'s `services.slice(0, 5)`.

One inconsistency found and resolved inline: Task 5 Step 3's process step 5 initially set `shotNeeded: ""`, which violates the schema's `min(1)`. The step now instructs setting it to `"Supplied: CNC lathe cutting footage"` and explicitly forbids relaxing the schema.
