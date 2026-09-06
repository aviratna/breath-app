import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, fonts } from '../theme/tokens';

export default function PlateNumber({ value, size = 40, dark = false }) {
  const display = value.toLocaleString();
  if (dark) {
    return (
      <Text style={[styles.plain, { fontSize: size, color: colors.bg }]}>{display}</Text>
    );
  }
  return (
    <View style={{ width: size * display.length * 0.62, height: size * 1.15 }}>
      {[
        { color: colors.accent, dx: 0, dy: 0, opacity: 1 },
        { color: colors.accent2, dx: 1.2, dy: 0.9, opacity: 0.85 },
        { color: colors.processYellow, dx: -1.1, dy: -0.8, opacity: 0.7 },
      ].map((plate, i) => (
        <Text
          key={i}
          style={[
            styles.plain,
            {
              position: 'absolute',
              fontSize: size,
              color: plate.color,
              opacity: plate.opacity,
              left: plate.dx,
              top: plate.dy,
            },
          ]}
        >
          {display}
        </Text>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  plain: {
    fontFamily: fonts.body,
    letterSpacing: -0.3,
  },
});
