import { signInAnonymously, onAuthStateChanged, deleteUser } from 'firebase/auth';
import {
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  addDoc,
  collection,
  query,
  orderBy,
  limit,
  onSnapshot,
  serverTimestamp,
  writeBatch,
  where,
} from 'firebase/firestore';
import { auth, db } from './firebase';

// No 0/O or 1/I, so codes are easy to read aloud and type.
const CODE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
export const CODE_LENGTH = 6;
export const MAX_NAME = 40;

export const APK_URL = 'https://github.com/aviratna/breath-app/releases/latest/download/breath.apk';
export const SITE_URL = 'https://aviratna.github.io/breath-app';

export function inviteLink(code) {
  return `${SITE_URL}/join/?c=${code}`;
}

// Pulls an invite code out of breath://join/CODE, https://…/join/?c=CODE or, for the web
// version, https://…/app/?join=CODE.
export function codeFromUrl(url) {
  if (!url) return null;
  const m = url.match(/join(?:\/?\?c=|\/|=)([A-Za-z0-9]{6})(?![A-Za-z0-9])/);
  return m ? normalizeCode(m[1]) : null;
}

// Errors whose message is written for the person using the app.
function userError(message) {
  const e = new Error(message);
  e.userFacing = true;
  return e;
}

export function errorMessage(e) {
  return e && e.userFacing ? e.message : 'Couldn\u2019t reach Breath. Check your connection and try again.';
}

function randomCode() {
  let s = '';
  for (let i = 0; i < CODE_LENGTH; i++) s += CODE_ALPHABET[Math.floor(Math.random() * CODE_ALPHABET.length)];
  return s;
}

export function normalizeCode(raw) {
  return (raw || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
}

export function onAuth(cb) {
  return onAuthStateChanged(auth, cb);
}

export async function ensureSignedIn() {
  if (auth.currentUser) return auth.currentUser;
  const cred = await signInAnonymously(auth);
  return cred.user;
}

export async function getProfile(uid) {
  const snap = await getDoc(doc(db, 'users', uid));
  return snap.exists() ? snap.data() : null;
}

// Creates the signed-in user's profile with a fresh, unique invite code.
export async function createProfile(rawName) {
  const name = rawName.trim().slice(0, MAX_NAME);
  if (!name) throw userError('Please enter a name.');
  const user = await ensureSignedIn();
  for (let attempt = 0; attempt < 5; attempt++) {
    const code = randomCode();
    const codeRef = doc(db, 'codes', code);
    if ((await getDoc(codeRef)).exists()) continue;
    // Rules only allow creating a code that doesn't exist yet, so a race fails here.
    try {
      await setDoc(codeRef, { uid: user.uid, name });
    } catch (e) {
      continue;
    }
    const profile = { name, code, createdAt: serverTimestamp() };
    await setDoc(doc(db, 'users', user.uid), profile);
    await publishInvite({ code, name });
    return { ...profile, uid: user.uid };
  }
  throw userError('Couldn’t create an invite code. Please try again.');
}

// The public half of an invite: just your name, so an invite link page can say who sent it.
export async function publishInvite(me) {
  if (!me || !me.code) return;
  await setDoc(doc(db, 'invites', me.code), { name: me.name }).catch(() => {});
}

// Connects the signed-in user with the owner of `rawCode`, on both sides.
export async function connectByCode(me, rawCode) {
  const code = normalizeCode(rawCode);
  if (code.length !== CODE_LENGTH) throw userError(`Codes are ${CODE_LENGTH} letters and numbers.`);
  const snap = await getDoc(doc(db, 'codes', code));
  if (!snap.exists()) throw userError('No one has that code. Check it and try again.');
  const other = snap.data();
  if (other.uid === me.uid) throw userError('That’s your own code.');

  const mine = doc(db, 'users', me.uid, 'connections', other.uid);
  if ((await getDoc(mine)).exists()) return { uid: other.uid, name: other.name, already: true };

  const since = serverTimestamp();
  const batch = writeBatch(db);
  batch.set(mine, { name: other.name, blocked: false, since });
  batch.set(doc(db, 'users', other.uid, 'connections', me.uid), { name: me.name, blocked: false, since });
  try {
    await batch.commit();
  } catch (e) {
    // The other side already exists, e.g. they had connected before and blocked us.
    if (e.code === 'permission-denied') {
      await setDoc(mine, { name: other.name, blocked: false, since });
    } else {
      throw e;
    }
  }
  return { uid: other.uid, name: other.name, already: false };
}

export function watchConnections(uid, cb, onError) {
  return onSnapshot(
    collection(db, 'users', uid, 'connections'),
    (snap) => cb(snap.docs.map((d) => ({ id: d.id, ...d.data() })).sort((a, b) => a.name.localeCompare(b.name))),
    onError
  );
}

export function watchInbox(uid, cb, onError) {
  const q = query(collection(db, 'users', uid, 'inbox'), orderBy('createdAt', 'desc'), limit(20));
  return onSnapshot(
    q,
    (snap) =>
      cb(
        snap.docs.map((d) => {
          const data = d.data({ serverTimestamps: 'estimate' });
          return { id: d.id, ...data, createdAt: data.createdAt ? data.createdAt.toDate() : new Date() };
        })
      ),
    onError
  );
}

export async function sendGift(me, toUid) {
  const ref = await addDoc(collection(db, 'users', toUid, 'inbox'), {
    from: me.uid,
    fromName: me.name,
    createdAt: serverTimestamp(),
    seen: false,
  });
  // Your own private note of it, for the month view you share with that person.
  await addDoc(collection(db, 'users', me.uid, 'sent'), { to: toUid, createdAt: serverTimestamp() }).catch(() => {});
  return ref.id;
}

// Breaths between you and one person in [start, end): the days you gave (from your own
// sent log) and the days they gave (from your inbox). Single-field ranges only, so no
// composite index is needed; the person is filtered here.
export async function breathsBetween(meUid, otherUid, start, end) {
  const range = (col) => query(collection(db, 'users', meUid, col), where('createdAt', '>=', start), where('createdAt', '<', end));
  const [sent, inbox] = await Promise.all([
    getDocs(range('sent')).catch(() => ({ docs: [] })),
    getDocs(range('inbox')),
  ]);
  const dates = (docs, key, value) =>
    docs.map((d) => d.data()).filter((g) => g[key] === value && g.createdAt).map((g) => g.createdAt.toDate());
  return { given: dates(sent.docs, 'to', otherUid), received: dates(inbox.docs, 'from', otherUid) };
}

// Changes your name everywhere it is shown: your profile, your invite code, and your entry
// in each connected person's list.
export async function renameMe(me, rawName) {
  const name = rawName.trim().slice(0, MAX_NAME);
  if (!name) throw userError('Please enter a name.');
  if (name === me.name) return name;
  await updateDoc(doc(db, 'users', me.uid), { name });
  if (me.code) await updateDoc(doc(db, 'codes', me.code), { name }).catch(() => {});
  await publishInvite({ code: me.code, name });
  const conns = await getDocs(collection(db, 'users', me.uid, 'connections'));
  await Promise.all(
    conns.docs.map((c) => updateDoc(doc(db, 'users', c.id, 'connections', me.uid), { name }).catch(() => {}))
  );
  return name;
}

export async function markSeen(uid, giftId) {
  await updateDoc(doc(db, 'users', uid, 'inbox', giftId), { seen: true });
}

export async function setBlocked(uid, otherUid, blocked) {
  await updateDoc(doc(db, 'users', uid, 'connections', otherUid), { blocked });
}

// Removes everything this user stored, then the sign-in itself.
export async function deleteAccount(me) {
  const uid = me.uid;
  const conns = await getDocs(collection(db, 'users', uid, 'connections'));
  for (const c of conns.docs) {
    // Remove ourselves from their list too (rules allow it unless they blocked us).
    await deleteDoc(doc(db, 'users', c.id, 'connections', uid)).catch(() => {});
    await deleteDoc(c.ref);
  }
  const inbox = await getDocs(collection(db, 'users', uid, 'inbox'));
  for (const g of inbox.docs) await deleteDoc(g.ref);
  const sent = await getDocs(collection(db, 'users', uid, 'sent')).catch(() => ({ docs: [] }));
  for (const g of sent.docs) await deleteDoc(g.ref).catch(() => {});
  if (me.code) await deleteDoc(doc(db, 'invites', me.code)).catch(() => {});
  if (me.code) await deleteDoc(doc(db, 'codes', me.code)).catch(() => {});
  await deleteDoc(doc(db, 'pushTokens', uid)).catch(() => {});
  await deleteDoc(doc(db, 'users', uid));
  if (auth.currentUser) await deleteUser(auth.currentUser);
}

export function relativeTime(date, now = new Date()) {
  const s = Math.max(0, Math.round((now - date) / 1000));
  if (s < 60) return 'just now';
  const m = Math.round(s / 60);
  if (m < 60) return `${m} minute${m === 1 ? '' : 's'} ago`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h} hour${h === 1 ? '' : 's'} ago`;
  const d = Math.round(h / 24);
  return `${d} day${d === 1 ? '' : 's'} ago`;
}
