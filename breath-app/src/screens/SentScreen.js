import React from 'react';
import { View, Text, StyleSheet, Pressable, SafeAreaView } from 'react-native';
import { colors, fonts, radius } from '../theme/tokens';
import { useBreath } from '../state/BreathContext';
import BreathMark from '../components/BreathMark';

export default function SentScreen({ route, navigation }) {
  const { name } = route.params;
  const { lastGift, previewMode } = useBreath();
  const isCeleb = previewMode === 'celebrity';

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={{ marginBottom: 26 }}>
          <BreathMark size={56} />
        </View>
        <Text style={styles.headline}>You gave {name} a breath.</Text>
        <Text style={styles.reassure}>
          {isCeleb
            ? 'One fan. One breath. No thread to follow up.'
            : 'No reply needed. They\u2019ll simply know you were thinking of them.'}
        </Text>

        {lastGift ? (
          <View style={styles.countRow}>
            <Text style={styles.countText}>{lastGift.before.toLocaleString()}</Text>
            <Text style={styles.arrow}>→</Text>
            <Text style={styles.countText}>{lastGift.after.toLocaleString()}</Text>
          </View>
        ) : null}

        <View style={{ flex: 1 }} />

        <Pressable style={styles.primary} onPress={() => navigation.navigate('ShareCard', { name })}>
          <Text style={styles.primaryLabel}>share this moment</Text>
        </Pressable>
        <Pressable style={styles.secondary} onPress={() => navigation.navigate('Home')}>
          <Text style={styles.secondaryLabel}>done</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  content: { flex: 1, alignItems: 'center', paddingTop: 90, paddingHorizontal: 30, paddingBottom: 32 },
  headline: { fontFamily: fonts.heading, fontSize: 20, color: colors.text, textAlign: 'center', marginBottom: 12 },
  reassure: { fontFamily: fonts.body, fontSize: 14, color: colors.textMuted, textAlign: 'center', lineHeight: 21, marginBottom: 28 },
  countRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  countText: { fontFamily: fonts.body, fontSize: 15, color: colors.textMuted },
  arrow: { fontFamily: fonts.body, fontSize: 15, color: '#a8a293' },
  primary: { width: '100%', backgroundColor: colors.text, borderRadius: radius.md, padding: 15, alignItems: 'center', marginBottom: 10 },
  primaryLabel: { fontFamily: fonts.heading, fontSize: 14, color: colors.bg },
  secondary: { width: '100%', padding: 15, alignItems: 'center' },
  secondaryLabel: { fontFamily: fonts.body, fontSize: 14, color: colors.textMuted },
});
