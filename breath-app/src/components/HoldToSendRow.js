import React, { useRef, useState } from 'react';
import { View, Text, StyleSheet, Animated, Pressable } from 'react-native';
import { colors, fonts, radius, spacing } from '../theme/tokens';
import Avatar from './Avatar';

const HOLD_MS = 900;

export default function HoldToSendRow({ name, tint, onComplete }) {
  const fill = useRef(new Animated.Value(0)).current;
  const anim = useRef(null);
  const [holding, setHolding] = useState(false);

  function start() {
    setHolding(true);
    fill.setValue(0);
    anim.current = Animated.timing(fill, {
      toValue: 1,
      duration: HOLD_MS,
      useNativeDriver: false,
    });
    anim.current.start(({ finished }) => {
      if (finished) {
        onComplete && onComplete(name);
      }
    });
  }

  function cancel() {
    if (anim.current) anim.current.stop();
    setHolding(false);
    Animated.timing(fill, { toValue: 0, duration: 120, useNativeDriver: false }).start();
  }

  const width = fill.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] });

  return (
    <Pressable
      onPressIn={start}
      onPressOut={cancel}
      style={styles.row}
    >
      <Animated.View style={[styles.fill, { width, backgroundColor: tint }]} />
      <View style={styles.content}>
        <Avatar name={name} size={36} />
        <Text style={styles.name}>{name}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    position: 'relative',
    overflow: 'hidden',
    borderRadius: radius.md,
    backgroundColor: colors.surface,
  },
  fill: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
    paddingVertical: 11,
    paddingHorizontal: 14,
  },
  name: {
    fontFamily: fonts.body,
    fontSize: 15,
    color: colors.text,
  },
});
