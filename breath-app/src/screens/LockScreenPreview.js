import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Pressable, SafeAreaView, Animated } from 'react-native';
import { colors, fonts } from '../theme/tokens';
import { useBreath } from '../state/BreathContext';
import { relativeTime } from '../lib/api';
import Avatar from '../components/Avatar';

export default function LockScreenPreview({ navigation }) {
  const { dailyBreathsRemaining, incomingGift, now } = useBreath();
  const time = now.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
  const date = now.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' });
  const pulse = useRef(new Animated.Value(0.35)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: 2500, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0.35, duration: 2500, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [pulse]);

  return (
    <SafeAreaView style={styles.container}>
      <Pressable style={styles.exit} onPress={() => navigation.goBack()}>
        <Text style={styles.exitLabel}>← exit preview</Text>
      </Pressable>

      <View style={styles.content}>
        <Text style={styles.time}>{time}</Text>
        <Text style={styles.date}>{date}</Text>

        <View style={styles.countBlock}>
          <View style={styles.labelRow}>
            <Animated.View style={[styles.dot, { opacity: pulse }]} />
            <Text style={styles.label}>breaths remaining today</Text>
          </View>
          <Text style={styles.count}>{dailyBreathsRemaining.toLocaleString()}</Text>
        </View>

        {incomingGift ? (
          <Pressable style={styles.giftCard} onPress={() => navigation.navigate('Receiving', { giftId: incomingGift.id })}>
            <Avatar name={incomingGift.name} size={32} dark />
            <Text style={styles.giftText}>
              <Text style={{ fontWeight: '600' }}>{incomingGift.name}</Text> — used one of their breaths thinking of you ·{' '}
              {relativeTime(incomingGift.createdAt, now)}
            </Text>
          </Pressable>
        ) : null}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.dark },
  exit: { paddingTop: 16, paddingLeft: 16 },
  exitLabel: { fontFamily: fonts.body, fontSize: 13, color: colors.accent },
  content: { flex: 1, alignItems: 'center', paddingTop: 60, paddingHorizontal: 24 },
  time: { fontFamily: fonts.body, fontSize: 15, color: '#e8e3d5' },
  date: { fontFamily: fonts.body, fontSize: 12, color: '#a8a293', marginTop: 2, marginBottom: 60 },
  countBlock: { alignItems: 'center', marginBottom: 40 },
  labelRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.accent },
  label: { fontFamily: fonts.heading, fontSize: 11, letterSpacing: 0.9, textTransform: 'uppercase', color: '#c9c2ab' },
  count: { fontFamily: fonts.body, fontSize: 48, color: '#f3efe4' },
  giftCard: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: 'rgba(255,255,255,0.06)', borderWidth: 0.5, borderColor: 'rgba(255,255,255,0.15)', borderRadius: 12, padding: 14, marginTop: 20, width: '100%' },
  giftText: { flex: 1, fontFamily: fonts.body, fontSize: 12.5, color: '#c9c2ab', lineHeight: 18 },
});
