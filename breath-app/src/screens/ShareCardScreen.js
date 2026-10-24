import React, { useRef, useState } from 'react';
import { View, Text, StyleSheet, Pressable, SafeAreaView, Alert, Platform } from 'react-native';
import { captureRef } from 'react-native-view-shot';
import * as Sharing from 'expo-sharing';
import { colors, fonts, radius } from '../theme/tokens';
import { useBreath } from '../state/BreathContext';

export default function ShareCardScreen({ route, navigation }) {
  const { name } = route.params;
  const { lastGift, previewMode } = useBreath();
  const isCeleb = previewMode === 'celebrity';
  const cardRef = useRef(null);
  const [busy, setBusy] = useState(false);

  // Renders the card to a PNG and opens the system share sheet, where it can be saved to
  // Photos/Files or sent to someone. On web the PNG is downloaded instead.
  async function shareImage() {
    if (busy) return;
    setBusy(true);
    try {
      if (Platform.OS === 'web') {
        const uri = await captureRef(cardRef, { format: 'png', result: 'data-uri' });
        const a = document.createElement('a');
        a.href = uri;
        a.download = 'breath.png';
        a.click();
        return;
      }
      const uri = await captureRef(cardRef, { format: 'png', quality: 1, result: 'tmpfile', width: 1080, height: 1920 });
      if (!(await Sharing.isAvailableAsync())) {
        Alert.alert('Sharing unavailable', 'This device has no app to share the image with.');
        return;
      }
      await Sharing.shareAsync(uri, { mimeType: 'image/png', dialogTitle: 'Share this moment' });
    } catch (e) {
      Alert.alert('Couldn\u2019t create the image', 'Please try again.');
    } finally {
      setBusy(false);
    }
  }

  const headline = isCeleb ? `${name.split(' ')[0] === name ? 'A public figure' : name} gave a fan a breath` : 'spent a breath thinking of you';

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View ref={cardRef} collapsable={false} style={styles.card}>
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

        <Pressable style={[styles.saveButton, busy && { opacity: 0.6 }]} onPress={shareImage} disabled={busy}>
          <Text style={styles.saveLabel}>{Platform.OS === 'web' ? 'save image' : 'share image'}</Text>
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
