import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Pressable, Animated, Easing, AccessibilityInfo, Vibration } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import Svg, { Circle } from 'react-native-svg';
import { colors, fonts, radius } from '../theme/tokens';
import { breathsUsed, useFocus } from '../state/FocusContext';
import { breathPhase } from '../lib/breathClock';

const SIZE = 300;
const MAX_DOTS = 90;

// A focus session: the task's breaths as a ring of dots that fade as they are spent, with
// the same breathing halo and pace as the rest of the app. It keeps counting if you leave.
export default function FocusSessionScreen({ navigation }) {
  const focus = useFocus();
  const a = focus.active;
  const [now, setNow] = useState(Date.now());
  const [inhaling, setInhaling] = useState(true);
  const [reduceMotion, setReduceMotion] = useState(false);
  const breath = useRef(new Animated.Value(0.5)).current;
  const buzzed = useRef(false);

  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled().then(setReduceMotion).catch(() => {});
  }, []);

  // Tick at every half-breath on the shared clock: the cue, the halo and the count move together.
  useEffect(() => {
    let alive = true;
    let timer;
    const step = () => {
      if (!alive) return;
      const { inhaling: inNow, remaining } = breathPhase();
      setInhaling(inNow);
      setNow(Date.now());
      if (!reduceMotion) {
        Animated.timing(breath, { toValue: inNow ? 1 : 0, duration: remaining, easing: Easing.inOut(Easing.sin), useNativeDriver: true }).start();
      }
      timer = setTimeout(step, remaining + 5);
    };
    step();
    return () => {
      alive = false;
      clearTimeout(timer);
      breath.stopAnimation();
    };
  }, [reduceMotion]);

  const used = a ? Math.min(breathsUsed(a, now), a.planned) : 0;
  const left = a ? a.planned - used : 0;
  const spent = !!a && left <= 0;
  const paused = !!a?.pausedAt;

  useEffect(() => {
    if (spent && !buzzed.current) {
      buzzed.current = true;
      Vibration.vibrate([0, 30, 120, 30]);
    }
    if (!spent) buzzed.current = false;
  }, [spent]);

  useEffect(() => {
    if (!a) navigation.replace('FocusToday');
  }, [!!a]);
  if (!a) return <View style={styles.container} />;

  const n = Math.min(MAX_DOTS, Math.max(12, Math.ceil(a.planned / 10)));
  const perDot = a.planned / n;
  const gone = Math.floor(used / perDot);
  const r = SIZE / 2 - 12;
  const dots = [];
  for (let i = 0; i < n; i++) {
    const ang = (i / n) * 2 * Math.PI - Math.PI / 2;
    const isNow = i === gone && !spent;
    dots.push(
      <Circle
        key={i}
        cx={SIZE / 2 + r * Math.cos(ang)}
        cy={SIZE / 2 + r * Math.sin(ang)}
        r={isNow ? 6 : 3.6}
        fill={isNow ? colors.tideLight : colors.moon}
        opacity={i < gone ? 0.16 : 0.9}
      />
    );
  }
  const halo = SIZE * 0.6;

  function done() {
    focus.finish();
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      <View style={styles.top}>
        <Text style={styles.eyebrow}>{paused ? 'Paused' : spent ? 'Spent' : 'Focusing'}</Text>
        <Pressable accessibilityRole="button" onPress={() => navigation.navigate('Home')} hitSlop={8} style={{ padding: 8 }}>
          <Text style={styles.muted}>Home</Text>
        </Pressable>
      </View>

      <View style={styles.body}>
        <Text style={styles.title} accessibilityRole="header">
          {a.title}
        </Text>

        <View style={{ width: SIZE, height: SIZE, marginTop: 30 }} accessible accessibilityLabel={`${left} of ${a.planned} breaths left on ${a.title}`}>
          <Animated.View
            pointerEvents="none"
            style={[
              styles.halo,
              {
                width: halo,
                height: halo,
                borderRadius: halo / 2,
                left: (SIZE - halo) / 2,
                top: (SIZE - halo) / 2,
                opacity: paused ? 0.35 : breath.interpolate({ inputRange: [0, 1], outputRange: [0.5, 1] }),
                transform: [{ scale: paused || reduceMotion ? 0.9 : breath.interpolate({ inputRange: [0, 1], outputRange: [0.82, 1.06] }) }],
              },
            ]}
          />
          <Svg width={SIZE} height={SIZE} style={StyleSheet.absoluteFill}>
            {dots}
          </Svg>
          <View style={[StyleSheet.absoluteFill, styles.center]} pointerEvents="none">
            {!paused && !spent && !reduceMotion ? <Text style={styles.cue}>{inhaling ? 'breathe in' : 'breathe out'}</Text> : null}
            <Text style={styles.count}>{spent ? a.planned.toLocaleString() : left.toLocaleString()}</Text>
            <Text style={styles.muted}>{spent ? 'breaths spent on this' : `of ${a.planned.toLocaleString()} left on this`}</Text>
          </View>
        </View>

        <Text style={styles.note}>
          {spent
            ? 'Is it worth more of your day, or is it done?'
            : `One dot fades for every ${Math.round(perDot)} breaths. When they’re gone, decide again: is it worth more?`}
        </Text>
      </View>

      <View style={styles.footer}>
        {spent ? (
          <View style={styles.row}>
            <Btn label="+225 more" onPress={() => focus.extend(225)} />
            <Btn label="Done" primary onPress={done} />
          </View>
        ) : (
          <View style={styles.row}>
            <Btn label={paused ? 'Resume' : 'Pause'} onPress={paused ? focus.resume : focus.pause} />
            <Btn label="Done" primary onPress={done} />
          </View>
        )}
        <Pressable accessibilityRole="button" onPress={() => navigation.navigate('Home')} style={{ paddingVertical: 14, alignItems: 'center' }}>
          <Text style={styles.link}>Someone on your mind? Give them a breath</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

function Btn({ label, onPress, primary }) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [styles.btn, primary ? styles.btnPrimary : styles.btnGhost, pressed && { opacity: 0.85 }]}
    >
      <Text style={[styles.btnLabel, primary && { color: colors.night, fontFamily: fonts.uiSemi }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.night },
  top: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 22, height: 52 },
  eyebrow: { fontFamily: fonts.uiSemi, fontSize: 12, letterSpacing: 1.3, textTransform: 'uppercase', color: colors.tideLight },
  body: { flex: 1, alignItems: 'center', paddingHorizontal: 22 },
  title: { fontFamily: fonts.display, fontSize: 26, color: colors.moon, textAlign: 'center', marginTop: 24 },
  halo: { position: 'absolute', borderWidth: 1, backgroundColor: 'rgba(140,195,207,0.14)', borderColor: 'rgba(140,195,207,0.35)' },
  center: { alignItems: 'center', justifyContent: 'center' },
  cue: { fontFamily: fonts.displayItalic, fontSize: 20, color: colors.moon },
  count: { fontFamily: fonts.displayLight, fontSize: 54, letterSpacing: -1, color: colors.moon, marginTop: 2 },
  muted: { fontFamily: fonts.ui, fontSize: 13, color: colors.moonMuted },
  note: { fontFamily: fonts.ui, fontSize: 13.5, lineHeight: 20, color: colors.moonMuted, textAlign: 'center', maxWidth: 290, marginTop: 26 },
  footer: { paddingHorizontal: 22, paddingBottom: 8 },
  row: { flexDirection: 'row', gap: 10 },
  btn: { flex: 1, height: 54, borderRadius: radius.pill, alignItems: 'center', justifyContent: 'center' },
  btnGhost: { borderWidth: 1, borderColor: '#3A3733' },
  btnPrimary: { backgroundColor: colors.moon },
  btnLabel: { fontFamily: fonts.uiMedium, fontSize: 15, color: colors.moon },
  link: { fontFamily: fonts.ui, fontSize: 14, color: colors.tideLight },
});
