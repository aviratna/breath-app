import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Pressable, SafeAreaView, TextInput, ScrollView, Share, ActivityIndicator } from 'react-native';
import { colors, fonts, radius } from '../theme/tokens';
import { useBreath } from '../state/BreathContext';
import { CODE_LENGTH, errorMessage, inviteLink, normalizeCode } from '../lib/api';

export default function ConnectScreen({ route, navigation }) {
  const { me, connect } = useBreath();
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState(null); // { ok, text }

  async function invite() {
    try {
      await Share.share({
        message: `Gift me a breath on Breath: ${inviteLink(me.code)}\n\n(or add me with the code ${me.code})`,
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
        <View style={styles.header}>
          <Pressable onPress={() => navigation.goBack()} hitSlop={12}>
            <Text style={styles.back}>‹</Text>
          </Pressable>
          <Text style={styles.title}>Add someone</Text>
        </View>

        <Text style={styles.sectionTitle}>Your code</Text>
        <Text style={styles.code} selectable>
          {me ? me.code : ''}
        </Text>
        <Text style={styles.body}>
          Send this to someone you&apos;d like to gift breaths to. When they enter it, you&apos;re connected — both ways.
        </Text>
        <Pressable style={styles.primary} onPress={invite}>
          <Text style={styles.primaryLabel}>send an invite</Text>
        </Pressable>

        <View style={styles.divider} />

        <Text style={styles.sectionTitle}>Have someone&apos;s code?</Text>
        <TextInput
          style={styles.input}
          value={code}
          onChangeText={(t) => setCode(normalizeCode(t).slice(0, CODE_LENGTH))}
          placeholder="ABC234"
          placeholderTextColor={colors.textFaint}
          autoCapitalize="characters"
          autoCorrect={false}
          returnKeyType="done"
          onSubmitEditing={() => add()}
        />
        {result ? <Text style={[styles.result, !result.ok && { color: colors.accent2Deep }]}>{result.text}</Text> : null}
        <Pressable style={[styles.secondary, (!ready || busy) && { opacity: 0.5 }]} onPress={() => add()} disabled={!ready || busy}>
          {busy ? <ActivityIndicator color={colors.text} /> : <Text style={styles.secondaryLabel}>connect</Text>}
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  content: { paddingTop: 52, paddingHorizontal: 24, paddingBottom: 32 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 30 },
  back: { fontSize: 24, color: colors.text },
  title: { fontFamily: fonts.heading, fontSize: 18, color: colors.text },
  sectionTitle: { fontFamily: fonts.heading, fontSize: 13, color: colors.textMuted, marginBottom: 10, textTransform: 'uppercase', letterSpacing: 0.5 },
  code: { fontFamily: fonts.body, fontSize: 40, letterSpacing: 6, color: colors.accentDeep, marginBottom: 10 },
  body: { fontFamily: fonts.body, fontSize: 14, lineHeight: 21, color: colors.textMuted, marginBottom: 18 },
  primary: { backgroundColor: colors.text, borderRadius: radius.md, padding: 15, alignItems: 'center' },
  primaryLabel: { fontFamily: fonts.heading, fontSize: 14, color: colors.bg },
  divider: { height: 0.5, backgroundColor: colors.divider, marginVertical: 30 },
  input: { fontFamily: fonts.body, fontSize: 24, letterSpacing: 4, color: colors.text, borderBottomWidth: 1, borderBottomColor: colors.text, paddingVertical: 8, marginBottom: 12 },
  result: { fontFamily: fonts.body, fontSize: 13, color: colors.accentDeep, marginBottom: 12 },
  secondary: { borderWidth: 1, borderColor: colors.divider, borderRadius: radius.md, padding: 14, alignItems: 'center', marginTop: 6 },
  secondaryLabel: { fontFamily: fonts.heading, fontSize: 13, color: colors.text },
});
