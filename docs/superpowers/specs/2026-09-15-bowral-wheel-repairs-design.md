# Bowral Wheel Repairs — Website Design Spec

**Date:** 2026-09-15
**Status:** Approved for implementation
**Deliverable:** Two visually distinct static websites for comparison, deployed to Vercel from one GitHub repo.

---

## 1. Purpose

Build a marketing website for **Bowral Wheel Repairs**, a CNC alloy wheel repair
business in Bowral, NSW (Southern Highlands).

Two complete colour variants are built so the owner can pick between them:

- **Variant A — "Red Brand":** red palette with a recoloured red/chrome logo.
- **Variant B — "Graphite + Red Accent":** graphite base, red accents, logo unaltered.

Both variants are structurally and editorially identical. Only colour and the
logo file differ, so the comparison is fair.

### Success criteria

1. Two live Vercel URLs, both viewable simultaneously in separate browser tabs.
2. Identical content and layout across variants; colour is the only difference.
3. All three supplied media assets used in context (lathe photo, two videos).
4. No pricing figures anywhere — every price reference is a quote prompt.
5. No reference to Bowral Body Shop by name, logo, or implication.
6. Layout and component language recognisably in the same family as the
   existing Bowral Body Shop site, without naming it.

---

## 2. Hard constraints

These are non-negotiable and were explicitly directed by the owner.

| # | Constraint |
|---|---|
| C1 | **No pricing.** No dollar figures, no ranges, no "from $X". Every price touchpoint reads "Contact us for a quote". |
| C2 | **No mention of Bowral Body Shop** in copy, metadata, alt text, structured data, or comments. |
| C3 | **The Bowral Body Shop logo is never used.** Only the Bowral Wheel Repairs logo (and its recoloured variant). |
| C4 | **No competitor imagery.** No photos from cncwheels.com.au or any other operator. Process *information* from research is fine; their *images* are not. |
| C5 | **Placeholders for missing media** must be clearly marked as awaiting Bowral Wheel Repairs' own photos/videos. |
| C6 | **No portraits and no owner names.** The About page covers workshop, machine and process instead. |
| C7 | **No fabricated credentials** — no invented awards, review counts, star ratings, certifications or insurer approvals. |

### Contact details (shared premises, business never named)

```
8 Mount Rd, Bowral NSW 2576
(02) 4872 2221
admin@bowralwheelrepairs.com.au   <- provisional address, may change
Tue-Fri 7:30am - 5:00pm
```

The email address is provisional and may be corrected later. The address and
phone are shared with a co-located business. This is
acceptable; naming that business is not.

---

## 3. Architecture

### 3.1 Repository layout

```
bowral-wheel-repairs/
├─ shared/
│   ├─ base.css                  # structure, layout, type, components (themeless)
│   └─ media/
│       ├─ logo-blue.png         # supplied original
│       ├─ logo-red.png          # generated: blue hues rotated to red
│       ├─ lathe.jpg             # supplied HL24 workshop photo
│       ├─ video-cutting.mp4     # supplied: wheel being machined
│       ├─ video-finished.mp4    # supplied: finished diamond-cut wheel
│       ├─ poster-cutting.jpg    # generated from video frame
│       └─ poster-finished.jpg   # generated from video frame
├─ variant-red/
│   ├─ index.html about.html services.html process.html gallery.html contact.html
│   ├─ css/theme.css             # token overrides ONLY
│   └─ js/main.js
├─ variant-graphite/
│   └─ (identical file set, different theme.css)
├─ docs/superpowers/specs/
├─ research/
└─ README.md
```

### 3.2 Why this shape

The existing Bowral Body Shop stylesheet is written as a re-themable template:
its header comment says *"Change CSS custom properties below to re-theme for any
trades/automotive business"*, and all colour lives in `:root` custom properties.

This spec exploits that. `shared/base.css` holds every structural rule and
references colour only through `var(--token)`. Each variant supplies a
`theme.css` of roughly 40 token declarations. Consequences:

- A layout or component fix is made once, in one file.
- The variants cannot drift structurally, because they share the structure.
- Choosing a winner means deleting one folder and one theme file.

HTML is duplicated per variant (each needs its own `<link>` and logo `src`), but
generated from one canonical source in a single pass so the two stay in sync.
This duplication is accepted deliberately: the alternative — a build step or a
runtime theme switcher — adds tooling for a decision that will be made once and
then collapsed to a single site.

### 3.3 Stack

Static HTML, hand-written CSS, one small vanilla JS file. No framework, no build
step, no dependencies — matching the sibling site. Vercel serves the folders
directly.

**Rationale:** a six-page brochure site with no dynamic data has nothing to gain
from a framework, and a zero-dependency static site has no build to break and
nothing to patch.

---

## 4. Design system

### 4.1 Shared foundation (both variants)

Typography carries over from the sibling site, so the two feel like one studio's
work without any stated connection:

```css
--font-display: 'Bebas Neue', Impact, sans-serif;        /* hero numerals, display */
--font-heading: 'Barlow Condensed', 'Arial Narrow', sans-serif;
--font-body:    'DM Sans', 'Segoe UI', sans-serif;
```

Also shared: `--section-pad: clamp(4rem, 8vw, 7rem)`, `--content-max: 1200px`,
the `--ease-out` / `--ease-bounce` curves, the reveal-on-scroll pattern, card
and button component shapes, and the carbon/mesh background textures.

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

Deep oxblood grounds with crimson as the action colour; chrome gradients on
display headings. Reads as a committed red identity.

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

Neutral carbon base lets red function as a signal colour on buttons, section
labels, rules, icon glows and hover states. The unaltered logo's blue reads as a
chrome-and-enamel badge against neutral graphite rather than as a competing
theme — which is the specific failure mode this variant exists to avoid.

### 4.4 Logo recolouring (Variant A only)

Generate `logo-red.png` from the supplied artwork:

- Blue outer glow, blue shield banding, blue "BOWRAL" wordmark → red.
- **Preserve:** all chrome/silver bevels, the three alloy wheels, the white
  "WHEEL REPAIRS" text, the stars, and full alpha transparency.

Method: selective hue rotation on blue-dominant pixels only, so chrome and
white are untouched. Implemented with ffmpeg or Python/Pillow, verified by eye
at nav size (~44px), hero size (~120px) and full size.

The supplied original is never modified.

### 4.5 Accessibility

- Body text meets WCAG AA (4.5:1) against its surface in both variants.
- Red is never the sole carrier of meaning; icons and labels accompany it.
- Focus states visible on all interactive elements.
- Videos are muted, loop, and carry `playsinline`; motion is decorative only
  and respects `prefers-reduced-motion`.
- All images carry meaningful `alt` text; decorative logos use `aria-hidden`.

---

## 5. Media plan

### 5.1 Supplied assets

**`IMG_20260915_225126.jpg`** — HL24 CNC lathe in the workshop, doors open,
new. Verified 444 KB.

- **Placement:** About → "The Workshop", full-width feature.
- **Treatment:** subtle gradient overlay for text legibility; caption names the
  machine.

**`Messenger_creation_4AE294B9-...mp4`** (15.3s) — a wheel chucked in the lathe
mid-cut, cutting tool engaged, swarf curling off and piling in the chip tray.

- **Placement:** Home hero (right side) + Process step 5 (machining).
- **Significance:** research across ~12 Australian operators found *none* showing
  a CNC lathe actually cutting a wheel. This is the site's strongest single
  differentiator and should be presented prominently.

**`Messenger_creation_1EB72D5D-...mp4`** (11.9s) — finished two-tone diamond-cut
wheel on a stand in the booth: machined face, gloss black pockets, masking still
on the barrel.

- **Placement:** Home → "The Result" + Gallery lead item.

### 5.2 Critical technical note — video aspect ratio

`ffprobe` reports both videos as **1024×576 (16:9)**. Extracted frames show the
actual content is **portrait 9:16 phone footage, pillarboxed** by Messenger with
grey bars down both sides.

**Consequence:** a full-bleed 16:9 background would display grey bars.

**Handling:** present both in a portrait-oriented frame (`aspect-ratio: 9/16`)
with `object-fit: cover` and a horizontal inset crop that removes the
pillarboxing. Verified visually at mobile and desktop widths before sign-off.

*This is why frames were extracted rather than trusting container metadata —
the metadata alone would have produced a broken hero.*

### 5.3 Poster frames

Extract with ffmpeg so videos never show a blank box before play:

- `poster-cutting.jpg` — from the cutting video at ~9s (tool engaged, swarf visible).
- `poster-finished.jpg` — from the finished-wheel video at ~12s (full wheel in frame).

### 5.4 Placeholder slots (C5)

Every unfilled media slot renders as a styled, clearly-labelled placeholder —
never a broken image, never a stock substitute:

```
┌─────────────────────────────┐
│         [ wheel icon ]      │
│   PHOTO COMING SOON         │
│   Bowral Wheel Repairs      │
│   before/after — kerb rash  │
└─────────────────────────────┘
```

Slots: 6 gallery before/after pairs, 3 workshop shots, 4 process step images.
Each carries an HTML comment naming the shot needed, so filling them later is a
file drop plus one `src` edit.

### 5.5 Excluded

The 239 catalogued cncwheels.com.au image URLs (`research/cncwheels-image-urls.txt`)
are retained as a **shot list only**. Not downloaded, not referenced, not
deployed. Their process *information* informs the copy; their photography does
not appear.

---

## 6. Site structure

### 6.1 Home (`index.html`)

1. **Nav** — logo, six links, click-to-call CTA, mobile hamburger.
2. **Hero** — split: logo + headline + dual CTA left; portrait cutting video right.
   Headline: *"Precision CNC Wheel Repair"*; sub: *"Machined, straightened and
   refinished in-house in Bowral."*
3. **Trust strip** — four items: In-house CNC machining · Southern Highlands
   local · OEM colour matching · Workmanship guarantee. *(No numbers, no ratings.)*
4. **Damage types** — six cards: kerb/gutter rash · buckles & bends · cracks ·
   corrosion & lacquer peel · diamond-cut face damage · tired or wrong colour.
5. **Services overview** — six cards linking to Services.
6. **Process teaser** — condensed 7-step strip → Process page.
7. **The Result** — finished-wheel video + machined-face explanation.
8. **Why us** — local, no freight, own machine, honest assessment.
9. **CTA banner** — "Get a Quote" + phone.
10. **Footer** — logo, links, services, contact, hours.

### 6.2 Services (`services.html`)

Detailed sections per service, each: what it is, what it fixes, how it's done,
what to expect. All CTAs are quote prompts.

1. **CNC diamond-cut refinishing** — the lathe skims the face to restore
   concentric cut lines under fresh lacquer. Hand polishing cannot reproduce
   that geometry; the wheel must be re-cut on a lathe programmed to the model's
   face profile. Honest caveat: each cut removes metal, so a wheel can only be
   re-cut a limited number of times.
2. **Wheel straightening** — hydraulic correction of buckles and flat spots from
   potholes and kerbs; trued and checked for runout.
3. **Crack & weld repair** — TIG welding of repairable cracks.
   **Safety boundary stated plainly:** cracks on spokes are *not* repaired — the
   spokes carry cornering and braking torque, and repairing them is not legal.
   Small cracks on the back or middle of the rim lip can be repaired safely.
4. **Full refurbishment** — strip, repair, prime, colour, clear, cure.
5. **Colour changes & custom finishes** — gloss, satin, matte, two-tone,
   machined face + accent. OEM colour matching.
6. **Gutter rash & kerb damage** — cosmetic repair of the lip and face.
7. **TPMS handling** — sensors removed, protected and refitted, or transferred.
   *(Research: unmentioned on every Australian site checked — a free credibility win.)*

### 6.3 Process (`process.html`) — new page, not in sibling site

Seven steps, each with an image slot:

1. **Assessment** — inspection, runout and crack check, honest go/no-go.
2. **Tyre removal & strip** — tyre off, weights and TPMS removed, old finish stripped.
3. **Straightening** — buckles corrected, trued, rechecked.
4. **Welding** — repairable cracks TIG welded and dressed.
5. **CNC machining** — wheel mounted on the lathe; the face is cut to the
   original profile. **Uses the cutting video.**
6. **Finishing** — prime, colour, clear coat, oven cure.
7. **Balance & refit** — tyre refitted, balanced, TPMS reset, torqued to spec.

Also: turnaround guidance in relative terms only (straightening fastest;
full refinishing longer) with no committed timeframes — timings are confirmed
at quote, since actual capacity is unknown.

### 6.4 About (`about.html`)

- **Our Story** — a Southern Highlands workshop doing CNC wheel work locally,
  so wheels are not freighted to Sydney or Wollongong. No named owners.
- **The Workshop** — the HL24 lathe photo, full-width, with caption.
- **Our Process** — condensed, linking to Process.
- **Why Bowral Wheel Repairs** — in-house machining, no freight delay, direct
  dealing with the people doing the work, honest assessment including saying no.
- **No team section, no portraits, no names** (C6).

### 6.5 Gallery (`gallery.html`)

Finished-wheel video as the lead item, then a filterable grid (All ·
Diamond Cut · Straightening · Refurbishment · Custom Colour) of
clearly-marked placeholder slots.

### 6.6 Contact (`contact.html`)

Details, hours, embedded map, and a quote form: name, phone, email, vehicle,
wheel size, damage type, damage description, photo-upload prompt. Submits to a
`mailto:` or Vercel form handler. **No price estimator.**

---

## 7. Copy positioning

### 7.1 Competitive reality (from research)

The brief assumed the nearest competitor was in Sydney. That is false:

- **Spot On Wheel Repairs**, Berkeley NSW (~70 km) explicitly advertises into
  *"Illawarra, Wollongong, Southern Highlands, Bowral, Kiama, Gerringong,
  Canberra, Goulburn"* — but charges Highlands customers a courier quote while
  Sydney gets free pickup.
- **Highlands Detailing** (Mittagong) advertises "CNC Diamond Cutting" but its
  own site says it *outsources structural repairs*.
- **Touch Up Guys** (mobile) does painted gutter rash only — explicitly not bent
  or cracked wheels.
- **Highlands Paint & Panel** (Mittagong) has advertised for a mag wheel
  repairer — an emerging competitor.
- Goulburn: nothing. Local tyre shops do fitting only.

### 7.2 The claim

**"CNC wheel machining, in-house, in Bowral."** Local, on-site, no freight, no
outsourcing, no courier wait.

Explicitly **not** "the only CNC wheel repairer in the region" — Spot On already
markets into Bowral, and the claim would collapse the moment a customer checked.
The defensible version is stronger anyway: the nearest real capability charges
freight and adds days, while this workshop has the lathe on site.

### 7.3 Tone

Direct trade voice, second person, short sentences. Technically specific — name
the operations. Confident without superlatives. No exclamation marks, no
"cutting-edge", no invented accolades.

### 7.4 Honest positions that build trust

1. Spoke cracks are not repaired — stated plainly with the reason.
2. Diamond-cut wheels have a finite number of re-cuts.
3. Turnaround is confirmed at quote, not promised on a web page.
4. Not every wheel is worth repairing; assessment may say replace.

Research showed competitors uniformly claim everything is fixable. Stating the
limits differentiates on credibility at zero cost.

### 7.5 Compliance note

Transport Victoria's VSI 8 states *"Repaired or damaged alloy wheels aren't
acceptable."* NSW's VSI.09 contains **no** equivalent prohibition. Bowral is in
NSW, so the business is fine — but copy must avoid absolute national
roadworthiness claims. **AS 1638** ("Light alloy road wheels") is the relevant
standard and may be referenced factually; no compliance certification is claimed.

---

## 8. Technical implementation

### 8.1 Performance

- No framework, no bundler; two Google Font families, preconnected.
- `loading="lazy"` on below-fold images; `decoding="async"`.
- Videos `preload="metadata"` with poster frames, `muted loop playsinline autoplay`.
- Logo PNGs compressed (supplied file is 1.8 MB — resize to nav/hero/favicon
  sizes rather than shipping full resolution).
- Target Lighthouse performance ≥ 90 mobile.

### 8.2 SEO

- Unique `<title>` and meta description per page.
- `LocalBusiness` / `AutoRepair` JSON-LD with real NAP, hours, geo.
  **No `aggregateRating`** — inventing one is prohibited by C7.
- Open Graph and Twitter cards; OG image is the logo variant.
- Semantic landmarks, one `<h1>` per page, logical heading order.
- `sitemap.xml`, `robots.txt`.
- Local keywords: Bowral, Mittagong, Moss Vale, Southern Highlands.

### 8.3 Responsive

Mobile-first; breakpoints 640 / 900 / 1200 px. Hero stacks to
video-above-copy on mobile. Nav collapses to hamburger below 900 px.
Tested at 360, 768, 1440 px.

### 8.4 JS (`main.js`, ~100 lines)

Mobile nav toggle · IntersectionObserver reveal-on-scroll · gallery filter ·
smooth anchor scroll · form validation. No dependencies. Site fully readable
and navigable with JS disabled.

---

## 9. Deployment

1. `git init`; commit to `KhaleonProductions/bowral-wheel-repairs` via `gh`.
2. Two Vercel projects from the one repo:
   - `bowral-wheel-repairs-red` → root `variant-red/`
   - `bowral-wheel-repairs-graphite` → root `variant-graphite/`
3. `shared/` is referenced by relative path from both and deployed with each.
4. Both URLs reported to the owner for side-by-side comparison.

No custom domain at this stage. After the choice, the losing variant and its
Vercel project are deleted and the winner promoted to the repo root.

---

## 10. Verification before sign-off

Per the project's standing rule, nothing is reported as working until observed.

| # | Check | Method |
|---|---|---|
| V1 | Both variants render, all 6 pages, no console errors | Local server, browser |
| V2 | Videos autoplay muted and loop, **no pillarbox bars** | Visual, mobile + desktop |
| V3 | Lathe photo present and legible on About | Visual |
| V4 | Red logo correct: chrome and white preserved | Visual at 44/120/full px |
| V5 | **Zero pricing** anywhere | `grep -rE '\$[0-9]'` → no matches |
| V6 | **No body shop reference** | `grep -riE 'body ?shop\|mittagong smash'` → no matches |
| V7 | No competitor images | `grep -ri 'cncwheels\|spotonwheel'` in variants → no matches |
| V8 | No broken links or missing assets | Link check, network panel |
| V9 | Responsive at 360/768/1440 | Browser resize |
| V10 | Contrast AA on body text, both variants | Contrast check |
| V11 | Both Vercel deployments live and reachable | `curl -I` → 200 |
| V12 | No fabricated ratings or certifications | Manual copy read |

---

## 11. Out of scope

Custom domain · CMS · booking or payment · live chat · analytics ·
real photography beyond the three supplied assets · multi-language ·
the click-to-call widget used by the sibling site (external absolute path,
and it would visually link the two businesses).
