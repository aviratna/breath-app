import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Easing, AccessibilityInfo } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, fonts, radius, type } from '../theme/tokens';
import { useBreath } from '../state/BreathContext';
import { BreathMark, Icon, PrimaryButton, TextButton } from '../components/ui';

// The breath leaving: three soft rings wash outward from the mark, like a heartbeat
// travelling away, twice, then rest.
function SentRipple({ size = 96 }) {
  const waves = useRef([0, 1, 2].map(() => new Animated.Value(0))).current;
  useEffect(() => {
    let anim;
    AccessibilityInfo.isReduceMotionEnabled()
      .catch(() => false)
      .then((reduce) => {
        if (reduce) return;
        anim = Animated.loop(
          Animated.stagger(
            260,
            waves.map((w) =>
              Animated.sequence([
                Animated.timing(w, { toValue: 1, duration: 1600, easing: Easing.out(Easing.quad), useNativeDriver: true }),
                Animated.timing(w, { toValue: 0, duration: 0, useNativeDriver: true }),
              ])
            )
          ),
          { iterations: 2 }
        );
        anim.start();
      });
    return () => anim && anim.stop();
  }, []);
  const box = size * 2.6;
  return (
    <View style={{ width: box, height: box, alignItems: 'center', justifyContent: 'center' }}>
      {waves.map((w, i) => (
        <Animated.View
          key={i}
          pointerEvents="none"
          style={{
            position: 'absolute',
            width: size,
            height: size,
            borderRadius: size / 2,
            borderWidth: 1.5,
            borderColor: colors.tide,
            opacity: w.interpolate({ inputRange: [0, 0.1, 1], outputRange: [0, 0.55, 0] }),
            transform: [{ scale: w.interpolate({ inputRange: [0, 1], outputRange: [1, 2.5] }) }],
          }}
        />
      ))}
      <BreathMark size={size} strokeWidth={1.6} />
    </View>
  );
}

export default function SentScreen({ route, navigation }) {
  const { name } = route.params;
  const { lastGift, previewMode } = useBreath();
  const isPublic = previewMode === 'celebrity';

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={{ marginTop: 24 }}>
          <SentRipple />
        </View>
        <Text style={[type.h1, styles.center, { marginTop: 0, marginBottom: 14 }]}>You gave {name} a breath.</Text>
        <Text style={[type.body, styles.center, { maxWidth: 300 }]}>
          {isPublic ? 'One person. One breath. Nothing to follow up.' : 'No message, no reply needed. They’ll simply know you were thinking of them.'}
        </Text>

        {lastGift ? (
          <View style={styles.pill} accessibilityLabel={`${lastGift.after} breaths left today`}>
            <Text style={styles.pillNum}>{lastGift.before.toLocaleString()}</Text>
            <Icon name="arrow" size={16} color={colors.stone} />
            <Text style={styles.pillNum}>{lastGift.after.toLocaleString()}</Text>
            <Text style={type.small}>left today</Text>
          </View>
        ) : null}

        <View style={{ flex: 1 }} />
        <PrimaryButton label="Share this moment" icon="share" onPress={() => navigation.navigate('ShareCard', { name })} style={{ alignSelf: 'stretch' }} />
        <TextButton label="Done" onPress={() => navigation.popTo('Home')} style={{ alignSelf: 'stretch', marginTop: 6 }} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.linen },
  content: { flex: 1, alignItems: 'center', paddingHorizontal: 28, paddingBottom: 16 },
  center: { textAlign: 'center' },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 32,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: radius.pill,
    backgroundColor: colors.paper,
    borderWidth: 1,
    borderColor: colors.mist,
  },
  pillNum: { fontFamily: fonts.display, fontSize: 17, color: colors.ink },
});
