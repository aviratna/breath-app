import React, { useEffect, useRef, useState } from 'react';
import { View, Text, Animated, Easing, StyleSheet, AccessibilityInfo } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { colors, fonts } from '../theme/tokens';
import { breathPhase } from '../lib/breathClock';

const DOTS = 96; // one per quarter hour

// The day as a ring of 96 quarter-hour dots: spent ones fade, remaining ones stay bright,
// the current one glows. Inside, a soft halo breathes once per counted breath (see breathClock).
export default function BreathDial({ size = 300, progress, breathsLeft, dark = true }) {
  const fg = dark ? colors.moon : colors.ink;
  const muted = dark ? colors.moonMuted : colors.stone;
  const accent = dark ? colors.tideLight : colors.tide;

  const r = size / 2 - 12;
  const c = size / 2;
  const now = Math.min(DOTS - 1, Math.floor(progress * DOTS));
  const dotR = Math.max(2, size * 0.01);
  const pos = (i) => {
    const a = (i / DOTS) * 2 * Math.PI - Math.PI / 2;
    return { x: c + r * Math.cos(a), y: c + r * Math.sin(a) };
  };
  const cur = pos(now);

  const breath = useRef(new Animated.Value(0)).current;
  const glow = useRef(new Animated.Value(0)).current;
  const [inhaling, setInhaling] = useState(true);
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled().then(setReduceMotion).catch(() => {});
  }, []);

  useEffect(() => {
    if (reduceMotion) {
      breath.setValue(0.6);
      return undefined;
    }
    // Follow the shared breath clock, so the halo, the cue and the count move together.
    let alive = true;
    let timer;
    const cycle = () => {
      if (!alive) return;
      const { inhaling: inNow, remaining } = breathPhase();
      setInhaling(inNow);
      Animated.timing(breath, {
        toValue: inNow ? 1 : 0,
        duration: remaining,
        easing: Easing.inOut(Easing.sin),
        useNativeDriver: true,
      }).start();
      timer = setTimeout(cycle, remaining + 5);
    };
    cycle();
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(glow, { toValue: 1, duration: 2000, useNativeDriver: true }),
        Animated.timing(glow, { toValue: 0, duration: 2000, useNativeDriver: true }),
      ])
    );
    pulse.start();
    return () => {
      alive = false;
      clearTimeout(timer);
      breath.stopAnimation();
      pulse.stop();
    };
  }, [reduceMotion]);

  const halo = size * 0.66;
  const dots = [];
  for (let i = 0; i < DOTS; i++) {
    if (i === now) continue;
    const p = pos(i);
    dots.push(<Circle key={i} cx={p.x} cy={p.y} r={dotR} fill={fg} opacity={i < now ? 0.18 : 0.9} />);
  }

  return (
    <View
      style={{ width: size, height: size }}
      accessible
      accessibilityLabel={`${breathsLeft.toLocaleString()} breaths left today. ${DOTS - now - 1} quarter hours remain.`}
    >
      <Animated.View
        pointerEvents="none"
        style={[
          styles.halo,
          {
            width: halo,
            height: halo,
            borderRadius: halo / 2,
            left: c - halo / 2,
            top: c - halo / 2,
            backgroundColor: dark ? 'rgba(140,195,207,0.16)' : 'rgba(45,106,120,0.10)',
            borderColor: dark ? 'rgba(140,195,207,0.35)' : 'rgba(45,106,120,0.25)',
            opacity: breath.interpolate({ inputRange: [0, 1], outputRange: [0.45, 1] }),
            transform: [{ scale: breath.interpolate({ inputRange: [0, 1], outputRange: [0.8, 1.06] }) }],
          },
        ]}
      />
      <Svg width={size} height={size} style={StyleSheet.absoluteFill}>
        {dots}
        <Circle cx={cur.x} cy={cur.y} r={dotR * 1.5} fill={accent} />
      </Svg>
      <Animated.View
        pointerEvents="none"
        style={{
          position: 'absolute',
          left: cur.x - dotR * 3.2,
          top: cur.y - dotR * 3.2,
          width: dotR * 6.4,
          height: dotR * 6.4,
          borderRadius: dotR * 3.2,
          backgroundColor: accent,
          opacity: glow.interpolate({ inputRange: [0, 1], outputRange: [0.08, 0.4] }),
        }}
      />
      <View style={[StyleSheet.absoluteFill, styles.center]} pointerEvents="none">
        {!reduceMotion ? <Text style={[styles.cue, { color: fg }]}>{inhaling ? 'breathe in' : 'breathe out'}</Text> : null}
        <Text style={[styles.count, { color: fg }]}>{breathsLeft.toLocaleString()}</Text>
        <Text style={[styles.label, { color: muted }]}>breaths left today</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  halo: { position: 'absolute', borderWidth: 1 },
  center: { alignItems: 'center', justifyContent: 'center' },
  cue: { fontFamily: fonts.displayItalic, fontSize: 24 },
  count: { fontFamily: fonts.displayLight, fontSize: 34, letterSpacing: -0.5, marginTop: 6 },
  label: { fontFamily: fonts.ui, fontSize: 12 },
});
