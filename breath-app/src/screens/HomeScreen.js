import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, fonts, radius, type } from '../theme/tokens';
import { useBreath } from '../state/BreathContext';
import { relativeTime } from '../lib/api';
import { Avatar, BreathMark, Icon, IconButton, ProgressRing, SecondaryButton } from '../components/ui';
import { PersonRow, useHoldToGive } from '../components/HoldToGive';

export default function HomeScreen({ navigation }) {
  const { dailyBreathsRemaining, dayProgress, contacts, previewMode, sendGift, gifts, unseenGifts, now } = useBreath();
  const [sendError, setSendError] = useState(null);
  const isPublic = previewMode === 'celebrity';

  async function give(contact) {
    setSendError(null);
    try {
      await sendGift(contact);
      navigation.navigate('Sent', { name: contact.name });
    } catch (e) {
      setSendError(`Couldn’t reach ${contact.name}. Check your connection and try again.`);
    }
  }
  const hold = useHoldToGive({ onComplete: give, breathsLeft: dailyBreathsRemaining });

  // A quiet line under each name: the last breath they gave you.
  function metaFor(id) {
    const g = gifts.find((x) => x.from === id);
    return g ? `Gave you a breath ${relativeTime(g.createdAt, now)}` : null;
  }

  const latest = unseenGifts[0];

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <View style={styles.brand}>
            <BreathMark size={24} />
            <Text style={styles.wordmark}>Breath</Text>
          </View>
          <IconButton name="settings" label="Settings" onPress={() => navigation.navigate('Settings')} />
        </View>
        {isPublic ? <Text style={styles.publicTag}>One to one, not one to a million</Text> : null}

        <View style={styles.ringWrap}>
          <ProgressRing size={232} progress={dayProgress}>
            <Text style={styles.count} accessibilityLabel={`${dailyBreathsRemaining} breaths left today`}>
              {dailyBreathsRemaining.toLocaleString()}
            </Text>
            <Text style={styles.countLabel}>breaths left today</Text>
          </ProgressRing>
          <Text style={styles.estimate}>A contemplative estimate, not a prediction</Text>
        </View>

        {latest ? (
          <Pressable style={styles.gift} accessibilityRole="button" onPress={() => navigation.navigate('Receiving', { giftId: latest.id })}>
            <Avatar name={latest.name} size={40} tone="tide" />
            <View style={{ flex: 1, minWidth: 0 }}>
              <Text style={styles.giftTitle} numberOfLines={1}>
                {latest.name} spent a breath on you
              </Text>
              <Text style={styles.giftMeta}>
                {relativeTime(latest.createdAt, now)}
                {unseenGifts.length > 1 ? ` · ${unseenGifts.length - 1} more` : ''}
              </Text>
            </View>
            <Icon name="chevron" size={18} />
          </Pressable>
        ) : null}

        <View style={styles.sectionHead}>
          <Text style={styles.sectionTitle}>Give a breath</Text>
          {contacts.length ? <Text style={type.small}>{isPublic ? 'Hold a name · once each' : 'Hold a name'}</Text> : null}
        </View>

        <View style={{ gap: 8 }}>
          {contacts.map((c) => (
            <PersonRow key={c.id} name={c.name} meta={metaFor(c.id)} onPressIn={() => hold.start(c)} onPressOut={hold.cancel} />
          ))}
          {contacts.length === 0 ? (
            <View style={styles.empty}>
              <Text style={styles.emptyTitle}>No one here yet</Text>
              <Text style={[type.small, { textAlign: 'center' }]}>
                Invite someone you love. When they open your link, their name appears here.
              </Text>
            </View>
          ) : null}
        </View>
        {sendError ? <Text style={styles.error}>{sendError}</Text> : null}

        <SecondaryButton label="Invite someone" icon="plus" height={50} onPress={() => navigation.navigate('Connect')} style={{ marginTop: 18 }} />
        <Pressable onPress={() => navigation.navigate('LockScreen')} style={{ alignSelf: 'center', paddingVertical: 14 }}>
          <Text style={styles.link}>Preview the lock screen widget</Text>
        </Pressable>
      </ScrollView>
      {hold.overlay}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.linen },
  content: { paddingTop: 8, paddingHorizontal: 20, paddingBottom: 24 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginRight: -8 },
  brand: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingLeft: 4 },
  wordmark: { fontFamily: fonts.displayItalic, fontSize: 24, color: colors.ink },
  publicTag: { fontFamily: fonts.displayItalic, fontSize: 15, color: colors.tide, paddingLeft: 4, marginTop: 2 },
  ringWrap: { alignItems: 'center', marginTop: 18, marginBottom: 22 },
  count: { fontFamily: fonts.displayLight, fontSize: 58, lineHeight: 64, letterSpacing: -1.5, color: colors.ink },
  countLabel: { fontFamily: fonts.ui, fontSize: 13, color: colors.stone, marginTop: 4 },
  estimate: { fontFamily: fonts.ui, fontSize: 12.5, color: colors.stone, marginTop: 12 },
  gift: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 12, paddingHorizontal: 14, borderRadius: radius.row, backgroundColor: colors.tideMist, marginBottom: 22 },
  giftTitle: { fontFamily: fonts.uiMedium, fontSize: 15, color: colors.ink },
  giftMeta: { fontFamily: fonts.ui, fontSize: 13, color: colors.tideInk, marginTop: 1 },
  sectionHead: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between', paddingHorizontal: 4, marginBottom: 10 },
  sectionTitle: { fontFamily: fonts.uiSemi, fontSize: 15, color: colors.ink },
  empty: { alignItems: 'center', gap: 6, paddingVertical: 26, paddingHorizontal: 24, borderRadius: radius.row, borderWidth: 1, borderStyle: 'dashed', borderColor: colors.border },
  emptyTitle: { fontFamily: fonts.display, fontSize: 21, color: colors.ink },
  error: { fontFamily: fonts.ui, fontSize: 13, color: colors.danger, marginTop: 12 },
  link: { fontFamily: fonts.ui, fontSize: 13.5, color: colors.tide },
});
