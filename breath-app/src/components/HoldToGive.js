import React, { useRef, useState } from 'react';
import { View, Text, Pressable, Animated, Easing, StyleSheet, Vibration } from 'react-native';
import Svg, { Circle, Polyline } from 'react-native-svg';
import { colors, fonts, radius } from '../theme/tokens';
import { Avatar, Icon } from './ui';

const HOLD_MS = 1200;
const RING = 236;
const STROKE = 4;
const R = RING / 2 - STROKE;
const C = 2 * Math.PI * R;
const AnimatedCircle = Animated.createAnimatedComponent(Circle);
const AnimatedPolyline = Animated.createAnimatedComponent(Polyline);

// A heartbeat line (two beats) that draws itself across as you hold.
const WAVE_W = 260;
const WAVE_H = 56;
const WAVE = (() => {
  const mid = WAVE_H / 2;
  const beat = (x) => [
    [x, mid], [x + 14, mid], [x + 20, mid - 5], [x + 26, mid], [x + 32, mid],
    [x + 36, mid + 7], [x + 42, 3], [x + 48, WAVE_H - 4], [x + 53, mid], [x + 64, mid],
    [x + 72, mid - 8], [x + 82, mid], [x + 130, mid],
  ];
  const pts = [...beat(0), ...beat(130)];
  let len = 0;
  for (let i = 1; i < pts.length; i++) len += Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]);
  return { points: pts.map((p) => p.join(',')).join(' '), length: Math.ceil(len) };
})();

// Press-and-hold to give a breath. Holding a row brings up a quiet full-screen moment with a
// ring that fills around the person; letting go early cancels.
export function useHoldToGive({ onComplete, breathsLeft }) {
  const progress = useRef(new Animated.Value(0)).current;
  const beat = useRef(new Animated.Value(0)).current;
  const beatLoop = useRef(null);
  const anim = useRef(null);
  const [person, setPerson] = useState(null);

  function start(p) {
    setPerson(p);
    progress.setValue(0);
    // The person's circle beats softly, lub-dub, while you hold.
    beat.setValue(0);
    beatLoop.current = Animated.loop(
      Animated.sequence([
        Animated.timing(beat, { toValue: 1, duration: 110, useNativeDriver: false }),
        Animated.timing(beat, { toValue: 0, duration: 140, useNativeDriver: false }),
        Animated.timing(beat, { toValue: 0.6, duration: 110, useNativeDriver: false }),
        Animated.timing(beat, { toValue: 0, duration: 240, useNativeDriver: false }),
      ])
    );
    beatLoop.current.start();
    anim.current = Animated.timing(progress, { toValue: 1, duration: HOLD_MS, easing: Easing.inOut(Easing.quad), useNativeDriver: false });
    anim.current.start(({ finished }) => {
      if (beatLoop.current) beatLoop.current.stop();
      if (!finished) return;
      Vibration.vibrate([0, 18, 90, 12]);
      setPerson(null);
      onComplete(p);
    });
  }

  function cancel() {
    if (anim.current) anim.current.stop();
    if (beatLoop.current) beatLoop.current.stop();
    setPerson(null);
  }

  const overlay = person ? (
    <View pointerEvents="none" style={[StyleSheet.absoluteFill, styles.overlay]}>
      <Text style={styles.eyebrow}>Giving a breath</Text>
      <View style={{ width: RING, height: RING, marginTop: 48, marginBottom: 14, alignItems: 'center', justifyContent: 'center' }}>
        <Svg width={RING} height={RING} style={{ position: 'absolute' }}>
          <Circle cx={RING / 2} cy={RING / 2} r={R} fill="none" stroke={colors.mist} strokeWidth={STROKE} />
          <AnimatedCircle
            cx={RING / 2}
            cy={RING / 2}
            r={R}
            fill="none"
            stroke={colors.tide}
            strokeWidth={STROKE}
            strokeLinecap="round"
            strokeDasharray={`${C} ${C}`}
            strokeDashoffset={progress.interpolate({ inputRange: [0, 1], outputRange: [C, 0] })}
            transform={`rotate(-90 ${RING / 2} ${RING / 2})`}
          />
        </Svg>
        <Animated.View style={{ transform: [{ scale: beat.interpolate({ inputRange: [0, 1], outputRange: [1, 1.05] }) }] }}>
          <Avatar name={person.name} size={180} tone="tide" />
        </Animated.View>
      </View>
      <Svg width={WAVE_W} height={WAVE_H} style={{ marginBottom: 14 }} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
        <Polyline points={WAVE.points} fill="none" stroke={colors.mist} strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
        <AnimatedPolyline
          points={WAVE.points}
          fill="none"
          stroke={colors.tide}
          strokeWidth={2.4}
          strokeLinejoin="round"
          strokeLinecap="round"
          strokeDasharray={`${WAVE.length} ${WAVE.length}`}
          strokeDashoffset={progress.interpolate({ inputRange: [0, 1], outputRange: [WAVE.length, 0] })}
        />
      </Svg>
      <Text style={styles.name}>{person.name}</Text>
      <Text style={styles.hint}>Keep holding…</Text>
      <View style={{ flex: 1 }} />
      <View style={styles.cancelRow}>
        <Icon name="close" size={16} color={colors.stone} />
        <Text style={styles.cancel}>Let go to cancel</Text>
      </View>
      <Text style={styles.cost}>This will cost one of your {breathsLeft.toLocaleString()} breaths today.</Text>
    </View>
  ) : null;

  return { start, cancel, overlay };
}

// One person you can give to. Press and hold to give; screen-reader users get a direct
// "Give a breath" action instead, since a long hold is hard to perform with one.
export function PersonRow({ name, meta, favourite, onToggleFavourite, onPressIn, onPressOut, onGiveNow }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${name}${meta ? `, ${meta}` : ''}`}
      accessibilityHint="Press and hold to give a breath"
      accessibilityActions={[{ name: 'activate', label: `Give ${name} a breath` }]}
      onAccessibilityAction={(e) => e.nativeEvent.actionName === 'activate' && onGiveNow && onGiveNow()}
      onPressIn={onPressIn}
      onPressOut={onPressOut}
      style={({ pressed }) => [styles.row, pressed && { borderColor: colors.tide, backgroundColor: colors.tideMist }]}
    >
      <Avatar name={name} size={38} />
      <View style={{ flex: 1, minWidth: 0 }}>
        <Text style={styles.rowName} numberOfLines={1}>
          {name}
        </Text>
        {meta ? (
          <Text style={styles.rowMeta} numberOfLines={1}>
            {meta}
          </Text>
        ) : null}
      </View>
      {onToggleFavourite ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={favourite ? `Unpin ${name}` : `Pin ${name} to the top`}
          accessibilityState={{ selected: !!favourite }}
          onPress={onToggleFavourite}
          hitSlop={6}
          style={styles.pin}
        >
          <Icon name="star" size={18} strokeWidth={1.6} color={favourite ? colors.tide : '#B3ACA3'} fill={favourite ? colors.tide : 'none'} />
        </Pressable>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  overlay: { backgroundColor: colors.linen, alignItems: 'center', paddingTop: 92, paddingHorizontal: 28, paddingBottom: 44 },
  eyebrow: { fontFamily: fonts.uiMedium, fontSize: 13, letterSpacing: 1.2, textTransform: 'uppercase', color: colors.stone },
  name: { fontFamily: fonts.display, fontSize: 32, letterSpacing: -0.3, color: colors.ink },
  hint: { fontFamily: fonts.ui, fontSize: 16, color: colors.stone, marginTop: 10 },
  cancelRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  cancel: { fontFamily: fonts.ui, fontSize: 14, color: colors.stone },
  cost: { fontFamily: fonts.ui, fontSize: 13, color: colors.stone, marginTop: 18, textAlign: 'center' },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    minHeight: 62,
    paddingVertical: 8,
    paddingLeft: 14,
    paddingRight: 4,
    borderRadius: radius.row,
    backgroundColor: colors.paper,
    borderWidth: 1,
    borderColor: colors.mist,
  },
  rowName: { fontFamily: fonts.uiMedium, fontSize: 15, color: colors.ink },
  rowMeta: { fontFamily: fonts.ui, fontSize: 12.5, color: colors.stone, marginTop: 1 },
  pin: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
});
