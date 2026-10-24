import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, SafeAreaView, ScrollView, Switch } from 'react-native';
import { colors, fonts } from '../theme/tokens';
import { useBreath } from '../state/BreathContext';
import { errorMessage } from '../lib/api';

export default function SettingsScreen({ navigation }) {
  const { me, connections, toggleBlock, previewMode, setPreviewMode, deleteAccount } = useBreath();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  async function onBlock(id) {
    setError(null);
    try {
      await toggleBlock(id);
    } catch (e) {
      setError(errorMessage(e));
    }
  }

  // Two taps (works the same on every platform, unlike a confirm dialog).
  async function onDelete() {
    if (!confirmDelete) {
      setConfirmDelete(true);
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await deleteAccount();
      navigation.reset({ index: 0, routes: [{ name: 'Onboarding' }] });
    } catch (e) {
      setError(errorMessage(e));
      setBusy(false);
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Pressable onPress={() => navigation.goBack()}>
            <Text style={styles.back}>‹</Text>
          </Pressable>
          <Text style={styles.title}>Settings</Text>
        </View>

        {me ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>You</Text>
            <View style={styles.row}>
              <Text style={styles.rowLabel}>{me.name}</Text>
              <Pressable onPress={() => navigation.navigate('Connect')}>
                <Text style={styles.link}>code {me.code}</Text>
              </Pressable>
            </View>
          </View>
        ) : null}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Preview mode</Text>
          <View style={styles.row}>
            <Text style={styles.rowLabel}>Public figure account</Text>
            <Switch
              value={previewMode === 'celebrity'}
              onValueChange={(v) => setPreviewMode(v ? 'celebrity' : 'personal')}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Privacy</Text>
          {connections.map((c) => (
            <View key={c.id} style={styles.row}>
              <Text style={[styles.rowLabel, c.blocked && { color: colors.textFaint }]}>{c.name}</Text>
              <Pressable onPress={() => onBlock(c.id)}>
                <Text style={styles.action}>{c.blocked ? 'Unblock' : 'Block'}</Text>
              </Pressable>
            </View>
          ))}
          {connections.length === 0 ? <Text style={styles.note}>No one yet.</Text> : null}
          <Text style={styles.note}>Blocked people can't send you breaths, and you won't see their earlier ones.</Text>
        </View>
        {error ? <Text style={styles.error}>{error}</Text> : null}

        <Pressable onPress={() => navigation.replace('Onboarding')}>
          <Text style={styles.replay}>replay onboarding</Text>
        </Pressable>

        {me ? (
          <View style={[styles.section, { marginTop: 40 }]}>
            <Text style={styles.sectionTitle}>Account</Text>
            <Pressable onPress={onDelete} disabled={busy}>
              <Text style={styles.danger}>
                {busy ? 'deleting\u2026' : confirmDelete ? 'tap again to delete everything' : 'delete my account'}
              </Text>
            </Pressable>
            <Text style={styles.note}>
              Removes your name, code, connections and received breaths from Breath's servers. This can't be undone.
            </Text>
          </View>
        ) : null}
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
  section: { marginBottom: 30 },
  sectionTitle: { fontFamily: fonts.heading, fontSize: 13, color: colors.textMuted, marginBottom: 10, textTransform: 'uppercase', letterSpacing: 0.5 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 0.5, borderBottomColor: colors.divider },
  rowLabel: { fontFamily: fonts.body, fontSize: 15, color: colors.text },
  action: { fontFamily: fonts.body, fontSize: 14, color: colors.accent2 },
  link: { fontFamily: fonts.body, fontSize: 13, color: colors.accent },
  note: { fontFamily: fonts.body, fontSize: 12.5, lineHeight: 18, color: colors.textFaint, marginTop: 10 },
  error: { fontFamily: fonts.body, fontSize: 13, color: colors.accent2Deep, marginBottom: 20 },
  danger: { fontFamily: fonts.body, fontSize: 14, color: colors.accent2Deep, textDecorationLine: 'underline' },
  replay: { fontFamily: fonts.body, fontSize: 13, color: colors.accent, textDecorationLine: 'underline' },
});
