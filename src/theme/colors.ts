// Nur Café brand palette — Premium Arabic Cafe, Manchester
// Terracotta + Cream: warmth of clay, linen, warm lamplight
// Every token justified against: does this feel like a £6 matcha?

const colors = {
  // ─── Brand Primaries ──────────────────────────────────────
  terracotta:      '#9C5148', // Primary brand. Warmth, clay, Middle Eastern earthiness
  terracottaDark:  '#7E3E37', // Pressed/active states. Depth without going black
  terracottaSoft:  '#C4786F', // Subtle fills, chip borders on terracotta backgrounds
  arabicGold:      '#C0825A', // Deluxe tier, premium accents. Warm, not gaudy

  // ─── Surfaces ─────────────────────────────────────────────
  cream:           '#EFE5D8', // Primary surface. Cards, tab bar, inputs
  creamDeep:       '#E0CDB8', // Borders, dividers on cream surfaces
  sand:            '#F7F2EB', // Page backgrounds. Lighter than cream — breathing room
  offWhite:        '#FAF6F1', // Skeleton shimmer base

  // ─── Text ─────────────────────────────────────────────────
  deepBrown:       '#2B1810', // Primary text on cream. Warm black
  subText:         '#6C5F55', // Secondary text, descriptions
  muted:           '#BFAAA5', // Placeholder text, inactive tab icons

  // ─── Semantic ─────────────────────────────────────────────
  success:         '#4A7C59', // Points earned, payment confirmed — forest green
  warning:         '#C0825A', // Urgent admin alerts — reuses arabicGold
  error:           '#9C3434', // Errors — deeper red, brand-adjacent

  // ─── Loyalty Tiers ────────────────────────────────────────
  bronze:          '#CD7F32', // Bronze tier badge
  silver:          '#94A3B8', // Silver tier badge
  gold:            '#F59E0B', // Gold tier badge — warm amber

  // ─── Semantic aliases — all point to the warm palette ────
  bg:              '#F7F2EB', // alias → sand   (page backgrounds)
  card:            '#EFE5D8', // alias → cream  (card / input surfaces)
  brand:           '#9C5148', // alias → terracotta
  brandDark:       '#7E3E37', // alias → terracottaDark
  brandSoft:       '#9C514818', // terracotta at ~10% opacity — soft tint
  text:            '#2B1810', // alias → deepBrown (primary body text)
  onBrand:         '#2B1810', // text / icons on sand page background → deepBrown
  border:          '#E0CDB8', // alias → creamDeep
  shadow:          '#2B1810', // warm shadow tint
  ctaTextOnBrand:  '#FFFFFF',
};

export default colors;
