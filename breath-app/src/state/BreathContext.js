import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { AppState } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as api from '../lib/api';

// A resting adult breathes roughly 12–20 times a minute; 15 is the contemplative middle.
// "Breaths remaining today" is that rate times the minutes left until local midnight,
// minus any breaths gifted today. It resets on its own at midnight.
const BREATHS_PER_MINUTE = 15;
const TICK_MS = 60 * 1000;
const STORAGE_KEY = 'breath/v1';

function localDateKey(d) {
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function dayClock(now) {
  const midnight = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const minutesLeft = (midnight - now) / 60000;
  return {
    breathsLeft: Math.floor(minutesLeft * BREATHS_PER_MINUTE),
    progress: (now - startOfDay) / (midnight - startOfDay),
  };
}

const BreathContext = createContext(null);

export function BreathProvider({ children }) {
  const [storageReady, setStorageReady] = useState(false);
  const [now, setNow] = useState(() => new Date());
  const [spent, setSpent] = useState({ date: localDateKey(new Date()), count: 0 });
  const [hasOnboarded, setHasOnboarded] = useState(false);
  const [previewMode, setPreviewMode] = useState('personal');
  const [lastGift, setLastGift] = useState(null);
  const loaded = useRef(false);

  // Account: anonymous Firebase sign-in plus a { name, code } profile.
  const [authReady, setAuthReady] = useState(false);
  const [me, setMe] = useState(null); // { uid, name, code } once the profile exists
  const [connections, setConnections] = useState([]);
  const [inbox, setInbox] = useState([]);

  // Load saved on-device state once.
  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((raw) => {
        if (!raw) return;
        const saved = JSON.parse(raw);
        if (saved.spent) setSpent(saved.spent);
        if (saved.hasOnboarded) setHasOnboarded(true);
      })
      .catch(() => {})
      .finally(() => {
        loaded.current = true;
        setStorageReady(true);
      });
  }, []);

  useEffect(() => {
    if (!loaded.current) return;
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify({ spent, hasOnboarded })).catch(() => {});
  }, [spent, hasOnboarded]);

  // Restore the signed-in user and their profile, if any.
  useEffect(() => {
    return api.onAuth(async (user) => {
      if (!user) {
        setMe(null);
        setAuthReady(true);
        return;
      }
      try {
        const profile = await api.getProfile(user.uid);
        setMe(profile ? { uid: user.uid, name: profile.name, code: profile.code } : null);
      } catch (e) {
        setMe(null);
      }
      setAuthReady(true);
    });
  }, []);

  // Live connections and received gifts while signed in.
  useEffect(() => {
    if (!me) {
      setConnections([]);
      setInbox([]);
      return undefined;
    }
    const offConnections = api.watchConnections(me.uid, setConnections, () => {});
    const offInbox = api.watchInbox(me.uid, setInbox, () => {});
    return () => {
      offConnections();
      offInbox();
    };
  }, [me]);

  // Tick once a minute, and immediately whenever the app comes back to the foreground.
  useEffect(() => {
    const tick = () => setNow(new Date());
    const id = setInterval(tick, TICK_MS);
    const sub = AppState.addEventListener('change', (s) => s === 'active' && tick());
    return () => {
      clearInterval(id);
      sub.remove();
    };
  }, []);

  const today = localDateKey(now);
  const spentToday = spent.date === today ? spent.count : 0;
  const { breathsLeft, progress: dayProgress } = dayClock(now);
  const dailyBreathsRemaining = Math.max(0, breathsLeft - spentToday);

  const nameFor = useCallback(
    (uid, fallback) => connections.find((c) => c.id === uid)?.name || fallback,
    [connections]
  );
  const contacts = connections.filter((c) => !c.blocked).map((c) => ({ id: c.id, name: c.name }));
  const blockedContacts = Object.fromEntries(connections.map((c) => [c.id, !!c.blocked]));
  const gifts = inbox
    .filter((g) => !blockedContacts[g.from])
    .map((g) => ({ ...g, name: nameFor(g.from, g.fromName) }));
  const unseenGifts = gifts.filter((g) => !g.seen);
  const incomingGift = gifts[0] || null;

  // Spends one of today's breaths and sends it. Throws if it couldn't be sent.
  const sendGift = useCallback(
    async (contact) => {
      if (!me) throw new Error('Not signed in');
      await api.sendGift(me, contact.id);
      const at = new Date();
      const date = localDateKey(at);
      const already = spent.date === date ? spent.count : 0;
      const before = Math.max(0, dayClock(at).breathsLeft - already);
      const after = Math.max(0, before - 1);
      setNow(at);
      setSpent({ date, count: already + 1 });
      const gift = { name: contact.name, before, after, mode: previewMode };
      setLastGift(gift);
      return gift;
    },
    [me, spent, previewMode]
  );

  async function createProfile(name) {
    const profile = await api.createProfile(name);
    setMe({ uid: profile.uid, name: profile.name, code: profile.code });
  }

  async function connect(code) {
    return api.connectByCode(me, code);
  }

  async function toggleBlock(id) {
    await api.setBlocked(me.uid, id, !blockedContacts[id]);
  }

  async function markSeen(giftId) {
    if (me) await api.markSeen(me.uid, giftId).catch(() => {});
  }

  async function deleteAccount() {
    await api.deleteAccount(me);
    setMe(null);
    setLastGift(null);
    setSpent({ date: localDateKey(new Date()), count: 0 });
    setHasOnboarded(false);
  }

  return (
    <BreathContext.Provider
      value={{
        ready: storageReady && authReady,
        now,
        me,
        dailyBreathsRemaining,
        dayProgress,
        contacts,
        connections,
        previewMode,
        setPreviewMode,
        sendGift,
        lastGift,
        gifts,
        unseenGifts,
        incomingGift,
        markSeen,
        blockedContacts,
        toggleBlock,
        createProfile,
        connect,
        deleteAccount,
        hasOnboarded,
        completeOnboarding: () => setHasOnboarded(true),
      }}
    >
      {children}
    </BreathContext.Provider>
  );
}

export function useBreath() {
  const ctx = useContext(BreathContext);
  if (!ctx) throw new Error('useBreath must be used within BreathProvider');
  return ctx;
}
