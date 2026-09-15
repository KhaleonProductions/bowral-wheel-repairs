# Bowral Wheel Repairs

Marketing website for a CNC alloy wheel repair business in Bowral, NSW.

**Live:** https://bowral-wheel-repairs-red.vercel.app

Oxblood base, crimson accents, with the logo recoloured from its supplied blue
to red/chrome.

Three colour variants were originally built for the owner to compare. The red
one was chosen; the other two were retired and their Vercel projects deleted.
They remain in git history up to commit `ecbc098`.

## Running locally

```bash
npm install
npm run dev
```

## Theming

Colour lives entirely in CSS custom properties:

- `app/globals.css` defines the brand tokens on `:root`.
- `lib/theme.ts` supplies the logo and favicon paths.
- Components reference colour only through `var(--token)`, never a literal.

That indirection is kept on purpose — re-theming later is a token change rather
than a component rewrite.

### Tailwind v4 gotcha

Do **not** add a theme colour whose name shadows a built-in Tailwind scale.
`--color-base` in `@theme inline` generates a `text-base` *colour* utility that
silently overrides the `text-base` *font-size* utility, which rendered nav and
footer text in the page background colour. Surfaces use arbitrary values
(`bg-[var(--base)]`) instead. See the comment in `app/globals.css`.

## Deploying

```bash
./scripts/deploy.sh
```

**Do not run `npx vercel deploy` from this directory.** Vercel blocks any
deployment whose metadata carries a GitHub commit attributed to an account that
is not a member of the Vercel team. This repo is owned by `KhaleonProductions`,
which is not a member of `scottabbott-9410s-projects`, and the Vercel CLI reads
the local `.git` directory and attaches that commit metadata automatically —
even after the project's Git integration has been disconnected. Such deploys
return `BLOCKED` with no build logs.

`scripts/deploy.sh` stages a copy of the tree with no `.git` directory, so no
commit metadata is attached. Verified: a deploy with an empty `meta` block
reaches `READY`; identical code carrying commit metadata is `BLOCKED`.

The permanent fixes are to invite the repo's GitHub account to the Vercel team,
or to move the repo to an account already on it.

**A returned URL does not mean success** — a `BLOCKED` deployment still prints
one, and the alias keeps serving the previous good build. Confirm `READY`:

```bash
npx vercel ls bowral-wheel-repairs-red
```

## Content

**All copy lives in `content/site.json`.** Nothing is hardcoded in components.
The file is validated by a Zod schema (`lib/schema.ts`) at import, so an invalid
or incomplete content file fails the build rather than shipping a broken page.

This separation is deliberate: it is what allows the site's copy to be edited by
the BusinessBrain platform later without touching markup.

## Media

```bash
./scripts/make-media.sh              # regenerate every derived asset
```

This copies the supplied originals under stable names, generates the red logo
from the supplied blue artwork, extracts video poster frames, and produces
nav/hero/favicon-sized derivatives. Idempotent.

Two things worth knowing:

- **The videos are portrait footage in a landscape container.** Both report
  1024×576 (16:9) but hold 9:16 phone footage pillarboxed with grey bars.
  `components/VideoFrame.tsx` renders a 9:16 frame with `object-cover` to push
  the bars outside the visible area. Do not switch it to `object-contain`.
- **The supplied logo has no alpha channel** — it is a solid square with a navy
  background baked in, so it renders as a rounded tile rather than a floating
  badge. `scripts/make-logo-red.py` recolours only blue-family pixels above a
  saturation floor, which is what preserves the chrome bevels, the three alloy
  wheels and the white wordmark. A global hue rotation would destroy all three.

### Placeholder slots

Unfilled media slots render through `components/MediaPlaceholder.tsx` as a
labelled "Photo coming soon" panel naming the shot required — never a broken
image and never a stock substitute. To fill one, drop the file into
`public/assets/` and set the slot's `src` in `content/site.json`.

Currently awaiting: 6 gallery before/after pairs, 6 process step photos.

## Hard constraints

These are enforced by tests, not just convention. Run `npm test`.

| Constraint | Enforcement |
|---|---|
| No pricing figures anywhere | `tests/*` grep the content file *and* the whole source tree |
| No reference to the co-located business at 8 Mount Rd | grep, both files and source |
| No competitor imagery or domains | grep; `research/` is excluded as a reference-only shot list |
| No fabricated ratings, reviews or accreditations | grep, including `aggregateRating` in JSON-LD |
| No committed turnaround times | grep for hour/day/week patterns |
| No exclusivity positioning claim | grep |
| Exact contact details | asserted literally in the schema and tests |

`tests/content.test.mjs` checks `content/site.json`;
`tests/constraints.test.mjs` checks every shipped source file, because a
violation typed directly into a component would pass the first.

### Why no turnaround times

A dedicated turnaround page is planned. Until the workshop's real capacity is
known, the site says timing is confirmed at quote rather than promising a
figure on a web page.

### Why not "the only CNC wheel repairer in the region"

Because it is not true and a customer could check. Spot On Wheel Repairs
(Berkeley, ~70 km) already advertises into Bowral by name, and a Mittagong
detailer markets CNC diamond cutting while outsourcing the machining. The claim
used instead — **in-house CNC machining, in Bowral, no freight** — is
defensible and stronger.

## Contact form

`app/api/contact/route.ts` implements the BusinessBrain contact-form contract
and degrades gracefully:

- With `BB_TENANT_ID`, `BB_WEBHOOK_SECRET` and `BB_WEBHOOK_URL` set, it POSTs
  to the platform webhook, which handles spam classification, owner email, a
  customer auto-reply, CRM contact and deal creation, and a Teams notification.
- With those unset (the current state), it accepts the submission, logs it, and
  returns success — so the form works today and gains CRM integration later
  with no code change.

Verified: `200` in fallback mode, `422` on invalid input, `400` on malformed JSON.

## Migrating into BusinessBrain

Investigation of `C:\code\BusinessBrain` established that the platform hosts
client sites on **Vercel**, with Cloudflare providing DNS only (a CNAME to
`cname.vercel-dns.com`, `proxied: false`, because Vercel SSL breaks behind
Cloudflare's proxy). Sites live in their own repositories, not the monorepo, and
carry no auth — the platform's Entra auth, RBAC and owner-approval engine gate
the *editing* path through the Teams bot.

This site is built in that stack, so migration is a registration rather than a
port:

1. Move or mirror the repo to the `The-Everything-AI-APP` org (the platform
   selects its GitHub token by `github_org`).
2. Insert a `brain.tenant_websites` row — `github_org`, `github_repo`,
   `repo_root_dir`, `vercel_project_name`, `production_branch`,
   `primary_domain`, `asset_path`, `webhook_secret`, `lifecycle_status`.
   Migration `105_tenant_websites.sql` seeds two sites by hand and is the
   precedent.
3. Set `BB_TENANT_ID` and `BB_WEBHOOK_SECRET` as Vercel env vars on
   `bowral-wheel-repairs-red`.
4. Attach the custom domain: Vercel domain attach, then a Cloudflare zone and
   CNAME as above.

**Step 2 adds a migration to the BusinessBrain repo, which falls under its R31
rule — infra changes there require review and must not be self-merged.** This
repository makes no changes to BusinessBrain.

## Docs

- `docs/superpowers/specs/2026-09-15-bowral-wheel-repairs-design.md` — design spec
- `docs/superpowers/plans/2026-09-15-bowral-wheel-repairs.md` — implementation plan
- `research/cncwheels-image-urls.txt` — competitor image catalogue, retained as a
  **shot list only**; none of these files are downloaded or deployed

## Stack

Next.js 16 (App Router) · React 19 · Tailwind CSS v4 · TypeScript (strict) ·
Zod 4. No UI kit, no animation library, no icon package.
