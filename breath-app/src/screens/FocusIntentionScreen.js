import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, TextInput, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, fonts, radius, type } from '../theme/tokens';
import { PRICES, useFocus } from '../state/FocusContext';
import { breathsUntilMidnight } from '../lib/breathClock';
import { PHILOSOPHY } from '../content/philosophy';
import { BreathMark, PrimaryButton, TextButton } from '../components/ui';

// One quote a day, the same one all day.
function quoteOfTheDay() {
  const quotes = PHILOSOPHY.sections.flatMap((s) => s.quotes || []);
  const d = new Date();
  const day = Math.floor((d - new Date(d.getFullYear(), 0, 0)) / 864e5);
  return quotes[day % quotes.length];
}

// Morning: "About N breaths before tonight. What are they for?" Up to three things.
export default function FocusIntentionScreen({ navigation }) {
  const focus = useFocus();
  const [items, setItems] = useState(() => {
    const saved = focus.intentions.map((i) => ({ ...i }));
    while (saved.length < 3) saved.push({ title: '', price: 450 });
    return saved;
  });
  const q = quoteOfTheDay();
  // Breaths before about 10 pm, rounded: a gentle figure, not a precise one.
  const tonight = Math.max(0, breathsUntilMidnight() - 2 * 60 * 15);
  const rounded = Math.round(tonight / 100) * 100;
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  const set = (i, change) => setItems((list) => list.map((x, j) => (j === i ? { ...x, ...change } : x)));
  const nextPrice = (p) => PRICES[(PRICES.indexOf(p) + 1) % PRICES.length];
  const any = items.some((i) => i.title.trim());

  function save() {
    focus.setIntentions(items);
    navigation.replace('FocusToday');
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, height: 44 }}>
            <BreathMark size={24} />
            <Text style={styles.wordmark}>Breath</Text>
          </View>
          <Text style={[type.label, { color: colors.tide, marginTop: 24 }]}>{greeting}</Text>
          <Text accessibilityRole="header" style={styles.h1}>
            {rounded > 0 ? `About ${rounded.toLocaleString()} breaths before tonight. What are they for?` : 'What are today’s breaths for?'}
          </Text>

          <View style={{ gap: 10, marginTop: 24 }}>
            {items.map((it, i) => (
              <View key={i} style={styles.item}>
                <Text style={styles.n}>{i + 1}</Text>
                <TextInput
                  accessibilityLabel={`Intention ${i + 1}`}
                  value={it.title}
                  onChangeText={(t) => set(i, { title: t })}
                  placeholder={['Write the launch email', 'A walk without my phone', 'Call Grandma'][i]}
                  placeholderTextColor="#8E887F"
                  maxLength={60}
                  style={styles.itemInput}
                />
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={`${it.price} breaths. Change`}
                  onPress={() => set(i, { price: nextPrice(it.price) })}
                  hitSlop={6}
                  style={styles.pricePill}
                >
                  <Text style={styles.priceText}>{it.price}</Text>
                </Pressable>
              </View>
            ))}
          </View>
          <Text style={[type.small, { marginTop: 8, marginHorizontal: 4 }]}>Tap a number to change what it’s worth.</Text>

          {q ? (
            <View style={styles.quote}>
              <Text style={styles.quoteText}>{'“'}{q.translation}{'”'}</Text>
              <Text style={[type.small, { marginTop: 6 }]}>{q.source}</Text>
            </View>
          ) : null}
        </ScrollView>
        <View style={styles.footer}>
          <PrimaryButton label="Set today’s intention" disabled={!any} onPress={save} />
          <TextButton label="Not today" color={colors.stone} onPress={() => navigation.goBack()} />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.linen },
  content: { paddingTop: 8, paddingHorizontal: 22, paddingBottom: 24 },
  wordmark: { fontFamily: fonts.displayItalic, fontSize: 24, color: colors.ink },
  h1: { ...type.h1, marginTop: 10 },
  item: { flexDirection: 'row', alignItems: 'center', gap: 12, minHeight: 58, paddingLeft: 16, paddingRight: 8, borderRadius: radius.row, backgroundColor: colors.paper, borderWidth: 1, borderColor: colors.mist },
  n: { fontFamily: fonts.display, fontSize: 18, color: colors.tide, width: 14 },
  itemInput: { flex: 1, fontFamily: fonts.uiMedium, fontSize: 15, color: colors.ink, paddingVertical: 12, outlineStyle: 'none' },
  pricePill: { minWidth: 52, height: 34, borderRadius: 17, paddingHorizontal: 10, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.tideMist },
  priceText: { fontFamily: fonts.uiMedium, fontSize: 13, color: colors.tideInk },
  quote: { marginTop: 26, paddingLeft: 16, borderLeftWidth: 2, borderLeftColor: colors.tide },
  quoteText: { fontFamily: fonts.displayItalic, fontSize: 19, lineHeight: 26, color: colors.ink },
  footer: { paddingHorizontal: 22, paddingBottom: 8, paddingTop: 8 },
});
