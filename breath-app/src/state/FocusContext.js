import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { AppState } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BREATH_MS } from '../lib/breathClock';

// "Breath for focus": you name a task and what it is worth in breaths, then watch those
// breaths pass. Everything here stays on the phone; a new day starts fresh.
//
// Saved as { date, firstOpen, intentions, sessions, active, reflection }:
//   intentions  [{ id, title, price }]            this morning's "what are they for?"
//   sessions    [{ id, title, planned, used, endedAt }]
//   active      { id, title, planned, startedAt } | null
//
// There is no pause, on purpose: your breaths don't stop while you step away, so neither
// does a focus session. That is the difference from an ordinary timer.

const KEY = 'breath/focus';
export const PRICES = [225, 450, 900];

function dateKey(d = new Date()) {
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function freshDay(now = new Date()) {
  return { date: dateKey(now), firstOpen: now.toISOString(), intentions: [], sessions: [], active: null, reflection: null };
}

// Breaths spent so far in a session, on the shared 4-second breath clock.
export function breathsUsed(active, now = Date.now()) {
  if (!active) return 0;
  return Math.max(0, Math.floor((now - active.startedAt) / BREATH_MS));
}

const id = () => Math.random().toString(36).slice(2, 10);
const FocusContext = createContext(null);

export function FocusProvider({ children }) {
  const [day, setDay] = useState(() => freshDay());
  const loaded = useRef(false);

  // A session left running overnight is closed on the day it started.
  function rollOver(saved, now = new Date()) {
    if (!saved || saved.date === dateKey(now)) return saved || freshDay(now);
    return freshDay(now);
  }

  useEffect(() => {
    AsyncStorage.getItem(KEY)
      .then((raw) => raw && setDay(rollOver(JSON.parse(raw))))
      .catch(() => {})
      .finally(() => (loaded.current = true));
    const sub = AppState.addEventListener('change', (s) => s === 'active' && setDay((d) => rollOver(d)));
    return () => sub.remove();
  }, []);

  useEffect(() => {
    if (loaded.current) AsyncStorage.setItem(KEY, JSON.stringify(day)).catch(() => {});
  }, [day]);

  const update = (fn) => setDay((d) => fn(rollOver(d)));

  const value = {
    ...day,
    setIntentions: (items) =>
      update((d) => ({ ...d, intentions: items.filter((i) => i.title.trim()).slice(0, 3).map((i) => ({ id: i.id || id(), title: i.title.trim(), price: i.price })) })),
    start: (title, planned) =>
      update((d) => ({ ...d, active: { id: id(), title: title.trim(), planned, startedAt: Date.now() } })),
    extend: (more) => update((d) => (d.active ? { ...d, active: { ...d.active, planned: d.active.planned + more } } : d)),
    finish: () =>
      update((d) => {
        if (!d.active) return d;
        const a = d.active;
        const session = { id: a.id, title: a.title, planned: a.planned, used: breathsUsed(a), endedAt: new Date().toISOString() };
        return { ...d, active: null, sessions: [...d.sessions, session] };
      }),
    reflect: (answer) => update((d) => ({ ...d, reflection: d.reflection === answer ? null : answer })),
  };

  return <FocusContext.Provider value={value}>{children}</FocusContext.Provider>;
}

export function useFocus() {
  return useContext(FocusContext);
}
