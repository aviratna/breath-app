import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, fonts, type } from '../theme/tokens';
import { useBreath } from '../state/BreathContext';
import { relativeTime } from '../lib/api';
import { Avatar, IconButton, PrimaryButton, SecondaryButton } from '../components/ui';

export default function ReceivingScreen({ route, navigation }) {
  const { gifts, incomingGift, sendGift, markSeen, blockedContacts, now } = useBreath();
  const giftId = route.params?.giftId;
  const gift = (giftId && gifts.find((g) => g.id === giftId)) || incomingGift;
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (gift && !gift.seen) markSeen(gift.id);
  }, [gift?.id]);

  const close = () => navigation.popTo('Home');

  if (!gift) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.content}>
          <View style={styles.top}>
            <IconButton name="close" label="Close" onPress={close} />
          </View>
          <Text style={[type.h1, styles.center, { marginTop: 120 }]}>No breaths yet</Text>
          <Text style={[type.body, styles.center, { marginTop: 12 }]}>When someone spends a breath on you, it will appear here.</Text>
        </View>
      </SafeAreaView>
    );
  }

  const canReply = gift.from in blockedContacts && !blockedContacts[gift.from];

  async function breatheBack() {
    setError(null);
    setBusy(true);
    try {
      await sendGift({ id: gift.from, name: gift.name });
      navigation.navigate('Sent', { name: gift.name });
    } catch (e) {
      setError('Couldn’t send it. Check your connection and try again.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.top}>
          <IconButton name="close" label="Close" onPress={close} />
        </View>

        <View style={styles.avatarWrap}>
          <View style={styles.halo} />
          <Avatar name={gift.name} size={156} tone="tide" />
          <View style={styles.dot} />
        </View>

        <Text style={[type.h1, styles.center, { marginTop: 40, marginBottom: 10 }]}>{gift.name} spent a breath on you</Text>
        <Text style={[type.small, { fontSize: 14 }]}>{relativeTime(gift.createdAt, now)}</Text>
        <Text style={styles.noReply}>No reply needed.</Text>

        <View style={{ flex: 1 }} />
        {error ? <Text style={styles.error}>{error}</Text> : null}
        <View style={styles.row}>
          <SecondaryButton label="Just smile" onPress={close} style={{ flex: 1, paddingHorizontal: 10 }} />
          {canReply ? <PrimaryButton label="Breathe one back" onPress={breatheBack} busy={busy} style={{ flex: 1.35, paddingHorizontal: 10 }} /> : null}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.linen },
  content: { flex: 1, alignItems: 'center', paddingHorizontal: 24, paddingBottom: 16 },
  top: { alignSelf: 'stretch', marginLeft: -10 },
  center: { textAlign: 'center' },
  avatarWrap: { width: 200, height: 200, alignItems: 'center', justifyContent: 'center', marginTop: 40 },
  halo: { position: 'absolute', width: 200, height: 200, borderRadius: 100, borderWidth: 1, borderColor: '#C9DCE0' },
  dot: { position: 'absolute', right: 18, top: 26, width: 16, height: 16, borderRadius: 8, backgroundColor: colors.tide, borderWidth: 3, borderColor: colors.linen },
  noReply: { fontFamily: fonts.displayItalic, fontSize: 19, color: colors.tide, marginTop: 26 },
  row: { flexDirection: 'row', gap: 10, alignSelf: 'stretch' },
  error: { fontFamily: fonts.ui, fontSize: 13, color: colors.danger, marginBottom: 12, textAlign: 'center' },
});
