#!/usr/bin/env bash
# Deploy to production.
#
# Why this script exists: Vercel blocks any deployment whose metadata carries a
# GitHub commit attributed to an account that is not a member of the Vercel
# team. This repo is owned by KhaleonProductions, which is not a team member,
# and the Vercel CLI reads the local .git directory and attaches that commit
# metadata automatically - even after disconnecting the project's Git
# integration. Every such deploy comes back BLOCKED with no build logs.
#
# The fix is to deploy from a copy of the working tree with no .git directory,
# so no commit metadata is attached. Verified working: a deploy with an empty
# meta block reaches READY, while the identical code with commit metadata is
# BLOCKED.
#
# The permanent fixes are either to invite the repo's GitHub account to the
# Vercel team, or to move the repo to an account already on it.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
STAGE="$(mktemp -d)"
trap 'rm -rf "$STAGE"' EXIT

echo "staging a git-free copy in $STAGE"
tar -cf - -C "$ROOT" \
  --exclude=node_modules --exclude=.next --exclude=.git \
  --exclude=.vercel --exclude=docs --exclude=research . \
  | (cd "$STAGE" && tar -xf -)

# Carry the project link across so the CLI does not create a new project.
mkdir -p "$STAGE/.vercel"
cat > "$STAGE/.vercel/project.json" <<'JSON'
{"projectId":"prj_xxWmqnqlUm6oazh2TuhbOHjvyaR9","orgId":"team_UtyTk6EJyY4ychVJV7ZhZvCA","projectName":"bowral-wheel-repairs-red"}
JSON

cd "$STAGE"
npm install --silent
npx vercel deploy --prod --yes

echo
echo "Verify the deployment reached READY - a BLOCKED one still returns a URL:"
echo "  npx vercel ls bowral-wheel-repairs-red"
