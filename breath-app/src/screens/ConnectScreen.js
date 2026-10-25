import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TextInput, ScrollView, Share } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, fonts, radius, type } from '../theme/tokens';
import { useBreath } from '../state/BreathContext';
import { CODE_LENGTH, errorMessage, inviteLink, normalizeCode } from '../lib/api';
import { Card, PrimaryButton, ScreenHeader, SecondaryButton } from '../components/ui';

export default function ConnectScreen({ route, navigation }) {
  const { me, connect } = useBreath();
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState(null); // { ok, text }

  async function invite() {
    try {
      await Share.share({
        message: `I'd like to give you a breath on Breath: ${inviteLink(me.code)}\n\n(or add me in the app with the code ${me.code})`,
      });
    } catch (e) {
      // Share sheet dismissed or unavailable — nothing to do.
    }
  }

  // Arrived from an invite link: connect straight away.
  const linkCode = route.params?.code;
  useEffect(() => {
    if (linkCode) {
      setCode(linkCode);
      add(linkCode);
    }
  }, [linkCode]);

  async function add(codeToUse = code) {
    if (busy) return;
    setBusy(true);
    setResult(null);
    try {
      const other = await connect(codeToUse);
      setResult({
        ok: true,
        text: other.already ? `You’re already connected with ${other.name}.` : `You and ${other.name} are connected.`,
      });
      setCode('');
    } catch (e) {
      setResult({ ok: false, text: errorMessage(e) });
    } finally {
      setBusy(false);
    }
  }

  const ready = normalizeCode(code).length === CODE_LENGTH;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <ScreenHeader title="Invite someone" onBack={() => navigation.goBack()} />

        <Text style={[type.h1, { fontSize: 28, lineHeight: 34, marginHorizontal: 4, marginBottom: 10 }]}>Who would you like to breathe for?</Text>
        <Text style={[type.body, { fontSize: 15, marginHorizontal: 4, marginBottom: 22 }]}>
          Send them your link. When they open it, you{'’'}re connected both ways.
        </Text>

        <Card style={{ padding: 20, gap: 16 }}>
          <Text style={type.label}>Your invite code</Text>
          <Text style={styles.code} selectable accessibilityLabel={`Your invite code: ${(me?.code || '').split('').join(' ')}`}>
            {me ? me.code : ''}
          </Text>
          <PrimaryButton label="Share invite link" icon="share" onPress={invite} />
          <Text style={[type.small, { textAlign: 'center' }]}>Opens WhatsApp, Messages or any app you choose</Text>
        </Card>

        <View style={styles.or}>
          <View style={styles.line} />
          <Text style={type.small}>Got someone{'’'}s code?</Text>
          <View style={styles.line} />
        </View>

        <Text nativeID="codeLabel" style={styles.inputLabel}>
          Their code
        </Text>
        <View style={{ flexDirection: 'row', gap: 10 }}>
          <TextInput
            accessibilityLabel="Their code"
            style={styles.input}
            value={code}
            onChangeText={(t) => setCode(normalizeCode(t).slice(0, CODE_LENGTH))}
            placeholder="ABC234"
            placeholderTextColor="#A49E97"
            autoCapitalize="characters"
            autoCorrect={false}
            returnKeyType="done"
            onSubmitEditing={() => ready && add()}
          />
          <SecondaryButton label="Connect" onPress={() => add()} busy={busy} disabled={!ready} height={56} style={{ borderRadius: radius.input }} />
        </View>
        {result ? <Text style={[styles.result, !result.ok && { color: colors.danger }]}>{result.text}</Text> : null}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.linen },
  content: { paddingTop: 4, paddingHorizontal: 20, paddingBottom: 32 },
  code: { fontFamily: fonts.display, fontSize: 44, lineHeight: 50, letterSpacing: 10, color: colors.tide },
  or: { flexDirection: 'row', alignItems: 'center', gap: 12, marginVertical: 26, marginHorizontal: 4 },
  line: { flex: 1, height: 1, backgroundColor: colors.mist },
  inputLabel: { fontFamily: fonts.uiMedium, fontSize: 13, color: colors.stone, marginHorizontal: 4, marginBottom: 8 },
  input: {
    flex: 1,
    minWidth: 0,
    height: 56,
    fontFamily: fonts.display,
    fontSize: 22,
    letterSpacing: 6,
    color: colors.ink,
    backgroundColor: colors.paper,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.input,
    paddingHorizontal: 14,
  },
  result: { fontFamily: fonts.ui, fontSize: 14, color: colors.tide, marginTop: 12, marginHorizontal: 4 },
});
