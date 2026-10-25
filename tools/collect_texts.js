#!/usr/bin/env node
// Liste tout ce que l'app peut lire à voix haute (mots, phrases, mots des tuiles de phrases, « bonjour » de Pip)
// → tools/texts.json : [[langTTS, texte], ...]
// Usage : node tools/collect_texts.js
const fs = require('fs');
const path = require('path');
const root = path.resolve(__dirname, '..');
eval(fs.readFileSync(path.join(root, 'content.js'), 'utf8') + '\nglobalThis.COURSE = COURSE; globalThis.LANGS = LANGS;');

const tokens = s => s.replace(/[.,!?¡¿;:«»"]/g, ' ').split(/\s+/).filter(Boolean);
const out = new Set();
const add = (lang, t) => { if (t && t.trim()) out.add(JSON.stringify([LANGS[lang].tts, t.trim()])); };

for (const lang of Object.keys(LANGS)) {
  add(lang, LANGS[lang].hello);
  for (const lv of COURSE) for (const u of lv.units) {
    u.words.forEach(w => add(lang, w[{ en: 2, pt: 3, es: 4 }[lang]]));
    u.sentences.forEach(s => { const t = s[{ en: 2, pt: 3, es: 4 }[lang]]; add(lang, t); tokens(t).forEach(k => add(lang, k)); });
  }
}
const list = [...out].map(s => JSON.parse(s));
fs.writeFileSync(path.join(root, 'tools', 'texts.json'), JSON.stringify(list, null, 0));
const by = {}; list.forEach(([l]) => by[l] = (by[l] || 0) + 1);
console.log(list.length, 'textes', by);
