import React from 'react';
import { View } from 'react-native';
import { colors } from '../theme/tokens';

// The Breath logo: one ring, one breath at its centre.
export default function BreathMark({ size = 56, color = colors.text, dot = colors.accent }) {
  const stroke = Math.max(1.5, size * 0.032);
  const d = Math.max(4, size * 0.15);
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        borderWidth: stroke,
        borderColor: color,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <View style={{ width: d, height: d, borderRadius: d / 2, backgroundColor: dot }} />
    </View>
  );
}
