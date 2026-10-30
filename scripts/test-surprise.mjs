#!/usr/bin/env node
/*
 * Fixture + round-trip tests for the private page's normalisation and unlock logic.
 * Runs the exact core.js the browser uses. Node built-ins only.
 *   node scripts/test-surprise.mjs
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const srcDir = join(root, 'surprise-src');
const { slug } = JSON.parse(readFileSync(join(srcDir, 'config.json'), 'utf8'));
const outDir = join(root, 'app', 'public', slug);
const core = createRequire(import.meta.url)(join(outDir, 'core.js'));

let passed = 0;
const ok = (name, fn) =>
  Promise.resolve(fn()).then(() => {
    passed++;
    console.log('  ok  ', name);
  });

// ---------- norm / normDigits fixtures (generic strings, unrelated to the game) ----------
await ok('norm: accents, spaces, punctuation', () => {
  assert.equal(core.norm('Café  Déjà-Vu!!'), 'cafedejavu');
  assert.equal(core.norm('  ÅNGSTRÖM_42 '), 'angstrom42');
  assert.equal(core.norm('ＡＢＣ １２３'), 'abc123'); // full-width folds under NFKD
  assert.equal(core.norm("It's  a   test."), 'itsatest');
  assert.equal(core.norm(''), '');
  assert.equal(core.norm(null), '');
  assert.equal(core.norm(undefined), '');
});
await ok('normDigits: strips non-digits', () => {
  assert.equal(core.normDigits('1-2 3'), '123');
  assert.equal(core.normDigits('a1b2c3'), '123');
  assert.equal(core.normDigits('４ ２'), '42');
  assert.equal(core.normDigits('abc'), '');
  assert.equal(core.normDigits(null), '');
});
await ok('b64 round trip', () => {
  const bytes = new Uint8Array([0, 1, 2, 250, 251, 252, 255]);
  assert.deepEqual([...core.b64d(core.b64e(bytes))], [...bytes]);
});

// ---------- round trip against the real data.json ----------
const data = JSON.parse(readFileSync(join(outDir, 'data.json'), 'utf8'));
const content = JSON.parse(readFileSync(join(srcDir, 'content.json'), 'utf8'));
const herName = content.herName;
const fill = (v) =>
  typeof v === 'string'
    ? v.replaceAll('{{HER_NAME}}', herName)
    : Array.isArray(v)
      ? v.map(fill)
      : v;

const variantsOf = (a) => [a, a.toUpperCase(), a.split('').join(' '), a.split('').join('-') + '!!', `  ${a}  `];
const ceks = {};

for (const id of ['1', '2', '3']) {
  const st = content.stages[id];
  await ok(`stage ${id}: every accepted answer and its sloppy variants unlock`, async () => {
    for (const a of st.answers) {
      for (const v of variantsOf(a)) {
        const cek = await core.unlock(data, id, core.norm(v));
        assert.ok(cek, `variant failed for stage ${id}`);
        const payload = await core.open(data, id, cek);
        assert.deepEqual(payload.riddle, fill(st.riddle));
        assert.deepEqual(payload.hints, fill(st.hints));
        assert.equal(payload.digit, st.digit);
        ceks[id] ??= cek;
      }
    }
  });
  await ok(`stage ${id}: wrong answers fail`, async () => {
    assert.equal(await core.unlock(data, id, core.norm('definitely wrong')), null);
    assert.equal(await core.unlock(data, id, ''), null);
    for (const other of ['1', '2', '3']) {
      if (other === id) continue;
      const foreign = core.norm(content.stages[other].answers[0]);
      assert.equal(await core.unlock(data, id, foreign), null, `stage ${other} answer opened stage ${id}`);
    }
  });
}

const code = content.stages.f.answers[0];
const chain = [ceks['1'], ceks['2'], ceks['3']];
await ok('final: code variants decrypt (with the three stage keys)', async () => {
  const variants = [code, code.split('').join('-'), code.split('').join(' '), code.split('').join(', '), `  ${code} `];
  for (const v of variants) {
    const cek = await core.unlock(data, 'f', core.finalPassword(core.normDigits(v), chain));
    assert.ok(cek, 'code variant failed');
    const payload = await core.open(data, 'f', cek);
    assert.deepEqual(payload.riddle, fill(content.stages.f.riddle));
    assert.equal(payload.closing, fill(content.stages.f.closing));
  }
});
await ok('final: wrong code, code alone, and wrong chain all fail', async () => {
  const wrong = String((Number(code[0]) + 1) % 10) + code.slice(1);
  assert.equal(await core.unlock(data, 'f', core.finalPassword(wrong, chain)), null);
  assert.equal(await core.unlock(data, 'f', core.normDigits(code)), null);
  assert.equal(await core.unlock(data, 'f', core.finalPassword(code, [chain[0], chain[1], chain[1]])), null);
});

// ---------- the shipped JSON must not contain readable fragments ----------
await ok('data.json has no readable fragments', () => {
  const lower = JSON.stringify(data).toLowerCase();
  const words = new Set([herName.toLowerCase()]);
  for (const st of Object.values(content.stages)) {
    for (const w of [...st.riddle, ...st.hints, st.closing ?? ''].join(' ').toLowerCase().match(/[a-z]{5,}/g) ?? []) words.add(w);
    for (const a of st.answers) words.add(String(a).toLowerCase());
  }
  for (const w of words) assert.ok(!lower.includes(w), `data.json contains "${w}"`);
});

console.log(`\n${passed} checks passed`);
