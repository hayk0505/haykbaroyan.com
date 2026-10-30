(() => {
  'use strict';

  const AUDIO_MODE = 'custom';

  const TRACKS = {
    1: { id: '7FO7BolIZsl1o8DDSjeOph' },
    2: { id: '0uowUdDOAcdicQTNWR6zWa' },
    3: { id: '3ZSf1TJZyRb0rnWYuUtdX4' }
  };

  const STORAGE_KEY = 'case0111:v1';
  const API_URL = 'https://open.spotify.com/embed/iframe-api/v1';
  const API_TIMEOUT_MS = 10000;
  const READY_TIMEOUT_MS = 8000;
  const PLAY_WATCHDOG_MS = 3500;

  const STRINGS = {
    docTitle: 'CASE #0111',
    eyebrow: 'CASE #0111 · THE MISSING GIFT',
    intro: [
      'Detective, something that belongs to you has gone missing from this apartment.',
      'The case file has three witnesses. Each one will play you a melody. Name the film or series it comes from, and the witness will give you a number.',
      'Write each number down. Small details matter in this line of work.',
      'Once all three have talked, come back to this board. CASE-4 is waiting.'
    ],
    boardLabel: 'Case board',
    progress: (n) => `${n} of 3 witnesses resolved`,
    assignee: 'Assignee: Detective',
    ticketTitle: (n) => `TRACK ${n}`,
    status: {
      todo: 'TO DO',
      progress: 'IN PROGRESS',
      done: 'DONE',
      blocked: 'BLOCKED',
      ready: 'READY FOR RELEASE'
    },

    play: 'Play witness',
    pause: 'Pause witness',
    callWitness: 'Call the witness',
    playIdle: 'Press play to hear the witness.',
    connecting: 'Connecting to the witness…',
    playing: 'The witness is talking…',
    paused: 'The witness is waiting.',
    tapPlayer: 'Tap the play button on the player.',
    trouble: 'Playback was blocked. Tap play again, or switch to the tap-to-play player.',
    troubleSwitch: 'Use tap-to-play',
    manual: 'Your host will play this witness.',
    audioError: 'The audio service could not be reached. Use the player instead.',
    maskLabel: 'WITNESS AUDIO',

    answerLabel: 'Name the film or series',
    answerPlaceholder: 'Title',
    submit: 'Submit answer',
    checking: 'Checking…',
    empty: 'Resolution: No input. Type an answer first.',
    wrong: 'Resolution: Cannot reproduce. Try again, detective.',
    fixed: 'Resolution: Fixed.',
    digit: 'Report code number',
    evidence: 'Evidence location',

    escalate: 'Escalate to Support',
    escalateAgain: 'Escalate again',
    escalateSpent: 'No further escalations',
    supportMelody: 'Support notes',
    supportPlace: 'Support notes · where to look',
    supportNote: (n) => `Note ${n}`,

    melodyHints: {
      1: ['Small-town mystery, damn fine coffee.', 'A recorder, a pie, a very strange dream room.'],
      2: ['Dublin, 1868. A famous black pour.', 'Four siblings, one will.'],
      3: ['A galaxy far, far away.', 'A farm boy, a laser sword.']
    },

    final: {
      key: 'CASE-4',
      title: 'Final report',
      blockedBy: 'blocked by CASE-1, CASE-2, CASE-3',
      prompt: 'Three witnesses, three numbers. Enter them in track order.',
      codeLabel: 'Report code',
      codePlaceholder: '– – –',
      submit: 'File report',
      wrong: 'Bug: invalid input. Check your track order.',
      closingLabel: 'Case closed'
    },

    reset: 'Reset case',
    resetConfirm: 'Reset all progress on this device?',
    errSecure: 'This case file needs a secure connection (https).',
    errLoad: 'The case file could not be opened. Reload the page and try again.'
  };

  const Core = window.CaseCore;
  const reduceMotion = () => window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function h(tag, attrs, ...children) {
    const node = document.createElement(tag);
    for (const [k, v] of Object.entries(attrs || {})) {
      if (v === false || v == null) continue;
      if (k === 'class') node.className = v;
      else if (k === 'text') node.textContent = v;
      else if (k === 'hidden') node.hidden = !!v;
      else if (k.startsWith('on')) node.addEventListener(k.slice(2), v);
      else node.setAttribute(k, v === true ? '' : String(v));
    }
    for (const c of children.flat()) {
      if (c == null || c === false) continue;
      node.append(c.nodeType ? c : document.createTextNode(String(c)));
    }
    return node;
  }

  const ICON = {
    play: '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M8 5.5v13a1 1 0 0 0 1.5.86l10.5-6.5a1 1 0 0 0 0-1.72L9.5 4.64A1 1 0 0 0 8 5.5Z" fill="currentColor"/></svg>',
    pause: '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><rect x="6" y="5" width="4.2" height="14" rx="1.2" fill="currentColor"/><rect x="13.8" y="5" width="4.2" height="14" rx="1.2" fill="currentColor"/></svg>',
    spinner: '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false" class="spin"><circle cx="12" cy="12" r="8" fill="none" stroke="currentColor" stroke-width="2.5" stroke-dasharray="36 20" stroke-linecap="round"/></svg>'
  };

  const blank = () => ({
    ceks: {}, // stage id -> base64 content key (present = solved)
    started: {}, // stage id -> true
    tm: { 1: 0, 2: 0, 3: 0 }, // melody hint tiers
    tl: { 1: 0, 2: 0, 3: 0, f: 0 } // location hint tiers
  });

  let memoryState = null;

  function loadState() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const s = JSON.parse(raw);
        const b = blank();
        return {
          ceks: Object.assign(b.ceks, s.ceks),
          started: Object.assign(b.started, s.started),
          tm: Object.assign(b.tm, s.tm),
          tl: Object.assign(b.tl, s.tl)
        };
      }
    } catch (e) {
    }
    return memoryState || blank();
  }

  function save() {
    memoryState = state;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
      /* private mode etc.: keep going in memory */
    }
  }

  let data = null;
  let state = loadState();
  const payloads = {}; // decrypted payloads by stage id
  const T = {}; // ticket element refs by stage id
  const audio = {};
  for (const n of [1, 2, 3]) {
    audio[n] = { view: null, wrap: null, host: null, ctrl: null, plain: false, playing: false, watchdog: 0, mounted: null, ready: null, override: null };
  }

  const isSolved = (id) => !!payloads[id];
  const solvedCount = () => [1, 2, 3].filter((n) => isSolved(String(n))).length;

  function trackUsable(n) {
    const id = TRACKS[n] && TRACKS[n].id;
    return typeof id === 'string' && /^[A-Za-z0-9]{22}$/.test(id) && !/^TRACK_ID_/i.test(id);
  }

  function modeFor(n) {
    if (!trackUsable(n)) return 'manual';
    return audio[n].override || AUDIO_MODE;
  }

  let apiPromise = null;
  function loadApi() {
    if (apiPromise) return apiPromise;
    apiPromise = new Promise((resolve, reject) => {
      const timer = setTimeout(() => reject(new Error('timeout')), API_TIMEOUT_MS);
      window.onSpotifyIframeApiReady = (IFrameAPI) => {
        clearTimeout(timer);
        resolve(IFrameAPI);
      };
      const s = document.createElement('script');
      s.src = API_URL;
      s.async = true;
      s.onerror = () => {
        clearTimeout(timer);
        reject(new Error('load'));
      };
      document.head.append(s);
    });
    apiPromise.catch(() => {
      apiPromise = null; // allow a retry on the next press
    });
    return apiPromise;
  }

  function setView(n, view) {
    const a = audio[n];
    a.view = view;
    if (!a.wrap) return;
    a.wrap.dataset.view = view;
    if (view === 'clip') a.wrap.setAttribute('aria-hidden', 'true');
    else a.wrap.removeAttribute('aria-hidden');
  }

  function plainFallback(n) {
    const a = audio[n];
    a.plain = true;
    a.ctrl = null;
    a.host.replaceChildren(
      h('iframe', {
        src: `https://open.spotify.com/embed/track/${TRACKS[n].id}`,
        width: '100%',
        height: '80',
        frameborder: '0',
        allow: 'autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture',
        title: STRINGS.maskLabel
      })
    );
    if (a.view === 'clip') setView(n, 'masked');
    setPlayNote(n, STRINGS.audioError);
  }

  // Creates the Spotify iframe (once per track) the first time it is needed.
  function mount(n, view) {
    const a = audio[n];
    if (a.wrap) {
      setView(n, view);
      return a.mounted;
    }
    a.host = h('div', { class: 'sp-host' }, h('div', { class: 'sp-target' }));
    a.wrap = h('div', { class: 'sp', 'data-view': view }, a.host, h('div', { class: 'sp-mask', 'aria-hidden': 'true' }, h('span', { text: STRINGS.maskLabel })));
    setView(n, view);
    T[n].audio.append(a.wrap);

    a.mounted = (async () => {
      try {
        const api = await loadApi();
        const target = a.host.querySelector('.sp-target');
        a.ctrl = await new Promise((resolve) => {
          api.createController(target, { uri: `spotify:track:${TRACKS[n].id}`, width: '100%', height: 80 }, resolve);
        });
        a.ready = new Promise((resolve) => {
          a.ctrl.addListener('ready', resolve);
          setTimeout(resolve, READY_TIMEOUT_MS);
        });
        a.ctrl.addListener('playback_update', (e) => onPlayback(n, e));
      } catch (err) {
        plainFallback(n);
      }
    })();
    return a.mounted;
  }

  // Only one witness talks at a time.
  function pauseOthers(n) {
    for (const m of [1, 2, 3]) {
      if (m === n) continue;
      const o = audio[m];
      clearTimeout(o.watchdog);
      if (o.ctrl) o.ctrl.pause();
    }
  }

  function onPlayback(n, e) {
    const a = audio[n];
    const paused = !e || !e.data || e.data.isPaused !== false;
    a.playing = !paused;
    if (a.playing) {
      pauseOthers(n); // also covers the embed's own play button (tap-to-play and revealed players)
      clearTimeout(a.watchdog);
      T[n].trouble.hidden = true;
      setPlayNote(n, STRINGS.playing);
    } else if (a.view !== 'masked') {
      setPlayNote(n, STRINGS.paused);
    }
    paintPlayButton(n);
  }

  function setPlayNote(n, text) {
    if (T[n] && T[n].playNote) T[n].playNote.textContent = text;
  }

  function paintPlayButton(n, busy) {
    const t = T[n];
    const a = audio[n];
    if (!t.playBtn) return;
    t.playBtn.dataset.playing = a.playing ? 'true' : 'false';
    t.playBtn.disabled = !!busy;
    t.playBtn.setAttribute('aria-busy', busy ? 'true' : 'false');
    t.playBtn.setAttribute('aria-label', a.playing ? STRINGS.pause : STRINGS.play);
    t.playIcon.innerHTML = busy ? ICON.spinner : a.playing ? ICON.pause : ICON.play;
  }

  function touch(id) {
    if (!state.started[id]) {
      state.started[id] = true;
      save();
      refresh();
    }
  }

  async function onPlayPress(n) {
    const a = audio[n];
    const id = String(n);
    touch(id);

    if (modeFor(n) === 'masked') {
      // The embed itself carries the real play button; ours only brings it in.
      T[n].playBtn.hidden = true;
      setPlayNote(n, STRINGS.connecting);
      await mount(n, 'masked');
      setPlayNote(n, a.plain ? STRINGS.audioError : STRINGS.tapPlayer);
      return;
    }

    if (!a.ctrl) {
      paintPlayButton(n, true);
      setPlayNote(n, STRINGS.connecting);
      await mount(n, isSolved(id) ? 'reveal' : 'clip');
      paintPlayButton(n, false);
      if (!a.ctrl) return; // fell back to the plain player
      await a.ready;
      pauseOthers(n);
      a.ctrl.play();
      startWatchdog(n);
      return;
    }

    if (a.playing) {
      a.ctrl.pause();
    } else {
      pauseOthers(n);
      a.ctrl.play();
      startWatchdog(n);
    }
  }

  function startWatchdog(n) {
    const a = audio[n];
    clearTimeout(a.watchdog);
    a.watchdog = setTimeout(() => {
      if (!a.playing) {
        setPlayNote(n, STRINGS.trouble);
        T[n].trouble.hidden = false;
      }
    }, PLAY_WATCHDOG_MS);
  }

  function useTapToPlay(n) {
    audio[n].override = 'masked';
    setView(n, 'masked');
    T[n].trouble.hidden = true;
    setPlayNote(n, STRINGS.tapPlayer);
  }

  // Payoff: show the embed (title and cover) once the track is solved.
  async function reveal(n) {
    if (!trackUsable(n)) return;
    const a = audio[n];
    T[n].playBlock.hidden = true;
    clearTimeout(a.watchdog);
    await mount(n, 'reveal');
    setView(n, 'reveal');
  }

  /* =====================================================================
   * unlock logic
   * ===================================================================== */
  async function openStage(id, cek) {
    payloads[id] = await Core.open(data, id, cek);
  }

  async function submitStage(n, input, form) {
    const id = String(n);
    const t = T[id];
    const pwd = Core.norm(input.value);
    if (!pwd) return say(t.feedback, STRINGS.empty, 'warn');
    busy(form, true, STRINGS.checking);
    try {
      const cek = await Core.unlock(data, id, pwd);
      if (!cek) {
        touch(id);
        say(t.feedback, STRINGS.wrong, 'bad');
        shake(t.root);
        return;
      }
      state.ceks[id] = Core.b64e(cek);
      state.started[id] = true;
      await openStage(id, cek);
      save();
      t.feedback.textContent = '';
      refresh();
      reveal(n);
      t.solved.scrollIntoView({ behavior: reduceMotion() ? 'auto' : 'smooth', block: 'nearest' });
    } finally {
      busy(form, false);
    }
  }

  async function submitFinal(input, form) {
    const t = T.f;
    const digits = Core.normDigits(input.value);
    if (!digits) return say(t.feedback, STRINGS.empty, 'warn');
    busy(form, true, STRINGS.checking);
    try {
      const chain = ['1', '2', '3'].map((id) => Core.b64d(state.ceks[id]));
      const cek = await Core.unlock(data, 'f', Core.finalPassword(digits, chain));
      if (!cek) {
        touch('f');
        say(t.feedback, STRINGS.final.wrong, 'bad');
        shake(t.root);
        return;
      }
      state.ceks.f = Core.b64e(cek);
      state.started.f = true;
      await openStage('f', cek);
      save();
      t.feedback.textContent = '';
      refresh();
      t.solved.scrollIntoView({ behavior: reduceMotion() ? 'auto' : 'smooth', block: 'nearest' });
    } finally {
      busy(form, false);
    }
  }

  function say(el, text, tone) {
    el.textContent = text;
    el.dataset.tone = tone || '';
  }

  function busy(form, on, label) {
    const btn = form.querySelector('button[type="submit"]');
    form.setAttribute('aria-busy', on ? 'true' : 'false');
    btn.disabled = on;
    if (on) {
      btn.dataset.label = btn.textContent;
      btn.textContent = label;
    } else if (btn.dataset.label) {
      btn.textContent = btn.dataset.label;
    }
  }

  function shake(el) {
    if (reduceMotion()) return;
    el.classList.remove('shake');
    void el.offsetWidth;
    el.classList.add('shake');
  }

  /* =====================================================================
   * rendering
   * ===================================================================== */
  function riddleBlock(lines) {
    return lines.map((line, i) => h('p', { class: 'line', style: `--i:${i}`, text: line }));
  }

  function supportBlock(id) {
    const hints = h('ol', { class: 'hints' });
    const btn = h('button', { type: 'button', class: 'btn ghost esc', onclick: () => escalate(id) });
    const title = h('h3', { class: 'support-title' });
    const root = h('section', { class: 'support', 'aria-label': STRINGS.escalate }, title, hints, btn);
    return { root, hints, btn, title };
  }

  function buildTicket(n) {
    const id = String(n);
    const t = {};
    const inputId = `answer-${n}`;
    const mode = modeFor(n);

    t.chip = h('span', { class: 'chip' });
    t.playBtn = h('button', { type: 'button', class: 'play', onclick: () => onPlayPress(n) });
    t.playIcon = h('span', { class: 'play-icon' });
    t.playBtn.append(t.playIcon);
    t.playNote = h('p', { class: 'play-note', 'aria-live': 'polite' });
    t.trouble = h('button', { type: 'button', class: 'link', hidden: true, onclick: () => useTapToPlay(n) }, STRINGS.troubleSwitch);

    if (mode === 'manual') {
      t.playBtn.hidden = true;
      t.playNote.textContent = STRINGS.manual;
    } else if (mode === 'masked') {
      t.playBtn.setAttribute('aria-label', STRINGS.callWitness);
      t.playIcon.innerHTML = ICON.play;
      t.playBtn.dataset.playing = 'false';
      t.playNote.textContent = STRINGS.playIdle;
    } else {
      t.playNote.textContent = STRINGS.playIdle;
    }

    t.playBlock = h('div', { class: 'play-block' }, t.playBtn, h('div', { class: 'play-meta' }, t.playNote, t.trouble));
    t.audio = h('div', { class: 'audio' });

    t.input = h('input', {
      id: inputId,
      class: 'field',
      type: 'text',
      name: inputId,
      inputmode: 'text',
      autocomplete: 'off',
      autocapitalize: 'none',
      autocorrect: 'off',
      spellcheck: 'false',
      enterkeyhint: 'go',
      placeholder: STRINGS.answerPlaceholder
    });
    t.feedback = h('p', { class: 'feedback', role: 'status', 'aria-live': 'polite' });
    t.form = h(
      'form',
      { class: 'answer', novalidate: true },
      h('label', { for: inputId, class: 'label', text: STRINGS.answerLabel }),
      h('div', { class: 'row' }, t.input, h('button', { type: 'submit', class: 'btn primary' }, STRINGS.submit)),
      t.feedback
    );
    t.form.addEventListener('submit', (e) => {
      e.preventDefault();
      submitStage(n, t.input, t.form);
    });

    t.digit = h('p', { class: 'digit', hidden: true });
    t.solved = h('div', { class: 'solved', hidden: true }, h('p', { class: 'resolution', text: STRINGS.fixed }), t.digit);

    t.support = supportBlock(id);

    t.root = h(
      'article',
      { class: 'ticket', id: `case-${n}`, 'data-state': 'todo' },
      h(
        'header',
        { class: 'ticket-head' },
        h('span', { class: 'key', text: `CASE-${n}` }),
        h('span', { class: 'meta', text: STRINGS.assignee }),
        t.chip
      ),
      h('h2', { class: 'ticket-title', text: STRINGS.ticketTitle(n) }),
      t.playBlock,
      t.audio,
      t.form,
      t.solved,
      t.support.root
    );
    T[id] = t;
    return t.root;
  }

  function buildFinal() {
    const t = {};
    const F = STRINGS.final;
    t.chip = h('span', { class: 'chip' });
    t.blocked = h('p', { class: 'blocked', text: F.blockedBy });
    t.input = h('input', {
      id: 'answer-f',
      class: 'field code',
      type: 'text',
      name: 'answer-f',
      inputmode: 'numeric',
      autocomplete: 'off',
      autocapitalize: 'none',
      autocorrect: 'off',
      spellcheck: 'false',
      enterkeyhint: 'go',
      placeholder: F.codePlaceholder
    });
    t.feedback = h('p', { class: 'feedback', role: 'status', 'aria-live': 'polite' });
    t.form = h(
      'form',
      { class: 'answer', novalidate: true, hidden: true },
      h('p', { class: 'prompt', text: F.prompt }),
      h('label', { for: 'answer-f', class: 'label', text: F.codeLabel }),
      h('div', { class: 'row' }, t.input, h('button', { type: 'submit', class: 'btn primary' }, F.submit)),
      t.feedback
    );
    t.form.addEventListener('submit', (e) => {
      e.preventDefault();
      submitFinal(t.input, t.form);
    });

    t.riddle = h('div', { class: 'riddle', tabindex: '-1' });
    t.closing = h('p', { class: 'closing' });
    t.solved = h(
      'div',
      { class: 'solved', hidden: true },
      h('section', { class: 'evidence' }, h('h3', { class: 'support-title', text: STRINGS.evidence }), t.riddle),
      t.closing
    );
    t.support = supportBlock('f');

    t.root = h(
      'article',
      { class: 'ticket final', id: 'case-4', 'data-state': 'blocked' },
      h('header', { class: 'ticket-head' }, h('span', { class: 'key', text: F.key }), h('span', { class: 'meta', text: STRINGS.assignee }), t.chip),
      h('h2', { class: 'ticket-title', text: F.title }),
      t.blocked,
      t.form,
      t.solved,
      t.support.root
    );
    T.f = t;
    return t.root;
  }

  /* ---------------- hints ---------------- */
  function escalate(id) {
    const solved = isSolved(id);
    const bag = solved ? state.tl : state.tm;
    if (bag[id] < 2) {
      bag[id] += 1;
      save();
      refreshSupport(id);
    }
  }

  function refreshSupport(id) {
    const s = T[id].support;
    const solved = isSolved(id);
    // Tracks only need help naming the melody; only the final report has a place to look.
    if (id === 'f' ? !solved : solved) {
      s.root.hidden = true;
      return;
    }
    s.root.hidden = false;
    const hints = solved ? payloads[id].hints : STRINGS.melodyHints[id];
    const tier = Math.min(2, solved ? state.tl[id] : state.tm[id]);
    s.title.textContent = solved ? STRINGS.supportPlace : STRINGS.supportMelody;
    s.hints.replaceChildren(...hints.slice(0, tier).map((text, i) => h('li', {}, h('span', { class: 'tag', text: STRINGS.supportNote(i + 1) }), h('span', { text }))));
    s.hints.hidden = tier === 0;
    s.btn.disabled = tier >= 2;
    s.btn.textContent = tier === 0 ? STRINGS.escalate : tier === 1 ? STRINGS.escalateAgain : STRINGS.escalateSpent;
  }

  /* ---------------- refresh ---------------- */
  function refresh() {
    for (const n of [1, 2, 3]) {
      const id = String(n);
      const t = T[id];
      const solved = isSolved(id);
      const st = solved ? 'done' : state.started[id] ? 'progress' : 'todo';
      t.root.dataset.state = st;
      t.chip.textContent = STRINGS.status[st];
      t.chip.dataset.state = st;
      t.form.hidden = solved;
      t.solved.hidden = !solved;
      const digit = solved && payloads[id].digit;
      if (digit && t.digit.hidden) {
        t.digit.append(h('span', { class: 'digit-label', text: STRINGS.digit }), h('span', { class: 'digit-value', text: digit }));
        t.digit.hidden = false;
      }
      refreshSupport(id);
    }

    const f = T.f;
    const unlocked = solvedCount() === 3;
    const done = isSolved('f');
    const st = done ? 'ready' : !unlocked ? 'blocked' : state.started.f ? 'progress' : 'todo';
    f.root.dataset.state = st;
    f.chip.textContent = STRINGS.status[st];
    f.chip.dataset.state = st;
    f.blocked.hidden = unlocked;
    f.form.hidden = !unlocked || done;
    f.solved.hidden = !done;
    if (done && !f.riddle.childElementCount) {
      f.riddle.append(...riddleBlock(payloads.f.riddle));
      f.closing.textContent = payloads.f.closing;
    }
    refreshSupport('f');

    const n = solvedCount();
    bar.style.setProperty('--p', `${(n / 3) * 100}%`);
    bar.setAttribute('aria-valuenow', String(n));
    barLabel.textContent = STRINGS.progress(n);
  }

  /* =====================================================================
   * boot
   * ===================================================================== */
  const app = document.getElementById('app');
  const bar = h('div', { class: 'bar', role: 'progressbar', 'aria-valuemin': '0', 'aria-valuemax': '3', 'aria-valuenow': '0', 'aria-label': STRINGS.boardLabel });
  const barLabel = h('span', { class: 'bar-label' });

  function fail(text) {
    app.replaceChildren(h('p', { class: 'fatal', role: 'alert', text }));
  }

  async function boot() {
    document.title = STRINGS.docTitle;
    if (!Core || !window.crypto || !window.crypto.subtle) return fail(STRINGS.errSecure);

    try {
      const res = await fetch('data.json', { cache: 'no-store' });
      if (!res.ok) throw new Error('http ' + res.status);
      data = await res.json();
    } catch (e) {
      return fail(STRINGS.errLoad);
    }

    // Restore progress. A stored key that no longer opens (data.json was rebuilt) is dropped.
    for (const id of ['1', '2', '3', 'f']) {
      if (!state.ceks[id]) continue;
      try {
        await openStage(id, Core.b64d(state.ceks[id]));
      } catch (e) {
        delete state.ceks[id];
        delete payloads[id];
      }
    }
    if (isSolved('f') && solvedCount() < 3) {
      delete state.ceks.f;
      delete payloads.f;
    }
    save();

    const resetBtn = h('button', {
      type: 'button',
      class: 'link reset',
      onclick: () => {
        if (!window.confirm(STRINGS.resetConfirm)) return;
        state = blank();
        memoryState = null;
        try {
          localStorage.removeItem(STORAGE_KEY);
        } catch (e) {
          /* ignore */
        }
        location.reload();
      }
    }, STRINGS.reset);

    app.replaceChildren(
      h(
        'header',
        { class: 'masthead' },
        h('h1', { class: 'eyebrow', text: STRINGS.eyebrow }),
        ...STRINGS.intro.map((p) => h('p', { class: 'intro', text: p }))
      ),
      h('section', { class: 'board', 'aria-label': STRINGS.boardLabel }, h('div', { class: 'board-top' }, h('span', { class: 'board-name', text: STRINGS.boardLabel }), barLabel), bar, buildTicket(1), buildTicket(2), buildTicket(3), buildFinal()),
      h('footer', { class: 'foot' }, resetBtn)
    );

    refresh();
    for (const n of [1, 2, 3]) {
      if (isSolved(String(n))) reveal(n);
    }
  }

  boot();
})();
