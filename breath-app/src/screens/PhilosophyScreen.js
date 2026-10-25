import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, fonts, type } from '../theme/tokens';
import { PHILOSOPHY } from '../content/philosophy';
import { BreathMark, ScreenHeader } from '../components/ui';

export default function PhilosophyScreen({ navigation }) {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <ScreenHeader onBack={() => navigation.goBack()} />
        <BreathMark size={44} strokeWidth={1.3} />
        <Text accessibilityRole="header" style={styles.title}>
          {PHILOSOPHY.title}
        </Text>
        <Text style={styles.intro}>{PHILOSOPHY.intro}</Text>

        {PHILOSOPHY.sections.map((s) => (
          <View key={s.heading} style={styles.section}>
            <Text accessibilityRole="header" style={styles.heading}>
              {s.heading}
            </Text>
            {s.body.map((p, i) => (
              <Text key={i} style={styles.p}>
                {p}
              </Text>
            ))}
            {s.quote ? (
              <View style={styles.quote}>
                <Text style={styles.quoteText}>{'“'}{s.quote}{'”'}</Text>
              </View>
            ) : null}
            {(s.after || []).map((p, i) => (
              <Text key={i} style={styles.p}>
                {p}
              </Text>
            ))}
            {s.source ? <Text style={styles.source}>{s.source}</Text> : null}
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.linen },
  content: { paddingTop: 4, paddingHorizontal: 24, paddingBottom: 48 },
  title: { fontFamily: fonts.display, fontSize: 34, lineHeight: 39, letterSpacing: -0.4, color: colors.ink, marginTop: 22 },
  intro: { ...type.body, fontSize: 17, lineHeight: 27, marginTop: 14 },
  section: { marginTop: 34, paddingTop: 26, borderTopWidth: 1, borderTopColor: colors.mist },
  heading: { fontFamily: fonts.display, fontSize: 24, lineHeight: 29, color: colors.ink, marginBottom: 12 },
  p: { ...type.body, color: '#45413C', marginBottom: 12 },
  quote: { borderLeftWidth: 2, borderLeftColor: colors.tide, paddingLeft: 16, marginVertical: 8, marginBottom: 16 },
  quoteText: { fontFamily: fonts.displayItalic, fontSize: 21, lineHeight: 29, color: colors.ink },
  source: { fontFamily: fonts.ui, fontSize: 12.5, letterSpacing: 0.3, color: colors.stone, marginTop: 2 },
});
