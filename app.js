'use strict';
// LinguaPop — application d'apprentissage des langues pour enfants (anglais, portugais, espagnol).

const LEVELS = COURSE.map(l => l.level);
const LANG_COL = { en: 2, pt: 3, es: 4 };
const ALL_UNITS = [];
COURSE.forEach(lv => lv.units.forEach(u => {
  u.level = lv.level; u.world = lv;
  u.W = u.words.map((w, i) => ({ key: `${u.id}.${i}`, e: w[0], fr: w[1], en: w[2], pt: w[3], es: w[4], textOnly: !!u.textOnly }));
  u.S = u.sentences.map(s => ({ e: s[0], fr: s[1], en: s[2], pt: s[3], es: s[4] }));
  ALL_UNITS.push(u);
}));
const CARD_BY_ID = Object.fromEntries(CARDS.map(c => [c[0], { id: c[0], e: c[1], name: c[2], r: c[3] }]));
const RARITY = { c: 'Commune', r: 'Rare', e: 'Épique', l: 'Légendaire' };
const PACK_PRICE = 25;
const AVATARS = ['🦊', '🐼', '🐯', '🐸', '🦄', '🐵', '🐨', '🐙', '🦁', '🐧', '🐰', '🐲', '👧', '👦', '🧒', '👸', '🤴', '🦸', '🧚', '🤖'];

const ACTS = [
  { id: 'cards', e: '🃏', name: 'Découvrir', desc: 'Retourne les cartes' },
  { id: 'quiz', e: '🎯', name: 'Quiz', desc: 'Trouve le bon mot' },
  { id: 'listen', e: '👂', name: 'Écoute', desc: 'Écoute et touche' },
  { id: 'memory', e: '🧠', name: 'Memory', desc: 'Trouve les paires' },
  { id: 'spell', e: '🔤', name: 'Épeler', desc: 'Lettre par lettre' },
  { id: 'phrases', e: '🧩', name: 'Phrases', desc: 'Construis la phrase' },
  { id: 'chrono', e: '⚡', name: 'Défi chrono', desc: '60 secondes, à fond !' },
];

const CHEERS = ['Bravo !', 'Super !', 'Génial !', 'Excellent !', 'Trop fort !', 'Parfait !', 'Youpi !', 'Champion !'];
const OOPS = ['Presque !', 'Pas grave !', 'On réessaie !', 'Tu y es presque !'];
const PIP_LINES = [
  "Prêt pour une nouvelle aventure ?", "Chaque jour, un petit peu : c'est magique !",
  "Gagne des pièces et ouvre des paquets de cartes !", "Touche-moi, je parle ta nouvelle langue !",
  "Les étoiles débloquent de nouveaux mondes !", "Tu deviens un vrai petit polyglotte !",
];

const BADGES = [
  { id: 'first', e: '🎉', name: 'Premier pas', desc: 'Finir une activité' },
  { id: 'perfect', e: '💯', name: 'Sans faute', desc: '3 étoiles au quiz' },
  { id: 'unit', e: '🏁', name: 'Thème fini', desc: 'Réussir un quiz' },
  { id: 'streak3', e: '🔥', name: 'Ça chauffe', desc: '3 jours de suite' },
  { id: 'streak7', e: '🌋', name: 'Volcan', desc: '7 jours de suite' },
  { id: 'words25', e: '📗', name: '25 mots', desc: 'Apprendre 25 mots' },
  { id: 'words100', e: '📚', name: '100 mots', desc: 'Apprendre 100 mots' },
  { id: 'memory', e: '🐘', name: "Mémoire d'éléphant", desc: 'Memory en 3 étoiles' },
  { id: 'speed', e: '⚡', name: 'Éclair', desc: '15 au défi chrono' },
  { id: 'speller', e: '✏️', name: 'Pro de l\'orthographe', desc: 'Épeler sans indice' },
  { id: 'builder', e: '🏗️', name: 'Bâtisseur', desc: '3 étoiles aux phrases' },
  { id: 'daily', e: '📅', name: 'Défi du jour', desc: 'Réussir un défi du jour' },
  { id: 'cards10', e: '🃏', name: 'Collectionneur', desc: '10 cartes différentes' },
  { id: 'legend', e: '👑', name: 'Légende', desc: 'Avoir une carte légendaire' },
  { id: 'A1', e: '🏝️', name: 'Niveau A1', desc: "Finir l'île des débuts" },
  { id: 'A2', e: '🌳', name: 'Niveau A2', desc: 'Finir la forêt magique' },
  { id: 'B1', e: '🏔️', name: 'Niveau B1', desc: 'Finir la montagne' },
  { id: 'B2', e: '🚀', name: 'Niveau B2', desc: 'Finir les étoiles' },
  { id: 'polyglot', e: '🌍', name: 'Polyglotte', desc: 'Jouer dans les 3 langues' },
];

// ---------- Utilitaires ----------
const app = document.getElementById('app');
const shuffle = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const pick = a => a[Math.floor(Math.random() * a.length)];
const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const today = () => { const d = new Date(); return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`; };
const yesterday = () => { const d = new Date(); d.setDate(d.getDate() - 1); return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`; };
const starStr = (n, max = 3) => '⭐'.repeat(n) + '☆'.repeat(Math.max(0, max - n));
function on(sel, fn, root = app) { root.querySelectorAll(sel).forEach(el => el.addEventListener('click', e => fn(el, e))); }
function setWorld(lv) { document.documentElement.style.setProperty('--world', lv.color); document.documentElement.style.setProperty('--world-d', lv.dark); }

// ---------- Sauvegarde ----------
const STORE = 'linguapop.v1';
let S;
try { S = JSON.parse(localStorage.getItem(STORE)); } catch (e) { S = null; }
if (!S || !Array.isArray(S.profiles)) S = { profiles: [], current: null, settings: { sound: true, slow: false, unlockAll: false } };
function save() {
  try { localStorage.setItem(STORE, JSON.stringify(S)); } catch (e) { /* stockage indisponible */ }
  if (typeof acctSchedule === 'function') acctSchedule(); // sauvegarde en ligne (account.js)
}
const P = () => S.profiles.find(p => p.id === S.current);
const L = () => P().lang;
function prog(lang = L()) { const p = P(); p.progress[lang] = p.progress[lang] || {}; return p.progress[lang]; }
function uprog(u) { const pr = prog(); pr[u.id] = pr[u.id] || {}; return pr[u.id]; }
function learned(lang = L()) { const p = P(); p.learned[lang] = p.learned[lang] || {}; return p.learned[lang]; }

function newProfile(name, avatar, lang, level) {
  return {
    id: 'p' + Date.now(), name, avatar, lang, start: { [lang]: level },
    coins: 20, xp: 0, streak: { n: 0, last: null }, progress: {}, learned: {},
    cards: {}, badges: {}, daily: {}, best: {}, langs: { [lang]: 1 },
  };
}

// ---------- Sons ----------
let actx;
function tone(freqs, dur = 0.12, type = 'sine', vol = 0.15) {
  if (!S.settings.sound) return;
  try {
    actx = actx || new (window.AudioContext || window.webkitAudioContext)();
    const t = actx.currentTime;
    freqs.forEach((f, i) => {
      const o = actx.createOscillator(), g = actx.createGain();
      o.type = type; o.frequency.value = f;
      g.gain.setValueAtTime(vol, t + i * dur);
      g.gain.exponentialRampToValueAtTime(0.001, t + i * dur + dur * 1.5);
      o.connect(g).connect(actx.destination);
      o.start(t + i * dur); o.stop(t + i * dur + dur * 1.6);
    });
  } catch (e) { /* pas de son */ }
}
const SFX = {
  ok: () => tone([660, 880], 0.1), bad: () => tone([240, 190], 0.15, 'triangle', 0.12),
  flip: () => tone([520], 0.05, 'triangle', 0.08), coin: () => tone([988, 1319], 0.07, 'square', 0.05),
  win: () => tone([523, 659, 784, 1047], 0.13, 'triangle', 0.15), tap: () => tone([420], 0.04, 'sine', 0.08),
  magic: () => tone([784, 988, 1175, 1568, 1976], 0.08, 'sine', 0.1),
};

// ---------- Voix ----------
let voices = [];
function loadVoices() { try { voices = speechSynthesis.getVoices() || []; } catch (e) { voices = []; } }
if ('speechSynthesis' in window) { loadVoices(); speechSynthesis.onvoiceschanged = loadVoices; }
const vlang = v => v.lang.replace('_', '-').toLowerCase();
function voiceFor(tag) {
  const t = tag.toLowerCase();
  const exact = voices.filter(v => vlang(v) === t);
  if (exact.length) return exact.find(v => /enhanced|premium|natural/i.test(v.name)) || exact[0];
  return voices.find(v => vlang(v).startsWith(t.slice(0, 2))) || null;
}
// Voix réelles pré-enregistrées (audio/<hash>.mp3), générées par tools/generate_audio.py.
// Le hash doit rester identique à audio_key() dans ce script (FNV-1a 32 bits de « lang|texte »).
let AUDIO_INDEX = new Set(), curAudio = null;
fetch('audio/index.json').then(r => r.ok ? r.json() : []).then(l => { AUDIO_INDEX = new Set(l); }).catch(() => {});
function audioKey(text, tag) {
  let h = 0x811c9dc5;
  for (const b of new TextEncoder().encode(`${tag}|${text.trim()}`)) { h ^= b; h = Math.imul(h, 0x01000193) >>> 0; }
  return h.toString(16).padStart(8, '0');
}
function stopVoice() {
  if (curAudio) { curAudio.pause(); curAudio = null; }
  try { speechSynthesis.cancel(); } catch (e) { /* */ }
}
function say(text, slow = false, lang = L()) {
  stopVoice();
  const key = audioKey(text, LANGS[lang].tts);
  if (AUDIO_INDEX.has(key)) {
    const a = new Audio(`audio/${key}.mp3`);
    a.playbackRate = slow ? 0.65 : (S.settings.slow ? 0.8 : 1);
    curAudio = a;
    a.play().catch(() => sayDevice(text, slow, lang));
    return;
  }
  sayDevice(text, slow, lang);
}
// Secours : voix de l'appareil, si un texte n'a pas d'enregistrement.
function sayDevice(text, slow, lang) {
  if (!('speechSynthesis' in window)) return;
  try {
    const u = new SpeechSynthesisUtterance(text);
    u.lang = LANGS[lang].tts;
    const v = voiceFor(u.lang); if (v) u.voice = v;
    u.rate = slow ? 0.55 : (S.settings.slow ? 0.7 : 0.9);
    speechSynthesis.speak(u);
  } catch (e) { /* pas de voix */ }
}

// ---------- Effets ----------
function confetti(n = 50) {
  const box = document.createElement('div'); box.className = 'confetti';
  const em = ['⭐', '✨', '🎉', '🌟', '🎈', '💫'], cols = ['#FFB703', '#2EC4B6', '#8E7DFF', '#FF5D8F', '#4CC9F0', '#2DCB70'];
  for (let i = 0; i < n; i++) {
    const s = document.createElement('span');
    if (i % 3) { s.className = 'sq'; s.style.background = pick(cols); } else s.textContent = pick(em);
    s.style.left = Math.random() * 100 + 'vw';
    s.style.animationDuration = (1.8 + Math.random() * 1.6) + 's';
    s.style.animationDelay = Math.random() * 0.6 + 's';
    box.appendChild(s);
  }
  document.body.appendChild(box); setTimeout(() => box.remove(), 4500);
}
function floatText(el, txt) {
  const r = el.getBoundingClientRect(), f = document.createElement('div');
  f.className = 'float'; f.textContent = txt;
  f.style.left = (r.left + r.width / 2 - 20) + 'px'; f.style.top = (r.top) + 'px';
  document.body.appendChild(f); setTimeout(() => f.remove(), 1000);
}
function toast(msg, ms = 2400) {
  const t = document.createElement('div'); t.className = 'toast'; t.textContent = msg;
  document.body.appendChild(t); setTimeout(() => t.remove(), ms);
}
function sheet(html, bind) {
  const bg = document.createElement('div'); bg.className = 'sheet-bg';
  bg.innerHTML = `<div class="sheet">${html}</div>`;
  bg.addEventListener('click', e => { if (e.target === bg) bg.remove(); });
  document.body.appendChild(bg);
  bind && bind(bg.querySelector('.sheet'), () => bg.remove());
}

// ---------- Progression ----------
const levelIdx = l => LEVELS.indexOf(l);
const startLevel = () => (P().start && P().start[L()]) || 'A1';
const unitDone = u => (uprog(u).quiz || 0) >= 1;
function unitStars(u) { const p = uprog(u); return ACTS.reduce((a, x) => a + (p[x.id] || 0), 0); }
function unitMaxStars(u) { return availableActs(u).length * 3; }
function availableActs(u) { return ACTS.filter(a => a.id !== 'spell' || spellable(u).length >= 3); }
function unitUnlocked(u) {
  if (S.settings.unlockAll) return true;
  const i = ALL_UNITS.indexOf(u), si = levelIdx(startLevel());
  if (i === 0 || levelIdx(u.level) < si) return true;
  if (u === COURSE[si].units[0]) return true;
  // Un thème déjà commencé, ou suivi d'un thème réussi (thème ajouté plus tard), reste ouvert
  if (unitStars(u) > 0 || ALL_UNITS.slice(i + 1).some(unitDone)) return true;
  return unitDone(ALL_UNITS[i - 1]);
}
const levelUnlocked = lv => unitUnlocked(lv.units[0]);
const levelDone = lv => lv.units.every(unitDone);
function currentUnit() { return ALL_UNITS.find(u => unitUnlocked(u) && !unitDone(u)) || ALL_UNITS[ALL_UNITS.length - 1]; }
function totalStars() { const pr = prog(); return Object.values(pr).reduce((a, p) => a + ACTS.reduce((b, x) => b + (p[x.id] || 0), 0), 0); }
const playerLevel = xp => Math.floor(Math.sqrt(xp / 40)) + 1;
const xpFor = lvl => (lvl - 1) * (lvl - 1) * 40;
const TITLES = ['Petit curieux', 'Explorateur', 'Aventurier', 'Voyageur', 'Super-héros des mots', 'Maître polyglotte'];
const titleFor = lvl => TITLES[Math.min(TITLES.length - 1, Math.floor((lvl - 1) / 3))];

const strip = (txt, lang) => txt.replace({ en: /^(the|a|an|to) /i, pt: /^(o|a|os|as|um|uma) /i, es: /^(el|la|los|las|un|una) /i }[lang], '');
function spellable(u, lang = L()) {
  return u.W.filter(w => { const s = strip(w[lang], lang).normalize('NFC'); return /^[\p{L}]+$/u.test(s) && s.length <= 10 && s.length >= 2; });
}
const tokens = s => s.replace(/[.,!?¡¿;:«»"]/g, ' ').split(/\s+/).filter(Boolean);

function markLearned(w) { learned()[w.key] = 1; }
function touchStreak() {
  const p = P(), t = today();
  if (p.streak.last === t) return;
  p.streak.n = p.streak.last === yesterday() ? p.streak.n + 1 : 1;
  p.streak.last = t;
}
function award(id, list) { const p = P(); if (!p.badges[id]) { p.badges[id] = today(); list.push(BADGES.find(b => b.id === id)); } }
function checkBadges(ctx = {}) {
  const p = P(), got = [];
  if (ctx.finished) award('first', got);
  if (ctx.act === 'quiz' && ctx.stars === 3) award('perfect', got);
  if (ctx.act === 'quiz' && ctx.stars >= 1) award('unit', got);
  if (ctx.act === 'memory' && ctx.stars === 3) award('memory', got);
  if (ctx.act === 'chrono' && ctx.score >= 15) award('speed', got);
  if (ctx.act === 'spell' && ctx.noHint) award('speller', got);
  if (ctx.act === 'phrases' && ctx.stars === 3) award('builder', got);
  if (ctx.daily) award('daily', got);
  if (p.streak.n >= 3) award('streak3', got);
  if (p.streak.n >= 7) award('streak7', got);
  const nw = Object.keys(LANGS).reduce((a, l) => a + Object.keys(p.learned[l] || {}).length, 0);
  if (nw >= 25) award('words25', got);
  if (nw >= 100) award('words100', got);
  if (Object.keys(p.cards).length >= 10) award('cards10', got);
  if (Object.keys(p.cards).some(id => CARD_BY_ID[id] && CARD_BY_ID[id].r === 'l')) award('legend', got);
  COURSE.forEach(lv => { if (levelDone(lv)) award(lv.level, got); });
  if (Object.keys(p.langs || {}).length >= 3) award('polyglot', got);
  return got;
}

// ---------- Navigation ----------
let tab = 'map', worldSel = null;
function go(fn, ...args) { stopVoice(); window.scrollTo(0, 0); fn(...args); }

function topbar() {
  const p = P(), lg = LANGS[p.lang];
  return `<header class="topbar">
    <button class="avatar-btn" data-a="profiles" aria-label="Changer de joueur">${p.avatar}</button>
    <button class="chip" data-a="lang">${lg.flag} ${lg.name}</button>
    <span class="spacer"></span>
    <span class="chip" title="Série de jours">🔥 ${p.streak.last === today() || p.streak.last === yesterday() ? p.streak.n : 0}</span>
    <span class="chip" title="Pièces">🪙 <span id="coins">${p.coins}</span></span>
  </header>`;
}
function tabbar() {
  const t = [['map', '🗺️', 'Aventure'], ['cards', '🃏', 'Cartes'], ['trophies', '🏆', 'Trophées'], ['parents', '🧑‍🏫', 'Parents & profs']];
  return `<nav class="tabbar">${t.map(([id, e, n]) => `<button data-tab="${id}" class="${tab === id ? 'on' : ''}"><span class="e">${e}</span>${n}</button>`).join('')}</nav>`;
}
function bindChrome() {
  on('[data-a=profiles]', () => go(renderProfiles));
  on('[data-a=lang]', () => langSheet());
  on('[data-tab]', el => { tab = el.dataset.tab; SFX.tap(); go(renderMain); });
}
function renderMain() {
  if (!P()) return renderProfiles();
  ({ map: renderHome, cards: renderCollection, trophies: renderTrophies, parents: renderParents }[tab] || renderHome)();
}

// ---------- Profils ----------
function renderProfiles() {
  setWorld(COURSE[2]);
  const acct = typeof acctBar === 'function';
  app.innerHTML = `<div class="welcome">
    ${acct ? acctBar() : ''}
    <div class="mascot">🦊</div>
    <h1 class="logo"><span>Lin</span><span>gua</span><span>Po</span><span>p</span></h1>
    <p class="tagline">Qui joue aujourd'hui ?</p>
    <div class="profiles">
      ${S.profiles.map(p => `<button class="profile" data-id="${p.id}"><span class="pface">${p.avatar}</span><span class="nm">${esc(p.name)}</span><span class="sub">${LANGS[p.lang].flag} ⭐ ${Object.values(p.progress).reduce((a, pr) => a + Object.values(pr).reduce((b, u) => b + ACTS.reduce((c, x) => c + (u[x.id] || 0), 0), 0), 0)}</span></button>`).join('')}
      ${S.profiles.length < 40 ? `<button class="profile add" data-a="add"><span class="pface">➕</span><span class="nm">Nouveau</span></button>` : ''}
    </div>
  </div>`;
  on('.profile[data-id]', el => { S.current = el.dataset.id; save(); SFX.ok(); tab = 'map'; worldSel = null; go(renderMain); });
  on('[data-a=add]', () => go(renderNewProfile));
  if (acct) acctBind();
}

function renderNewProfile() {
  let av = '🦊', lang = 'en', lvl = 'A1';
  app.innerHTML = `<div class="form">
    <button class="backbtn" data-a="back">‹</button>
    <h2>Crée ton joueur ✨</h2>
    <div class="field"><label>Ton prénom</label><input class="text-in" id="nm" maxlength="14" autocomplete="off" placeholder="Ex. : Lina"></div>
    <div class="field"><label>Ton personnage</label><div class="pick-grid" id="avs">${AVATARS.map(a => `<button class="pick ${a === av ? 'on' : ''}" data-v="${a}">${a}</button>`).join('')}</div></div>
    <div class="field"><label>Quelle langue veux-tu apprendre ?</label><div class="lang-pick" id="lgs">${Object.entries(LANGS).map(([k, l]) => `<button class="pick ${k === lang ? 'on' : ''}" data-v="${k}">${l.flag}<small>${l.name}</small></button>`).join('')}</div></div>
    <div class="field"><label>Ton niveau</label><div class="level-pick" id="lvs">${COURSE.map(c => `<button class="pick ${c.level === lvl ? 'on' : ''}" data-v="${c.level}">${c.level}<small>${['Je débute', 'Je connais un peu', 'Je me débrouille', 'Je suis fort'][levelIdx(c.level)]}</small></button>`).join('')}</div></div>
    <button class="btn green block" id="ok">C'est parti ! 🚀</button>
  </div>`;
  const group = (id, cb) => on(`#${id} .pick`, el => { app.querySelectorAll(`#${id} .pick`).forEach(b => b.classList.toggle('on', b === el)); SFX.tap(); cb(el.dataset.v); });
  group('avs', v => av = v); group('lgs', v => { lang = v; say(LANGS[v].hello, false, v); }); group('lvs', v => lvl = v);
  on('[data-a=back]', () => go(renderProfiles));
  on('#ok', () => {
    const name = app.querySelector('#nm').value.trim();
    if (!name) { app.querySelector('#nm').focus(); toast('Écris ton prénom 😊'); return; }
    const p = newProfile(name, av, lang, lvl);
    S.profiles.push(p); S.current = p.id; save();
    SFX.win(); confetti(); tab = 'map'; worldSel = null; go(renderMain);
  });
}

function langSheet() {
  const p = P();
  sheet(`<h2>Choisis ta langue</h2><div class="lang-pick">${Object.entries(LANGS).map(([k, l]) => `<button class="pick ${k === p.lang ? 'on' : ''}" data-v="${k}">${l.flag}<small>${l.name}</small></button>`).join('')}</div>
    <div id="lvl-ask" style="display:none;margin-top:18px"><h2 style="font-size:19px">Ton niveau dans cette langue ?</h2><div class="level-pick">${LEVELS.map(l => `<button class="pick" data-l="${l}">${l}</button>`).join('')}</div></div>`,
  (el, close) => {
    let chosen;
    const apply = (k, lvl) => {
      p.lang = k; p.langs = p.langs || {}; p.langs[k] = 1;
      p.start = p.start || {}; if (lvl) p.start[k] = lvl;
      worldSel = null; save(); close(); say(LANGS[k].hello, false, k); go(renderMain);
    };
    el.querySelectorAll('[data-v]').forEach(b => b.onclick = () => {
      chosen = b.dataset.v;
      if (p.start && p.start[chosen]) return apply(chosen);
      el.querySelectorAll('[data-v]').forEach(x => x.classList.toggle('on', x === b));
      el.querySelector('#lvl-ask').style.display = '';
    });
    el.querySelectorAll('[data-l]').forEach(b => b.onclick = () => apply(chosen, b.dataset.l));
  });
}

// ---------- Accueil : la carte ----------
function renderHome() {
  const p = P(), cur = currentUnit();
  const lv = worldSel ? COURSE.find(c => c.level === worldSel) : cur.world;
  setWorld(lv);
  const d = p.daily[L()] === today();
  const offs = [0, 70, 100, 70, 0, -70, -100, -70];
  app.innerHTML = topbar() + `<main class="home">
    <div class="mascot-row"><button class="mascot" data-a="pip">🦊</button><div class="bubble">${esc(p.name)}, ${pick(PIP_LINES).replace(/^./, c => c.toLowerCase())}</div></div>
    <button class="daily ${d ? 'done' : ''}" data-a="daily"><span class="ic">${d ? '✅' : '🎁'}</span><span><b>${d ? 'Défi du jour réussi !' : 'Défi du jour'}</b><small>${d ? 'Reviens demain pour un nouveau défi' : '10 questions · pièces ×2 · +15 🪙 bonus'}</small></span></button>
    <div class="worlds">${COURSE.map(c => `<button class="world-tab ${c === lv ? 'on' : ''} ${levelUnlocked(c) ? '' : 'locked'}" style="--c:${c.color};--cd:${c.dark}" data-w="${c.level}"><span class="e">${levelUnlocked(c) ? c.icon : '🔒'}</span>${c.level}</button>`).join('')}</div>
    <div class="world-head"><span class="e">${lv.icon}</span><div><h2>${lv.level} · ${lv.name}</h2><p>${lv.units.filter(unitDone).length} / ${lv.units.length} thèmes réussis</p></div></div>
    <div class="path">${lv.units.map((u, i) => {
      const unl = unitUnlocked(u), dn = unitDone(u), isCur = u === cur && unl;
      return `<div class="node-wrap" style="transform:translateX(${offs[i % offs.length]}px)">
        ${isCur ? '<span class="go-tag">C\'est ici !</span>' : ''}
        <button class="node ${unl ? '' : 'locked'} ${dn ? 'done' : ''} ${isCur ? 'current' : ''}" data-u="${u.id}">${u.icon}</button>
        <span class="node-label">${u.title}</span>
        ${unl ? `<span class="node-stars">⭐ ${unitStars(u)}/${unitMaxStars(u)}</span>` : ''}
      </div>`;
    }).join('')}</div>
  </main>` + tabbar();
  bindChrome();
  on('[data-a=pip]', el => { el.animate([{ transform: 'scale(1)' }, { transform: 'scale(1.3) rotate(15deg)' }, { transform: 'scale(1)' }], 500); say(LANGS[L()].hello); });
  on('[data-a=daily]', () => { if (d) { toast('Déjà fait aujourd\'hui ! Bravo 🎉'); return; } startDaily(); });
  on('[data-w]', el => { const c = COURSE.find(x => x.level === el.dataset.w); if (!levelUnlocked(c)) { SFX.bad(); toast('🔒 Termine le monde précédent pour ouvrir celui-ci !'); return; } SFX.tap(); worldSel = c.level; renderHome(); });
  on('[data-u]', el => {
    const u = ALL_UNITS.find(x => x.id === el.dataset.u);
    if (!unitUnlocked(u)) { SFX.bad(); el.animate([{ transform: 'translateX(0)' }, { transform: 'translateX(-8px)' }, { transform: 'translateX(8px)' }, { transform: 'translateX(0)' }], 300); toast('🔒 Réussis le quiz du thème d\'avant !'); return; }
    SFX.tap(); go(renderUnit, u);
  });
  const c = app.querySelector('.node.current'); if (c && !worldSel) setTimeout(() => c.scrollIntoView({ block: 'center', behavior: 'smooth' }), 150);
}

// ---------- Écran d'un thème ----------
function renderUnit(u) {
  setWorld(u.world);
  const p = uprog(u), acts = availableActs(u);
  const next = acts.find(a => !p[a.id]);
  app.innerHTML = `<div class="screen">
    <button class="backbtn" data-a="back">‹</button>
    <div class="unit-hero"><span class="e">${u.icon}</span><h1>${u.title}</h1><p>${u.level} · ${u.W.length} mots · ${u.S.length} phrases</p></div>
    <div class="acts">${acts.map(a => {
      const st = p[a.id] || 0, wide = a.id === 'chrono';
      return `<button class="act ${next === a ? 'next' : ''} ${wide ? 'wide' : ''}" data-act="${a.id}"><span class="e">${a.e}</span><span><b>${a.name}</b><br><small>${a.desc}${a.id === 'chrono' && p.chronoBest ? ` · record ${p.chronoBest}` : ''}</small><br><span class="st">${starStr(st)}</span></span></button>`;
    }).join('')}</div>
  </div>`;
  on('[data-a=back]', () => go(renderMain));
  on('[data-act]', el => { SFX.tap(); go(startAct, u, el.dataset.act); });
}

function startAct(u, act) {
  ({ cards: playCards, quiz: () => playQuestions(u, 'quiz'), listen: () => playQuestions(u, 'listen'), memory: playMemory, spell: playSpell, phrases: playPhrases, chrono: playChrono }[act])(u);
}

function gameShell(barPct, extra = '') {
  return `<div class="game"><div class="game-top"><button class="close" data-a="quit" aria-label="Quitter">✕</button><div class="bar ${extra}"><i style="width:${barPct}%"></i></div><span class="combo" id="combo"></span></div><div class="q" id="q"></div><div id="fb"></div></div>`;
}
function bindQuit(back) {
  on('[data-a=quit]', () => sheet(`<h2>Tu veux vraiment arrêter ? 🥺</h2><div style="display:flex;flex-direction:column;gap:12px"><button class="btn green block" data-k="stay">Je continue !</button><button class="btn white block" data-k="go">Quitter</button></div>`,
    (el, close) => { el.querySelector('[data-k=stay]').onclick = close; el.querySelector('[data-k=go]').onclick = () => { close(); clearInterval(timer); go(back); }; }));
}
let timer = null;
function addCoins(n, el) { const p = P(); p.coins += n; const c = document.getElementById('coins'); if (c) c.textContent = p.coins; if (el) floatText(el, `+${n} 🪙`); }

// ---------- 1. Découvrir : cartes à retourner ----------
function playCards(u) {
  const lang = L(); let i = 0;
  app.innerHTML = gameShell(0);
  bindQuit(() => renderUnit(u));
  const draw = () => {
    const w = u.W[i];
    app.querySelector('.bar i').style.width = (i / u.W.length * 100) + '%';
    app.querySelector('#q').innerHTML = `<div class="flip-zone">
      <div class="flip" id="fc"><div class="flip-in">
        <div class="face front"><span class="e">${w.e}</span><span class="w" style="font-size:24px">${esc(w.fr)}</span><span class="hint">👆 Touche pour retourner</span></div>
        <div class="face back"><span class="e">${w.e}</span><span class="w">${esc(w[lang])}</span><span class="fr">${esc(w.fr)}</span></div>
      </div></div>
      <div class="say-row"><button class="say" data-s="n">🔊</button><button class="say" data-s="s">🐢</button></div>
      <div class="flip-nav">${i > 0 ? '<button class="btn white" data-n="-1">‹</button>' : ''}<button class="btn" data-n="1">${i === u.W.length - 1 ? 'Terminer ✓' : 'Suivant ›'}</button></div>
    </div>`;
    const fc = app.querySelector('#fc');
    fc.onclick = () => { fc.classList.toggle('turned'); SFX.flip(); if (fc.classList.contains('turned')) { say(w[lang]); markLearned(w); } };
    on('[data-s]', el => { fc.classList.add('turned'); markLearned(w); say(w[lang], el.dataset.s === 's'); }, app.querySelector('#q'));
    on('[data-n]', el => {
      if (+el.dataset.n < 0) { i--; return draw(); }
      if (!fc.classList.contains('turned')) { fc.classList.add('turned'); say(w[lang]); markLearned(w); SFX.flip(); return; }
      if (i === u.W.length - 1) return finish({ u, act: 'cards', stars: 3, correct: u.W.length, total: u.W.length });
      i++; draw();
    }, app.querySelector('#q'));
  };
  draw();
}

// ---------- 2 & 3. Quiz, Écoute, Défi du jour ----------
// Thèmes sans image parlante (ex. les jours) : on remplace l'image par le mot français
const TEXT_TYPE = { img2word: 'fr2word', word2img: 'word2fr', listen: 'listen2fr' };
const FR_OPTS = t => t === 'word2fr' || t === 'listen2fr';
function buildQuestion(w, pool, type) {
  if (w.textOnly && TEXT_TYPE[type]) type = TEXT_TYPE[type];
  const others = shuffle(pool.filter(x => x.key !== w.key && x.e !== w.e && x[L()] !== w[L()]));
  return { w, type, opts: shuffle([w, ...others.slice(0, 3)]) };
}
function playQuestions(u, mode, daily = null) {
  const lang = L();
  const pool = daily ? daily.pool : u.W;
  const base = daily ? shuffle(pool).slice(0, 10) : shuffle(u.W).concat(shuffle(u.W)).slice(0, Math.max(8, Math.min(10, u.W.length)));
  const types = mode === 'listen' ? ['listen'] : mode === 'quiz' ? ['img2word', 'word2img', 'fr2word'] : ['img2word', 'word2img', 'listen', 'fr2word'];
  let queue = base.map(w => buildQuestion(w, pool, pick(types)));
  const total = queue.length; let done = 0, firstOk = 0, combo = 0, coins = 0;
  const missedOnce = new Set();
  app.innerHTML = gameShell(0);
  bindQuit(() => daily ? renderMain() : renderUnit(u));
  const q = app.querySelector('#q'), fb = app.querySelector('#fb');

  const next = () => {
    fb.innerHTML = '';
    if (!queue.length) {
      const ratio = firstOk / total;
      return finish({ u, act: daily ? 'daily' : mode, stars: ratio >= 0.9 ? 3 : ratio >= 0.65 ? 2 : 1, correct: firstOk, total, coins, daily: !!daily });
    }
    const cur = queue.shift(), w = cur.w;
    const textOpts = cur.type !== 'word2img' && cur.type !== 'listen';
    let head = '';
    if (cur.type === 'img2word') head = `<p class="prompt">Qu'est-ce que c'est ?</p><div class="big-emoji">${w.e}</div>`;
    if (cur.type === 'fr2word') head = `<p class="prompt">Comment dit-on…</p><div class="target-word" style="color:var(--muted)">« ${esc(w.fr)} »</div><div style="height:20px"></div>`;
    if (cur.type === 'word2img') head = `<p class="prompt">Touche la bonne image</p><div class="target-word">${esc(w[lang])}</div><div class="say-row"><button class="say small" data-s="n">🔊</button><button class="say small" data-s="s">🐢</button></div>`;
    if (cur.type === 'word2fr') head = `<p class="prompt">Qu'est-ce que ça veut dire ?</p><div class="target-word">${esc(w[lang])}</div><div class="say-row"><button class="say small" data-s="n">🔊</button><button class="say small" data-s="s">🐢</button></div>`;
    if (cur.type === 'listen' || cur.type === 'listen2fr') head = `<p class="prompt">${cur.type === 'listen' ? 'Écoute bien… 👂' : 'Écoute… qu\'est-ce que ça veut dire ? 👂'}</p><div class="say-row"><button class="say big" data-s="n">🔊</button><button class="say" data-s="s" style="align-self:end">🐢</button></div>`;
    q.innerHTML = head + `<div class="opts ${textOpts ? '' : 'grid'}">${cur.opts.map((o, i) => `<button class="opt ${textOpts ? '' : 'emoji'}" data-i="${i}">${FR_OPTS(cur.type) ? esc(o.fr) : textOpts ? esc(o[lang]) : o.e}</button>`).join('')}</div>`;
    if (cur.type !== 'img2word' && cur.type !== 'fr2word') setTimeout(() => say(w[lang]), 250);
    on('[data-s]', el => say(w[lang], el.dataset.s === 's'), q);
    let answered = false;
    on('.opt', el => {
      if (answered) return; answered = true;
      const o = cur.opts[+el.dataset.i], good = o.key === w.key;
      const btns = q.querySelectorAll('.opt');
      btns.forEach((b, i) => { if (cur.opts[i].key === w.key) b.classList.add('ok'); else if (b !== el) b.classList.add('dim'); });
      say(w[lang]);
      if (good) {
        SFX.ok(); combo++; markLearned(w);
        if (!missedOnce.has(w.key)) { firstOk++; done++; }
        else done++;
        const gain = daily ? 2 : 1; coins += gain; addCoins(gain, el); SFX.coin();
        app.querySelector('#combo').textContent = combo >= 3 ? `🔥${combo}` : '';
        fb.innerHTML = `<div class="feedback ok"><div class="msg">🎉 ${pick(CHEERS)}</div><button class="btn green block" data-a="next">Continuer</button></div>`;
        const t = setTimeout(next, 1300);
        on('[data-a=next]', () => { clearTimeout(t); next(); }, fb);
      } else {
        el.classList.add('ko'); SFX.bad(); combo = 0; app.querySelector('#combo').textContent = '';
        if (!missedOnce.has(w.key)) { missedOnce.add(w.key); queue.push(buildQuestion(w, pool, cur.type)); }
        else done++;
        fb.innerHTML = `<div class="feedback ko"><div class="msg">💪 ${pick(OOPS)}</div><div class="sol">${w.e} ${esc(w[lang])} = ${esc(w.fr)}</div><button class="btn block" style="background:var(--red);box-shadow:0 5px 0 var(--red-d)" data-a="next">Continuer</button></div>`;
        on('[data-a=next]', next, fb);
      }
      app.querySelector('.bar i').style.width = (done / total * 100) + '%';
    }, q);
  };
  next();
}

function startDaily() {
  const unlocked = ALL_UNITS.filter(u => unitUnlocked(u) && (unitStars(u) > 0 || u === currentUnit()));
  const pool = unlocked.flatMap(u => u.W);
  setWorld(currentUnit().world);
  go(playQuestions, currentUnit(), 'daily', { pool });
}

// ---------- 4. Memory ----------
function playMemory(u) {
  const lang = L();
  const words = shuffle(u.W).slice(0, 6);
  const cards = shuffle(words.flatMap(w => [{ w, kind: 'e' }, { w, kind: 't' }]));
  let open = [], found = 0, moves = 0, lock = false;
  app.innerHTML = gameShell(0);
  bindQuit(() => renderUnit(u));
  const q = app.querySelector('#q');
  q.innerHTML = `<p class="prompt">${u.textOnly ? 'Trouve le mot et sa traduction !' : "Trouve l'image et son mot !"}</p><div class="mem-info"><span>Coups : <b id="mv">0</b></span><span>Paires : <b id="pr">0</b>/${words.length}</span></div>
    <div class="mem">${cards.map((c, i) => `<div class="mcard" data-i="${i}"><div class="flip-in"><div class="face front">❓</div><div class="face back">${c.kind === 'e' ? (u.textOnly ? `<span class="w" style="color:var(--purple-d)">${esc(c.w.fr)}</span>` : `<span class="e">${c.w.e}</span>`) : `<span class="w">${esc(c.w[lang])}</span>`}</div></div></div>`).join('')}</div>`;
  on('.mcard', el => {
    if (lock || el.classList.contains('open') || el.classList.contains('found')) return;
    const c = cards[+el.dataset.i];
    el.classList.add('open'); SFX.flip();
    if (c.kind === 't') say(c.w[lang]);
    open.push({ el, c });
    if (open.length < 2) return;
    moves++; q.querySelector('#mv').textContent = moves;
    const [a, b] = open; open = [];
    if (a.c.w.key === b.c.w.key && a.c.kind !== b.c.kind) {
      setTimeout(() => {
        a.el.classList.add('found'); b.el.classList.add('found'); SFX.ok(); say(a.c.w[lang]); markLearned(a.c.w);
        found++; q.querySelector('#pr').textContent = found;
        app.querySelector('.bar i').style.width = (found / words.length * 100) + '%';
        addCoins(1, b.el);
        if (found === words.length) setTimeout(() => finish({ u, act: 'memory', stars: moves <= words.length + 4 ? 3 : moves <= words.length + 9 ? 2 : 1, correct: found, total: words.length, coins: found, moves }), 900);
      }, 350);
    } else {
      lock = true;
      setTimeout(() => { a.el.classList.remove('open'); b.el.classList.remove('open'); lock = false; }, 1000);
    }
  }, q);
}

// ---------- 5. Épeler ----------
function playSpell(u) {
  const lang = L();
  const words = shuffle(spellable(u)).slice(0, 6);
  let i = 0, firstOk = 0, hints = 0, coins = 0;
  app.innerHTML = gameShell(0);
  bindQuit(() => renderUnit(u));
  const q = app.querySelector('#q'), fb = app.querySelector('#fb');
  const draw = () => {
    fb.innerHTML = '';
    if (i >= words.length) { const r = firstOk / words.length; return finish({ u, act: 'spell', stars: r >= 0.9 ? 3 : r >= 0.6 ? 2 : 1, correct: firstOk, total: words.length, coins, noHint: hints === 0 && r === 1 }); }
    const w = words[i], target = strip(w[lang], lang).normalize('NFC'), letters = [...target];
    const extra = shuffle([...'abcdefghilmnoprstu'].filter(c => !letters.includes(c))).slice(0, 2);
    const tiles = shuffle(letters.concat(extra));
    let slots = letters.map(() => null), missed = false; // une case vide par lettre
    q.innerHTML = `<div class="big-emoji" style="font-size:96px;margin-bottom:6px">${w.e}</div>
      <p style="text-align:center;margin:0;color:var(--muted);font-size:18px">${esc(w.fr)}</p>
      <div class="say-row" style="margin:12px 0"><button class="say small" data-s="n">🔊</button><button class="say small" data-s="s">🐢</button></div>
      <div class="slots" id="slots">${letters.map((_, k) => `<span class="slot" data-k="${k}"></span>`).join('')}</div>
      <div class="tiles">${tiles.map((t, k) => `<button class="tile" data-t="${k}">${t}</button>`).join('')}</div>
      <div class="tools"><button class="btn white" data-a="hint">💡 Indice</button><button class="btn white" data-a="erase">⌫</button></div>`;
    setTimeout(() => say(w[lang]), 250);
    on('[data-s]', el => say(w[lang], el.dataset.s === 's'), q);
    const paint = () => {
      q.querySelectorAll('.slot').forEach((s, k) => { s.textContent = slots[k] ? tiles[slots[k].t] : ''; s.classList.toggle('filled', !!slots[k]); });
      q.querySelectorAll('.tile').forEach((b, k) => b.classList.toggle('used', slots.some(s => s && s.t === k)));
    };
    const check = () => {
      if (slots.filter(Boolean).length < letters.length) return;
      const got = slots.map(s => tiles[s.t]).join('');
      const box = q.querySelector('#slots');
      if (got === target) {
        box.classList.add('ok'); SFX.ok(); say(w[lang]); markLearned(w);
        if (!missed) { firstOk++; coins++; addCoins(1, box); }
        app.querySelector('.bar i').style.width = ((i + 1) / words.length * 100) + '%';
        fb.innerHTML = `<div class="feedback ok"><div class="msg">🎉 ${pick(CHEERS)}</div><button class="btn green block" data-a="next">Continuer</button></div>`;
        on('[data-a=next]', () => { i++; draw(); }, fb);
      } else {
        missed = true; SFX.bad(); box.classList.remove('ko'); void box.offsetWidth; box.classList.add('ko');
        setTimeout(() => { slots = slots.map((s, k) => s && (s.hint || tiles[s.t] === letters[k]) ? s : null); paint(); }, 450);
      }
    };
    on('.tile', el => {
      const k = slots.findIndex(s => !s); if (k < 0) return;
      slots[k] = { t: +el.dataset.t }; SFX.tap(); paint(); check();
    }, q);
    on('.slot', el => { const k = +el.dataset.k; if (slots[k] && !slots[k].hint) { slots[k] = null; paint(); } }, q);
    on('[data-a=erase]', () => { for (let k = slots.length - 1; k >= 0; k--) if (slots[k] && !slots[k].hint) { slots[k] = null; break; } paint(); }, q);
    on('[data-a=hint]', () => {
      const k = letters.findIndex((l, k) => !slots[k] || tiles[slots[k].t] !== l);
      if (k < 0) return;
      const used = new Set(slots.filter(Boolean).map(s => s.t));
      if (slots[k]) used.delete(slots[k].t);
      const t = tiles.findIndex((x, j) => x === letters[k] && !used.has(j));
      if (t < 0) return;
      const other = slots.findIndex(s => s && s.t === t); if (other >= 0) slots[other] = null;
      slots[k] = { t, hint: true }; hints++; missed = true; SFX.magic(); paint(); check();
    }, q);
  };
  draw();
}

// ---------- 6. Phrases ----------
function playPhrases(u) {
  const lang = L();
  const list = shuffle(u.S);
  let i = 0, firstOk = 0, coins = 0;
  app.innerHTML = gameShell(0);
  bindQuit(() => renderUnit(u));
  const q = app.querySelector('#q'), fb = app.querySelector('#fb');
  const draw = () => {
    fb.innerHTML = '';
    if (i >= list.length) { const r = firstOk / list.length; return finish({ u, act: 'phrases', stars: r >= 0.85 ? 3 : r >= 0.5 ? 2 : 1, correct: firstOk, total: list.length, coins }); }
    const s = list[i], ans = tokens(s[lang]);
    const lower = new Set(ans.map(t => t.toLowerCase()));
    const decoys = shuffle([...new Set(u.S.filter(x => x !== s).flatMap(x => tokens(x[lang])))].filter(t => !lower.has(t.toLowerCase()))).slice(0, ans.length > 7 ? 2 : 3);
    const tiles = shuffle(ans.concat(decoys));
    let built = [];
    q.innerHTML = `<p class="prompt">Traduis la phrase</p>
      <div class="fr-sentence"><span class="e">${s.e}</span><span>${esc(s.fr)}</span></div>
      <div class="answer-line" id="line"></div>
      <div class="tiles" id="tiles">${tiles.map((t, k) => `<button class="tile" data-t="${k}">${esc(t)}</button>`).join('')}</div>
      <div style="margin-top:auto;padding-top:20px"><button class="btn green block" id="check" disabled>Vérifier</button></div>`;
    const paint = () => {
      q.querySelector('#line').innerHTML = built.map((k, j) => `<button class="tile" data-b="${j}">${esc(tiles[k])}</button>`).join('');
      q.querySelectorAll('#tiles .tile').forEach((b, k) => b.classList.toggle('used', built.includes(k)));
      q.querySelector('#check').disabled = !built.length;
      on('[data-b]', el => { built.splice(+el.dataset.b, 1); SFX.tap(); paint(); }, q.querySelector('#line'));
    };
    on('#tiles .tile', el => { const k = +el.dataset.t; if (built.includes(k)) return; built.push(k); SFX.tap(); say(tiles[k]); paint(); }, q);
    q.querySelector('#check').onclick = () => {
      const good = built.map(k => tiles[k]).join(' ') === ans.join(' ');
      say(s[lang]);
      app.querySelector('.bar i').style.width = ((i + 1) / list.length * 100) + '%';
      if (good) {
        firstOk++; coins += 2; addCoins(2, q.querySelector('#line')); SFX.ok();
        fb.innerHTML = `<div class="feedback ok"><div class="msg">🎉 ${pick(CHEERS)}</div><div class="sol">${esc(s[lang])}</div><button class="btn green block" data-a="next">Continuer</button></div>`;
      } else {
        SFX.bad();
        fb.innerHTML = `<div class="feedback ko"><div class="msg">💪 ${pick(OOPS)}</div><div class="sol">✅ ${esc(s[lang])}</div><button class="btn block" style="background:var(--red);box-shadow:0 5px 0 var(--red-d)" data-a="next">Continuer</button></div>`;
      }
      on('[data-a=next]', () => { i++; draw(); }, fb);
    };
    paint();
  };
  draw();
}

// ---------- 7. Défi chrono ----------
function playChrono(u) {
  const lang = L(), DUR = 60;
  let left = DUR, score = 0, coins = 0, last = null;
  app.innerHTML = `<div class="game"><div class="q" style="justify-content:center;align-items:center;text-align:center;gap:16px">
    <div style="font-size:90px">⚡</div><h1 style="margin:0">Défi chrono</h1><p style="margin:0;font-size:19px;color:var(--muted)">Réponds à un maximum de questions en 60 secondes !<br>Record : ${uprog(u).chronoBest || 0}</p>
    <button class="btn yellow" id="go" style="min-width:220px">Prêt ? Go ! 🏁</button><button class="btn white" data-a="back">Retour</button></div></div>`;
  on('[data-a=back]', () => go(renderUnit, u));
  on('#go', () => {
    let n = 3;
    const q0 = app.querySelector('.q');
    const count = () => {
      if (n === 0) return begin();
      q0.innerHTML = `<div style="font-size:140px;font-weight:700;color:var(--world-d);animation:pop .5s">${n}</div>`; tone([440 + (3 - n) * 110], 0.1); n--; setTimeout(count, 700);
    };
    count();
  });
  const begin = () => {
    app.innerHTML = gameShell(100, 'time');
    bindQuit(() => renderUnit(u));
    const q = app.querySelector('#q');
    app.querySelector('#combo').textContent = '⏱ 60';
    clearInterval(timer);
    timer = setInterval(() => {
      left--; app.querySelector('#combo').textContent = `⏱ ${left}`;
      app.querySelector('.bar i').style.width = (left / DUR * 100) + '%';
      if (left <= 5 && left > 0) tone([880], 0.05, 'square', 0.04);
      if (left <= 0) { clearInterval(timer); const p = uprog(u); if (score > (p.chronoBest || 0)) p.chronoBest = score; finish({ u, act: 'chrono', stars: score >= 15 ? 3 : score >= 9 ? 2 : 1, correct: score, total: score, coins, score }); }
    }, 1000);
    const ask = () => {
      let w; do { w = pick(u.W); } while (u.W.length > 1 && w === last); last = w;
      const qq = buildQuestion(w, u.W, Math.random() < 0.5 ? 'img2word' : 'word2img'), t = qq.type, text = t !== 'word2img';
      const shown = t === 'img2word' ? `<div class="big-emoji" style="font-size:100px">${w.e}</div>`
        : t === 'fr2word' ? `<div class="target-word" style="margin:30px 0;color:var(--muted)">« ${esc(w.fr)} »</div>`
        : `<div class="target-word" style="margin:30px 0">${esc(w[lang])}</div>`;
      q.innerHTML = `<div class="chrono-score">Score : ${score} 🏆</div>${shown}
        <div class="opts ${text ? '' : 'grid'}">${qq.opts.map((o, k) => `<button class="opt ${text ? '' : 'emoji'}" data-i="${k}" style="${text ? '' : 'min-height:96px;font-size:52px'}">${FR_OPTS(t) ? esc(o.fr) : text ? esc(o[lang]) : o.e}</button>`).join('')}</div>`;
      on('.opt', el => {
        if (left <= 0) return;
        const good = qq.opts[+el.dataset.i].key === w.key;
        if (good) { score++; coins++; addCoins(1, el); SFX.ok(); markLearned(w); el.classList.add('ok'); setTimeout(ask, 250); }
        else { SFX.bad(); el.classList.add('ko'); q.querySelectorAll('.opt')[qq.opts.indexOf(w)].classList.add('ok'); setTimeout(ask, 700); }
      }, q);
    };
    ask();
  };
}

// ---------- Fin d'activité ----------
function finish(r) {
  clearInterval(timer);
  const p = P(), lang = L();
  let bonus = 0, firstUnit = false, newWorld = null;
  if (r.daily) {
    p.daily[lang] = today(); bonus = 15;
  } else {
    const up = uprog(r.u), wasDone = unitDone(r.u);
    const levelWasDone = levelDone(r.u.world);
    if (r.stars > (up[r.act] || 0)) up[r.act] = r.stars;
    if (!wasDone && unitDone(r.u)) {
      firstUnit = true;
      if (!levelWasDone && levelDone(r.u.world)) { const n = COURSE[levelIdx(r.u.level) + 1]; newWorld = n || 'end'; }
    }
    bonus = r.stars * 2;
  }
  p.coins += bonus;
  const xp = (r.correct || 0) * 10 + r.stars * 10;
  const lvlBefore = playerLevel(p.xp); p.xp += xp; const lvlUp = playerLevel(p.xp) > lvlBefore;
  p.langs = p.langs || {}; p.langs[lang] = 1; p.last = Date.now();
  touchStreak();
  const badges = checkBadges({ finished: true, act: r.act, stars: r.stars, score: r.score, noHint: r.noHint, daily: r.daily });
  save();
  SFX.win(); confetti(r.stars === 3 ? 80 : 45);
  const title = r.stars === 3 ? 'Incroyable !' : r.stars === 2 ? 'Bien joué !' : 'Bravo, tu as fini !';
  app.innerHTML = `<div class="result">
    <div class="mascot">${r.stars === 3 ? '🤩' : '🦊'}</div>
    <h1>${title}</h1>
    <div class="stars-big"><span>⭐</span><span>⭐</span><span>⭐</span></div>
    <div class="gains">
      <div class="gain">🪙 +${(r.coins || 0) + bonus}<small>pièces</small></div>
      <div class="gain">✨ +${xp}<small>XP</small></div>
      ${r.act === 'chrono' ? `<div class="gain">🏆 ${r.score}<small>bonnes réponses</small></div>` : r.total ? `<div class="gain">✅ ${r.correct}/${r.total}<small>du premier coup</small></div>` : ''}
    </div>
    ${lvlUp ? `<div class="new-badge">🆙 Tu passes niveau ${playerLevel(p.xp)} : ${titleFor(playerLevel(p.xp))} !</div>` : ''}
    ${firstUnit && newWorld && newWorld !== 'end' ? `<div class="new-badge">🗺️ Nouveau monde débloqué : ${newWorld.icon} ${newWorld.name} !</div>` : firstUnit ? `<div class="new-badge">🔓 Thème suivant débloqué !</div>` : ''}
    ${badges.map(b => `<div class="new-badge">🏅 Nouveau trophée : ${b.e} ${b.name}</div>`).join('')}
    <div class="btns">
      ${firstUnit ? `<button class="btn yellow block" data-a="gift">🎁 Ouvre ta carte cadeau !</button>` : ''}
      <button class="btn green block" data-a="cont">Continuer</button>
      ${r.daily ? '' : `<button class="btn white block" data-a="again">↻ Rejouer</button>`}
    </div>
  </div>`;
  app.querySelectorAll('.stars-big span').forEach((s, k) => { if (k < r.stars) setTimeout(() => { s.classList.add('lit'); tone([660 + k * 220], 0.12, 'triangle', 0.12); }, 400 + k * 350); });
  on('[data-a=cont]', () => r.daily ? go(renderMain) : go(renderUnit, r.u));
  on('[data-a=again]', () => go(startAct, r.u, r.act));
  on('[data-a=gift]', () => go(openPack, 1, () => go(renderUnit, r.u)));
}

// ---------- Cartes à collectionner ----------
function drawCard() {
  const x = Math.random(), r = x < 0.04 ? 'l' : x < 0.16 ? 'e' : x < 0.45 ? 'r' : 'c';
  return pick(CARDS.filter(c => c[3] === r))[0];
}
function openPack(n, back) {
  const p = P(), ids = Array.from({ length: n }, drawCard);
  let refund = 0;
  const isNew = ids.map(id => { const nw = !p.cards[id]; if (!nw) refund += 5; p.cards[id] = (p.cards[id] || 0) + 1; return nw; });
  p.coins += refund;
  const badges = checkBadges(); save();
  app.innerHTML = `<div class="opening"><h2>${n > 1 ? 'Ton paquet magique !' : 'Ta carte cadeau !'}</h2><p style="margin:0;opacity:.8">Touche les cartes pour les retourner</p>
    <div class="reveal ${n === 1 ? 'solo' : ''}">${ids.map((id, k) => { const c = CARD_BY_ID[id]; return `<div class="flip" data-k="${k}"><div class="flip-in"><div class="face front">✨</div><div class="face back rar-${c.r}"><span class="e">${c.e}</span><span class="w">${esc(c.name)}</span><span class="rar-label rl-${c.r}">${RARITY[c.r]}</span><span class="rar-label" style="color:${isNew[k] ? '#2DCB70' : '#9A93B5'}">${isNew[k] ? 'Nouvelle !' : 'Double · +5 🪙'}</span></div></div></div>`; }).join('')}</div>
    <button class="btn yellow" id="done" style="visibility:hidden;min-width:220px">Super !</button></div>`;
  let turned = 0;
  app.querySelectorAll('.reveal .flip').forEach(el => el.onclick = () => {
    if (el.classList.contains('turned')) return;
    el.classList.add('turned'); turned++;
    const c = CARD_BY_ID[ids[+el.dataset.k]];
    if (c.r === 'l' || c.r === 'e') { SFX.magic(); confetti(60); } else SFX.flip();
    if (turned === ids.length) { app.querySelector('#done').style.visibility = 'visible'; badges.forEach(b => toast(`🏅 Nouveau trophée : ${b.e} ${b.name}`, 3000)); }
  });
  app.querySelector('#done').onclick = back;
}
function renderCollection() {
  const p = P(), owned = Object.keys(p.cards).length;
  setWorld(COURSE[2]);
  app.innerHTML = topbar() + `<main class="home">
    <div class="shop"><div class="pack">🎴</div><h2 style="margin:6px 0 0">Paquet magique</h2><p>3 cartes surprises · peut-être une légendaire !</p>
      <button class="btn yellow" id="buy" ${p.coins < PACK_PRICE ? 'disabled' : ''}>Ouvrir · ${PACK_PRICE} 🪙</button>
      ${p.coins < PACK_PRICE ? `<p style="margin:10px 0 0;font-size:14px">Encore ${PACK_PRICE - p.coins} 🪙 — joue pour en gagner !</p>` : ''}</div>
    <h3 class="sec">Ma collection · ${owned}/${CARDS.length}</h3>
    <div class="collection">${CARDS.map(([id, e, name, r]) => { const n = p.cards[id] || 0; return `<div class="ccard rar-${r} ${n ? '' : 'missing'}">${n > 1 ? `<span class="cnt">×${n}</span>` : ''}<span class="e">${e}</span><span class="n">${n ? esc(name) : '???'}</span><span class="rar-label rl-${r}">${RARITY[r]}</span></div>`; }).join('')}</div>
  </main>` + tabbar();
  bindChrome();
  on('#buy', () => { if (p.coins < PACK_PRICE) return; p.coins -= PACK_PRICE; save(); SFX.coin(); go(openPack, 3, () => go(renderMain)); });
}

// ---------- Trophées ----------
function renderTrophies() {
  const p = P(), lvl = playerLevel(p.xp), a = xpFor(lvl), b = xpFor(lvl + 1);
  setWorld(COURSE[0]);
  const words = Object.keys(learned()).length;
  app.innerHTML = topbar() + `<main class="home">
    <div class="me-card"><span class="pface">${p.avatar}</span><div style="flex:1"><h2>${esc(p.name)}</h2><div style="color:var(--muted)">Niveau ${lvl} · ${titleFor(lvl)}</div><div class="xp"><i style="width:${(p.xp - a) / (b - a) * 100}%"></i></div><small style="color:var(--muted)">${p.xp - a} / ${b - a} XP</small></div></div>
    <div class="stats">
      <div class="stat"><span class="e">📖</span><span><b>${words}</b><small>mots appris (${LANGS[L()].name.toLowerCase()})</small></span></div>
      <div class="stat"><span class="e">⭐</span><span><b>${totalStars()}</b><small>étoiles</small></span></div>
      <div class="stat"><span class="e">🔥</span><span><b>${p.streak.n}</b><small>jours de suite</small></span></div>
      <div class="stat"><span class="e">🃏</span><span><b>${Object.keys(p.cards).length}</b><small>cartes</small></span></div>
    </div>
    <h3 class="sec">Mes trophées · ${Object.keys(p.badges).length}/${BADGES.length}</h3>
    <div class="badges">${BADGES.map(bd => `<div class="badge ${p.badges[bd.id] ? 'on' : 'off'}"><span class="e">${bd.e}</span><b>${bd.name}</b><small>${bd.desc}</small></div>`).join('')}</div>
  </main>` + tabbar();
  bindChrome();
}

// ---------- Espace parents & professeurs ----------
// Résumé d'un élève dans une langue (pour la vue classe et l'export).
function studentStats(p, k) {
  const pr = p.progress[k] || {};
  return {
    level: (p.start && p.start[k]) || 'A1',
    done: ALL_UNITS.filter(u => (pr[u.id] || {}).quiz).length,
    stars: Object.values(pr).reduce((a, u) => a + ACTS.reduce((b, x) => b + (u[x.id] || 0), 0), 0),
    words: Object.keys(p.learned[k] || {}).length,
  };
}
const lastSeen = p => p.last ? new Date(p.last).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' }) : '—';
function exportCSV() {
  const rows = [['Élève', 'Langue', 'Niveau de départ', 'Thèmes réussis', 'Étoiles', 'Mots vus', 'Série (jours)', 'Dernière activité']];
  S.profiles.forEach(p => Object.keys(p.langs || { [p.lang]: 1 }).forEach(k => {
    const t = studentStats(p, k);
    rows.push([p.name, LANGS[k].name, t.level, `${t.done}/${ALL_UNITS.length}`, t.stars, t.words, p.streak.n, p.last ? new Date(p.last).toLocaleDateString('fr-FR') : '']);
  }));
  const csv = '\ufeff' + rows.map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(';')).join('\r\n');
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
  a.download = `linguapop-classe-${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(a); a.click(); a.remove();
}
let parentOk = false;
function renderParents() {
  setWorld(COURSE[1]);
  if (!parentOk) {
    const x = 3 + Math.floor(Math.random() * 7), y = 3 + Math.floor(Math.random() * 7);
    app.innerHTML = topbar() + `<main class="home" style="text-align:center"><div style="font-size:70px;margin-top:20px">🧑‍🏫</div><h2>Espace parents & professeurs</h2><p style="color:var(--muted)">Pour entrer, combien font <b>${x} × ${y}</b> ?</p>
      <input class="text-in" id="ans" inputmode="numeric" style="max-width:200px;text-align:center"><br><br><button class="btn" id="ok">Entrer</button></main>` + tabbar();
    bindChrome();
    on('#ok', () => { if (+app.querySelector('#ans').value === x * y) { parentOk = true; renderParents(); } else { SFX.bad(); toast('Ce n\'est pas ça 🙂'); } });
    return;
  }
  const p = P(), st = S.settings;
  const VNAME = { en: 'Sonia (Royaume-Uni)', pt: 'Raquel (Portugal)', es: 'Elvira (Espagne)' };
  const vinfo = Object.entries(LANGS).map(([k, l]) => `<li>${l.flag} ${l.name} : ${VNAME[k]} <button class="chip" data-dl="${k}" style="margin-left:6px">📥 Hors connexion</button> <small id="dl-${k}"></small></li>`).join('');
  const sw = (k, t, d) => `<div class="setting"><span><b>${t}</b><small>${d}</small></span><button class="switch ${st[k] ? 'on' : ''}" data-k="${k}" aria-label="${t}"></button></div>`;
  const perLang = Object.keys(LANGS).map(k => { const pr = p.progress[k] || {}; const done = ALL_UNITS.filter(u => (pr[u.id] || {}).quiz).length; return `<li>${LANGS[k].flag} ${LANGS[k].name} : ${done}/${ALL_UNITS.length} thèmes réussis · ${Object.keys(p.learned[k] || {}).length} mots vus</li>`; }).join('');
  app.innerHTML = topbar() + `<main class="home">
    <h2>🧑‍🏫 Parents & professeurs</h2>
    <h3 class="sec">Toute la classe · ${S.profiles.length} élève${S.profiles.length > 1 ? 's' : ''}</h3>
    <div class="table-wrap"><table class="class-table">
      <thead><tr><th>Élève</th><th>Langue</th><th>Niv.</th><th>Thèmes</th><th>⭐</th><th>Mots</th><th>🔥</th><th>Vu le</th></tr></thead>
      <tbody>${S.profiles.map(q => { const t = studentStats(q, q.lang); return `<tr data-pid="${q.id}" class="${q.id === p.id ? 'sel' : ''}"><td>${q.avatar} ${esc(q.name)}</td><td>${LANGS[q.lang].flag}</td><td>${t.level}</td><td>${t.done}/${ALL_UNITS.length}</td><td>${t.stars}</td><td>${t.words}</td><td>${q.streak.n}</td><td>${lastSeen(q)}</td></tr>`; }).join('')}</tbody>
    </table></div>
    <p style="color:var(--muted);font-size:14px;margin:6px 0 10px">Touchez un élève pour voir son détail et régler son niveau.</p>
    <div style="display:flex;gap:10px;flex-wrap:wrap"><button class="btn white" data-a="add" style="flex:1">➕ Ajouter un élève</button><button class="btn white" data-a="csv" style="flex:1">📊 Exporter (tableur)</button></div>
    <h3 class="sec">Détail : ${p.avatar} ${esc(p.name)}</h3>
    <ul style="line-height:1.7;padding-left:18px;margin:0">${perLang}</ul>
    <div class="setting" style="margin-top:12px"><span><b>Niveau en ${LANGS[p.lang].name.toLowerCase()}</b><small>Débloque directement les thèmes jusqu'à ce niveau</small></span>
      <span style="display:flex;gap:4px">${LEVELS.map(l => `<button class="chip ${startLevel() === l ? 'on-chip' : ''}" data-lvl="${l}">${l}</button>`).join('')}</span></div>
    <h3 class="sec">Réglages</h3>
    ${sw('sound', 'Sons et musique', 'Petits bruitages pendant les jeux')}
    ${sw('slow', 'Voix plus lente', 'Pratique pour les plus jeunes')}
    ${sw('unlockAll', 'Tout débloquer', 'Accès libre à tous les thèmes et niveaux')}
    <h3 class="sec">Voix</h3>
    <ul style="line-height:1.7;padding-left:18px;margin:0">${vinfo}</ul>
    <div class="note">De vraies voix enregistrées, avec l'accent du pays. « Hors connexion » télécharge toutes les voix d'une langue (environ 8 Mo) pour jouer sans internet.</div>
    <h3 class="sec">Niveaux CECRL</h3>
    <div class="note" style="background:#EEF9FF">A1 : premiers mots · A2 : la vie de tous les jours · B1 : raconter et expliquer · B2 : donner son avis, hypothèses. (Le cadre européen s'arrête à C2 ; il n'existe pas de « B3 ».)</div>
    ${typeof acctSection === 'function' ? acctSection() : ''}
    <h3 class="sec">Élève</h3>
    <button class="btn white block" data-a="switch">Changer d'élève</button>
    <button class="danger block" data-a="del" style="width:100%">Supprimer le profil de ${esc(p.name)}</button>
  </main>` + tabbar();
  bindChrome();
  on('[data-dl]', async el => {
    const k = el.dataset.dl, info = app.querySelector(`#dl-${k}`);
    try {
      const list = await (await fetch(`audio/index-${LANGS[k].tts}.json`)).json();
      const cache = await caches.open('linguapop-audio');
      let n = 0;
      for (let i = 0; i < list.length; i += 8) {
        await Promise.all(list.slice(i, i + 8).map(h => cache.add(`audio/${h}.mp3`).catch(() => {})));
        n = Math.min(list.length, i + 8); info.textContent = `${Math.round(n / list.length * 100)} %`;
      }
      info.textContent = '✅ prêt';
    } catch (e) { info.textContent = '⚠️ connexion nécessaire'; }
  });
  on('.switch', el => { st[el.dataset.k] = !st[el.dataset.k]; save(); SFX.tap(); renderParents(); });
  on('[data-a=switch]', () => go(renderProfiles));
  on('[data-pid]', el => { S.current = el.dataset.pid; save(); SFX.tap(); renderParents(); });
  on('[data-a=add]', () => go(renderNewProfile));
  on('[data-a=csv]', exportCSV);
  if (typeof acctSectionBind === 'function') acctSectionBind();
  on('[data-lvl]', el => { p.start = p.start || {}; p.start[p.lang] = el.dataset.lvl; save(); SFX.ok(); toast(`${p.name} : niveau ${el.dataset.lvl} en ${LANGS[p.lang].name.toLowerCase()}`); renderParents(); });
  on('[data-a=del]', () => sheet(`<h2>Supprimer ${esc(p.name)} ?</h2><p style="text-align:center">Toute sa progression, ses pièces et ses cartes seront perdues.</p><div style="display:flex;flex-direction:column;gap:12px"><button class="btn white block" data-k="no">Annuler</button><button class="btn block" style="background:var(--red);box-shadow:0 5px 0 var(--red-d)" data-k="yes">Supprimer</button></div>`,
    (el, close) => {
      el.querySelector('[data-k=no]').onclick = close;
      el.querySelector('[data-k=yes]').onclick = () => { S.profiles = S.profiles.filter(x => x.id !== p.id); S.current = null; save(); close(); parentOk = false; go(renderProfiles); };
    }));
}

// ---------- Démarrage ----------
if ('serviceWorker' in navigator && location.protocol !== 'file:') navigator.serviceWorker.register('sw.js').catch(() => {});
if (P()) renderMain(); else renderProfiles();
