// src/theme/typography.ts
// Nur Café type scale — Premium Arabic Cafe, Warm Editorial
//
// Two-font system:
//   Amiri  — Arabic calligraphy-influenced serif. Heritage, emotion, identity.
//            Used for: logo wordmark, Arabic greetings, section display headers,
//            BrandSplash, gift card prices, category Arabic sub-labels.
//   Manrope — Modern geometric sans. Precision, clarity, modernity.
//             Used for: body copy, buttons, labels, prices, tab labels, inputs.

export const fonts = {
  // Manrope weights
  regular:      'Manrope_400Regular',
  medium:       'Manrope_500Medium',
  semibold:     'Manrope_600SemiBold',
  bold:         'Manrope_700Bold',
  extrabold:    'Manrope_800ExtraBold',

  // Amiri weights — Arabic calligraphy influenced
  amiri:        'Amiri_400Regular',
  amiriBold:    'Amiri_700Bold',
} as const;

// ─── Display — Arabic heritage moments ────────────────────────────────────────
// Use Amiri for screen titles and bilingual display pairings

export const type = {
  // Hero display (BrandSplash, onboarding)
  display: {
    fontFamily: fonts.extrabold,
    fontSize: 48,
    lineHeight: 52,
    letterSpacing: -0.5,
  },

  // Arabic hero — BrandSplash "نور كافيه", onboarding
  arabicHero: {
    fontFamily: fonts.amiriBold,
    fontSize: 40,
    lineHeight: 52,
    letterSpacing: 3,
  },

  // H1 — screen headers (Manrope bold pairing with arabicHeading)
  h1: {
    fontFamily: fonts.extrabold,
    fontSize: 32,
    lineHeight: 36,
    letterSpacing: -0.3,
  },

  // Arabic heading — section titles with Arabic above English
  arabicHeading: {
    fontFamily: fonts.amiriBold,
    fontSize: 24,
    lineHeight: 32,
    letterSpacing: 1,
  },

  // H2 — sub-headings, card display titles
  h2: {
    fontFamily: fonts.extrabold,
    fontSize: 24,
    lineHeight: 28,
  },

  // H3 — card labels, item names, modal titles
  h3: {
    fontFamily: fonts.bold,
    fontSize: 18,
    lineHeight: 22,
  },

  // Arabic greeting — HomeScreen "مساء النور، [Name]"
  arabicGreeting: {
    fontFamily: fonts.amiri,
    fontSize: 18,
    lineHeight: 26,
    letterSpacing: 0.5,
  },

  // Arabic label — CategoryGrid sub-labels, tab bar Arabic
  arabicLabel: {
    fontFamily: fonts.amiri,
    fontSize: 14,
    lineHeight: 20,
  },

  // Arabic small — captions, helper text in Arabic
  arabicSmall: {
    fontFamily: fonts.amiri,
    fontSize: 12,
    lineHeight: 18,
  },

  // Body large — primary readable text
  bodyLg: {
    fontFamily: fonts.semibold,
    fontSize: 17,
    lineHeight: 26,
  },

  // Body — descriptions, secondary info
  body: {
    fontFamily: fonts.medium,
    fontSize: 15,
    lineHeight: 22,
  },

  // Body small — captions, helper text
  bodySm: {
    fontFamily: fonts.regular,
    fontSize: 13,
    lineHeight: 18,
  },

  // Label large — section chips, badges (uppercase)
  labelLg: {
    fontFamily: fonts.bold,
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 1.5,
    textTransform: 'uppercase' as const,
  },

  // Label medium — tab bar labels
  labelMd: {
    fontFamily: fonts.semibold,
    fontSize: 11,
    lineHeight: 14,
    letterSpacing: 0.3,
  },

  // Label small — price tags, timestamps, counts
  labelSm: {
    fontFamily: fonts.medium,
    fontSize: 10,
    lineHeight: 14,
  },

  // Price — monetary values, prominent pricing
  price: {
    fontFamily: fonts.extrabold,
    fontSize: 18,
    lineHeight: 22,
  },

  // Gift card price — Amiri for premium feel
  priceAmiri: {
    fontFamily: fonts.amiriBold,
    fontSize: 20,
    lineHeight: 28,
  },

  // Brand wordmark — NUR / logo text
  brand: {
    fontFamily: fonts.amiriBold,
    fontSize: 72,
    letterSpacing: 4,
    lineHeight: 80,
  },

  // Brand subtitle — نور sub-label under NUR
  brandSubtitle: {
    fontFamily: fonts.amiriBold,
    fontSize: 52,
    letterSpacing: 2,
    lineHeight: 60,
  },

  // Caption — tags, fine print
  caption: {
    fontFamily: fonts.semibold,
    fontSize: 13,
    lineHeight: 18,
    letterSpacing: 0.3,
  },

  // Button text — CTAs
  button: {
    fontFamily: fonts.extrabold,
    fontSize: 15,
    lineHeight: 20,
    letterSpacing: 1.8,
    textTransform: 'uppercase' as const,
  },
} as const;
