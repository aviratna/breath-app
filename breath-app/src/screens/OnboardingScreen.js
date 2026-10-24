import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, SafeAreaView } from 'react-native';
import { colors, fonts, spacing, radius } from '../theme/tokens';
import { useBreath } from '../state/BreathContext';

const STEPS = [
  {
    title: 'Every being is born with a fixed number of breaths.',
    body: [
      'The Vedic and Tibetan Buddhist traditions have long held this: not years, breaths. To notice one passing is to notice a little of a life passing with it.',
      'Breath borrows that practice. It keeps a quiet, contemplative count — and lets you spend one of your own to reach someone you love.',
    ],
  },
  {
    title: 'the problem is we think we have time.',
    attribution: '— often attributed to the Buddha',
    callout:
      'Your count is a contemplative estimate, not a medical or actuarial prediction. It is a device for attention, not a diagnosis.',
  },
  {
    title: 'Say it without saying anything.',
    body: [
      "When you think of someone but don't have a conversation in you, gift them a breath. It costs you one of your own — that's what makes it sincere.",
      'No thread. No reply expected. Just a quiet moment where someone was thought of.',
    ],
  },
];

export default function OnboardingScreen({ navigation }) {
  const { completeOnboarding } = useBreath();
  const [step, setStep] = useState(0);
  const s = STEPS[step];
  const isLast = step === STEPS.length - 1;

  function next() {
    if (isLast) {
      completeOnboarding();
      navigation.replace('Home');
    } else {
      setStep(step + 1);
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.wordmark}>Breath</Text>

        <Text style={styles.title}>{s.title}</Text>
        {s.attribution ? <Text style={styles.attribution}>{s.attribution}</Text> : null}
        {s.callout ? (
          <View style={styles.callout}>
            <Text style={styles.calloutText}>{s.callout}</Text>
          </View>
        ) : null}
        {s.body
          ? s.body.map((p, i) => (
              <Text key={i} style={styles.body}>
                {p}
              </Text>
            ))
          : null}

        <View style={styles.spacer} />

        <View style={styles.dots}>
          {STEPS.map((_, i) => (
            <View
              key={i}
              style={[styles.dot, { backgroundColor: i === step ? colors.text : 'rgba(32,30,29,0.2)' }]}
            />
          ))}
        </View>

        <Pressable style={styles.button} onPress={next}>
          <Text style={styles.buttonLabel}>{isLast ? 'Begin' : 'Continue'}</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f6f3ee' },
  content: { flex: 1, paddingTop: 64, paddingHorizontal: 30, paddingBottom: 32 },
  wordmark: { fontFamily: fonts.headingItalic, fontSize: 34, color: colors.text, marginBottom: 28 },
  title: { fontFamily: fonts.heading, fontSize: 22, lineHeight: 29, color: colors.text, marginBottom: 16 },
  attribution: { fontFamily: fonts.bodyItalic, fontSize: 14, color: colors.accentDeep, marginBottom: 22 },
  callout: { backgroundColor: colors.surface, borderRadius: radius.md, padding: 18 },
  calloutText: { fontFamily: fonts.body, fontSize: 13.5, lineHeight: 21.6, color: 'rgba(32,30,29,0.72)' },
  body: { fontFamily: fonts.body, fontSize: 15, lineHeight: 24.75, color: 'rgba(32,30,29,0.75)', marginBottom: 14 },
  spacer: { flex: 1 },
  dots: { flexDirection: 'row', gap: 6, marginBottom: 26, paddingTop: 26 },
  dot: { width: 18, height: 3, borderRadius: 2 },
  button: { backgroundColor: colors.text, borderRadius: radius.md, padding: 15, alignItems: 'center' },
  buttonLabel: { fontFamily: fonts.heading, fontSize: 14, color: colors.bg },
});
