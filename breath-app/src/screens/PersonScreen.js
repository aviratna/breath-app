import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, fonts, radius, type } from '../theme/tokens';
import { useBreath } from '../state/BreathContext';
import { useLiveBreaths } from '../lib/breathClock';
import { breathsBetween } from '../lib/api';
import { Avatar, Icon, IconButton, ScreenHeader } from '../components/ui';
import { useHoldToGive } from '../components/HoldToGive';

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

// One person: this month's breaths between the two of you as a quiet grid of days.
// It is only ever seen on your own phone, from your own data. No streaks, no scores.
export default function PersonScreen({ route, navigation }) {
  const { id } = route.params;
  const { me, contacts, connections, sendGift, givenToday } = useBreath();
  const person = contacts.find((c) => c.id === id) || { id, name: route.params.name || '' };
  const connection = connections.find((c) => c.id === id);
  const breathsLeft = useLiveBreaths(givenToday);

  const [offset, setOffset] = useState(0); // 0 = this month, -1 = last month…
  const [data, setData] = useState(null);
  const [failed, setFailed] = useState(false);

  const today = new Date();
  const start = new Date(today.getFullYear(), today.getMonth() + offset, 1);
  const end = new Date(today.getFullYear(), today.getMonth() + offset + 1, 1);
  const daysInMonth = Math.round((end - start) / 864e5);

  const load = useCallback(() => {
    if (!me) return;
    setFailed(false);
    breathsBetween(me.uid, id, start, end)
      .then(setData)
      .catch(() => setFailed(true));
  }, [me?.uid, id, offset]);

  useEffect(() => {
    setData(null);
    load();
  }, [load]);
  useEffect(() => navigation.addListener('focus', load), [navigation, load]);

  async function give(p) {
    await sendGift(p);
    navigation.navigate('Sent', { name: p.name });
  }
  const hold = useHoldToGive({ onComplete: give, breathsLeft });

  const gaveDays = new Set((data?.given || []).map((d) => d.getDate()));
  const gotDays = new Set((data?.received || []).map((d) => d.getDate()));
  const days = Array.from({ length: daysInMonth }, (_, i) => {
    const n = i + 1;
    return { n, gave: gaveDays.has(n), got: gotDays.has(n), future: offset === 0 && n > today.getDate() };
  });
  // Monday-first grid: blank cells before the 1st.
  const lead = (start.getDay() + 6) % 7;
  const total = (data?.given.length || 0) + (data?.received.length || 0);
  const activeDays = days.filter((d) => d.gave || d.got).length;
  const first = person.name.split(' ')[0];
  const since = connection?.since?.toDate ? connection.since.toDate() : null;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <ScreenHeader onBack={() => navigation.goBack()} />
        <View style={{ alignItems: 'center', marginTop: 4 }}>
          <Avatar name={person.name} size={96} tone="tide" />
          <Text accessibilityRole="header" style={styles.name}>
            {person.name}
          </Text>
          {since ? <Text style={type.small}>Connected since {MONTHS[since.getMonth()]} {since.getFullYear()}</Text> : null}
        </View>

        <View style={styles.card}>
          <View style={styles.monthRow}>
            <IconButton name="back" label="Previous month" onPress={() => setOffset(offset - 1)} />
            <Text style={[type.label, { color: colors.tide }]}>
              {MONTHS[start.getMonth()]}
              {start.getFullYear() !== today.getFullYear() ? ` ${start.getFullYear()}` : ''}, between you two
            </Text>
            {offset < 0 ? (
              <IconButton name="chevron" label="Next month" onPress={() => setOffset(offset + 1)} />
            ) : (
              <View style={{ width: 44 }} />
            )}
          </View>

          {data ? (
            <>
              <Text style={styles.total}>
                {total === 0 ? 'No breaths yet' : `${total} ${total === 1 ? 'breath' : 'breaths'} shared`}
              </Text>
              <Text style={[type.small, { textAlign: 'center' }]}>
                {total === 0
                  ? offset === 0
                    ? `Hold below to give ${first} the first one this month.`
                    : 'A quiet month.'
                  : `You gave ${data.given.length} · ${first} gave ${data.received.length} · on ${activeDays} ${activeDays === 1 ? 'day' : 'days'}`}
              </Text>
              <View style={styles.grid} accessible accessibilityLabel={`${activeDays} days with breaths this month`}>
                {Array.from({ length: lead }, (_, i) => (
                  <View key={`b${i}`} style={styles.cell} />
                ))}
                {days.map((d) => (
                  <View key={d.n} style={styles.cell}>
                    {d.gave && d.got ? (
                      <View style={styles.both} />
                    ) : d.gave ? (
                      <View style={styles.gave} />
                    ) : d.got ? (
                      <View style={styles.got} />
                    ) : (
                      <View style={[styles.none, d.future && { opacity: 0.35 }]} />
                    )}
                  </View>
                ))}
              </View>
              <View style={styles.legend}>
                <Legend dot={styles.gave} label="you gave" />
                <Legend dot={styles.got} label={`${first} gave`} />
                <Legend dot={styles.both} label="both" />
              </View>
            </>
          ) : (
            <Text style={[type.small, { textAlign: 'center', paddingVertical: 40 }]}>
              {failed ? 'Couldn’t load this month. Check your connection.' : 'Loading…'}
            </Text>
          )}
        </View>

        <View style={styles.privacy}>
          <Icon name="lock" size={14} color={colors.stone} />
          <Text style={type.small}>Only you see this, on your phone. No streaks, no scores.</Text>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Give ${first} a breath`}
          accessibilityHint="Press and hold"
          accessibilityActions={[{ name: 'activate', label: `Give ${first} a breath` }]}
          onAccessibilityAction={() => give(person)}
          onPressIn={() => hold.start(person)}
          onPressOut={hold.cancel}
          style={({ pressed }) => [styles.giveBtn, pressed && { opacity: 0.9 }]}
        >
          <Text style={styles.giveText}>Hold to give {first} a breath</Text>
        </Pressable>
      </View>
      {hold.overlay}
    </SafeAreaView>
  );
}

function Legend({ dot, label }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
      <View style={[dot, { transform: [{ scale: 0.7 }] }]} />
      <Text style={type.small}>{label}</Text>
    </View>
  );
}

const DOT = 16;
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.linen },
  content: { paddingTop: 4, paddingHorizontal: 22, paddingBottom: 24 },
  name: { fontFamily: fonts.display, fontSize: 32, color: colors.ink, marginTop: 14 },
  card: { marginTop: 24, backgroundColor: colors.paper, borderWidth: 1, borderColor: colors.mist, borderRadius: 22, padding: 14, paddingBottom: 18 },
  monthRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  total: { fontFamily: fonts.display, fontSize: 26, color: colors.ink, textAlign: 'center', marginTop: 4 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 16 },
  cell: { width: `${100 / 7}%`, height: 34, alignItems: 'center', justifyContent: 'center' },
  gave: { width: DOT, height: DOT, borderRadius: DOT / 2, backgroundColor: colors.tide },
  got: { width: DOT, height: DOT, borderRadius: DOT / 2, borderWidth: 2, borderColor: colors.tide },
  both: { width: DOT + 6, height: DOT + 6, borderRadius: (DOT + 6) / 2, backgroundColor: colors.tide, borderWidth: 3, borderColor: colors.tideMist },
  none: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.border },
  legend: { flexDirection: 'row', justifyContent: 'center', flexWrap: 'wrap', gap: 16, marginTop: 12 },
  privacy: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 16, paddingHorizontal: 8 },
  footer: { paddingHorizontal: 22, paddingBottom: 16, paddingTop: 8 },
  giveBtn: { height: 56, borderRadius: radius.pill, backgroundColor: colors.ink, alignItems: 'center', justifyContent: 'center' },
  giveText: { fontFamily: fonts.uiSemi, fontSize: 16, color: colors.linen },
});
