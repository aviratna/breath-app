import React, { createContext, useContext, useEffect, useRef, useState } from 'react';

const CONTACTS = [
  { id: 'mom', name: 'Mom' },
  { id: 'dad', name: 'Dad' },
  { id: 'wife', name: 'Wife' },
  { id: 'sister', name: 'Sister' },
  { id: 'brother', name: 'Brother' },
  { id: 'friend', name: 'Friend' },
];

const START_COUNT = 9015;
const DAY_SECONDS = 24 * 60 * 60;

const BreathContext = createContext(null);

export function BreathProvider({ children }) {
  const [dailyBreathsRemaining, setDailyBreathsRemaining] = useState(START_COUNT);
  const [previewMode, setPreviewMode] = useState('personal');
  const [blockedContacts, setBlockedContacts] = useState({});
  const [lastGift, setLastGift] = useState(null);
  const [incomingGift, setIncomingGift] = useState({
    name: 'Mom',
    message: 'used one of her breaths thinking of you',
    timestamp: '2 minutes ago',
  });
  const secondsElapsed = useRef(0);

  useEffect(() => {
    const id = setInterval(() => {
      secondsElapsed.current += 1;
      setDailyBreathsRemaining((c) => (c > 0 ? c - 1 : 0));
    }, 60000);
    return () => clearInterval(id);
  }, []);

  const dayProgress = Math.min(1, secondsElapsed.current / DAY_SECONDS);

  function sendGift(contactName) {
    const before = dailyBreathsRemaining;
    const after = Math.max(0, before - 1);
    setDailyBreathsRemaining(after);
    const gift = { name: contactName, before, after, mode: previewMode };
    setLastGift(gift);
    return gift;
  }

  function toggleBlock(id) {
    setBlockedContacts((prev) => ({ ...prev, [id]: !prev[id] }));
  }

  return (
    <BreathContext.Provider
      value={{
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
