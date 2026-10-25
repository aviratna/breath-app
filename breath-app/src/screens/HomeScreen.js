import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, fonts, radius, type } from '../theme/tokens';
import { useLiveBreaths } from '../lib/breathClock';
import { useBreath } from '../state/BreathContext';
import { relativeTime } from '../lib/api';
import { Avatar, BreathMark, Icon, IconButton, ProgressRing, SecondaryButton } from '../components/ui';
import { PersonRow, useHoldToGive } from '../components/HoldToGive';

export default function HomeScreen({ navigation }) {
  const { dayProgress, contacts, previewMode, sendGift, unseenGifts, now, toggleFavourite, givenToday } = useBreath();
  const dailyBreathsRemaining = useLiveBreaths(givenToday);
  const [sendError, setSendError] = useState(null);
  const [query, setQuery] = useState('');
  const isPublic = previewMode === 'celebrity';

  async function give(contact) {
    setSendError(null);
    try {
      await sendGift(contact);
      navigation.navigate('Sent', { name: contact.name });
    } catch (e) {
      setSendError(`Couldn’t reach ${contact.name}. Check your connection and try again.`);
    }
  }
  const hold = useHoldToGive({ onComplete: give, breathsLeft: dailyBreathsRemaining });

  // A quiet line under each name: the most recent breath either way.
  function metaFor(c) {
    if (!c.lastActivity) return null;
    const when = relativeTime(c.lastActivity, now);
    return c.lastActivity === c.lastGiven ? `You gave a breath ${when}` : `Gave you a breath ${when}`;
  }

  // Sections: pinned people, the five most recent, then everyone else by name.
  // A search box appears once the list is long enough to need one.
  const byName = (a, b) => a.name.localeCompare(b.name);
  const showSearch = contacts.length > 8;
  const q = query.trim().toLowerCase();
  let sections;
  if (q) {
    sections = [{ title: null, people: contacts.filter((c) => c.name.toLowerCase().includes(q)).sort(byName) }];
  } else if (contacts.length <= 6) {
    const rank = (c) => (c.favourite ? 2 : 0) + (c.lastActivity ? 1 : 0);
    sections = [
      {
        title: null,
        people: [...contacts].sort((a, b) => rank(b) - rank(a) || (b.lastActivity || 0) - (a.lastActivity || 0) || byName(a, b)),
      },
    ];
  } else {
    const pinned = contacts.filter((c) => c.favourite).sort(byName);
    const recent = contacts
      .filter((c) => !c.favourite && c.lastActivity)
      .sort((a, b) => b.lastActivity - a.lastActivity)
      .slice(0, 5);
    const shown = new Set([...pinned, ...recent].map((c) => c.id));
    sections = [
      { title: 'Pinned', people: pinned },
      { title: 'Recent', people: recent },
      { title: pinned.length || recent.length ? 'Everyone' : null, people: contacts.filter((c) => !shown.has(c.id)).sort(byName) },
    ].filter((sec) => sec.people.length);
  }

  const latest = unseenGifts[0];

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <View style={styles.brand}>
            <BreathMark size={24} />
            <Text style={styles.wordmark}>Breath</Text>
          </View>
          <IconButton name="settings" label="Settings" onPress={() => navigation.navigate('Settings')} />
        </View>
        {isPublic ? <Text style={styles.publicTag}>One to one, not one to a million</Text> : null}

        <View style={styles.ringWrap}>
          <ProgressRing size={232} progress={dayProgress}>
            <Text style={styles.count} accessibilityLabel={`${dailyBreathsRemaining} breaths left today`}>
              {dailyBreathsRemaining.toLocaleString()}
            </Text>
            <Text style={styles.countLabel}>breaths left today</Text>
          </ProgressRing>
          <Text style={styles.estimate}>A contemplative estimate, not a prediction</Text>
        </View>

        {latest ? (
          <Pressable style={styles.gift} accessibilityRole="button" onPress={() => navigation.navigate('Receiving', { giftId: latest.id })}>
            <Avatar name={latest.name} size={40} tone="tide" />
            <View style={{ flex: 1, minWidth: 0 }}>
              <Text style={styles.giftTitle} numberOfLines={1}>
                {latest.name} spent a breath on you
              </Text>
              <Text style={styles.giftMeta}>
                {relativeTime(latest.createdAt, now)}
                {unseenGifts.length > 1 ? ` · ${unseenGifts.length - 1} more` : ''}
              </Text>
            </View>
            <Icon name="chevron" size={18} />
          </Pressable>
        ) : null}

        <View style={styles.sectionHead}>
          <Text style={styles.sectionTitle}>Give a breath</Text>
          {contacts.length ? <Text style={type.small}>{isPublic ? 'Hold a name · once each' : 'Tap to open · hold to give'}</Text> : null}
        </View>

        {showSearch ? (
          <View style={styles.search}>
            <Icon name="search" size={18} color={colors.stone} />
            <TextInput
              accessibilityLabel="Search your people"
              value={query}
              onChangeText={setQuery}
              placeholder={`Search ${contacts.length} people`}
              placeholderTextColor="#8E887F"
              style={styles.searchInput}
              autoCorrect={false}
              returnKeyType="search"
            />
            {query ? (
              <Pressable accessibilityRole="button" accessibilityLabel="Clear search" onPress={() => setQuery('')} hitSlop={8} style={{ padding: 6 }}>
                <Icon name="close" size={16} color={colors.stone} />
              </Pressable>
            ) : null}
          </View>
        ) : null}

        {sections.map((sec, si) => (
          <View key={si} style={{ marginBottom: 6 }}>
            {sec.title ? <Text style={[type.label, styles.groupLabel]}>{sec.title}</Text> : null}
            <View style={{ gap: 8 }}>
              {sec.people.map((c) => (
                <PersonRow
                  key={c.id}
                  name={c.name}
                  meta={metaFor(c)}
                  favourite={c.favourite}
                  onToggleFavourite={() => toggleFavourite(c.id)}
                  onPressIn={() => hold.start(c)}
                  onPressOut={hold.cancel}
                  onGiveNow={() => give(c)}
                  onOpen={() => navigation.navigate('Person', { id: c.id, name: c.name })}
                />
              ))}
            </View>
          </View>
        ))}
        {q && sections[0].people.length === 0 ? <Text style={[type.small, { paddingHorizontal: 4 }]}>No one called {'\u201c'}{query.trim()}{'\u201d'}.</Text> : null}
        {contacts.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyTitle}>No one here yet</Text>
            <Text style={[type.small, { textAlign: 'center' }]}>
              Invite someone you love. When they open your link, their name appears here.
            </Text>
          </View>
        ) : null}
        {sendError ? <Text style={styles.error}>{sendError}</Text> : null}

        <SecondaryButton label="Invite someone" icon="plus" height={50} onPress={() => navigation.navigate('Connect')} style={{ marginTop: 18 }} />
        <View style={styles.links}>
          <Pressable onPress={() => navigation.navigate('Philosophy')} style={{ paddingVertical: 12 }}>
            <Text style={styles.link}>Why breaths?</Text>
          </Pressable>
          <Text style={styles.dot}>·</Text>
          <Pressable onPress={() => navigation.navigate('LockScreen')} style={{ paddingVertical: 12 }}>
            <Text style={styles.link}>Lock screen widget</Text>
          </Pressable>
        </View>
      </ScrollView>
      {hold.overlay}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.linen },
  content: { paddingTop: 8, paddingHorizontal: 20, paddingBottom: 24 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginRight: -8 },
  brand: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingLeft: 4 },
  wordmark: { fontFamily: fonts.displayItalic, fontSize: 24, color: colors.ink },
  publicTag: { fontFamily: fonts.displayItalic, fontSize: 15, color: colors.tide, paddingLeft: 4, marginTop: 2 },
  ringWrap: { alignItems: 'center', marginTop: 18, marginBottom: 22 },
  count: { fontFamily: fonts.displayLight, fontSize: 58, lineHeight: 64, letterSpacing: -1.5, color: colors.ink },
  countLabel: { fontFamily: fonts.ui, fontSize: 13, color: colors.stone, marginTop: 4 },
  estimate: { fontFamily: fonts.ui, fontSize: 12.5, color: colors.stone, marginTop: 12 },
  gift: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 12, paddingHorizontal: 14, borderRadius: radius.row, backgroundColor: colors.tideMist, marginBottom: 22 },
  giftTitle: { fontFamily: fonts.uiMedium, fontSize: 15, color: colors.ink },
  giftMeta: { fontFamily: fonts.ui, fontSize: 13, color: colors.tideInk, marginTop: 1 },
  sectionHead: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between', paddingHorizontal: 4, marginBottom: 10 },
  sectionTitle: { fontFamily: fonts.uiSemi, fontSize: 15, color: colors.ink },
  search: { flexDirection: 'row', alignItems: 'center', gap: 8, minHeight: 46, paddingLeft: 14, paddingRight: 8, borderRadius: radius.row, backgroundColor: colors.paper, borderWidth: 1, borderColor: colors.mist, marginBottom: 14 },
  searchInput: { flex: 1, fontFamily: fonts.ui, fontSize: 15, color: colors.ink, paddingVertical: 10, outlineStyle: 'none' },
  groupLabel: { marginHorizontal: 4, marginTop: 6, marginBottom: 8 },
  empty: { alignItems: 'center', gap: 6, paddingVertical: 26, paddingHorizontal: 24, borderRadius: radius.row, borderWidth: 1, borderStyle: 'dashed', borderColor: colors.border },
  emptyTitle: { fontFamily: fonts.display, fontSize: 21, color: colors.ink },
  error: { fontFamily: fonts.ui, fontSize: 13, color: colors.danger, marginTop: 12 },
  links: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 10, marginTop: 6 },
  dot: { color: colors.stone },
  link: { fontFamily: fonts.ui, fontSize: 13.5, color: colors.tide },
});
