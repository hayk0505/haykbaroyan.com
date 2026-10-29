/*
 * Shared by the browser page, the build script and the node tests, so the
 * normalisation and the unlock logic cannot drift apart. Needs WebCrypto
 * (browsers over https/localhost, and Node >= 19 via globalThis.crypto).
 */
(function (root, factory) {
  var api = factory();
  if (typeof module === 'object' && module.exports) {
    module.exports = api;
  } else {
    root.CaseCore = api;
  }
})(typeof self !== 'undefined' ? self : globalThis, function () {
  'use strict';

  var enc = new TextEncoder();
  var dec = new TextDecoder();

  /** Free-text answers: NFKD, drop accents, lowercase, keep [a-z0-9] only. */
  function norm(s) {
    return String(s == null ? '' : s)
      .normalize('NFKD')
      .replace(/[̀-ͯ]/g, '')
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '');
  }

  /** Numeric code: strip everything that is not a digit. */
  function normDigits(s) {
    return String(s == null ? '' : s).normalize('NFKD').replace(/\D/g, '');
  }

  function b64d(str) {
    var bin = atob(str);
    var out = new Uint8Array(bin.length);
    for (var i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
    return out;
  }

  function b64e(bytes) {
    var s = '';
    for (var i = 0; i < bytes.length; i++) s += String.fromCharCode(bytes[i]);
    return btoa(s);
  }

  async function deriveKek(password, salt, iterations) {
    var subtle = globalThis.crypto.subtle;
    var base = await subtle.importKey('raw', enc.encode(password), 'PBKDF2', false, ['deriveKey']);
    return subtle.deriveKey(
      { name: 'PBKDF2', salt: salt, iterations: iterations, hash: 'SHA-256' },
      base,
      { name: 'AES-GCM', length: 256 },
      false,
      ['decrypt']
    );
  }

  /**
   * Try every wrapper of a stage with the given (already normalised) password.
   * Resolves to the stage content key (Uint8Array) or null when none accepts it.
   */
  async function unlock(data, id, password) {
    var st = data && data.s && data.s[id];
    if (!st || !password) return null;
    var subtle = globalThis.crypto.subtle;
    var aad = enc.encode('w' + id);
    for (var i = 0; i < st.w.length; i++) {
      var w = st.w[i];
      try {
        var kek = await deriveKek(password, b64d(w.s), data.n);
        var raw = await subtle.decrypt(
          { name: 'AES-GCM', iv: b64d(w.i), additionalData: aad },
          kek,
          b64d(w.k)
        );
        return new Uint8Array(raw);
      } catch (e) {
        /* GCM authentication failed: wrong answer for this wrapper */
      }
    }
    return null;
  }

  /** Decrypt a stage payload with its content key. */
  async function open(data, id, cek) {
    var st = data.s[id];
    var subtle = globalThis.crypto.subtle;
    var key = await subtle.importKey('raw', cek, 'AES-GCM', false, ['decrypt']);
    var pt = await subtle.decrypt(
      { name: 'AES-GCM', iv: b64d(st.i), additionalData: enc.encode('p' + id) },
      key,
      b64d(st.c)
    );
    return JSON.parse(dec.decode(pt));
  }

  /** The last stage is keyed on the code AND on the three earlier content keys. */
  function finalPassword(digits, ceks) {
    return digits + '|' + ceks.map(b64e).join('|');
  }

  return {
    norm: norm,
    normDigits: normDigits,
    b64d: b64d,
    b64e: b64e,
    unlock: unlock,
    open: open,
    finalPassword: finalPassword
  };
});
