// src/theme/springs.ts
// Nur Café spring physics library — shared across all screens
//
// Philosophy: Every interaction should feel physical. Objects have weight.
// Buttons are snappy. Cards are solid. Floats are dreamy. Splashes are dramatic.
// Nothing is linear. Nothing is instant.

export const springs = {
  // ─── Button press — quick, confident ──────────────────────
  // Scale down fast on press, release with a light bounce
  button: {
    mass: 0.6,
    damping: 12,
    stiffness: 200,
  },

  // ─── Card press — slightly heavier ─────────────────────────
  // Cards have more visual mass than buttons
  card: {
    mass: 0.8,
    damping: 13,
    stiffness: 180,
  },

  // ─── Category cell press — mid-weight ──────────────────────
  category: {
    mass: 0.7,
    damping: 11,
    stiffness: 180,
  },

  // ─── Floating animation — slow, dreamy ─────────────────────
  // Used for 3D drink images, gift card 3D visuals
  // Combined with withRepeat(withSequence(-4px, 4px), -1, true) at 1500ms each
  float: {
    mass: 1.2,
    damping: 20,
    stiffness: 80,
  },

  // ─── Tab icon — punchy active state ────────────────────────
  tabIcon: {
    mass: 0.5,
    damping: 10,
    stiffness: 220,
  },

  // ─── Modal entry — slides up with weight ───────────────────
  // Bottom sheets, product modals, gift card modal
  modal: {
    mass: 1.0,
    damping: 18,
    stiffness: 150,
  },

  // ─── BrandSplash logo — dramatic entrance ──────────────────
  // Logo scales from 0.25 to 1.0 — needs drama, controlled overshoot
  splash: {
    mass: 1.2,
    damping: 10,
    stiffness: 120,
  },

  // ─── ADD button bounce — bouncy cart confirmation ──────────
  // 0.8 → 1.2 → 1.0 — visual confirmation of add-to-cart
  addButton: {
    mass: 0.4,
    damping: 8,
    stiffness: 260,
  },

  // ─── Points pill pulse — subtle attention draw ─────────────
  // Every ~8s scales 1 → 1.04 → 1
  pill: {
    mass: 0.8,
    damping: 14,
    stiffness: 160,
  },
} as const;

// ─── Float animation timing ────────────────────────────────────────────────
// Use with withRepeat(withSequence(...), -1, true) in Reanimated
export const floatConfig = {
  offsetY: 4,       // pixels up and down from center
  duration: 1500,   // ms per half-cycle (up or down)
};
