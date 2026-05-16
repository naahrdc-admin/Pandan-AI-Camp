// ─────────────────────────────────────────────────────────
//  Storage helper
//  Personal data  (shared=false) → localStorage
//  Shared data    (shared=true)  → Firebase Realtime DB
// ─────────────────────────────────────────────────────────

// 🔧 Fill in your Firebase Realtime Database URL here
// e.g. https://your-project-default-rtdb.asia-southeast1.firebasedatabase.app
const FIREBASE_URL = import.meta.env.VITE_FIREBASE_URL || '';

// Sanitise key for Firebase path (no dots, $, #, [, ], /)
const fbKey = k => k.replace(/[.$#[\]/]/g, '_');

export const db = {
  get: async (key, fallback, shared = false) => {
    if (!shared) {
      // ── localStorage ──────────────────────────────────
      try {
        const v = localStorage.getItem(key);
        return v != null ? JSON.parse(v) : fallback;
      } catch {
        return fallback;
      }
    } else {
      // ── Firebase REST ──────────────────────────────────
      if (!FIREBASE_URL) return fallback;
      try {
        const res = await fetch(`${FIREBASE_URL}/${fbKey(key)}.json`);
        const data = await res.json();
        return data != null ? data : fallback;
      } catch {
        return fallback;
      }
    }
  },

  set: async (key, value, shared = false) => {
    if (!shared) {
      try { localStorage.setItem(key, JSON.stringify(value)); } catch {}
    } else {
      if (!FIREBASE_URL) return;
      try {
        await fetch(`${FIREBASE_URL}/${fbKey(key)}.json`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(value),
        });
      } catch {}
    }
  },

  del: async (key, shared = false) => {
    if (!shared) {
      try { localStorage.removeItem(key); } catch {}
    } else {
      if (!FIREBASE_URL) return;
      try {
        await fetch(`${FIREBASE_URL}/${fbKey(key)}.json`, { method: 'DELETE' });
      } catch {}
    }
  },
};
