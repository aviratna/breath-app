import React from 'react';
import { View, Text, StyleSheet, Pressable, SafeAreaView, ScrollView } from 'react-native';
import { colors, fonts, spacing, radius } from '../theme/tokens';
import { useBreath } from '../state/BreathContext';
import PlateNumber from '../components/PlateNumber';
import HoldToSendRow from '../components/HoldToSendRow';

export default function HomeScreen({ navigation }) {
  const { dailyBreathsRemaining, contacts, previewMode, sendGift, blockedContacts } = useBreath();
  const isCeleb = previewMode === 'celebrity';
  const tint = isCeleb ? colors.accent2Tint : colors.accentTint;

  const visibleContacts = contacts.filter((c) => !blockedContacts[c.id]);

  function handleSend(name) {
    sendGift(name);
    navigation.navigate('Sent', { name });
  }

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

        <View style={styles.ringWrap}>
          <PlateNumber value={dailyBreathsRemaining} size={40} />
        </View>
        <Text style={styles.label}>breaths remaining today</Text>
        <Text style={styles.sublabel}>a contemplative estimate, not a prediction</Text>

        <View style={{ width: '100%', marginBottom: 10, marginTop: 34 }}>
          <Text style={styles.giftTitle}>gift a breath</Text>
          <Text style={styles.giftSub}>
            {isCeleb ? 'hold a name — you can give this once' : 'hold a name to send — it costs you one of your own'}
          </Text>
        </View>

        <View style={{ width: '100%', gap: 8, marginBottom: 28 }}>
          {visibleContacts.map((c) => (
            <HoldToSendRow key={c.id} name={c.name} tint={tint} onComplete={handleSend} />
          ))}
        </View>

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
  link: { fontFamily: fonts.body, fontSize: 13, color: colors.accent, textDecorationLine: 'underline' },
});
