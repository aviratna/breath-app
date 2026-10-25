import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import Svg, { Circle } from 'react-native-svg';
import { colors, fonts } from '../theme/tokens';
import { useBreath } from '../state/BreathContext';
import { PrimaryButton, TextButton } from '../components/ui';

const STEPS = [
  {
    title: 'Every being is born with a fixed number of breaths.',
    body: 'An old yogic teaching counts a life not in years, but in breaths. Breath keeps a quiet count of yours, and lets you spend one on someone you love.',
  },
  {
    title: 'The problem is, we think we have time.',
    attribution: 'Often attributed to the Buddha',
    body: 'Your count is a contemplative estimate, not a medical or actuarial prediction. It is a device for attention, not a diagnosis.',
  },
  {
    title: 'Say it without saying anything.',
    body: 'When you think of someone but don’t have a conversation in you, give them a breath. It costs one of your own, which is what makes it sincere. No thread, no reply expected.',
  },
];

export default function OnboardingScreen({ navigation }) {
  const { completeOnboarding, me } = useBreath();
  const [step, setStep] = useState(0);
  const s = STEPS[step];
  const isLast = step === STEPS.length - 1;

  function next() {
    if (isLast) {
      completeOnboarding();
      navigation.replace(me ? 'Home' : 'Name');
    } else {
      setStep(step + 1);
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      <View style={styles.content}>
        <Text style={styles.wordmark}>Breath</Text>

        <View style={styles.mark}>
          <Svg width={168} height={168} viewBox="0 0 168 168">
            <Circle cx={84} cy={84} r={78} fill="none" stroke={colors.moon} strokeOpacity={0.18} strokeWidth={1} />
            <Circle cx={84} cy={84} r={62} fill="none" stroke={colors.moon} strokeWidth={1.5} />
            <Circle cx={84} cy={84} r={6} fill={colors.tideLight} />
          </Svg>
        </View>

        <Text style={styles.title}>{s.title}</Text>
        {s.attribution ? <Text style={styles.attribution}>{s.attribution}</Text> : null}
        <Text style={styles.body}>{s.body}</Text>
        {step === 0 ? (
          <TextButton label="Read the idea behind Breath" color={colors.tideLight} onPress={() => navigation.navigate('Philosophy')} style={{ alignSelf: 'flex-start', paddingVertical: 12 }} />
        ) : null}

        <View style={{ flex: 1 }} />

        <View style={styles.dots} accessibilityLabel={`Step ${step + 1} of ${STEPS.length}`}>
          {STEPS.map((_, i) => (
            <View key={i} style={[styles.dot, i === step && styles.dotOn]} />
          ))}
        </View>
        <PrimaryButton dark label={isLast ? 'Begin' : 'Continue'} onPress={next} />
        {step === 0 ? (
          <TextButton
            label="Skip the introduction"
            color={colors.tideLight}
            onPress={() => {
              completeOnboarding();
              navigation.replace(me ? 'Home' : 'Name');
            }}
            style={{ marginTop: 6 }}
          />
        ) : (
          <TextButton label="Back" color={colors.moonMuted} onPress={() => setStep(step - 1)} style={{ marginTop: 6 }} />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.night },
  content: { flex: 1, paddingTop: 24, paddingHorizontal: 28, paddingBottom: 20 },
  wordmark: { fontFamily: fonts.displayItalic, fontSize: 22, color: colors.moon },
  mark: { alignItems: 'center', marginTop: 44, marginBottom: 40 },
  title: { fontFamily: fonts.display, fontSize: 34, lineHeight: 39, letterSpacing: -0.4, color: colors.moon, marginBottom: 14 },
  attribution: { fontFamily: fonts.displayItalic, fontSize: 16, color: colors.tideLight, marginBottom: 14 },
  body: { fontFamily: fonts.ui, fontSize: 16, lineHeight: 26, color: colors.moonMuted },
  dots: { flexDirection: 'row', gap: 6, marginBottom: 22 },
  dot: { width: 8, height: 3, borderRadius: 2, backgroundColor: colors.moon, opacity: 0.3 },
  dotOn: { width: 22, opacity: 1 },
});
