import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, fonts, type } from '../theme/tokens';
import { PHILOSOPHY } from '../content/philosophy';
import { BreathMark, ScreenHeader } from '../components/ui';

// One quote: the original (Sanskrit, Pāli or Tibetan), its transliteration, our
// translation and the reference. Devanagari and Tibetan use the system fonts, which
// include those scripts; Latin-script Pāli uses the serif italic.
function Quote({ q }) {
  const nonLatin = q.script === 'deva' || q.script === 'tibt';
  return (
    <View style={styles.quote}>
      {q.original ? (
        <Text style={nonLatin ? styles.originalScript : styles.originalLatin} accessibilityLanguage={q.script === 'tibt' ? 'bo' : q.script === 'deva' ? 'sa' : 'pi'}>
          {q.original}
        </Text>
      ) : null}
      {q.translit ? <Text style={styles.translit}>{q.translit}</Text> : null}
      <Text style={styles.translation}>{'“'}{q.translation}{'”'}</Text>
      <Text style={styles.source}>{q.source}</Text>
    </View>
  );
}

export default function PhilosophyScreen({ navigation }) {
  const p = PHILOSOPHY;
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <ScreenHeader onBack={() => navigation.goBack()} />
        <BreathMark size={44} strokeWidth={1.3} />
        <Text style={[type.label, { color: colors.tide, marginTop: 22 }]}>{p.eyebrow}</Text>
        <Text accessibilityRole="header" style={styles.title}>
          {p.title}
        </Text>
        <Text style={styles.intro}>{p.intro}</Text>

        {p.sections.map((s) => (
          <View key={s.heading} style={styles.section}>
            {s.founder ? <Text style={[type.label, { color: colors.tide, marginBottom: 8 }]}>A note from the founder</Text> : null}
            <Text accessibilityRole="header" style={styles.heading}>
              {s.heading}
            </Text>
            {s.body.map((t, i) => (
              <Text key={i} style={styles.p}>
                {t}
              </Text>
            ))}
            {(s.quotes || []).map((q, i) => (
              <Quote key={i} q={q} />
            ))}
            {(s.after || []).map((t, i) => (
              <Text key={i} style={styles.p}>
                {t}
              </Text>
            ))}
            {s.founder ? <Text style={styles.signature}>{'\u2014 '}{s.founder}</Text> : null}
          </View>
        ))}
        <Text style={[type.small, { marginTop: 36 }]}>{p.note}</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.linen },
  content: { paddingTop: 4, paddingHorizontal: 24, paddingBottom: 48 },
  title: { fontFamily: fonts.display, fontSize: 34, lineHeight: 40, letterSpacing: -0.4, color: colors.ink, marginTop: 10 },
  intro: { ...type.body, fontSize: 17, lineHeight: 27, marginTop: 16 },
  section: { marginTop: 34, paddingTop: 26, borderTopWidth: 1, borderTopColor: colors.mist },
  heading: { fontFamily: fonts.display, fontSize: 24, lineHeight: 29, color: colors.ink, marginBottom: 12 },
  p: { ...type.body, color: '#45413C', marginBottom: 12 },
  quote: { borderLeftWidth: 2, borderLeftColor: colors.tide, paddingLeft: 16, marginTop: 6, marginBottom: 18, gap: 6 },
  originalScript: { fontSize: 20, lineHeight: 32, color: colors.ink },
  originalLatin: { fontFamily: fonts.displayItalic, fontSize: 17, lineHeight: 25, color: colors.ink },
  translit: { fontFamily: fonts.ui, fontSize: 13.5, lineHeight: 20, fontStyle: 'italic', color: colors.stone },
  translation: { fontFamily: fonts.displayItalic, fontSize: 20, lineHeight: 28, color: colors.ink, marginTop: 2 },
  signature: { fontFamily: fonts.displayItalic, fontSize: 18, color: colors.ink, marginTop: 4 },
  source: { fontFamily: fonts.ui, fontSize: 12.5, letterSpacing: 0.3, color: colors.stone },
});
