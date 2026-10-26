import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, fonts, radius, type } from '../theme/tokens';
import { useBreath } from '../state/BreathContext';
import { breathsUsed, useFocus } from '../state/FocusContext';
import { BREATH_MS } from '../lib/breathClock';
import { Icon, PrimaryButton, ScreenHeader, SecondaryButton } from '../components/ui';

const SHADES = [colors.tide, '#6FA3AF', '#A9C9D0'];
const time = (d) => d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });

// "Where today's breaths went": the focus sessions, everything else, and the breaths given.
// A look back, not a score.
export default function FocusTodayScreen({ navigation }) {
  const { contacts, givenToday } = useBreath();
  const focus = useFocus();
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 30000);
    return () => clearInterval(t);
  }, []);

  const since = new Date(focus.firstOpen);
  const total = Math.max(0, Math.floor((now - since) / BREATH_MS));
  const sessions = focus.sessions;
  const active = focus.active;
  const activeUsed = active ? Math.min(breathsUsed(active, now.getTime()), active.planned) : 0;
  const focused = sessions.reduce((s, x) => s + x.used, 0) + activeUsed;
  const other = Math.max(0, total - focused);
  const todayKey = now.toDateString();
  const givenNames = contacts.filter((c) => c.lastGiven && c.lastGiven.toDateString() === todayKey).map((c) => c.name);
  const doneTitles = new Set(sessions.map((s) => s.title.toLowerCase()));
  const open = focus.intentions.filter((i) => !doneTitles.has(i.title.toLowerCase()));

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <ScreenHeader onBack={() => navigation.goBack()} />
        <Text style={[type.label, { color: colors.tide }]}>Breath for focus</Text>
        <Text accessibilityRole="header" style={styles.h1}>
          Where today’s breaths went
        </Text>
        <Text style={type.small}>
          {total.toLocaleString()} breaths since you opened Breath at {time(since)}
        </Text>

        {total > 0 ? (
          <View style={styles.bar} accessible accessibilityLabel={`${focused} breaths on focus, ${other} elsewhere`}>
            {sessions.map((s, i) => (s.used ? <View key={s.id} style={{ flex: s.used, backgroundColor: SHADES[i % SHADES.length] }} /> : null))}
            {activeUsed ? <View style={{ flex: activeUsed, backgroundColor: colors.ink }} /> : null}
            {other ? <View style={{ flex: other, backgroundColor: colors.mist }} /> : null}
          </View>
        ) : null}

        <View style={styles.card}>
          {active ? (
            <Pressable style={[styles.row, styles.divider]} onPress={() => navigation.navigate('FocusSession')} accessibilityRole="button">
              <View style={[styles.swatch, { backgroundColor: colors.ink }]} />
              <View style={{ flex: 1 }}>
                <Text style={styles.rowTitle}>{active.title}</Text>
                <Text style={type.small}>now · {activeUsed} of {active.planned}</Text>
              </View>
              <Icon name="chevron" size={16} color={colors.stone} />
            </Pressable>
          ) : null}
          {sessions.map((s, i) => (
            <View key={s.id} style={[styles.row, styles.divider]}>
              <View style={[styles.swatch, { backgroundColor: SHADES[i % SHADES.length] }]} />
              <View style={{ flex: 1 }}>
                <Text style={styles.rowTitle}>{s.title}</Text>
                <Text style={type.small}>
                  planned {s.planned.toLocaleString()} · used {s.used.toLocaleString()}
                </Text>
              </View>
              <Text style={styles.num}>{s.used.toLocaleString()}</Text>
            </View>
          ))}
          <View style={[styles.row, styles.divider]}>
            <View style={[styles.swatch, { backgroundColor: colors.mist, borderWidth: 1, borderColor: colors.border }]} />
            <View style={{ flex: 1 }}>
              <Text style={styles.rowTitle}>Everything else</Text>
              <Text style={type.small}>meals, travel, people, rest</Text>
            </View>
            <Text style={styles.num}>{other.toLocaleString()}</Text>
          </View>
          <View style={styles.row}>
            <View style={[styles.swatch, { borderWidth: 2, borderColor: colors.tide }]} />
            <View style={{ flex: 1 }}>
              <Text style={styles.rowTitle}>Given away</Text>
              <Text style={type.small} numberOfLines={1}>
                {givenNames.length ? givenNames.join(', ') : 'No one yet today'}
              </Text>
            </View>
            <Text style={styles.num}>{givenToday}</Text>
          </View>
        </View>

        {open.length ? (
          <>
            <Text style={[type.label, { marginTop: 24, marginBottom: 8, marginHorizontal: 4 }]}>Still on today’s list</Text>
            <View style={{ gap: 8 }}>
              {open.map((i) => (
                <Pressable
                  key={i.id}
                  accessibilityRole="button"
                  accessibilityLabel={`Start ${i.title}, ${i.price} breaths`}
                  onPress={() => navigation.navigate('FocusStart', { title: i.title, price: i.price })}
                  style={styles.intention}
                >
                  <Text style={[styles.rowTitle, { flex: 1 }]}>{i.title}</Text>
                  <Text style={type.small}>{i.price}</Text>
                  <Icon name="chevron" size={16} color={colors.stone} />
                </Pressable>
              ))}
            </View>
          </>
        ) : null}

        {sessions.length ? (
          <>
            <Text style={styles.question}>Was it worth it?</Text>
            <View style={{ flexDirection: 'row', gap: 8, marginTop: 12 }}>
              {[
                ['mostly', 'Mostly'],
                ['unsure', 'Not sure'],
                ['no', 'Not really'],
              ].map(([k, label]) => {
                const on = focus.reflection === k;
                return (
                  <Pressable
                    key={k}
                    accessibilityRole="button"
                    accessibilityState={{ selected: on }}
                    onPress={() => focus.reflect(k)}
                    style={[styles.chip, on && styles.chipOn]}
                  >
                    <Text style={styles.chipLabel}>{label}</Text>
                  </Pressable>
                );
              })}
            </View>
            <Text style={[type.small, { marginTop: 12 }]}>Only for you. No score, no streak — just a moment to look back.</Text>
          </>
        ) : null}
      </ScrollView>
      <View style={styles.footer}>
        {active ? (
          <PrimaryButton label="Back to your focus" onPress={() => navigation.navigate('FocusSession')} />
        ) : (
          <PrimaryButton label="Start a focus" onPress={() => navigation.navigate('FocusStart')} />
        )}
        {!focus.intentions.length ? (
          <SecondaryButton label="Set today’s intention" height={48} onPress={() => navigation.navigate('FocusIntention')} style={{ marginTop: 8 }} />
        ) : null}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.linen },
  content: { paddingTop: 4, paddingHorizontal: 22, paddingBottom: 24 },
  h1: { ...type.h1, fontSize: 30, lineHeight: 35, marginTop: 10, marginBottom: 6 },
  bar: { flexDirection: 'row', height: 18, borderRadius: 9, overflow: 'hidden', gap: 2, marginTop: 20 },
  card: { marginTop: 20, backgroundColor: colors.paper, borderWidth: 1, borderColor: colors.mist, borderRadius: 20, overflow: 'hidden' },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 14, paddingHorizontal: 16 },
  divider: { borderBottomWidth: 1, borderBottomColor: colors.hairline },
  swatch: { width: 10, height: 10, borderRadius: 5 },
  rowTitle: { fontFamily: fonts.uiMedium, fontSize: 15, color: colors.ink },
  num: { fontFamily: fonts.display, fontSize: 19, color: colors.ink },
  intention: { flexDirection: 'row', alignItems: 'center', gap: 10, minHeight: 54, paddingHorizontal: 16, borderRadius: radius.row, backgroundColor: colors.paper, borderWidth: 1, borderColor: colors.mist },
  question: { fontFamily: fonts.display, fontSize: 21, color: colors.ink, marginTop: 24 },
  chip: { flex: 1, height: 46, borderRadius: radius.pill, borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center' },
  chipOn: { borderWidth: 2, borderColor: colors.tide, backgroundColor: colors.tideMist },
  chipLabel: { fontFamily: fonts.uiMedium, fontSize: 14, color: colors.ink },
  footer: { paddingHorizontal: 22, paddingBottom: 16, paddingTop: 8 },
});
