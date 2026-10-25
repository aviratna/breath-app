import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { colors, fonts } from '../theme/tokens';
import { useBreath } from '../state/BreathContext';
import { relativeTime } from '../lib/api';
import { BreathMark, IconButton, ProgressRing } from '../components/ui';

export default function LockScreenPreview({ navigation }) {
  const { dailyBreathsRemaining, dayProgress, incomingGift, now } = useBreath();
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

        <View style={styles.widget}>
          <ProgressRing size={40} strokeWidth={2.5} progress={dayProgress} track="rgba(239,234,224,0.2)" color={colors.moon}>
            <View style={styles.widgetDot} />
          </ProgressRing>
          <View>
            <Text style={styles.widgetNum}>{dailyBreathsRemaining.toLocaleString()}</Text>
            <Text style={styles.widgetLabel}>breaths left today</Text>
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
  content: { flex: 1, alignItems: 'center', paddingTop: 40, paddingHorizontal: 20, paddingBottom: 24 },
  date: { fontFamily: fonts.ui, fontSize: 17, color: colors.moonMuted },
  time: { fontFamily: fonts.displayLight, fontSize: 96, lineHeight: 104, letterSpacing: -2, color: colors.moon, marginTop: 2 },
  widget: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginTop: 26,
    paddingVertical: 12,
    paddingLeft: 12,
    paddingRight: 20,
    borderRadius: 999,
    backgroundColor: 'rgba(239,234,224,0.07)',
    borderWidth: 1,
    borderColor: 'rgba(239,234,224,0.12)',
  },
  widgetDot: { width: 5, height: 5, borderRadius: 3, backgroundColor: colors.tideLight },
  widgetNum: { fontFamily: fonts.display, fontSize: 22, lineHeight: 26, color: colors.moon },
  widgetLabel: { fontFamily: fonts.ui, fontSize: 12, color: colors.moonMuted },
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
