// src/theme/typography.ts
// Nur Café type scale — Warm Editorial Minimalism
// Manrope: 400 Regular, 500 Medium, 600 SemiBold, 700 Bold, 800 ExtraBold
// Amiri: Arabic-calligraphy influenced serif — used for the brand wordmark

export const fonts = {
  regular:   'Manrope_400Regular',
  medium:    'Manrope_500Medium',
  semibold:  'Manrope_600SemiBold',
  bold:      'Manrope_700Bold',
  extrabold: 'Manrope_800ExtraBold',
  amiri:     'Amiri_400Regular',
  amiriBold: 'Amiri_700Bold',
} as const;

export const type = {
  // Display — hero headlines, screen titles
  display: {
    fontFamily: fonts.extrabold,
    fontSize: 48,
    lineHeight: 52,
    letterSpacing: -0.5,
  },
  // H1 — section headers, card titles
  h1: {
    fontFamily: fonts.extrabold,
    fontSize: 32,
    lineHeight: 36,
    letterSpacing: -0.3,
  },
  // H2 — sub-headings
  h2: {
    fontFamily: fonts.extrabold,
    fontSize: 24,
    lineHeight: 28,
  },
  // H3 — card labels, item names
  h3: {
    fontFamily: fonts.bold,
    fontSize: 18,
    lineHeight: 22,
  },
  // Body large — primary readable text (16px min for mobile)
  bodyLg: {
    fontFamily: fonts.semibold,
    fontSize: 16,
    lineHeight: 24,
  },
  // Body — secondary text
  body: {
    fontFamily: fonts.medium,
    fontSize: 15,
    lineHeight: 22,
  },
  // Caption — tags, labels, fine print
  caption: {
    fontFamily: fonts.semibold,
    fontSize: 13,
    lineHeight: 18,
    letterSpacing: 0.3,
  },
  // Label — all-caps buttons and tags
  label: {
    fontFamily: fonts.extrabold,
    fontSize: 13,
    letterSpacing: 1.2,
  },
  // Price — monetary values
  price: {
    fontFamily: fonts.extrabold,
    fontSize: 18,
    lineHeight: 22,
  },
  // Brand wordmark — Arabic-calligraphy influenced (Amiri)
  brand: {
    fontFamily: fonts.amiriBold,
    fontSize: 22,
    letterSpacing: 3,
  },
} as const;
