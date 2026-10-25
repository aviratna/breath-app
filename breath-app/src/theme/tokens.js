// Breath design system v2 — calm, editorial, one breath of colour.
// Linen ground, ink text, and a single accent (Tide) used only where a breath moves.
export const colors = {
  linen: '#F5F1EA', // app background
  paper: '#FBF9F5', // cards, inputs
  mist: '#E3DDD3', // borders
  hairline: '#EEE9E1', // row dividers inside cards
  border: '#D4CCC0', // outline buttons
  ink: '#1B1A18', // text, primary buttons
  stone: '#5E5953', // secondary text (5:1 on linen)
  night: '#161514', // dark surfaces
  moon: '#EFEAE0', // text on night
  moonMuted: '#B9B2A6', // secondary text on night
  tide: '#2D6A78', // the accent: a breath given
  tideDeep: '#1F4F5A',
  tideMist: '#E2EDEF', // accent tint
  tideInk: '#3F5E66', // secondary text on tideMist
  tideLight: '#8CC3CF', // accent on night
  danger: '#9C3B2A',
};

export const fonts = {
  display: 'Newsreader_400Regular',
  displayLight: 'Newsreader_300Light',
  displayItalic: 'Newsreader_400Regular_Italic',
  ui: 'Inter_400Regular',
  uiMedium: 'Inter_500Medium',
  uiSemi: 'Inter_600SemiBold',
};

export const radius = { card: 20, row: 16, input: 14, pill: 999 };

// Shared text styles.
export const type = {
  h1: { fontFamily: fonts.display, fontSize: 32, lineHeight: 37, letterSpacing: -0.3, color: colors.ink },
  body: { fontFamily: fonts.ui, fontSize: 16, lineHeight: 25, color: colors.stone },
  label: { fontFamily: fonts.uiSemi, fontSize: 12, letterSpacing: 1.2, textTransform: 'uppercase', color: colors.stone },
  small: { fontFamily: fonts.ui, fontSize: 13, lineHeight: 19, color: colors.stone },
};
