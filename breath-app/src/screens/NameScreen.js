import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, fonts, radius, type } from '../theme/tokens';
import { useBreath } from '../state/BreathContext';
import { MAX_NAME, errorMessage } from '../lib/api';
import { PrimaryButton } from '../components/ui';

export default function NameScreen({ navigation }) {
  const { createProfile } = useBreath();
  const [name, setName] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  async function submit() {
    if (busy || !name.trim()) return;
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
        <Text style={[type.h1, { marginTop: 56, marginBottom: 14 }]}>What should people call you?</Text>
        <Text style={[type.body, { marginBottom: 36 }]}>
          Only the people you connect with will see it. No email, no phone number, no password.
        </Text>

        <Text nativeID="nameLabel" style={styles.label}>
          Your name
        </Text>
        <TextInput
          accessibilityLabelledBy="nameLabel"
          accessibilityLabel="Your name"
          style={styles.input}
          value={name}
          onChangeText={setName}
          placeholder="Maya"
          placeholderTextColor="#9C968F"
          maxLength={MAX_NAME}
          autoFocus
          autoCapitalize="words"
          returnKeyType="done"
          onSubmitEditing={submit}
        />
        {error ? <Text style={styles.error}>{error}</Text> : <Text style={[type.small, { marginTop: 10 }]}>Use the name your people know you by.</Text>}

        <View style={{ flex: 1 }} />
        <PrimaryButton label="Continue" onPress={submit} busy={busy} disabled={!name.trim()} />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.linen },
  content: { flex: 1, paddingHorizontal: 28, paddingBottom: 20 },
  label: { fontFamily: fonts.uiMedium, fontSize: 13, color: colors.stone, marginBottom: 8 },
  input: {
    fontFamily: fonts.display,
    fontSize: 26,
    color: colors.ink,
    backgroundColor: colors.paper,
    borderWidth: 1.5,
    borderColor: colors.ink,
    borderRadius: radius.input,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  error: { fontFamily: fonts.ui, fontSize: 13, color: colors.danger, marginTop: 10 },
});
