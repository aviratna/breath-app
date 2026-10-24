import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Pressable, SafeAreaView } from 'react-native';
import { colors, fonts, radius } from '../theme/tokens';
import { useBreath } from '../state/BreathContext';
import { relativeTime } from '../lib/api';

export default function ReceivingScreen({ route, navigation }) {
  const { gifts, incomingGift, sendGift, markSeen, blockedContacts, now } = useBreath();
  const giftId = route.params?.giftId;
  const gift = (giftId && gifts.find((g) => g.id === giftId)) || incomingGift;
  const [error, setError] = useState(null);

  useEffect(() => {
    if (gift && !gift.seen) markSeen(gift.id);
  }, [gift?.id]);

  if (!gift) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.content}>
          <Text style={styles.message}>No gifts yet. When someone spends a breath on you, it will appear here.</Text>
          <View style={{ flex: 1 }} />
          <Pressable style={[styles.outlined, { flex: 0, width: '100%' }]} onPress={() => navigation.navigate('Home')}>
            <Text style={styles.outlinedLabel}>back</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  const canReply = gift.from in blockedContacts && !blockedContacts[gift.from];

  async function breatheBack() {
    setError(null);
    try {
      await sendGift({ id: gift.from, name: gift.name });
      navigation.navigate('Sent', { name: gift.name });
    } catch (e) {
      setError('Couldn\u2019t send it. Check your connection and try again.');
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.avatar} />
        <Text style={styles.name}>{gift.name}</Text>
        <Text style={styles.message}>used one of their breaths thinking of you</Text>
        <Text style={styles.timestamp}>{relativeTime(gift.createdAt, now)}</Text>
        <Text style={styles.reassure}>no reply needed</Text>

        <View style={{ flex: 1 }} />
        {error ? <Text style={styles.error}>{error}</Text> : null}

        <View style={styles.row}>
          <Pressable style={styles.outlined} onPress={() => navigation.navigate('Home')}>
            <Text style={styles.outlinedLabel}>just smile</Text>
          </Pressable>
          {canReply ? (
            <Pressable style={styles.outlined} onPress={breatheBack}>
              <Text style={styles.outlinedLabel}>breathe one back</Text>
            </Pressable>
          ) : null}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f6f3ee' },
  content: { flex: 1, alignItems: 'center', paddingTop: 80, paddingHorizontal: 30, paddingBottom: 32 },
  avatar: { width: 72, height: 72, borderRadius: 36, backgroundColor: colors.surface, marginBottom: 20 },
  name: { fontFamily: fonts.heading, fontSize: 19, color: colors.text, marginBottom: 8 },
  message: { fontFamily: fonts.body, fontSize: 15, color: colors.textMuted, textAlign: 'center', lineHeight: 22, marginBottom: 6 },
  timestamp: { fontFamily: fonts.body, fontSize: 12, color: colors.textFaint, marginBottom: 18 },
  reassure: { fontFamily: fonts.bodyItalic, fontSize: 13.5, color: colors.accentDeep },
  error: { fontFamily: fonts.body, fontSize: 13, color: colors.accent2Deep, marginBottom: 12, textAlign: 'center' },
  row: { flexDirection: 'row', gap: 10, width: '100%' },
  outlined: { flex: 1, borderWidth: 1, borderColor: colors.divider, borderRadius: radius.md, padding: 14, alignItems: 'center' },
  outlinedLabel: { fontFamily: fonts.heading, fontSize: 13, color: colors.text },
});
