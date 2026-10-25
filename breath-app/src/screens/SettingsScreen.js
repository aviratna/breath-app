import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, Switch, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, fonts, type } from '../theme/tokens';
import { useBreath } from '../state/BreathContext';
import { errorMessage, SITE_URL } from '../lib/api';
import { Avatar, Card, Icon, ScreenHeader } from '../components/ui';

const PRIVACY_URL = 'https://github.com/aviratna/breath-app/blob/main/PRIVACY.md';

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
        <ScreenHeader title="Settings" onBack={() => navigation.goBack()} />

        {me ? (
          <Card style={styles.profile}>
            <Avatar name={me.name} size={52} tone="tide" />
            <View style={{ flex: 1 }}>
              <Text style={styles.profileName}>{me.name}</Text>
              <Text style={type.small}>Invite code {me.code}</Text>
            </View>
            <Pressable accessibilityRole="button" onPress={() => navigation.navigate('Connect')} style={styles.smallBtn}>
              <Text style={styles.smallBtnLabel}>Invite</Text>
            </Pressable>
          </Card>
        ) : null}

        <Text style={[type.label, styles.sectionLabel]}>Your people</Text>
        <Card style={{ overflow: 'hidden' }}>
          {connections.map((c, i) => (
            <View key={c.id} style={[styles.row, i < connections.length - 1 && styles.rowDivider]}>
              <Text style={[styles.rowLabel, c.blocked && { color: colors.stone }]}>{c.name}</Text>
              <Pressable accessibilityRole="button" accessibilityLabel={`${c.blocked ? 'Unblock' : 'Block'} ${c.name}`} onPress={() => onBlock(c.id)} style={styles.rowAction}>
                <Text style={styles.rowActionLabel}>{c.blocked ? 'Unblock' : 'Block'}</Text>
              </Pressable>
            </View>
          ))}
          {connections.length === 0 ? (
            <View style={styles.row}>
              <Text style={type.small}>No one yet.</Text>
            </View>
          ) : null}
        </Card>
        <Text style={[type.small, styles.note]}>Blocked people can{'’'}t give you breaths. They aren{'’'}t told.</Text>

        <Card style={{ overflow: 'hidden', marginTop: 18 }}>
          <View style={[styles.row, styles.rowDivider]}>
            <Text style={styles.rowLabel}>Public figure mode</Text>
            <Switch
              accessibilityLabel="Public figure mode"
              value={previewMode === 'celebrity'}
              onValueChange={(v) => setPreviewMode(v ? 'celebrity' : 'personal')}
              trackColor={{ true: colors.tide, false: colors.mist }}
              thumbColor={colors.paper}
            />
          </View>
          <Pressable style={[styles.row, styles.rowDivider]} onPress={() => navigation.replace('Onboarding')}>
            <Text style={styles.rowLabel}>Replay the introduction</Text>
            <Icon name="chevron" size={16} color={colors.stone} />
          </Pressable>
          <Pressable style={[styles.row, styles.rowDivider]} onPress={() => Linking.openURL(SITE_URL)}>
            <Text style={styles.rowLabel}>About Breath</Text>
            <Icon name="external" size={16} color={colors.stone} />
          </Pressable>
          <Pressable style={styles.row} onPress={() => Linking.openURL(PRIVACY_URL)}>
            <Text style={styles.rowLabel}>Privacy policy</Text>
            <Icon name="external" size={16} color={colors.stone} />
          </Pressable>
        </Card>

        {error ? <Text style={styles.error}>{error}</Text> : null}

        {me ? (
          <View style={{ marginTop: 34, alignItems: 'center' }}>
            <Pressable accessibilityRole="button" onPress={onDelete} disabled={busy} style={{ padding: 12 }}>
              <Text style={styles.danger}>{busy ? 'Deleting…' : confirmDelete ? 'Tap again to delete everything' : 'Delete my account'}</Text>
            </Pressable>
            <Text style={[type.small, { textAlign: 'center', paddingHorizontal: 12 }]}>
              Removes your name, code, connections and received breaths from Breath{'’'}s servers. This can{'’'}t be undone.
            </Text>
          </View>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.linen },
  content: { paddingTop: 4, paddingHorizontal: 20, paddingBottom: 32 },
  profile: { flexDirection: 'row', alignItems: 'center', gap: 14, padding: 16, marginBottom: 22 },
  profileName: { fontFamily: fonts.display, fontSize: 21, color: colors.ink },
  smallBtn: { paddingVertical: 10, paddingHorizontal: 14, borderRadius: 999, borderWidth: 1, borderColor: colors.border },
  smallBtnLabel: { fontFamily: fonts.uiMedium, fontSize: 14, color: colors.ink },
  sectionLabel: { marginHorizontal: 4, marginBottom: 8 },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', minHeight: 54, paddingLeft: 16, paddingRight: 8 },
  rowDivider: { borderBottomWidth: 1, borderBottomColor: colors.hairline },
  rowLabel: { fontFamily: fonts.ui, fontSize: 15, color: colors.ink, flex: 1 },
  rowAction: { paddingVertical: 12, paddingHorizontal: 10 },
  rowActionLabel: { fontFamily: fonts.ui, fontSize: 14, color: colors.stone },
  note: { marginHorizontal: 4, marginTop: 8 },
  error: { fontFamily: fonts.ui, fontSize: 13, color: colors.danger, marginTop: 14 },
  danger: { fontFamily: fonts.uiMedium, fontSize: 15, color: colors.danger },
});
