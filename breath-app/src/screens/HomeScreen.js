import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, SafeAreaView, ScrollView } from 'react-native';
import { colors, fonts, spacing, radius } from '../theme/tokens';
import { useBreath } from '../state/BreathContext';
import PlateNumber from '../components/PlateNumber';
import HoldToSendRow from '../components/HoldToSendRow';

export default function HomeScreen({ navigation }) {
  const { dailyBreathsRemaining, contacts, previewMode, sendGift, unseenGifts } = useBreath();
  const [sendError, setSendError] = useState(null);
  const isCeleb = previewMode === 'celebrity';
  const tint = isCeleb ? colors.accent2Tint : colors.accentTint;

  async function handleSend(contact) {
    setSendError(null);
    try {
      await sendGift(contact);
      navigation.navigate('Sent', { name: contact.name });
    } catch (e) {
      setSendError(`Couldn\u2019t reach ${contact.name}. Check your connection and try again.`);
    }
  }

  const latestUnseen = unseenGifts[0];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Text style={styles.wordmark}>Breath</Text>
            {isCeleb ? <View style={styles.badge} /> : null}
          </View>
          <Pressable style={styles.gear} onPress={() => navigation.navigate('Settings')}>
            <Text style={{ fontSize: 14 }}>⚙</Text>
          </Pressable>
        </View>

        {isCeleb ? <Text style={styles.tagline}>one to one, not one to a million</Text> : null}

        {latestUnseen ? (
          <Pressable style={styles.giftBanner} onPress={() => navigation.navigate('Receiving', { giftId: latestUnseen.id })}>
            <View style={styles.giftDot} />
            <Text style={styles.giftBannerText}>
              <Text style={{ fontFamily: fonts.heading }}>{latestUnseen.name}</Text> used one of their breaths thinking of you
              {unseenGifts.length > 1 ? ` · ${unseenGifts.length - 1} more` : ''}
            </Text>
          </Pressable>
        ) : null}

        <View style={styles.ringWrap}>
          <PlateNumber value={dailyBreathsRemaining} size={48} />
        </View>
        <Text style={styles.label}>breaths remaining today</Text>
        <Text style={styles.sublabel}>a contemplative estimate, not a prediction</Text>

        <View style={{ width: '100%', marginBottom: 10, marginTop: 34 }}>
          <Text style={styles.giftTitle}>gift a breath</Text>
          <Text style={styles.giftSub}>
            {isCeleb ? 'hold a name — you can give this once' : 'hold a name to send — it costs you one of your own'}
          </Text>
        </View>

        <View style={{ width: '100%', gap: 8, marginBottom: 12 }}>
          {contacts.map((c) => (
            <HoldToSendRow key={c.id} name={c.name} tint={tint} onComplete={() => handleSend(c)} />
          ))}
          {contacts.length === 0 ? (
            <Text style={styles.empty}>
              No one here yet. Invite someone you love — when they join with your code, their name appears here.
            </Text>
          ) : null}
        </View>
        {sendError ? <Text style={styles.error}>{sendError}</Text> : null}

        <Pressable style={styles.addButton} onPress={() => navigation.navigate('Connect')}>
          <Text style={styles.addLabel}>{contacts.length === 0 ? 'invite someone' : '+ add someone'}</Text>
        </Pressable>

        <Pressable onPress={() => navigation.navigate('LockScreen')}>
          <Text style={styles.link}>preview lock screen</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  content: { alignItems: 'center', paddingTop: 52, paddingHorizontal: 24, paddingBottom: 32 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', width: '100%', marginBottom: 20 },
  wordmark: { fontFamily: fonts.headingItalic, fontSize: 21, color: colors.text },
  badge: { width: 10, height: 10, borderRadius: 5, backgroundColor: colors.accent2 },
  gear: { width: 30, height: 30, borderRadius: 15, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center' },
  tagline: { fontFamily: fonts.bodyItalic, fontSize: 12.5, color: colors.accent2Deep, marginBottom: 18 },
  ringWrap: { alignItems: 'center', justifyContent: 'center', marginBottom: 10, marginTop: 10 },
  label: { fontFamily: fonts.heading, fontSize: 11, letterSpacing: 0.9, textTransform: 'uppercase', color: '#605d5d', marginBottom: 2 },
  sublabel: { fontFamily: fonts.body, fontSize: 12, color: colors.textFaint },
  giftTitle: { fontFamily: fonts.heading, fontSize: 13, color: colors.text, marginBottom: 2 },
  giftSub: { fontFamily: fonts.body, fontSize: 12.5, color: colors.textMuted, marginBottom: 14 },
  giftBanner: { flexDirection: 'row', alignItems: 'center', gap: 10, width: '100%', backgroundColor: colors.accentTint, borderRadius: radius.md, padding: 12, marginBottom: 14 },
  giftDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.accent },
  giftBannerText: { flex: 1, fontFamily: fonts.body, fontSize: 13, lineHeight: 19, color: colors.text },
  empty: { fontFamily: fonts.body, fontSize: 13.5, lineHeight: 21, color: colors.textMuted, paddingVertical: 8 },
  error: { fontFamily: fonts.body, fontSize: 13, color: colors.accent2Deep, marginBottom: 12, alignSelf: 'flex-start' },
  addButton: { borderWidth: 1, borderColor: colors.divider, borderRadius: radius.md, paddingVertical: 12, width: '100%', alignItems: 'center', marginBottom: 24 },
  addLabel: { fontFamily: fonts.heading, fontSize: 13, color: colors.text },
  link: { fontFamily: fonts.body, fontSize: 13, color: colors.accent, textDecorationLine: 'underline' },
});
