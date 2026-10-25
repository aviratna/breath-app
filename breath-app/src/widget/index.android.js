import React from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { registerWidgetTaskHandler, requestWidgetUpdate } from 'react-native-android-widget';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../lib/firebase';
import * as api from '../lib/api';
import { notifyGift } from '../lib/push';
import { breathsUntilMidnight } from '../lib/breathClock';
import { BreathWidget } from './BreathWidget';

// The Android home-screen widget. The app keeps a small cache of who to show (you, and up
// to three people: pinned first, then the most recent); the widget reads it, plus today's
// count, whenever Android asks it to draw. Giving from the widget takes two taps.

export const WIDGET_NAME = 'Breath';
const CACHE = 'breath/widget';
const ARMED = 'breath/widget-armed';
const STATUS = 'breath/widget-status';
const APP_STATE = 'breath/v1';
const ARM_MS = 6000;
const STATUS_MS = 60 * 1000;

const read = async (key, fallback) => {
  try {
    const raw = await AsyncStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch (e) {
    return fallback;
  }
};
const write = (key, value) => AsyncStorage.setItem(key, JSON.stringify(value)).catch(() => {});

function localDateKey(d) {
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

async function widgetState() {
  const now = new Date();
  const [cache, app, armed, status] = await Promise.all([read(CACHE, {}), read(APP_STATE, {}), read(ARMED, null), read(STATUS, null)]);
  const spentToday = app.spent && app.spent.date === localDateKey(now) ? app.spent.count : 0;
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  return {
    me: cache.me || null,
    people: (cache.people || []).slice(0, 3),
    breathsLeft: Math.max(0, breathsUntilMidnight(now) - spentToday),
    progress: (now - start) / 864e5,
    armed: armed && Date.now() - armed.at < ARM_MS ? armed.id : null,
    status: status && Date.now() - status.at < STATUS_MS ? status.text : null,
  };
}

function signedInUser() {
  return new Promise((resolve) => {
    const off = onAuthStateChanged(auth, (u) => {
      off();
      resolve(u);
    });
  });
}

// Sends a breath without opening the app, and books it the way the app would.
async function give(id) {
  const cache = await read(CACHE, {});
  const person = (cache.people || []).find((p) => p.id === id);
  if (!cache.me || !person) return;
  try {
    const user = await signedInUser();
    if (!user || user.uid !== cache.me.uid) throw new Error('signed out');
    const giftId = await api.sendGift(cache.me, id);
    notifyGift(id, cache.me.name, giftId);
    const now = new Date();
    const app = await read(APP_STATE, {});
    const date = localDateKey(now);
    const count = app.spent && app.spent.date === date ? app.spent.count : 0;
    await write(APP_STATE, { ...app, spent: { date, count: count + 1 }, lastGiven: { ...(app.lastGiven || {}), [id]: now.toISOString() } });
    await write(STATUS, { text: `Breath sent to ${person.name}`, at: Date.now() });
  } catch (e) {
    await write(STATUS, { text: 'Couldn’t send. Open Breath.', at: Date.now() });
  }
}

async function handler({ widgetAction, clickAction, clickActionData, renderWidget }) {
  if (widgetAction === 'WIDGET_DELETED') return;
  if (widgetAction === 'WIDGET_CLICK' && clickAction === 'GIVE' && clickActionData && clickActionData.id) {
    const id = String(clickActionData.id);
    const armed = await read(ARMED, null);
    if (armed && armed.id === id && Date.now() - armed.at < ARM_MS) {
      await AsyncStorage.removeItem(ARMED).catch(() => {});
      renderWidget(BreathWidget({ ...(await widgetState()), status: 'Sending…' }));
      await give(id);
    } else {
      await write(ARMED, { id, at: Date.now() });
    }
  }
  renderWidget(BreathWidget(await widgetState()));
}

export function registerWidget() {
  registerWidgetTaskHandler(handler);
}

// Called by the app whenever who-to-show or today's count changes.
export async function updateWidget({ me, people }) {
  await write(CACHE, { me: me ? { uid: me.uid, name: me.name } : null, people });
  await requestWidgetUpdate({ widgetName: WIDGET_NAME, renderWidget: async () => BreathWidget(await widgetState()) }).catch(() => {});
}
