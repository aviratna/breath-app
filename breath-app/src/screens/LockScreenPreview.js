import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { colors, fonts } from '../theme/tokens';
import { useLiveBreaths } from '../lib/breathClock';
import { useBreath } from '../state/BreathContext';
import { relativeTime } from '../lib/api';
import { BreathMark, IconButton } from '../components/ui';
import BreathDial from '../components/BreathDial';

export default function LockScreenPreview({ navigation }) {
  const { dayProgress, incomingGift, now, gifts, givenToday } = useBreath();
  const dailyBreathsRemaining = useLiveBreaths(givenToday);
  const receivedToday = gifts.filter((g) => g.createdAt.toDateString() === now.toDateString()).length;
  const time = now.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }).replace(/\s?[AP]M$/i, '');
  const date = now.toLocaleDateString([], { weekday: 'long', day: 'numeric', month: 'long' });

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      <View style={styles.top}>
        <IconButton name="back" label="Exit preview" color={colors.moon} onPress={() => navigation.goBack()} />
        <Text style={styles.previewTag}>Lock screen preview</Text>
      </View>

      <View style={styles.content}>
        <Text style={styles.date}>{date}</Text>
        <Text style={styles.time}>{time}</Text>

        <View style={{ marginTop: 34 }}>
          <BreathDial size={300} progress={dayProgress} breathsLeft={dailyBreathsRemaining} />
        </View>
        <View style={styles.summary}>
          <View style={styles.summaryItem}>
            <View style={styles.givenDot} />
            <Text style={styles.summaryText}>{givenToday} given</Text>
          </View>
          <View style={styles.summaryItem}>
            <View style={styles.receivedDot} />
            <Text style={styles.summaryText}>{receivedToday} received</Text>
          </View>
        </View>

        <View style={{ flex: 1 }} />

        {incomingGift ? (
          <Pressable style={styles.note} accessibilityRole="button" onPress={() => navigation.navigate('Receiving', { giftId: incomingGift.id })}>
            <View style={styles.noteIcon}>
              <BreathMark size={24} color={colors.moon} dot={colors.tideLight} />
            </View>
            <View style={{ flex: 1, minWidth: 0 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={styles.noteApp}>Breath</Text>
                <Text style={styles.noteApp}>{relativeTime(incomingGift.createdAt, now)}</Text>
              </View>
              <Text style={styles.noteTitle}>{incomingGift.name} spent a breath on you</Text>
              <Text style={styles.noteBody}>No reply needed.</Text>
            </View>
          </Pressable>
        ) : null}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.night },
  top: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10 },
  previewTag: { fontFamily: fonts.ui, fontSize: 13, color: colors.moonMuted },
  content: { flex: 1, alignItems: 'center', paddingTop: 20, paddingHorizontal: 20, paddingBottom: 24 },
  date: { fontFamily: fonts.ui, fontSize: 17, color: colors.moonMuted },
  time: { fontFamily: fonts.displayLight, fontSize: 84, lineHeight: 92, letterSpacing: -2, color: colors.moon, marginTop: 2 },
  summary: { flexDirection: 'row', gap: 22, marginTop: 22 },
  summaryItem: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  givenDot: { width: 9, height: 9, borderRadius: 5, backgroundColor: colors.tideLight },
  receivedDot: { width: 9, height: 9, borderRadius: 5, borderWidth: 2, borderColor: colors.tideLight },
  summaryText: { fontFamily: fonts.ui, fontSize: 14, color: colors.moonMuted },
  note: {
    alignSelf: 'stretch',
    flexDirection: 'row',
    gap: 12,
    padding: 14,
    paddingHorizontal: 16,
    borderRadius: 22,
    backgroundColor: 'rgba(239,234,224,0.09)',
    borderWidth: 1,
    borderColor: 'rgba(239,234,224,0.12)',
  },
  noteIcon: { width: 38, height: 38, borderRadius: 10, borderWidth: 1, borderColor: 'rgba(239,234,224,0.18)', alignItems: 'center', justifyContent: 'center' },
  noteApp: { fontFamily: fonts.ui, fontSize: 13, color: colors.moonMuted },
  noteTitle: { fontFamily: fonts.uiMedium, fontSize: 15, color: colors.moon, marginTop: 2 },
  noteBody: { fontFamily: fonts.ui, fontSize: 14, color: colors.moonMuted, marginTop: 2 },
});
