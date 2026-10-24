import React from 'react';
import { Text, StyleSheet } from 'react-native';
import { colors, fonts } from '../theme/tokens';

// The day's breath count: a single, plain ink numeral.
export default function PlateNumber({ value, size = 40, dark = false }) {
  return (
    <Text style={[styles.number, { fontSize: size, color: dark ? colors.bg : colors.text }]}>
      {value.toLocaleString()}
    </Text>
  );
}

const styles = StyleSheet.create({
  number: {
    fontFamily: fonts.body,
    letterSpacing: -0.5,
  },
});
