# Handoff: registering Bowral Wheel Repairs on BusinessBrain

**For:** Sam
**From:** Scott
**Date:** 2026-09-16
**Repo:** https://github.com/KhaleonProductions/bowral-wheel-repairs (private, `KhaleonProductions`)

---

## What this is

A six-page marketing site for **Bowral Wheel Repairs** — a CNC alloy wheel
repair business in Bowral, NSW. Built in Next.js 16 + Tailwind v4 to match the
shape of `The-Everything-AI-APP/website-starter-nextjs`, specifically so it can
be adopted by the `website-builder` platform without a rewrite.

Three colour variants are live for the owner to choose from. They are one
codebase themed by `NEXT_PUBLIC_THEME`, so two of the three Vercel projects get
deleted once a decision is made.

| Variant | URL | Vercel project |
|---|---|---|
| Red | https://bowral-wheel-repairs-red.vercel.app | `bowral-wheel-repairs-red` |
| Graphite | https://bowral-wheel-repairs-graphite.vercel.app | `bowral-wheel-repairs-graphite` |
| Chrome | https://bowral-wheel-repairs-chrome.vercel.app | `bowral-wheel-repairs-chrome` |

All three currently sit under the `scottabbott-9410s-projects` team
(`team_UtyTk6EJyY4ychVJV7ZhZvCA`), with deployment protection disabled so the
owner can review them.

## Nothing in the BusinessBrain repo has been touched

No files, no migrations, no workflows. Everything below is a proposal for your
review, not work already done. **R31** applies to step 2 — it adds a numbered
SQL migration — so it needs your sign-off and must not be self-merged.

## What we verified about the platform first

Worth stating plainly, because the original brief assumed otherwise:

| Assumption | Verified reality |
|---|---|
| Client sites run on Cloudflare | They run on **Vercel**. Cloudflare provides DNS only — a CNAME to `cname.vercel-dns.com` with `proxied: false`, because Vercel SSL breaks behind the orange cloud. There is no `wrangler.toml`, Worker or Pages project anywhere in the repo. |
| Sites live in the monorepo | Each site is its **own repo** under `The-Everything-AI-APP`, cloned from `website-starter-nextjs`. The monorepo holds the bot that builds them. |
| Sites use the platform's auth | Client sites are **fully public with no login and no admin area**. Entra auth, RBAC and the authorization engine gate the *editing* path via the Teams bot. A site's only credential is its outbound contact-form webhook secret. |

Because of that, this is deliberately built as **Option A** — conform to the
existing convention, introduce no new infrastructure.

## Steps needed

### 1. Repo placement — your call

The repo is currently `KhaleonProductions/bowral-wheel-repairs`. Per
`websiteProvisioning.ts:70`, `getGitHubToken(githubOrg)` picks the PAT by org:
`GITHUB_ADMIN_TOKEN` for `The-Everything-AI-APP`, the legacy `GITHUB_TOKEN` for
`staino83`.

**Question for you:** move or mirror it to `The-Everything-AI-APP` so the
standard admin token applies, or register it in place and accept that the
platform cannot write to it? Bot-driven editing needs the former.

### 2. Register the site — needs your review (R31)

Insert one row into `brain.tenant_websites`. Migration
`105_tenant_websites.sql` (lines 86–111) hand-seeds two SG1 sites and is the
precedent for a manually-registered, non-bot-provisioned site.

Next migration number is **204**. Values to confirm with you:

| Column | Proposed value | Note |
|---|---|---|
| `tenant_id` | ? | Which tenant owns this? New tenant, or existing? |
| `name` | `Bowral Wheel Repairs` | |
| `slug` | `bowral-wheel-repairs` | |
| `github_org` | `The-Everything-AI-APP` | Depends on step 1 |
| `github_repo` | `bowral-wheel-repairs` | |
| `repo_root_dir` | *(repo root)* | Not a subdirectory |
| `vercel_project_name` | winning variant's project | After the owner chooses |
| `production_branch` | `main` | Currently the only branch |
| `primary_domain` | `bowralwheelrepairs.com.au` | Not yet purchased |
| `asset_path` | `public/assets` | Matches the column default |
| `lifecycle_status` | `live` | Or `draft` until the domain is attached |
| `webhook_secret` | generate | |

### 3. Vercel env vars

Once registered, set on the winning project:

```
BB_TENANT_ID
BB_WEBHOOK_SECRET
BB_WEBHOOK_URL
```

`app/api/contact/route.ts` already implements the contract and **degrades
gracefully** — with these unset it accepts the submission, logs it and returns
success. So the form works today and gains CRM integration the moment the vars
land, with no code change. Verified: 200 in fallback, 422 on invalid input, 400
on malformed JSON.

### 4. Domain

`bowralwheelrepairs.com.au` is not registered yet. When it is, the existing
`setupWebsiteDomain()` path handles it: Vercel domain attach, then a Cloudflare
zone and CNAME to `cname.vercel-dns.com` with `proxied: false`.

### 5. Clean up

After the owner picks a variant, delete the other two Vercel projects and the
losing theme token blocks in `app/globals.css`.

## What registration buys

Everything the platform already does for a registered site:

- Contact form → AI spam classification → owner email via Graph → customer
  auto-reply → CRM contact and deal → Teams notification
- Chat-driven copy editing with a live dev preview at
  `bowral-wheel-repairs-dev.the-everything-app.com`
- The owner-approval gate on publishing (the `dev_promote` flow from #758)

## Things to know before reviewing

**All copy lives in `content/site.json`**, validated by a Zod schema at import —
an invalid content file fails the build rather than shipping a broken page.
Nothing is hardcoded in components. This is what makes bot-driven editing
possible; copy baked into JSX would not be editable that way.

**Hard constraints are enforced by tests, not convention.** `npm test` greps
both the content file and every shipped source file for: pricing figures, any
reference to the co-located business at the same address, competitor domains,
fabricated ratings or `aggregateRating`, committed turnaround times, and
exclusivity claims. 17 tests, all passing.

**The site deliberately makes no exclusivity claim.** Spot On Wheel Repairs
(Berkeley, ~70 km) already advertises into "Southern Highlands, Bowral,
Goulburn" by name, and a Mittagong detailer markets CNC diamond cutting while
its own site says it outsources structural repairs. The positioning used is
*in-house CNC machining, in Bowral, no freight* — defensible if a customer
checks.

**No turnaround times are committed anywhere**, at the owner's instruction. A
dedicated turnaround page is planned once real workshop capacity is known.

**12 media placeholder slots** are awaiting the business's own photography (6
gallery before/after pairs, 6 process steps). Each renders a labelled "Photo
coming soon" panel naming the required shot — never a broken image, never stock.

## Reference

- `README.md` — running locally, the Tailwind v4 collision gotcha, media pipeline
- `docs/superpowers/specs/2026-09-15-bowral-wheel-repairs-design.md` — design spec
- `docs/superpowers/plans/2026-09-15-bowral-wheel-repairs.md` — implementation plan
- `research/cncwheels-image-urls.txt` — competitor image catalogue, retained as a
  **shot list only**; nothing downloaded or deployed
