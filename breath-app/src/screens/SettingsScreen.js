import React from 'react';
import { View, Text, StyleSheet, Pressable, SafeAreaView, ScrollView, Switch } from 'react-native';
import { colors, fonts } from '../theme/tokens';
import { useBreath } from '../state/BreathContext';

export default function SettingsScreen({ navigation }) {
  const { contacts, blockedContacts, toggleBlock, previewMode, setPreviewMode } = useBreath();

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Pressable onPress={() => navigation.goBack()}>
            <Text style={styles.back}>‹</Text>
          </Pressable>
          <Text style={styles.title}>Settings</Text>
        </View>

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
          {contacts.map((c) => (
            <View key={c.id} style={styles.row}>
              <Text style={styles.rowLabel}>{c.name}</Text>
              <Pressable onPress={() => toggleBlock(c.id)}>
                <Text style={styles.action}>{blockedContacts[c.id] ? 'Unblock' : 'Block'}</Text>
              </Pressable>
            </View>
          ))}
        </View>

        <Pressable onPress={() => navigation.replace('Onboarding')}>
          <Text style={styles.replay}>replay onboarding</Text>
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
  section: { marginBottom: 30 },
  sectionTitle: { fontFamily: fonts.heading, fontSize: 13, color: colors.textMuted, marginBottom: 10, textTransform: 'uppercase', letterSpacing: 0.5 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 0.5, borderBottomColor: colors.divider },
  rowLabel: { fontFamily: fonts.body, fontSize: 15, color: colors.text },
  action: { fontFamily: fonts.body, fontSize: 14, color: colors.accent2 },
  replay: { fontFamily: fonts.body, fontSize: 13, color: colors.accent, textDecorationLine: 'underline' },
});
