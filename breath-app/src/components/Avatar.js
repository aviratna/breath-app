import React from 'react';
import { View, Text } from 'react-native';
import { colors, fonts } from '../theme/tokens';

// A person's initial in a quiet circle (Breath has no profile photos).
export default function Avatar({ name, size = 36, dark = false }) {
  const initial = (name || '?').trim().charAt(0).toUpperCase() || '?';
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: dark ? 'rgba(255,255,255,0.08)' : colors.bg,
        borderWidth: 1,
        borderColor: dark ? 'rgba(255,255,255,0.22)' : colors.divider,
      }}
    >
      <Text style={{ fontFamily: fonts.headingItalic, fontSize: size * 0.46, color: dark ? '#e8e3d5' : colors.text }}>
        {initial}
      </Text>
    </View>
  );
}
