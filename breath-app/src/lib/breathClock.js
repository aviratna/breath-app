import { useEffect, useState } from 'react';

// One breath every four seconds (15 a minute, a resting pace), on the wall clock, so every
// screen — and the website — breathes and counts down together. Each breath is a 1.6 s
// in-breath and a 2.4 s out-breath; the count falls by one as each out-breath ends.
export const BREATH_MS = 4000;
export const INHALE_MS = 1600;

// Where we are in the current breath: { inhaling, remaining } (ms left in this half).
export function breathPhase(t = Date.now()) {
  const p = t % BREATH_MS;
  return p < INHALE_MS ? { inhaling: true, remaining: INHALE_MS - p } : { inhaling: false, remaining: BREATH_MS - p };
}

// Breaths left until local midnight at 15 a minute, i.e. whole 4-second breaths remaining.
export function breathsUntilMidnight(now = new Date()) {
  const midnight = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
  return Math.floor((midnight - now) / BREATH_MS);
}

// Re-renders exactly when a breath ends, returning the live count minus breaths given today.
export function useLiveBreaths(givenToday = 0) {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    let id;
    const next = () => {
      id = setTimeout(() => {
        setNow(new Date());
        next();
      }, BREATH_MS - (Date.now() % BREATH_MS) + 5);
    };
    next();
    return () => clearTimeout(id);
  }, []);
  return Math.max(0, breathsUntilMidnight(now) - givenToday);
}
