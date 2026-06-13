/*
 * Minimal zero-dependency smoke test for K_Binders_LivingMeta.
 * Run: node tests/smoke.test.js
 *
 * Covers the two things most likely to silently break:
 *   1. The registry pseudo-IPD survival primitives (Kaplan-Meier, median, RMST)
 *      against a hand-computed reference case.
 *   2. Basic shipped-HTML integrity (SRI on the one external CDN link,
 *      no unfilled template tokens).
 */
'use strict';

const assert = require('assert');
const fs = require('fs');
const path = require('path');

let passed = 0;
function check(name, fn) {
  fn();
  passed++;
  console.log('  ok - ' + name);
}

// ---------------------------------------------------------------------------
// 1. Survival primitives (deterministic, hand-verifiable)
// ---------------------------------------------------------------------------
const RIPD = require(path.join(__dirname, '..', 'assets', 'js', 'pseudo-ipd.js'));
const H = RIPD._;

// 4 events at t=1..4, no censoring -> S = .75, .5, .25, 0
const ipd = [1, 2, 3, 4].map((t) => ({ time: t, status: 1 }));
const km = H.kmFromIPD(ipd);

check('kmFromIPD produces one step per distinct event time', () => {
  assert.strictEqual(km.length, 4);
});

check('kmFromIPD survival is monotone non-increasing from 1 to 0', () => {
  const S = km.map((s) => s.S);
  assert.ok(Math.abs(S[0] - 0.75) < 1e-12, 'S(1)=0.75');
  assert.ok(Math.abs(S[1] - 0.5) < 1e-12, 'S(2)=0.5');
  assert.ok(Math.abs(S[2] - 0.25) < 1e-12, 'S(3)=0.25');
  assert.ok(Math.abs(S[3] - 0) < 1e-12, 'S(4)=0');
});

check('medianFromKM (step) = first time with S<=0.5', () => {
  assert.strictEqual(H.medianFromKM(km), 2);
});

check('rmst to tau=4 equals area under KM step (=2.5)', () => {
  assert.ok(Math.abs(H.rmst(km, 4) - 2.5) < 1e-12);
});

check('kmFromIPD([]) returns empty (no crash on empty input)', () => {
  assert.deepStrictEqual(H.kmFromIPD([]), []);
});

// ---------------------------------------------------------------------------
// 2. Shipped-HTML integrity
// ---------------------------------------------------------------------------
const html = fs.readFileSync(
  path.join(__dirname, '..', 'K_BINDERS_REVIEW.html'),
  'utf8'
);

check('no unfilled placeholder tokens in shipped HTML', () => {
  assert.ok(!/REPLACE_ME|__PLACEHOLDER__/.test(html));
});

check('the external Font Awesome CDN link carries an SRI integrity hash', () => {
  const m = html.match(/cdnjs\.cloudflare\.com[^"]*all\.min\.css"[^>]*/g) || [];
  assert.ok(m.length > 0, 'found a Font Awesome link');
  m.forEach((tag) =>
    assert.ok(/integrity="sha\d+-/.test(tag), 'link has SRI: ' + tag)
  );
});

check('no hardcoded local filesystem paths in shipped HTML', () => {
  assert.ok(!/[A-Za-z]:\\Users\\|\/home\/[a-z]/.test(html));
});

console.log('\n' + passed + ' passed');
