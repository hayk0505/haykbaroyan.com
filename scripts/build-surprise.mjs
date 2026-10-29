#!/usr/bin/env node
/*
 * Encrypts surprise-src/content.json into data.json for the private static page.
 * Node built-ins only. Run locally:  node scripts/build-surprise.mjs
 * The plaintext source and the config stay in surprise-src/ (gitignored).
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { randomBytes, pbkdf2Sync, createCipheriv } from 'node:crypto';
import { createRequire } from 'node:module';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const srcDir = join(root, 'surprise-src');
const { slug } = JSON.parse(readFileSync(join(srcDir, 'config.json'), 'utf8'));
const outDir = join(root, 'app', 'public', slug);
const core = createRequire(import.meta.url)(join(outDir, 'core.js'));

const ITER = 200_000;
const MAX_ATTEMPTS = 100;

const content = JSON.parse(
  readFileSync(join(srcDir, 'content.json'), 'utf8').replaceAll('{{HER_NAME}}', '__HER_NAME__')
);
const herName = content.herName;
const fill = (v) =>
  typeof v === 'string'
    ? v.replaceAll('__HER_NAME__', herName)
    : Array.isArray(v)
      ? v.map(fill)
      : v;

const aad = (tag, id) => Buffer.from(tag + id, 'utf8');

function gcm(key, iv, additional, plain) {
  const c = createCipheriv('aes-256-gcm', key, iv);
  c.setAAD(additional);
  return Buffer.concat([c.update(plain), c.final(), c.getAuthTag()]); // tag appended, as WebCrypto expects
}

function wrap(cek, id, password) {
  const salt = randomBytes(16);
  const iv = randomBytes(12);
  const kek = pbkdf2Sync(Buffer.from(password, 'utf8'), salt, ITER, 32, 'sha256');
  return {
    s: salt.toString('base64'),
    i: iv.toString('base64'),
    k: gcm(kek, iv, aad('w', id), cek).toString('base64')
  };
}

function seal(id, cek, payload) {
  const iv = randomBytes(12);
  return { i: iv.toString('base64'), c: gcm(cek, iv, aad('p', id), Buffer.from(JSON.stringify(payload), 'utf8')).toString('base64') };
}

function buildOnce() {
  const s = {};
  const ceks = {};
  for (const id of ['1', '2', '3', 'f']) {
    const st = content.stages[id];
    const cek = randomBytes(32);
    ceks[id] = cek;
    const normalise = id === 'f' ? core.normDigits : core.norm;
    const answers = [...new Set(st.answers.map(normalise))].filter(Boolean);
    const passwords =
      id === 'f'
        ? answers.map((a) => core.finalPassword(a, [ceks['1'], ceks['2'], ceks['3']]))
        : answers;
    const payload = { riddle: fill(st.riddle), hints: fill(st.hints) };
    if (id === 'f') payload.closing = fill(st.closing);
    s[id] = { w: passwords.map((p) => wrap(cek, id, p)), ...seal(id, cek, payload) };
  }
  return { v: 1, n: ITER, s };
}

// Fragments that must never appear (case-insensitively) inside the shipped JSON,
// even by coincidence in the base64 text. If one does, we simply re-roll the randomness.
function forbiddenFragments() {
  const out = new Set([herName.toLowerCase()]);
  for (const st of Object.values(content.stages)) {
    const text = [...st.riddle, ...st.hints, st.closing ?? ''].join(' ');
    for (const w of text.toLowerCase().match(/[a-z]{5,}/g) ?? []) out.add(w);
    for (const a of st.answers) out.add(String(a).toLowerCase());
  }
  return [...out];
}

async function selfCheck(data) {
  // Uses the very same core.js the browser runs.
  const ceks = [];
  for (const id of ['1', '2', '3']) {
    const st = content.stages[id];
    for (const a of st.answers) {
      const cek = await core.unlock(data, id, core.norm(a));
      if (!cek) throw new Error(`stage ${id}: accepted answer failed to unlock`);
      const p = await core.open(data, id, cek);
      if (JSON.stringify(p.riddle) !== JSON.stringify(fill(st.riddle))) throw new Error(`stage ${id}: payload mismatch`);
    }
    if (await core.unlock(data, id, core.norm('definitely not it'))) throw new Error(`stage ${id}: wrong answer unlocked`);
    ceks.push(await core.unlock(data, id, core.norm(st.answers[0])));
  }
  const code = content.stages.f.answers[0];
  const good = await core.unlock(data, 'f', core.finalPassword(core.normDigits(code), ceks));
  if (!good) throw new Error('final: code failed to unlock');
  if (await core.unlock(data, 'f', core.normDigits(code))) throw new Error('final: code alone must not unlock');
  if (await core.unlock(data, 'f', core.finalPassword('000', ceks))) throw new Error('final: wrong code unlocked');
}

const bad = forbiddenFragments();
let data;
let json;
for (let attempt = 1; ; attempt++) {
  if (attempt > MAX_ATTEMPTS) throw new Error('could not produce a clean data.json');
  data = buildOnce();
  json = JSON.stringify(data);
  const lower = json.toLowerCase();
  if (!bad.some((frag) => lower.includes(frag))) break;
}

await selfCheck(data);
writeFileSync(join(outDir, 'data.json'), json + '\n');
console.log(`data.json written (${json.length} bytes, ${ITER} PBKDF2 iterations, self-check passed)`);
