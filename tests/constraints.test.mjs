import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, extname, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

/**
 * Task 1's tests check content/site.json. These check EVERYTHING shipped -
 * component copy, metadata, alt text and comments - because a constraint
 * violation hand-typed into a .tsx file would pass the content test.
 *
 * research/ and docs/ are excluded: the research file legitimately catalogues
 * competitor URLs and pricing as a shot list and reference, and the spec and
 * plan quote the constraints themselves. Neither is deployed.
 */
const ROOT = fileURLToPath(new URL('..', import.meta.url));
const SKIP_DIRS = new Set([
  'node_modules',
  '.next',
  '.git',
  'out',
  'research',
  'docs',
  '.vercel',
  'scripts',
]);
const EXTS = new Set(['.ts', '.tsx', '.js', '.mjs', '.json', '.css']);
const SKIP_FILES = new Set(['package-lock.json']);

function sourceFiles(dir = ROOT, acc = []) {
  for (const entry of readdirSync(dir)) {
    if (SKIP_DIRS.has(entry) || SKIP_FILES.has(entry)) continue;
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) sourceFiles(full, acc);
    else if (EXTS.has(extname(entry))) acc.push(full);
  }
  return acc;
}

// Tests themselves contain the banned patterns as assertions, so exclude them.
const files = sourceFiles().filter((f) => !f.includes(`${sep}tests${sep}`));
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

test('C3: no unapproved logo assets referenced', () => {
  assert.deepEqual(offenders(/["'/]logo\.png|bodyshop/i), []);
});

test('C4: no competitor references', () => {
  assert.deepEqual(offenders(/cncwheels|spotonwheel|highlandsdetailing/i), []);
});

test('C7: no fabricated ratings, review counts or aggregateRating', () => {
  assert.deepEqual(offenders(/aggregateRating/), []);
  assert.deepEqual(offenders(/\b\d+(\.\d+)?\s*(star|★)/i), []);
  assert.deepEqual(offenders(/\b\d+\+?\s*(google\s+)?reviews?\b/i), []);
});

test('C8: no committed turnaround times', () => {
  assert.deepEqual(offenders(/\b\d+\s*(hour|hr|day|week)s?\b|same[-\s]day|24[-\s]?48/i), []);
});

test('no exclusivity positioning claim', () => {
  assert.deepEqual(offenders(/only\s+cnc|the\s+only\s+wheel/i), []);
});

test('exact contact details appear in the shipped content', () => {
  const all = corpus.map((c) => c.text).join('\n');
  assert.ok(all.includes('(02) 4872 2221'), 'phone number missing');
  assert.ok(all.includes('admin@bowralwheelrepairs.com.au'), 'email missing');
  assert.ok(all.includes('8 Mount Rd'), 'street address missing');
});
