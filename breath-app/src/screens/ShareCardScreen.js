import React from 'react';
import { View, Text, StyleSheet, Pressable, SafeAreaView, Alert } from 'react-native';
import { colors, fonts, radius } from '../theme/tokens';
import { useBreath } from '../state/BreathContext';

export default function ShareCardScreen({ route, navigation }) {
  const { name } = route.params;
  const { lastGift, previewMode } = useBreath();
  const isCeleb = previewMode === 'celebrity';

  const headline = isCeleb ? `${name.split(' ')[0] === name ? 'A public figure' : name} gave a fan a breath` : 'spent a breath thinking of you';

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.card}>
          <View style={styles.avatar} />
          <Text style={styles.line}>{isCeleb ? `${name === 'you' ? 'They' : name} gave a fan a breath` : 'spent a breath thinking of you'}</Text>

          {lastGift ? (
            <View style={styles.countRow}>
              <Text style={styles.countText}>{lastGift.before.toLocaleString()}</Text>
              <Text style={styles.arrow}>→</Text>
              <Text style={styles.countText}>{lastGift.after.toLocaleString()}</Text>
            </View>
          ) : null}

          {isCeleb ? <Text style={styles.tagline}>one to one, not one to a million</Text> : null}

          <Text style={styles.wordmark}>breath</Text>
        </View>

        <Pressable style={styles.saveButton} onPress={() => Alert.alert('Saved', 'Image saved to your library.')}>
          <Text style={styles.saveLabel}>save image</Text>
        </Pressable>
        <Pressable onPress={() => navigation.navigate('Home')}>
          <Text style={styles.done}>done</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  content: { flex: 1, alignItems: 'center', paddingTop: 40, paddingHorizontal: 24, paddingBottom: 32 },
  card: {
    width: 240,
    aspectRatio: 9 / 16,
    backgroundColor: '#f6f3ee',
    borderRadius: radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    marginBottom: 24,
  },
  avatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: colors.surface, marginBottom: 18 },
  line: { fontFamily: fonts.heading, fontSize: 16, color: colors.text, textAlign: 'center', marginBottom: 20 },
  countRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 14 },
  countText: { fontFamily: fonts.body, fontSize: 13, color: colors.textMuted },
  arrow: { fontFamily: fonts.body, fontSize: 13, color: '#a8a293' },
  tagline: { fontFamily: fonts.bodyItalic, fontSize: 11.5, color: colors.accent2Deep, marginBottom: 14, textAlign: 'center' },
  wordmark: { position: 'absolute', bottom: 18, fontFamily: fonts.headingItalic, fontSize: 13, color: colors.textFaint },
  saveButton: { backgroundColor: colors.text, borderRadius: radius.md, paddingVertical: 14, paddingHorizontal: 40, marginBottom: 12 },
  saveLabel: { fontFamily: fonts.heading, fontSize: 13, color: colors.bg },
  done: { fontFamily: fonts.body, fontSize: 13, color: colors.textMuted },
});
