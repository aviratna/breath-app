import React, { useRef, useState } from 'react';
import { View, Text, StyleSheet, Alert, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { captureRef } from 'react-native-view-shot';
import * as Sharing from 'expo-sharing';
import { colors, fonts } from '../theme/tokens';
import { BreathMark, PrimaryButton, ScreenHeader, TextButton } from '../components/ui';
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
        <View style={{ alignSelf: 'stretch' }}>
          <ScreenHeader title="Share this moment" onBack={() => navigation.goBack()} />
        </View>

        <View ref={cardRef} collapsable={false} style={styles.card}>
          <BreathMark size={64} color={colors.moon} dot={colors.tideLight} strokeWidth={1.4} />
          <Text style={styles.line}>
            {isCeleb ? `${name === 'you' ? 'They' : name} gave a fan a breath.` : 'I spent a breath thinking of you.'}
          </Text>
          {lastGift ? (
            <Text style={styles.count}>
              {lastGift.before.toLocaleString()} {'\u2192'} {lastGift.after.toLocaleString()} breaths today
            </Text>
          ) : null}
          {isCeleb ? <Text style={styles.tagline}>One to one, not one to a million.</Text> : null}
          <Text style={styles.wordmark}>Breath</Text>
        </View>

        <View style={{ flex: 1 }} />
        <PrimaryButton
          label={Platform.OS === 'web' ? 'Save image' : 'Share image'}
          icon="share"
          onPress={shareImage}
          busy={busy}
          style={{ alignSelf: 'stretch' }}
        />
        <TextButton label="Done" onPress={() => navigation.navigate('Home')} style={{ alignSelf: 'stretch', marginTop: 6 }} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.linen },
  content: { flex: 1, alignItems: 'center', paddingTop: 4, paddingHorizontal: 20, paddingBottom: 16 },
  card: {
    width: 270,
    aspectRatio: 9 / 16,
    backgroundColor: colors.night,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 28,
    marginTop: 8,
  },
  line: { fontFamily: fonts.display, fontSize: 26, lineHeight: 31, letterSpacing: -0.3, color: colors.moon, textAlign: 'center', marginTop: 30 },
  count: { fontFamily: fonts.ui, fontSize: 12.5, color: colors.moonMuted, marginTop: 16 },
  tagline: { fontFamily: fonts.displayItalic, fontSize: 14, color: colors.tideLight, marginTop: 12, textAlign: 'center' },
  wordmark: { position: 'absolute', bottom: 26, fontFamily: fonts.displayItalic, fontSize: 17, color: colors.moon },
});
