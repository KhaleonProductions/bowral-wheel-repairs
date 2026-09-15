# Bowral Wheel Repairs — Website Design Spec

**Date:** 2026-09-15
**Version:** 2 (supersedes v1 static-HTML spec — see §12 Revision history)
**Status:** Approved for implementation
**Deliverable:** Two visually distinct colour variants of a Next.js marketing site,
deployed to Vercel, structured to migrate into the BusinessBrain platform.

---

## 1. Purpose

Build a marketing website for **Bowral Wheel Repairs**, a CNC alloy wheel repair
business in Bowral, NSW (Southern Highlands).

Two complete colour variants are built so the owner can pick between them:

- **Variant A — "Red Brand":** red palette with a recoloured red/chrome logo.
- **Variant B — "Graphite + Red Accent":** graphite base, red accents, logo unaltered.

Both variants render from **one shared content file and one shared component
set**. Only design tokens and the logo asset differ, so the comparison is fair
and copy is written once.

### Success criteria

1. Two live Vercel URLs, both viewable simultaneously in separate browser tabs.
2. Identical content and layout across variants; colour is the only difference.
3. All three supplied media assets used in context (lathe photo, two videos).
4. No pricing figures anywhere — every price reference is a quote prompt.
5. No reference to Bowral Body Shop by name, logo, or implication.
6. Structured so BusinessBrain migration is a registration step, not a rewrite.

---

## 2. Hard constraints

Non-negotiable, explicitly directed by the owner.

| # | Constraint |
|---|---|
| C1 | **No pricing.** No dollar figures, no ranges, no "from $X". Every price touchpoint reads "Contact us for a quote". |
| C2 | **No mention of Bowral Body Shop** in copy, metadata, alt text, structured data, or code comments. |
| C3 | **The Bowral Body Shop logo is never used.** Only the Bowral Wheel Repairs logo and its recoloured variant. |
| C4 | **No competitor imagery.** No photos from cncwheels.com.au or any other operator. Process *information* from research is used; their *images* are not. |
| C5 | **Placeholders for missing media** are clearly marked as awaiting Bowral Wheel Repairs' own photos and videos. |
| C6 | **No portraits and no owner names.** About covers workshop, machine and process instead. |
| C7 | **No fabricated credentials** — no invented awards, review counts, star ratings, certifications or insurer approvals. |
| C8 | **No committed turnaround times.** A dedicated turnaround page is planned for the future; until then the site does not state or imply timeframes. |

### Contact details (shared premises, co-located business never named)

```
8 Mount Rd, Bowral NSW 2576
(02) 4872 2221
admin@bowralwheelrepairs.com.au
Tue-Fri 7:30am - 5:00pm
```

The email address is provisional and may be corrected later. The address and
phone are shared with a co-located business; that is acceptable, naming it is not.

---

## 3. Architecture

### 3.1 Platform context — why this shape

The site is intended to migrate into the **BusinessBrain** platform
(`C:\code\BusinessBrain`). Investigation of that repo established how it
actually serves client sites, which differs from the initial assumption:

| Assumption in brief | Verified reality |
|---|---|
| Sites hosted on Cloudflare | **Hosted on Vercel.** Cloudflare is DNS only — a CNAME to `cname.vercel-dns.com` with `proxied: false`, because Vercel SSL breaks behind Cloudflare's proxy. No `wrangler.toml`, Worker, or Pages project exists in the repo. |
| Site lives inside the monorepo | **Own GitHub repo per site**, under the `The-Everything-AI-APP` org, cloned from `website-starter-nextjs`. The monorepo holds the bot that builds sites, not the sites. |
| Site uses the platform's auth | **Client sites are fully public with no login and no admin area.** The platform's Entra auth, RBAC and owner-approval engine gate the *editing* path, which runs through the Teams bot. The site's only credential is an outbound webhook secret for its contact form. |

Key source references in that repo:
`teams_bot/src/services/websiteProvisioning.ts`,
`teams_bot/src/services/toolCalling/handlers/manageWebsite.ts`,
`teams_bot/supabase/migrations/105_tenant_websites.sql`,
`features/website-builder/FEATURE.md`.

**Decision:** build in the platform's own stack — **Next.js App Router +
Tailwind on Vercel** — so migration is a registration step rather than a port.
Cloudflare involvement is DNS, matching every existing client site. No new
infrastructure is introduced.

### 3.2 Repository layout

```
bowral-wheel-repairs/
├─ content/
│   └─ site.json              # ALL copy, services, contact, media manifest
├─ components/                # shared by both variants
│   ├─ Nav.tsx  Footer.tsx  Hero.tsx  CTABanner.tsx
│   ├─ ServiceCard.tsx  ProcessStep.tsx  DamageCard.tsx
│   ├─ VideoFrame.tsx         # portrait-safe video (see §5.2)
│   ├─ MediaPlaceholder.tsx   # C5 placeholder slots
│   └─ QuoteForm.tsx
├─ app/
│   ├─ layout.tsx             # fonts, metadata, JSON-LD, theme class
│   ├─ page.tsx               # home
│   ├─ about/  services/  process/  gallery/  contact/
│   │   └─ page.tsx
│   ├─ api/contact/route.ts   # BusinessBrain webhook (see §9.2)
│   └─ globals.css            # Tailwind + theme token definitions
├─ lib/
│   ├─ content.ts             # typed loader + Zod schema for site.json
│   └─ theme.ts               # variant resolution
├─ public/assets/
│   ├─ logo-blue.png  logo-red.png  logo-*-nav.png  favicon
│   ├─ lathe.jpg
│   ├─ video-cutting.mp4  video-finished.mp4
│   └─ poster-cutting.jpg  poster-finished.jpg
├─ docs/superpowers/specs/
├─ research/
├─ next.config.ts  tailwind.config.ts  tsconfig.json  package.json
└─ README.md
```

### 3.3 The two variants — one codebase

Variants are **not** separate folders. A single build is themed at runtime by an
environment variable:

```
NEXT_PUBLIC_THEME=red        -> variant A
NEXT_PUBLIC_THEME=graphite   -> variant B
```

`app/layout.tsx` reads it and sets `data-theme` on `<html>`. `globals.css`
defines both token sets:

```css
:root[data-theme="red"]      { --accent: #dc2626; --base: #14090a; ... }
:root[data-theme="graphite"] { --accent: #e11d2e; --base: #131619; ... }
```

Tailwind maps these tokens to utility classes via `tailwind.config.ts`, so
components never hardcode colour. Logo selection is derived from the same
variable in `lib/theme.ts`.

**Consequences:**
- One component tree, one content file — copy and layout cannot drift.
- Two Vercel projects, same repo, differing only in that env var.
- Choosing a winner means deleting one Vercel project and one token block.

**Rationale for rejecting duplicated folders (v1 approach):** duplicated HTML
meant every copy edit had to be made twice, and BusinessBrain's chat-driven
editing writes to *one* source. Token-based theming keeps a single source of
truth in both dimensions.

### 3.4 Content as data

All copy lives in `content/site.json`, validated by a Zod schema in
`lib/content.ts`. Components receive content as props; no copy is embedded in
JSX.

This is not decoration — it is what makes the platform migration work.
BusinessBrain's `website-builder` edits a live site through the bot with an
owner-approval gate before publish. A site whose copy is separable from its
markup can be edited that way; one with copy baked into components cannot.

### 3.5 Stack

| Concern | Choice |
|---|---|
| Framework | Next.js App Router (matching `website-starter-nextjs`) |
| Styling | Tailwind + CSS custom properties for theming |
| Language | TypeScript, strict |
| Validation | Zod (content schema + form input) |
| Hosting | Vercel, two projects |
| DNS (later) | Cloudflare zone + CNAME, `proxied: false` |
| Dependencies | Framework + Tailwind + Zod only. No UI kit, no animation library. |

---

## 4. Design system

### 4.1 Shared foundation

Typography deliberately echoes the owner's other site so the two feel like one
studio's work, while never naming or badging it (C2/C3):

```
display:  'Bebas Neue'         -> hero headline, step numerals
heading:  'Barlow Condensed'   -> section titles, labels, eyebrows
body:     'DM Sans'            -> paragraphs, UI
```

Shared spacing and motion: section padding `clamp(4rem, 8vw, 7rem)`, content
max-width `1200px`, reveal-on-scroll via `IntersectionObserver`,
`cubic-bezier(0.22, 1, 0.36, 1)` easing, carbon-texture and mesh-gradient
background treatments.

### 4.2 Variant A — Red Brand

```css
--base:          #14090a;   /* near-black, red-shifted */
--base-deep:     #0a0405;
--surface:       #241012;
--surface-mid:   #2e1518;
--accent:        #dc2626;   /* crimson primary */
--accent-bright: #ef4444;
--accent-muted:  #991b1b;
--accent-glow:   rgba(220, 38, 38, 0.25);
--logo:          logo-red.png;
```

Deep oxblood grounds, crimson as the action colour, chrome gradients on display
headings. A committed red identity.

### 4.3 Variant B — Graphite + Red Accent

```css
--base:          #131619;   /* neutral graphite */
--base-deep:     #0b0d0f;
--surface:       #1c2024;
--surface-mid:   #262b31;
--accent:        #e11d2e;   /* signal red */
--accent-bright: #ff2d3f;
--accent-muted:  #a91520;
--accent-glow:   rgba(225, 29, 46, 0.22);
--logo:          logo-blue.png;
```

A neutral carbon base lets red act as a signal colour on buttons, labels, rules
and hover states. The unaltered logo's blue reads as a chrome-and-enamel badge
against neutral graphite rather than a competing theme — the specific failure
mode this variant exists to avoid.

### 4.4 Logo recolouring (Variant A only)

Generate `logo-red.png` from the supplied artwork:

- **Recolour:** blue outer glow, blue shield banding, blue "BOWRAL" wordmark → red.
- **Preserve:** all chrome and silver bevels, the three alloy wheels, the white
  "WHEEL REPAIRS" text, the stars, and full alpha transparency.

Method: selective hue rotation on blue-dominant pixels only, so chrome and white
are untouched. Implemented with Python/Pillow or ffmpeg. Verified by eye at nav
size (~44px), hero size (~120px) and full resolution.

The supplied original is never modified. The 1.8 MB source is downscaled into
purpose-sized derivatives rather than shipped whole.

### 4.5 Accessibility

- Body text meets WCAG AA (4.5:1) against its surface in both variants.
- Red never carries meaning alone; icons and text labels accompany it.
- Visible focus states on all interactive elements.
- Videos are `muted loop playsinline`; motion is decorative and respects
  `prefers-reduced-motion`.
- Meaningful `alt` on all content images; decorative logos `aria-hidden`.
- Form fields have associated labels and inline error text.

---

## 5. Media plan

### 5.1 Supplied assets

**`IMG_20260915_225126.jpg`** — the HL24 CNC lathe in the workshop, doors open.

- **Placement:** About → "The Workshop", full-width feature.
- **Treatment:** gradient scrim for text legibility; caption names the machine.

**`Messenger_creation_4AE294B9-...mp4`** (15.3s) — a wheel chucked in the lathe
mid-cut, tool engaged, swarf curling off into the chip tray.

- **Placement:** home hero (right side) and Process step 5.
- **Significance:** research across ~12 Australian operators found **none**
  showing a CNC lathe actually cutting a wheel. This is the site's strongest
  single differentiator and is treated as the hero asset.

**`Messenger_creation_1EB72D5D-...mp4`** (11.9s) — a finished two-tone
diamond-cut wheel on a stand in the booth: machined face, gloss black pockets,
masking still on the barrel.

- **Placement:** home → "The Result", and the Gallery lead item.

### 5.2 Critical technical note — video aspect ratio

`ffprobe` reports both videos as **1024×576 (16:9)**. Extracted frames show the
content is actually **portrait 9:16 phone footage, pillarboxed** by Messenger
with grey bars down both sides.

**Consequence:** a full-bleed 16:9 background would display grey bars.

**Handling:** the `VideoFrame` component renders `aspect-ratio: 9/16` with
`object-fit: cover` and a horizontal inset crop that removes the pillarboxing.
Verified visually at mobile and desktop widths before sign-off.

*Frames were extracted rather than trusting container metadata precisely because
the metadata alone would have shipped a broken hero.*

### 5.3 Poster frames

Extracted with ffmpeg so no video shows a blank box before playback:

- `poster-cutting.jpg` — ~9s (tool engaged, swarf visible).
- `poster-finished.jpg` — ~12s (full wheel in frame).

### 5.4 Placeholder slots (C5)

Every unfilled media slot renders through `MediaPlaceholder`, clearly labelled
and never a broken image or a stock substitute:

```
┌─────────────────────────────┐
│         [ wheel icon ]      │
│   PHOTO COMING SOON         │
│   Bowral Wheel Repairs      │
│   before/after — kerb rash  │
└─────────────────────────────┘
```

Slots: 6 gallery before/after pairs, 3 workshop shots, 4 process step images.
Each carries a `shotNeeded` prop describing the required photo, so filling one
later is a file drop plus one content-file edit.

### 5.5 Excluded

The 239 catalogued cncwheels.com.au image URLs
(`research/cncwheels-image-urls.txt`) are retained as a **shot list only**. Not
downloaded, not referenced, not deployed. Their process *information* informs
the copy; their photography does not appear (C4).

---

## 6. Site structure

Six routes. Home, About, Services, Gallery and Contact mirror the owner's other
site; **Process** is added because the CNC workflow is this business's primary
differentiator and a strong local-SEO page.

### 6.1 Home (`/`)

1. **Nav** — logo, six links, click-to-call CTA, mobile drawer.
2. **Hero** — split layout: logo, headline, dual CTA left; portrait cutting
   video right. Headline *"Precision CNC Wheel Repair"*; sub *"Machined,
   straightened and refinished in-house in Bowral."*
3. **Trust strip** — four capability claims: in-house CNC machining ·
   Southern Highlands local · OEM colour matching · workmanship guarantee.
   *(No numbers, no ratings — C7.)*
4. **Damage types** — six cards: kerb and gutter rash · buckles and bends ·
   cracks · corrosion and lacquer peel · diamond-cut face damage · tired or
   wrong colour.
5. **Services overview** — six cards linking through to Services.
6. **New to the Highlands** — the positioning narrative (§7.3).
7. **Process teaser** — condensed 7-step strip → Process.
8. **The Result** — finished-wheel video plus machined-face explanation.
9. **Straight answers** — the honest-limits section (§7.4).
10. **CTA banner** — "Get a Quote" plus phone.
11. **Footer** — logo, links, services, contact, hours.

### 6.2 Services (`/services`)

One detailed section per service: what it is, what it fixes, how it's done, what
to expect. Every CTA is a quote prompt (C1).

1. **CNC diamond-cut refinishing** — the lathe skims the wheel face to restore
   the fine concentric cut lines under fresh lacquer. Hand polishing cannot
   reproduce that geometry; the wheel must be re-cut on a lathe following the
   model's face profile.
2. **Wheel straightening** — hydraulic correction of buckles and flat spots from
   potholes and kerbs; trued and checked for runout.
3. **Crack and weld repair** — TIG welding of repairable cracks, with the safety
   boundary stated plainly (§7.4).
4. **Full refurbishment** — strip, repair, prime, colour, clear, cure.
5. **Colour changes and custom finishes** — gloss, satin, matte, two-tone,
   machined face with accent. OEM colour matching.
6. **Gutter rash and kerb damage** — cosmetic repair of lip and face.
7. **TPMS handling** — sensors removed, protected and refitted or transferred.
   *(Research: unmentioned on every Australian site checked — a free
   credibility win.)*

### 6.3 Process (`/process`)

Seven steps, each with an image slot:

1. **Assessment** — inspection, runout and crack check, honest go/no-go.
2. **Tyre removal and strip** — tyre off, weights and TPMS removed, finish stripped.
3. **Straightening** — buckles corrected, trued, rechecked.
4. **Welding** — repairable cracks TIG welded and dressed.
5. **CNC machining** — wheel mounted on the lathe, face cut to the original
   profile. **Uses the cutting video.**
6. **Finishing** — prime, colour, clear coat, oven cure.
7. **Balance and refit** — tyre refitted, balanced, TPMS reset, torqued to spec.

**No timeframes anywhere on this page** (C8). Timing is confirmed at quote; a
dedicated turnaround page is planned separately.

### 6.4 About (`/about`)

- **New to the Highlands. Not new to the work.** — the positioning narrative.
- **The Workshop** — the HL24 lathe photo, full-width, captioned.
- **Our Process** — condensed, linking to Process.
- **Straight answers** — the honest-limits section.
- **No team section, no portraits, no names** (C6).

### 6.5 Gallery (`/gallery`)

Finished-wheel video as the lead item, then a filterable grid (All · Diamond Cut
· Straightening · Refurbishment · Custom Colour) of clearly-marked placeholder
slots awaiting the business's own before/after photography.

### 6.6 Contact (`/contact`)

Details, hours, embedded map, and a quote request form: name, phone, email,
vehicle, wheel size, damage type, description, photo-upload prompt. Posts to
`/api/contact` (§9.2). **No price estimator, no quoted figures** (C1).

---

## 7. Copy and positioning

### 7.1 Competitive reality (from research)

The brief assumed the nearest competitor was in Sydney. That is false:

- **Spot On Wheel Repairs**, Berkeley NSW (~70 km) explicitly advertises into
  *"Illawarra, Wollongong, Southern Highlands, Bowral, Kiama, Gerringong,
  Canberra, Goulburn"* — but charges Highlands customers a courier quote while
  Sydney gets free pickup.
- **Highlands Detailing** (Mittagong) advertises "CNC Diamond Cutting" while its
  own site states it outsources structural repairs.
- **Touch Up Guys** (mobile) does painted gutter rash only — explicitly not bent
  or cracked wheels.
- **Highlands Paint & Panel** (Mittagong) has advertised for a mag wheel
  repairer — an emerging competitor.
- Goulburn: nothing. Local tyre shops do fitting only.

### 7.2 The claim

**"CNC wheel machining, in-house, in Bowral."** Local, on site, no freight, no
outsourcing, no courier wait.

Explicitly **not** "the only CNC wheel repairer in the region" — Spot On already
markets into Bowral by name, and the claim would collapse the moment a customer
checked. The defensible version is stronger anyway: the nearest real capability
charges freight and adds days, while this workshop has the lathe on site.

### 7.3 "New to the Highlands" — approved copy

The risk in announcing newness is that it reads as *unproven* to someone about to
hand over a set of wheels. The resolution is to make newness the customer's
benefit: the machine is new, the capability is new *to the region*, and the
alternative is freighting wheels to Wollongong or Sydney. Confident about the
future, evidenced in the present.

> **New to the Highlands. Not new to the work.**
>
> Until now, getting a wheel properly machined around here meant packing it off
> to Wollongong or Sydney, paying for the freight, and waiting on a courier both
> ways.
>
> So we brought the machine to Bowral instead.
>
> Our CNC lathe is installed and cutting at Mount Road — not a partner's machine
> somewhere down the highway, not a job we quietly send out and mark up. When we
> say the work is done in-house, we mean in *this* house.
>
> We're the new name in Southern Highlands wheel repair, and we're setting out to
> be the one people recommend. The plan for getting there isn't complicated: do
> proper work, give straight answers, and hand back wheels people are pleased to
> put back on the car.
>
> Bring us something kerbed, buckled or cracked and let us show you.

### 7.4 "Straight answers" — approved copy

Jovial in tone, and explicitly noting that competitors imply everything is
fixable.

> **We'll tell you if it's not worth it**
>
> Here's something you won't read on many wheel repair websites: not every wheel
> can be saved. Funny how everyone else's site implies anything can be fixed,
> isn't it?
>
> Cracks in the spokes are a hard no — and not because we can't be bothered. The
> spokes carry every bit of your cornering and braking load, so welding them
> isn't just risky, it's not legal. Rim lip cracks are usually a different story
> and often perfectly repairable.
>
> Diamond-cut wheels are similar. Every re-cut takes a whisker of metal off the
> face, so there's a limit to how many times one wheel can go under the tool.
> We'll tell you where yours is at.
>
> You'll get a straight answer either way. Sometimes that answer is "replace it"
> — and we'd rather say so than take your money and hand back something we're not
> proud of.

### 7.5 Tone

Direct Australian trade voice, second person, short sentences. Dry humour where
it lands naturally; never jokey at the expense of clarity. Technically specific —
name the operations. Confident without superlatives. No exclamation marks, no
"cutting-edge", no invented accolades.

### 7.6 Compliance note

Transport Victoria's VSI 8 states *"Repaired or damaged alloy wheels aren't
acceptable."* NSW's VSI.09 contains **no** equivalent prohibition. Bowral is in
NSW, so the business is fine — but copy must avoid absolute national
roadworthiness claims. **AS 1638** ("Light alloy road wheels") is the relevant
standard and may be referenced factually; no compliance certification is claimed.

---

## 8. Technical implementation

### 8.1 Performance

- Next.js `Image` for stills; explicit dimensions to prevent layout shift.
- Videos `preload="metadata"` with poster frames; `muted loop playsinline autoplay`.
- Two Google Font families via `next/font` (self-hosted, no render-blocking request).
- Logo derivatives sized per use rather than shipping the 1.8 MB source.
- Static rendering for all six routes; no client JS beyond nav, reveal, gallery
  filter and form.
- Target Lighthouse performance ≥ 90 mobile.

### 8.2 SEO

- Per-route `metadata` exports: unique title and description.
- `LocalBusiness` / `AutoRepair` JSON-LD with real NAP, hours, geo.
  **No `aggregateRating`** — inventing one is prohibited by C7.
- Open Graph and Twitter cards; OG image is the variant's logo.
- Semantic landmarks, one `<h1>` per route, logical heading order.
- `app/sitemap.ts` and `app/robots.ts`.
- Local keywords: Bowral, Mittagong, Moss Vale, Southern Highlands.

### 8.3 Responsive

Mobile-first; breakpoints at Tailwind `sm` / `md` / `lg` / `xl`. Hero stacks to
video-above-copy on mobile. Nav collapses to a drawer below `lg`. Verified at
360, 768 and 1440 px.

### 8.4 Client behaviour

Mobile nav toggle · reveal-on-scroll via `IntersectionObserver` · gallery filter
· form validation. All progressive: every route is fully readable and navigable
without client JS.

---

## 9. Deployment and platform migration

### 9.1 Now — two Vercel projects

1. Git repo committed and pushed to GitHub.
2. Two Vercel projects from the same repo, differing only by env var:
   - `bowral-wheel-repairs-red` → `NEXT_PUBLIC_THEME=red`
   - `bowral-wheel-repairs-graphite` → `NEXT_PUBLIC_THEME=graphite`
3. Both URLs reported for side-by-side comparison.

No custom domain at this stage. After the choice, the losing Vercel project is
deleted and the winning theme becomes the default.

### 9.2 Contact webhook — built now, inert until registered

`app/api/contact/route.ts` follows the platform's contact-form contract: it
POSTs the submission to BusinessBrain's `contactFormWebhook` endpoint with a
per-site secret, read from env:

```
BB_TENANT_ID       # BusinessBrain tenant
BB_WEBHOOK_SECRET  # per-site secret, validated by hash server-side
BB_WEBHOOK_URL     # platform endpoint
```

When those vars are absent — which is the case until the site is registered —
the route falls back to a plain `mailto:` handoff and logs a clear notice. The
form therefore works from day one and gains CRM integration on registration
without a code change.

Once registered, the platform side provides: AI spam classification, owner email
via Graph, customer auto-reply, CRM contact and deal creation, and a Teams
notification.

### 9.3 Later — migrating into BusinessBrain

The migration is a **registration**, not a port:

1. Move or mirror the repo to the `The-Everything-AI-APP` org (the platform
   selects its GitHub token by `github_org`; `staino83` is a legacy path for
   pre-existing SG1 sites).
2. Insert a `brain.tenant_websites` row — `github_org`, `github_repo`,
   `repo_root_dir`, `vercel_project_name`, `production_branch`, `primary_domain`,
   `asset_path`, `webhook_secret`, `lifecycle_status`. Migration
   `105_tenant_websites.sql` seeds SG1's own two sites by hand and is the
   precedent for a manually-registered site.
3. Set `BB_TENANT_ID` and `BB_WEBHOOK_SECRET` as Vercel env vars.
4. Attach the custom domain: Vercel domain attach, then a Cloudflare zone and
   CNAME to `cname.vercel-dns.com` with `proxied: false`.

On registration the site inherits chat-driven editing, dev-preview hosting at
`<slug>-dev.the-everything-app.com`, and the owner-approval gate on publishing.

**Procedural gate:** that migration adds a numbered SQL migration to the
BusinessBrain repo, which falls under **R31** — infra changes there require
Sam's review and must not be self-merged. This spec's implementation makes **no
changes to the BusinessBrain repo**; step 2 is a follow-up task requiring that
review.

---

## 10. Verification before sign-off

Nothing is reported as working until observed.

| # | Check | Method |
|---|---|---|
| V1 | Both themes render, all 6 routes, no console errors | `next build` + local run, browser |
| V2 | Videos autoplay muted and loop, **no pillarbox bars** | Visual, mobile + desktop |
| V3 | Lathe photo present and legible on About | Visual |
| V4 | Red logo correct: chrome and white preserved | Visual at 44 / 120 / full px |
| V5 | **Zero pricing** anywhere | `grep -rE '\$[0-9]'` → no matches |
| V6 | **No body shop reference** | `grep -riE 'body ?shop\|mittagong smash'` → no matches |
| V7 | No competitor images or references | `grep -ri 'cncwheels\|spotonwheel'` outside `research/` → none |
| V8 | **No committed turnaround times** | `grep -riE '[0-9]+ ?(hour\|day\|week)\|same.day\|24.48'` → reviewed, none committed |
| V9 | No broken links or missing assets | Link check, network panel |
| V10 | Responsive at 360 / 768 / 1440 | Browser resize |
| V11 | Contrast AA on body text, both themes | Contrast check |
| V12 | Content schema validates | Zod parse in build |
| V13 | Contact route degrades cleanly without BB env vars | Submit with vars unset |
| V14 | Both Vercel deployments live | `curl -I` → 200 |
| V15 | No fabricated ratings or certifications | Manual copy read |
| V16 | `next build` clean, no type errors | Build output |

---

## 11. Out of scope

Custom domain · turnaround-times page (planned separately, C8) · CMS ·
booking or payment · live chat · analytics · real photography beyond the three
supplied assets · multi-language · **any change to the BusinessBrain repo**
(§9.3 step 2 is a reviewed follow-up) · Cloudflare Workers or Pages compute
(would be net-new infrastructure there; not required).

---

## 12. Revision history

**v2 (2026-09-15)** — rewritten after investigating `C:\code\BusinessBrain`.
Changes from v1:

- **Stack:** static HTML/CSS → Next.js App Router + Tailwind, matching the
  platform's `website-starter-nextjs` shape so migration is registration, not a
  port.
- **Variants:** duplicated `variant-red/` and `variant-graphite/` folders → one
  codebase themed by `NEXT_PUBLIC_THEME`, eliminating the edit-twice problem.
- **Content:** copy embedded in markup → `content/site.json` with a Zod schema,
  so platform-driven editing is possible.
- **Cloudflare:** corrected from "hosting" to DNS-only, matching verified
  platform behaviour.
- **Copy:** added approved "New to the Highlands" (§7.3) and jovial "Straight
  answers" (§7.4) sections.
- **C8 added:** no committed turnaround times; separate page planned.
- **Added:** contact webhook route (§9.2), migration path (§9.3), R31 note.
