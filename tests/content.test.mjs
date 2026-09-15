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
    'business',
    'contact',
    'nav',
    'quoteCta',
    'home',
    'newcomer',
    'straightAnswers',
    'workshop',
    'whyUs',
    'services',
    'process',
    'gallery',
    'about',
    'contactPage',
    'seo',
  ]) {
    assert.ok(key in raw, `missing section: ${key}`);
  }
});
