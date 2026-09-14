// firebase-auth.js — Shared Firebase Auth Module for NDTechHub Blog
import { initializeApp, getApps } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import {
  getAuth, GoogleAuthProvider, signInWithPopup,
  createUserWithEmailAndPassword, signInWithEmailAndPassword,
  signOut, onAuthStateChanged, updateProfile
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-storage.js";

const firebaseConfig = {
  apiKey: "AIzaSyCY2gFTgTW3uGgmdbjjyGdWFiIfdpGNgf4",
  authDomain: "ndtechhub-91464.firebaseapp.com",
  databaseURL: "https://ndtechhub-91464-default-rtdb.firebaseio.com",
  projectId: "ndtechhub-91464",
  storageBucket: "ndtechhub-91464.firebasestorage.app",
  messagingSenderId: "326061417911",
  appId: "1:326061417911:web:167c59d85be322652e7432",
  measurementId: "G-23XBQD2Z6F"
};

const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db   = getFirestore(app);
export const storage = getStorage(app);
console.log("%c[NDTechHub] Firestore Config Project ID:", "color:#ff00ea;font-weight:bold", firebaseConfig.projectId);

export const ADMIN_EMAILS = [
  "manoj.alig2979@gmail.com",
  "connect@ndtechhub.com",
  "hello@ndtechhub.com"
];
export const isAdmin = (user) => !!(user && user.email && ADMIN_EMAILS.includes(user.email.toLowerCase().trim()));

// ── Inject Auth Modal ────────────────────────────────────────────────────────
function injectAuthModal() {
  if (document.getElementById('ndth-auth-modal')) return;
  const modal = document.createElement('div');
  modal.id = 'ndth-auth-modal';
  modal.innerHTML = `
<style>
#ndth-auth-modal{display:none;position:fixed;inset:0;z-index:9999;background:rgba(8,12,20,.88);backdrop-filter:blur(14px);align-items:center;justify-content:center}
#ndth-auth-modal.open{display:flex}
#ndth-auth-box{background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.1);border-radius:22px;padding:40px;width:100%;max-width:420px;box-shadow:0 30px 80px rgba(0,0,0,.6);position:relative;animation:authIn .3s ease}
@keyframes authIn{from{opacity:0;transform:translateY(-18px)}to{opacity:1;transform:none}}
#ndth-auth-box h2{font-size:22px;font-weight:800;color:#fff;margin:0 0 4px;letter-spacing:-.02em}
#ndth-auth-box .sub{font-size:13px;color:rgba(255,255,255,.45);margin:0 0 26px}
.auth-tabs{display:flex;gap:4px;background:rgba(255,255,255,.04);border-radius:10px;padding:4px;margin-bottom:24px}
.auth-tab{flex:1;padding:8px;border:none;background:transparent;color:rgba(255,255,255,.45);font-size:13px;font-weight:600;border-radius:8px;cursor:pointer;transition:all .2s}
.auth-tab.active{background:rgba(0,242,254,.12);color:#00f2fe}
.auth-panel{display:none}.auth-panel.active{display:block}
.auth-field{width:100%;padding:12px 16px;margin-bottom:12px;background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.1);border-radius:10px;color:#fff;font-size:14px;outline:none;box-sizing:border-box;transition:border-color .2s;font-family:inherit}
.auth-field:focus{border-color:rgba(0,242,254,.4)}
.auth-field::placeholder{color:rgba(255,255,255,.28)}
.auth-btn-primary{width:100%;padding:13px;border:none;background:linear-gradient(135deg,#00f2fe,#4facfe);color:#080c14;font-weight:800;font-size:14px;border-radius:10px;cursor:pointer;transition:opacity .2s;font-family:inherit}
.auth-btn-primary:hover{opacity:.88}
.auth-divider{text-align:center;color:rgba(255,255,255,.28);font-size:12px;margin:16px 0;position:relative}
.auth-divider::before,.auth-divider::after{content:'';position:absolute;top:50%;width:calc(50% - 22px);height:1px;background:rgba(255,255,255,.1)}
.auth-divider::before{left:0}.auth-divider::after{right:0}
.auth-btn-google{width:100%;padding:12px;display:flex;align-items:center;justify-content:center;gap:10px;border-radius:10px;background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.12);color:#fff;font-size:14px;font-weight:600;cursor:pointer;transition:all .2s;font-family:inherit}
.auth-btn-google:hover{background:rgba(255,255,255,.1)}
#ndth-auth-close{position:absolute;top:16px;right:16px;background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.1);color:rgba(255,255,255,.55);border-radius:8px;width:32px;height:32px;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:all .2s;font-size:15px}
#ndth-auth-close:hover{background:rgba(255,255,255,.12);color:#fff}
.auth-err{color:#ef4444;font-size:12px;margin:-4px 0 10px;display:none;line-height:1.4}
</style>
<div id="ndth-auth-box">
  <button id="ndth-auth-close">✕</button>
  <h2>NDTechHub Blog</h2>
  <p class="sub">Sign in to write and manage your posts.</p>
  <div class="auth-tabs">
    <button class="auth-tab active" data-panel="signin">Sign In</button>
    <button class="auth-tab" data-panel="signup">Create Account</button>
  </div>
  <div class="auth-panel active" id="panel-signin">
    <p class="auth-err" id="err-signin"></p>
    <input type="email" class="auth-field" id="si-email" placeholder="Email address" />
    <input type="password" class="auth-field" id="si-pass" placeholder="Password" />
    <button class="auth-btn-primary" id="btn-si-email">Sign In</button>
    <div class="auth-divider">or continue with</div>
    <button class="auth-btn-google" id="btn-si-google">
      <svg width="18" height="18" viewBox="0 0 48 48"><path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9.1 3.2l6.8-6.8C35.8 2.5 30.3 0 24 0 14.8 0 7 5.4 3.2 13.3l7.9 6.2C13 13.7 18 9.5 24 9.5z"/><path fill="#4285F4" d="M46.5 24.5c0-1.6-.1-3.1-.4-4.5H24v8.5h12.7c-.6 3-2.3 5.5-4.9 7.2l7.6 5.9c4.4-4.1 7.1-10.1 7.1-17.1z"/><path fill="#FBBC05" d="M11.1 28.6A14.5 14.5 0 0 1 9.5 24c0-1.6.3-3.2.8-4.6L2.4 13.2A23.9 23.9 0 0 0 0 24c0 3.9.9 7.5 2.5 10.8l8.6-6.2z"/><path fill="#34A853" d="M24 48c6.5 0 11.9-2.1 15.9-5.8l-7.6-5.9c-2.2 1.5-5 2.3-8.3 2.3-6.1 0-11.2-4.1-13-9.7l-7.9 6.1C7.1 42.8 14.9 48 24 48z"/></svg>
      Continue with Google
    </button>
  </div>
  <div class="auth-panel" id="panel-signup">
    <p class="auth-err" id="err-signup"></p>
    <input type="text"     class="auth-field" id="su-name"  placeholder="Your full name" />
    <input type="email"    class="auth-field" id="su-email" placeholder="Email address" />
    <input type="password" class="auth-field" id="su-pass"  placeholder="Password (min 6 chars)" />
    <button class="auth-btn-primary" id="btn-su-email">Create Account</button>
    <div class="auth-divider">or continue with</div>
    <button class="auth-btn-google" id="btn-su-google">
      <svg width="18" height="18" viewBox="0 0 48 48"><path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9.1 3.2l6.8-6.8C35.8 2.5 30.3 0 24 0 14.8 0 7 5.4 3.2 13.3l7.9 6.2C13 13.7 18 9.5 24 9.5z"/><path fill="#4285F4" d="M46.5 24.5c0-1.6-.1-3.1-.4-4.5H24v8.5h12.7c-.6 3-2.3 5.5-4.9 7.2l7.6 5.9c4.4-4.1 7.1-10.1 7.1-17.1z"/><path fill="#FBBC05" d="M11.1 28.6A14.5 14.5 0 0 1 9.5 24c0-1.6.3-3.2.8-4.6L2.4 13.2A23.9 23.9 0 0 0 0 24c0 3.9.9 7.5 2.5 10.8l8.6-6.2z"/><path fill="#34A853" d="M24 48c6.5 0 11.9-2.1 15.9-5.8l-7.6-5.9c-2.2 1.5-5 2.3-8.3 2.3-6.1 0-11.2-4.1-13-9.7l-7.9 6.1C7.1 42.8 14.9 48 24 48z"/></svg>
      Continue with Google
    </button>
  </div>
</div>`;
  document.body.appendChild(modal);

  // Tab switching
  modal.querySelectorAll('.auth-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      modal.querySelectorAll('.auth-tab').forEach(t => t.classList.remove('active'));
      modal.querySelectorAll('.auth-panel').forEach(p => p.classList.remove('active'));
      tab.classList.add('active');
      document.getElementById(`panel-${tab.dataset.panel}`).classList.add('active');
    });
  });

  const setErr = (id, msg) => {
    const el = document.getElementById(id);
    if (el) { el.textContent = msg; el.style.display = msg ? 'block' : 'none'; }
  };

  document.getElementById('ndth-auth-close').addEventListener('click', closeAuthModal);
  modal.addEventListener('click', e => { if (e.target === modal) closeAuthModal(); });

  const googleAuth = async () => {
    try {
      await signInWithPopup(auth, new GoogleAuthProvider());
      closeAuthModal();
    } catch (err) { setErr('err-signin', err.message); }
  };
  document.getElementById('btn-si-google').addEventListener('click', googleAuth);
  document.getElementById('btn-su-google').addEventListener('click', googleAuth);

  document.getElementById('btn-si-email').addEventListener('click', async () => {
    try {
      await signInWithEmailAndPassword(auth,
        document.getElementById('si-email').value.trim(),
        document.getElementById('si-pass').value);
      closeAuthModal();
    } catch (err) { setErr('err-signin', err.message); }
  });

  document.getElementById('btn-su-email').addEventListener('click', async () => {
    const name  = document.getElementById('su-name').value.trim();
    const email = document.getElementById('su-email').value.trim();
    const pass  = document.getElementById('su-pass').value;
    if (!name) { setErr('err-signup', 'Please enter your name.'); return; }
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, pass);
      await updateProfile(cred.user, { displayName: name });
      closeAuthModal();
    } catch (err) { setErr('err-signup', err.message); }
  });
}

export function openAuthModal()  { const m = document.getElementById('ndth-auth-modal'); if (m) m.classList.add('open'); }
export function closeAuthModal() { const m = document.getElementById('ndth-auth-modal'); if (m) m.classList.remove('open'); }
export async function signOutUser() { await signOut(auth); }

export function watchAuthState(callback) {
  injectAuthModal();
  return onAuthStateChanged(auth, user => {
    if (user) console.log('%c[NDTechHub] Signed in | UID:', 'color:#00f2fe;font-weight:bold', user.uid, '| Admin:', isAdmin(user));
    callback(user);
  });
}
