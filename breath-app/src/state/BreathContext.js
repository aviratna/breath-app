import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { AppState } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const CONTACTS = [
  { id: 'mom', name: 'Mom' },
  { id: 'dad', name: 'Dad' },
  { id: 'wife', name: 'Wife' },
  { id: 'sister', name: 'Sister' },
  { id: 'brother', name: 'Brother' },
  { id: 'friend', name: 'Friend' },
];

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
  const [ready, setReady] = useState(false);
  const [now, setNow] = useState(() => new Date());
  const [spent, setSpent] = useState({ date: localDateKey(new Date()), count: 0 });
  const [blockedContacts, setBlockedContacts] = useState({});
  const [hasOnboarded, setHasOnboarded] = useState(false);
  const [previewMode, setPreviewMode] = useState('personal');
  const [lastGift, setLastGift] = useState(null);
  const [incomingGift] = useState({
    name: 'Mom',
    message: 'used one of her breaths thinking of you',
    timestamp: '2 minutes ago',
  });
  const loaded = useRef(false);

  // Load saved state once.
  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((raw) => {
        if (!raw) return;
        const saved = JSON.parse(raw);
        if (saved.spent) setSpent(saved.spent);
        if (saved.blockedContacts) setBlockedContacts(saved.blockedContacts);
        if (saved.hasOnboarded) setHasOnboarded(true);
      })
      .catch(() => {})
      .finally(() => {
        loaded.current = true;
        setReady(true);
      });
  }, []);

  // Save whenever persisted state changes (after the initial load).
  useEffect(() => {
    if (!loaded.current) return;
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify({ spent, blockedContacts, hasOnboarded })).catch(() => {});
  }, [spent, blockedContacts, hasOnboarded]);

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

  const sendGift = useCallback(
    (contactName) => {
      const at = new Date();
      const date = localDateKey(at);
      const already = spent.date === date ? spent.count : 0;
      const before = Math.max(0, dayClock(at).breathsLeft - already);
      const after = Math.max(0, before - 1);
      setNow(at);
      setSpent({ date, count: already + 1 });
      const gift = { name: contactName, before, after, mode: previewMode };
      setLastGift(gift);
      return gift;
    },
    [spent, previewMode]
  );

  function toggleBlock(id) {
    setBlockedContacts((prev) => ({ ...prev, [id]: !prev[id] }));
  }

  return (
    <BreathContext.Provider
      value={{
        ready,
        now,
        dailyBreathsRemaining,
        dayProgress,
        contacts: CONTACTS,
        previewMode,
        setPreviewMode,
        sendGift,
        lastGift,
        incomingGift,
        blockedContacts,
        toggleBlock,
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
