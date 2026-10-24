import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, SafeAreaView, TextInput, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import { colors, fonts, radius } from '../theme/tokens';
import { useBreath } from '../state/BreathContext';
import { MAX_NAME, errorMessage } from '../lib/api';

export default function NameScreen({ navigation }) {
  const { createProfile } = useBreath();
  const [name, setName] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  async function submit() {
    if (busy) return;
    setBusy(true);
    setError(null);
    try {
      await createProfile(name);
      navigation.replace('Home');
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setBusy(false);
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView style={styles.content} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <Text style={styles.wordmark}>Breath</Text>
        <Text style={styles.title}>What should people call you?</Text>
        <Text style={styles.body}>
          This is the name the people you gift will see. No email, no password — just a name.
        </Text>
        <TextInput
          style={styles.input}
          value={name}
          onChangeText={setName}
          placeholder="Your name"
          placeholderTextColor={colors.textFaint}
          maxLength={MAX_NAME}
          autoFocus
          returnKeyType="done"
          onSubmitEditing={submit}
        />
        {error ? <Text style={styles.error}>{error}</Text> : null}
        <View style={{ flex: 1 }} />
        <Pressable style={[styles.button, (!name.trim() || busy) && { opacity: 0.5 }]} onPress={submit} disabled={!name.trim() || busy}>
          {busy ? <ActivityIndicator color={colors.bg} /> : <Text style={styles.buttonLabel}>Continue</Text>}
        </Pressable>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  content: { flex: 1, paddingTop: 52, paddingHorizontal: 30, paddingBottom: 32 },
  wordmark: { fontFamily: fonts.headingItalic, fontSize: 30, color: colors.text, marginBottom: 40 },
  title: { fontFamily: fonts.heading, fontSize: 22, lineHeight: 29, color: colors.text, marginBottom: 14 },
  body: { fontFamily: fonts.body, fontSize: 15, lineHeight: 24, color: 'rgba(32,30,29,0.75)', marginBottom: 24 },
  input: { fontFamily: fonts.body, fontSize: 18, color: colors.text, borderBottomWidth: 1, borderBottomColor: colors.text, paddingVertical: 10 },
  error: { fontFamily: fonts.body, fontSize: 13, color: colors.accent2Deep, marginTop: 10 },
  button: { backgroundColor: colors.text, borderRadius: radius.md, padding: 15, alignItems: 'center' },
  buttonLabel: { fontFamily: fonts.heading, fontSize: 14, color: colors.bg },
});
