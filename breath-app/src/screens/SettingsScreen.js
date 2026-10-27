import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, Switch, Linking, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, fonts, type } from '../theme/tokens';
import { useBreath } from '../state/BreathContext';
import { errorMessage, MAX_NAME, SITE_URL } from '../lib/api';
import { Avatar, Card, Icon, ScreenHeader } from '../components/ui';
import { radius } from '../theme/tokens';
import { formatTime, loadMorning, MORNING_DEFAULT, morningSupported, saveMorning } from '../lib/morning';

const PRIVACY_URL = `${SITE_URL}/privacy/`;
const CONTACT_EMAIL = 'ikistudio.app@gmail.com';

export default function SettingsScreen({ navigation }) {
  const { me, connections, toggleBlock, previewMode, setPreviewMode, deleteAccount, rename } = useBreath();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState('');
  const [saving, setSaving] = useState(false);
  const [query, setQuery] = useState('');
  const [morning, setMorning] = useState(MORNING_DEFAULT);
  const [morningNote, setMorningNote] = useState(null);

  useEffect(() => {
    if (morningSupported) loadMorning().then(setMorning);
  }, []);

  // Applies a change to the morning reminder; the time moves in quarter hours.
  async function updateMorning(change) {
    const next = { ...morning, ...change };
    setMorning(next);
    setMorningNote(null);
    try {
      const saved = await saveMorning(next);
      setMorning(saved);
      if (next.on && !saved.on) setMorningNote('Allow notifications for Breath in your phone’s settings to use this.');
    } catch (e) {
      setMorningNote('Couldn’t set the reminder on this phone.');
    }
  }
  function shiftMorning(minutes) {
    const total = (morning.hour * 60 + morning.minute + minutes + 1440) % 1440;
    updateMorning({ hour: Math.floor(total / 60), minute: total % 60 });
  }

  async function saveName() {
    setSaving(true);
    setError(null);
    try {
      await rename(draft);
      setEditing(false);
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setSaving(false);
    }
  }

  const q = query.trim().toLowerCase();
  const people = q ? connections.filter((c) => c.name.toLowerCase().includes(q)) : connections;
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
            <Avatar name={editing ? draft || me.name : me.name} size={52} tone="tide" />
            {editing ? (
              <View style={{ flex: 1, gap: 10 }}>
                <TextInput
                  accessibilityLabel="Your name"
                  value={draft}
                  onChangeText={setDraft}
                  maxLength={MAX_NAME}
                  autoFocus
                  autoCapitalize="words"
                  returnKeyType="done"
                  onSubmitEditing={saveName}
                  style={styles.nameInput}
                />
                <View style={{ flexDirection: 'row', gap: 8 }}>
                  <Pressable accessibilityRole="button" onPress={saveName} disabled={saving || !draft.trim()} style={[styles.smallBtn, styles.smallBtnDark, (saving || !draft.trim()) && { opacity: 0.5 }]}>
                    <Text style={[styles.smallBtnLabel, { color: colors.linen }]}>{saving ? 'Saving\u2026' : 'Save'}</Text>
                  </Pressable>
                  <Pressable accessibilityRole="button" onPress={() => setEditing(false)} style={styles.smallBtn}>
                    <Text style={styles.smallBtnLabel}>Cancel</Text>
                  </Pressable>
                </View>
              </View>
            ) : (
              <>
                <View style={{ flex: 1 }}>
                  <Text style={styles.profileName}>{me.name}</Text>
                  <Pressable onPress={() => navigation.navigate('Connect')} hitSlop={6}>
                    <Text style={type.small}>Invite code {me.code}</Text>
                  </Pressable>
                </View>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Edit your name"
                  onPress={() => {
                    setDraft(me.name);
                    setEditing(true);
                  }}
                  style={[styles.smallBtn, { flexDirection: 'row', alignItems: 'center', gap: 6 }]}
                >
                  <Icon name="edit" size={15} />
                  <Text style={styles.smallBtnLabel}>Edit</Text>
                </Pressable>
              </>
            )}
          </Card>
        ) : null}

        <Text style={[type.label, styles.sectionLabel]}>Your people</Text>
        {connections.length > 8 ? (
          <View style={styles.search}>
            <Icon name="search" size={18} color={colors.stone} />
            <TextInput accessibilityLabel="Search your people" value={query} onChangeText={setQuery} placeholder="Search" placeholderTextColor="#8E887F" style={styles.searchInput} autoCorrect={false} />
          </View>
        ) : null}
        <Card style={{ overflow: 'hidden' }}>
          {people.map((c, i) => (
            <View key={c.id} style={[styles.row, i < people.length - 1 && styles.rowDivider]}>
              <Pressable
                accessibilityRole="button"
                disabled={c.blocked}
                onPress={() => navigation.navigate('Person', { id: c.id, name: c.name })}
                style={{ flex: 1, paddingVertical: 14 }}
              >
                <Text style={[styles.rowLabel, c.blocked && { color: colors.stone }]}>{c.name}</Text>
              </Pressable>
              <Pressable accessibilityRole="button" accessibilityLabel={`${c.blocked ? 'Unblock' : 'Block'} ${c.name}`} onPress={() => onBlock(c.id)} style={styles.rowAction}>
                <Text style={styles.rowActionLabel}>{c.blocked ? 'Unblock' : 'Block'}</Text>
              </Pressable>
            </View>
          ))}
          {people.length === 0 ? (
            <View style={styles.row}>
              <Text style={type.small}>{q ? 'No one by that name.' : 'No one yet.'}</Text>
            </View>
          ) : null}
        </Card>
        <Text style={[type.small, styles.note]}>Blocked people can{'’'}t give you breaths. They aren{'’'}t told.</Text>

        {morningSupported ? (
          <>
            <Text style={[type.label, styles.sectionLabel, { marginTop: 22 }]}>Morning breath</Text>
            <Card style={{ overflow: 'hidden' }}>
              <View style={[styles.row, morning.on && styles.rowDivider]}>
                <View style={{ flex: 1, paddingVertical: 10 }}>
                  <Text style={styles.rowLabel}>A gentle nudge each morning</Text>
                  <Text style={type.small}>{'“'}Who{'’'}s on your mind today?{'”'} Once a day, never more.</Text>
                </View>
                <Switch
                  accessibilityLabel="Morning breath reminder"
                  value={morning.on}
                  onValueChange={(on) => updateMorning({ on })}
                  trackColor={{ true: colors.tide, false: colors.mist }}
                  thumbColor={colors.paper}
                />
              </View>
              {morning.on ? (
                <View style={styles.row}>
                  <Text style={styles.rowLabel}>Time</Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Pressable accessibilityRole="button" accessibilityLabel="Fifteen minutes earlier" onPress={() => shiftMorning(-15)} style={styles.stepBtn}>
                      <Text style={styles.stepLabel}>−</Text>
                    </Pressable>
                    <Text style={styles.time} accessibilityLiveRegion="polite">{formatTime(morning.hour, morning.minute)}</Text>
                    <Pressable accessibilityRole="button" accessibilityLabel="Fifteen minutes later" onPress={() => shiftMorning(15)} style={styles.stepBtn}>
                      <Text style={styles.stepLabel}>+</Text>
                    </Pressable>
                  </View>
                </View>
              ) : null}
            </Card>
            {morningNote ? <Text style={[type.small, styles.note]}>{morningNote}</Text> : null}
          </>
        ) : null}

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
          <Pressable style={[styles.row, styles.rowDivider]} onPress={() => navigation.navigate('Philosophy')}>
            <Text style={styles.rowLabel}>The idea behind Breath</Text>
            <Icon name="chevron" size={16} color={colors.stone} />
          </Pressable>
          <Pressable style={[styles.row, styles.rowDivider]} onPress={() => navigation.replace('Onboarding')}>
            <Text style={styles.rowLabel}>Replay the introduction</Text>
            <Icon name="chevron" size={16} color={colors.stone} />
          </Pressable>
          <Pressable style={[styles.row, styles.rowDivider]} onPress={() => Linking.openURL(SITE_URL)}>
            <Text style={styles.rowLabel}>Breath website</Text>
            <Icon name="external" size={16} color={colors.stone} />
          </Pressable>
          <Pressable style={[styles.row, styles.rowDivider]} onPress={() => Linking.openURL(PRIVACY_URL)}>
            <Text style={styles.rowLabel}>Privacy policy</Text>
            <Icon name="external" size={16} color={colors.stone} />
          </Pressable>
          <Pressable style={styles.row} onPress={() => Linking.openURL(`mailto:${CONTACT_EMAIL}?subject=Breath`)}>
            <Text style={styles.rowLabel}>Write to us</Text>
            <Text style={styles.rowActionLabel}>{CONTACT_EMAIL}</Text>
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
  smallBtnDark: { backgroundColor: colors.ink, borderColor: colors.ink },
  nameInput: { fontFamily: fonts.display, fontSize: 21, color: colors.ink, borderWidth: 1.5, borderColor: colors.ink, borderRadius: radius.input, paddingHorizontal: 12, paddingVertical: 8, backgroundColor: colors.linen },
  search: { flexDirection: 'row', alignItems: 'center', gap: 8, minHeight: 44, paddingHorizontal: 14, borderRadius: radius.row, backgroundColor: colors.paper, borderWidth: 1, borderColor: colors.mist, marginBottom: 10 },
  searchInput: { flex: 1, fontFamily: fonts.ui, fontSize: 15, color: colors.ink, paddingVertical: 8 },
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
  stepBtn: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  stepLabel: { fontFamily: fonts.uiMedium, fontSize: 22, color: colors.ink },
  time: { fontFamily: fonts.uiMedium, fontSize: 15, color: colors.tide, minWidth: 74, textAlign: 'center' },
});
