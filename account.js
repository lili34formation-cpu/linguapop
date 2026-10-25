'use strict';
// LinguaPop — comptes des adultes (parents, professeurs) et sauvegarde en ligne (Supabase).
// Les enfants restent des profils dans le compte de l'adulte : pas d'e-mail pour eux.
// Les données restent aussi dans le navigateur (localStorage) pour jouer hors connexion.

// Informations publiques du projet (la sécurité repose sur les règles RLS de supabase/schema.sql)
const SB_URL = 'https://ygebxzosjxzagumhkkek.supabase.co';
const SB_KEY = 'sb_publishable_oyis0FR_8YsY5BIdiPPw4w_y83yqn1K';
const sb = window.supabase ? window.supabase.createClient(SB_URL, SB_KEY, { auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true } }) : null;
let acctUser = null, acctTimer = null, acctSynced = null;

const acctName = u => (u && u.user_metadata && u.user_metadata.name) || (u && u.email ? u.email.split('@')[0] : '');
const acctRole = u => (u && u.user_metadata && u.user_metadata.role) === 'prof' ? 'Professeur' : 'Parent';
const ERR = [
  [/invalid login/i, 'E-mail ou mot de passe incorrect.'],
  [/already registered|already exists/i, 'Un compte existe déjà avec cet e-mail : connecte-toi.'],
  [/at least 6|password.*short|weak/i, 'Le mot de passe doit faire au moins 6 caractères.'],
  [/valid email|invalid.*email/i, "L'adresse e-mail n'est pas valide."],
  [/rate limit|too many/i, 'Trop d\'essais : patiente une minute.'],
  [/fetch|network/i, 'Pas de connexion internet.'],
];
const acctErr = e => { const m = (e && e.message) || String(e); const f = ERR.find(([r]) => r.test(m)); return f ? f[1] : m; };

// ---------- Synchronisation ----------
function acctSchedule() { if (!acctUser) return; clearTimeout(acctTimer); acctTimer = setTimeout(acctPush, 1500); }
async function acctPush() {
  if (!acctUser) return;
  clearTimeout(acctTimer);
  const { error } = await sb.from('linguapop_data').upsert({ user_id: acctUser.id, data: S, updated_at: new Date().toISOString() });
  if (!error) acctSynced = Date.now();
}
// Fusionne les profils du compte et ceux de cet appareil (le plus récent gagne).
function acctMerge(remote) {
  const score = p => [(p.last || 0), (p.xp || 0)];
  const byId = new Map((remote.profiles || []).map(p => [p.id, p]));
  S.profiles.forEach(lp => {
    const rp = byId.get(lp.id);
    if (!rp) return byId.set(lp.id, lp);
    const [a1, a2] = score(lp), [b1, b2] = score(rp);
    if (a1 > b1 || (a1 === b1 && a2 > b2)) byId.set(lp.id, lp);
  });
  const profiles = [...byId.values()];
  return { profiles, current: profiles.some(p => p.id === S.current) ? S.current : null, settings: Object.assign({}, S.settings, remote.settings || {}), owner: acctUser.id };
}
async function acctLoad() {
  const { data, error } = await sb.from('linguapop_data').select('data').eq('user_id', acctUser.id).maybeSingle();
  if (error) { toast('⚠️ Sauvegarde en ligne indisponible pour le moment'); return; }
  // Données locales d'un autre compte (appareil partagé) : on ne les mélange pas
  if (S.owner && S.owner !== acctUser.id) S = { profiles: [], current: null, settings: S.settings };
  S = data && data.data && Array.isArray(data.data.profiles) ? acctMerge(data.data) : Object.assign(S, { owner: acctUser.id });
  save(); await acctPush();
}

async function acctStart() {
  if (!sb) return;
  const { data } = await sb.auth.getSession();
  if (data && data.session) { acctUser = data.session.user; await acctLoad(); }
  refreshAfterAuth(); // affiche la barre de compte (l'écran a été dessiné avant ce script)
  sb.auth.onAuthStateChange((ev, session) => {
    if (ev === 'PASSWORD_RECOVERY') newPasswordSheet();
    if (ev === 'TOKEN_REFRESHED' && session) acctUser = session.user;
  });
  window.addEventListener('online', () => acctUser && acctPush());
  document.addEventListener('visibilitychange', () => { if (document.hidden && acctUser) acctPush(); });
}
function refreshAfterAuth() {
  // Ne pas interrompre une partie en cours : on ne redessine que les écrans d'accueil
  if (app.querySelector('.game, .result, .opening')) return;
  if (P()) renderMain(); else renderProfiles();
}

// ---------- Interface ----------
function acctBar() {
  if (!sb) return '';
  if (acctUser) return `<div class="acct-bar on"><span>☁️ Compte de <b>${esc(acctName(acctUser))}</b> · ${acctRole(acctUser).toLowerCase()} · sauvegardé en ligne</span></div>`;
  return `<button class="acct-bar" data-a="login">👤 <span><b>Parent ou professeur ?</b> Connecte-toi pour sauvegarder la progression en ligne</span></button>`;
}
function acctBind() { on('[data-a=login]', () => authSheet('login')); }

function acctSection() {
  if (!sb) return '';
  if (!acctUser) return `<h3 class="sec">Compte en ligne</h3><div class="note" style="background:#EEF9FF">Créez un compte parent ou professeur pour sauvegarder la progression des enfants en ligne et la retrouver sur un autre appareil. Les enfants n'ont pas besoin d'e-mail.</div><button class="btn block" data-a="login">👤 Se connecter / créer un compte</button>`;
  return `<h3 class="sec">Compte en ligne</h3>
    <div class="setting"><span><b>${esc(acctName(acctUser))} · ${acctRole(acctUser)}</b><small>${esc(acctUser.email)}${acctSynced ? ' · sauvegardé à ' + new Date(acctSynced).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) : ''}</small></span></div>
    <button class="btn white block" data-a="logout">Se déconnecter</button>
    <button class="danger block" data-a="delacct" style="width:100%">Supprimer mon compte et toutes les données</button>`;
}
function acctSectionBind() {
  on('[data-a=login]', () => authSheet('login'));
  on('[data-a=logout]', () => sheet(`<h2>Se déconnecter ?</h2><p style="text-align:center">La progression est sauvegardée dans le compte. Sur cet appareil, les profils seront effacés (pratique sur un appareil partagé).</p><div style="display:flex;flex-direction:column;gap:12px"><button class="btn white block" data-k="no">Annuler</button><button class="btn block" data-k="yes">Se déconnecter</button></div>`,
    (el, close) => {
      el.querySelector('[data-k=no]').onclick = close;
      el.querySelector('[data-k=yes]').onclick = async () => {
        await acctPush(); await sb.auth.signOut(); acctUser = null;
        S = { profiles: [], current: null, settings: S.settings }; save(); close(); parentOk = false; go(renderProfiles);
      };
    }));
  on('[data-a=delacct]', () => sheet(`<h2>Supprimer le compte ?</h2><p style="text-align:center">Le compte et la progression de tous les enfants ou élèves seront définitivement effacés.</p><div style="display:flex;flex-direction:column;gap:12px"><button class="btn white block" data-k="no">Annuler</button><button class="btn block" style="background:var(--red);box-shadow:0 5px 0 var(--red-d)" data-k="yes">Supprimer définitivement</button></div>`,
    (el, close) => {
      el.querySelector('[data-k=no]').onclick = close;
      el.querySelector('[data-k=yes]').onclick = async () => {
        const { error } = await sb.rpc('delete_my_account');
        if (error) { toast('⚠️ ' + acctErr(error)); return; }
        await sb.auth.signOut(); acctUser = null;
        S = { profiles: [], current: null, settings: S.settings }; save(); close(); parentOk = false; go(renderProfiles);
        toast('Compte supprimé.');
      };
    }));
}

const pwField = (id, ph) => `<div style="position:relative"><input class="text-in" id="${id}" type="password" placeholder="${ph}" autocomplete="${id === 'pw' ? 'current-password' : 'new-password'}" style="padding-right:58px"><button type="button" class="eye" data-eye="${id}" aria-label="Afficher le mot de passe">👁️</button></div>`;
function authSheet(mode) {
  const signup = mode === 'signup';
  sheet(`<h2>${signup ? 'Créer un compte adulte' : 'Connexion parent / prof'}</h2>
    <form id="af" autocomplete="on">
      ${signup ? `<div class="field"><label>Je suis</label><div class="lang-pick" style="grid-template-columns:1fr 1fr" id="role"><button type="button" class="pick on" data-v="parent">👪<small>Parent</small></button><button type="button" class="pick" data-v="prof">🧑‍🏫<small>Professeur</small></button></div></div>
      <div class="field"><label>Votre nom</label><input class="text-in" id="an" autocomplete="name" placeholder="Ex. : Mme Martin"></div>` : ''}
      <div class="field"><label>E-mail</label><input class="text-in" id="ae" type="email" autocomplete="email" inputmode="email" placeholder="vous@exemple.fr"></div>
      <div class="field"><label>Mot de passe</label>${pwField(signup ? 'npw' : 'pw', signup ? '6 caractères minimum' : '')}</div>
      <p class="auth-err" id="aerr"></p>
      <button class="btn green block" type="submit" id="ago">${signup ? 'Créer le compte' : 'Se connecter'}</button>
    </form>
    <div style="display:flex;flex-direction:column;gap:6px;margin-top:14px;text-align:center">
      <button class="link" data-m="${signup ? 'login' : 'signup'}">${signup ? 'Déjà un compte ? Se connecter' : 'Pas encore de compte ? En créer un'}</button>
      ${signup ? '' : '<button class="link" data-m="reset">Mot de passe oublié ?</button>'}
    </div>
    ${signup ? '<p style="font-size:13px;color:var(--muted);margin:12px 0 0">Seules la progression et les prénoms des enfants sont sauvegardés, en Europe. Vous pouvez supprimer le compte à tout moment depuis l\'espace parents & profs.</p>' : ''}`,
  (el, close) => {
    let role = 'parent';
    el.querySelectorAll('#role .pick').forEach(b => b.onclick = () => { role = b.dataset.v; el.querySelectorAll('#role .pick').forEach(x => x.classList.toggle('on', x === b)); });
    el.querySelectorAll('[data-eye]').forEach(b => b.onclick = () => { const i = el.querySelector('#' + b.dataset.eye); i.type = i.type === 'password' ? 'text' : 'password'; b.textContent = i.type === 'password' ? '👁️' : '🙈'; });
    el.querySelectorAll('[data-m]').forEach(b => b.onclick = () => { close(); b.dataset.m === 'reset' ? resetSheet() : authSheet(b.dataset.m); });
    el.querySelector('#af').onsubmit = async e => {
      e.preventDefault();
      const email = el.querySelector('#ae').value.trim(), pw = el.querySelector(signup ? '#npw' : '#pw').value, err = el.querySelector('#aerr'), btn = el.querySelector('#ago');
      err.textContent = '';
      if (!email || !pw) { err.textContent = "Remplis l'e-mail et le mot de passe."; return; }
      btn.disabled = true; btn.textContent = '…';
      const res = signup
        ? await sb.auth.signUp({ email, password: pw, options: { data: { name: el.querySelector('#an').value.trim(), role }, emailRedirectTo: location.origin + location.pathname } })
        : await sb.auth.signInWithPassword({ email, password: pw });
      if (res.error || !res.data.session) {
        btn.disabled = false; btn.textContent = signup ? 'Créer le compte' : 'Se connecter';
        err.textContent = res.error ? acctErr(res.error) : 'Vérifiez votre boîte mail pour confirmer le compte.';
        return;
      }
      acctUser = res.data.session.user; close();
      await acctLoad(); SFX.win(); confetti(40);
      toast(signup ? `Bienvenue ${acctName(acctUser)} ! La progression est sauvegardée en ligne ☁️` : `Bonjour ${acctName(acctUser)} ! ☁️`, 3000);
      refreshAfterAuth();
    };
  });
}
function resetSheet() {
  sheet(`<h2>Mot de passe oublié</h2><div class="field"><label>E-mail du compte</label><input class="text-in" id="re" type="email" autocomplete="email"></div><p class="auth-err" id="rerr"></p><button class="btn block" id="rgo">Recevoir un lien</button>`,
    (el, close) => {
      el.querySelector('#rgo').onclick = async () => {
        const email = el.querySelector('#re').value.trim(); if (!email) return;
        const { error } = await sb.auth.resetPasswordForEmail(email, { redirectTo: location.origin + location.pathname });
        if (error) { el.querySelector('#rerr').textContent = acctErr(error); return; }
        close(); toast('📧 Si ce compte existe, un e-mail vient de partir.', 3500);
      };
    });
}
function newPasswordSheet() {
  sheet(`<h2>Nouveau mot de passe</h2><div class="field">${pwField('npw', '6 caractères minimum')}</div><p class="auth-err" id="nerr"></p><button class="btn green block" id="ngo">Enregistrer</button>`,
    (el, close) => {
      el.querySelector('[data-eye]').onclick = () => { const i = el.querySelector('#npw'); i.type = i.type === 'password' ? 'text' : 'password'; };
      el.querySelector('#ngo').onclick = async () => {
        const { data, error } = await sb.auth.updateUser({ password: el.querySelector('#npw').value });
        if (error) { el.querySelector('#nerr').textContent = acctErr(error); return; }
        acctUser = data.user; close(); toast('Mot de passe changé ✅'); await acctLoad(); refreshAfterAuth();
      };
    });
}

acctStart();
