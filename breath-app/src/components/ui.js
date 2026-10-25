import React from 'react';
import { View, Text, Pressable, ActivityIndicator } from 'react-native';
import Svg, { Path, Circle, Rect } from 'react-native-svg';
import { colors, fonts, radius } from '../theme/tokens';

// Stroke icons (24px grid), drawn in the current text colour.
const ICONS = {
  back: <Path d="M15 5l-7 7 7 7" />,
  close: <Path d="M6 6l12 12M18 6L6 18" />,
  chevron: <Path d="M9 5l7 7-7 7" />,
  plus: <Path d="M12 5v14M5 12h14" />,
  share: <Path d="M12 15V3M7 8l5-5 5 5M5 13v6a2 2 0 002 2h10a2 2 0 002-2v-6" />,
  arrow: <Path d="M5 12h14M13 6l6 6-6 6" />,
  external: <Path d="M7 17L17 7M9 7h8v8" />,
  settings: (
    <>
      <Path d="M4 7h10M18 7h2M4 17h4M12 17h8" />
      <Circle cx="16" cy="7" r="2" />
      <Circle cx="10" cy="17" r="2" />
    </>
  ),
  search: (
    <>
      <Circle cx="11" cy="11" r="6.5" />
      <Path d="M20 20l-4.2-4.2" />
    </>
  ),
  star: <Path d="M12 3.6l2.5 5.2 5.7.8-4.1 4 1 5.6L12 16.5l-5.1 2.7 1-5.6-4.1-4 5.7-.8z" />,
  edit: <Path d="M4 20h4L19 9l-4-4L4 16v4zM14 6l4 4" />,
  lock: (
    <>
      <Rect x="5" y="11" width="14" height="9" rx="2" />
      <Path d="M8 11V8a4 4 0 018 0v3" />
    </>
  ),
  bell: <Path d="M6 16V11a6 6 0 0112 0v5l1.5 2h-15L6 16zM10 20.5a2 2 0 004 0" />,
  copy: (
    <>
      <Rect x="8" y="8" width="12" height="12" rx="2" />
      <Path d="M16 8V6a2 2 0 00-2-2H6a2 2 0 00-2 2v8a2 2 0 002 2h2" />
    </>
  ),
};

export function Icon({ name, size = 22, color = colors.ink, strokeWidth = 1.8, fill = 'none' }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
      {ICONS[name]}
    </Svg>
  );
}

// The Breath logo: one ring for the day, one dot for the breath you give.
export function BreathMark({ size = 56, color = colors.ink, dot = colors.tide, strokeWidth }) {
  const sw = strokeWidth ?? Math.max(1.2, size * 0.034);
  const r = size / 2 - sw;
  return (
    <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <Circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={sw} />
      <Circle cx={size / 2} cy={size / 2} r={Math.max(2, size * 0.065)} fill={dot} />
    </Svg>
  );
}

// A ring whose arc shows `progress` (0–1), with children centred inside.
export function ProgressRing({ size, progress, strokeWidth = 3, track = colors.mist, color = colors.ink, children }) {
  const r = size / 2 - strokeWidth;
  const c = 2 * Math.PI * r;
  const p = Math.min(1, Math.max(0, progress));
  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={size} height={size} style={{ position: 'absolute' }}>
        <Circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={track} strokeWidth={strokeWidth} />
        {p > 0 ? (
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={`${c * p} ${c}`}
            transform={`rotate(-90 ${size / 2} ${size / 2})`}
          />
        ) : null}
      </Svg>
      {children}
    </View>
  );
}

// A person's initial in a circle. Tone: 'tide' (a gift), 'plain' (a row), 'night' (dark surfaces).
export function Avatar({ name, size = 40, tone = 'plain' }) {
  const initial = (name || '?').trim().charAt(0).toUpperCase() || '?';
  const t = {
    tide: { bg: colors.tideMist, fg: colors.tide, border: colors.tideMist },
    plain: { bg: colors.linen, fg: colors.ink, border: colors.mist },
    night: { bg: 'rgba(239,234,224,0.08)', fg: colors.moon, border: 'rgba(239,234,224,0.18)' },
  }[tone];
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: t.bg,
        borderWidth: 1,
        borderColor: t.border,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Text style={{ fontFamily: fonts.displayItalic, fontSize: size * 0.46, color: t.fg }}>{initial}</Text>
    </View>
  );
}

export function PrimaryButton({ label, onPress, icon, busy, disabled, dark = false, style }) {
  const bg = dark ? colors.moon : colors.ink;
  const fg = dark ? colors.night : colors.linen;
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      disabled={disabled || busy}
      style={({ pressed }) => [
        { minHeight: 54, paddingVertical: 12, borderRadius: radius.pill, backgroundColor: bg, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, paddingHorizontal: 22 },
        (disabled || busy) && { opacity: 0.45 },
        pressed && { opacity: 0.85 },
        style,
      ]}
    >
      {busy ? (
        <ActivityIndicator color={fg} />
      ) : (
        <>
          {icon ? <Icon name={icon} size={18} color={fg} /> : null}
          <Text style={{ fontFamily: fonts.uiSemi, fontSize: 16, color: fg, textAlign: 'center', flexShrink: 1 }}>{label}</Text>
        </>
      )}
    </Pressable>
  );
}

export function SecondaryButton({ label, onPress, icon, busy, disabled, style, height = 54 }) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      disabled={disabled || busy}
      style={({ pressed }) => [
        { minHeight: height, paddingVertical: 10, borderRadius: radius.pill, borderWidth: 1, borderColor: colors.border, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingHorizontal: 20 },
        (disabled || busy) && { opacity: 0.45 },
        pressed && { backgroundColor: colors.paper },
        style,
      ]}
    >
      {busy ? (
        <ActivityIndicator color={colors.ink} />
      ) : (
        <>
          {icon ? <Icon name={icon} size={18} /> : null}
          <Text style={{ fontFamily: fonts.uiMedium, fontSize: 15, color: colors.ink, textAlign: 'center', flexShrink: 1 }}>{label}</Text>
        </>
      )}
    </Pressable>
  );
}

export function TextButton({ label, onPress, color = colors.ink, style }) {
  return (
    <Pressable accessibilityRole="button" onPress={onPress} hitSlop={8} style={[{ paddingVertical: 14, alignItems: 'center' }, style]}>
      <Text style={{ fontFamily: fonts.ui, fontSize: 15, color }}>{label}</Text>
    </Pressable>
  );
}

export function IconButton({ name, label, onPress, color = colors.ink, style }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      hitSlop={6}
      style={({ pressed }) => [{ width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' }, pressed && { backgroundColor: 'rgba(27,26,24,0.06)' }, style]}
    >
      <Icon name={name} color={color} />
    </Pressable>
  );
}

// Back button plus screen title, for pushed screens.
export function ScreenHeader({ title, onBack }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginLeft: -10, marginBottom: 18 }}>
      <IconButton name="back" label="Back" onPress={onBack} />
      {title ? <Text style={{ fontFamily: fonts.uiSemi, fontSize: 17, color: colors.ink }}>{title}</Text> : null}
    </View>
  );
}

export function Card({ children, style }) {
  return (
    <View style={[{ backgroundColor: colors.paper, borderRadius: radius.card, borderWidth: 1, borderColor: colors.mist }, style]}>{children}</View>
  );
}
