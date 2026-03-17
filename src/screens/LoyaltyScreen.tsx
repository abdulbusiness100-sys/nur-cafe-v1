// src/screens/LoyaltyScreen.tsx
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useAuth } from '../context/AuthContext';
import colors from '../theme/colors';
import { spacing, radius, shadow } from '../theme/spacing';
import { type as t } from '../theme/typography';

// Tier configuration — mirrors TIER_CONFIG in HomeScreen and the DB trigger
const TIERS = {
  bronze: { label: 'Bronze', color: '#CD7F32', nextLabel: 'Silver', next: 50  },
  silver: { label: 'Silver', color: '#94A3B8', nextLabel: 'Gold',   next: 150 },
  gold:   { label: 'Gold',   color: '#F59E0B', nextLabel: null,      next: null },
} as const;

type TierKey = keyof typeof TIERS;

const TIER_PERKS: Record<TierKey, string[]> = {
  bronze: ['Earn 1pt per £1 spent', 'Birthday bonus points', 'Early access to new drinks'],
  silver: ['Everything in Bronze', '1.25x points multiplier', 'Free size upgrade once a month'],
  gold:   ['Everything in Silver', '1.5x points multiplier', 'Free drink on your birthday', 'Priority ordering'],
};

const TIER_STEPS: { key: TierKey; threshold: number }[] = [
  { key: 'bronze', threshold: 0   },
  { key: 'silver', threshold: 50  },
  { key: 'gold',   threshold: 150 },
];

export default function LoyaltyScreen() {
  const { profile } = useAuth();
  const points   = profile?.points ?? 0;
  const tier     = ((profile?.tier ?? 'bronze') as TierKey);
  const tierCfg  = TIERS[tier];
  const progress = tierCfg.next ? Math.min(points / tierCfg.next, 1) : 1;
  const ptsToNext = tierCfg.next ? tierCfg.next - points : 0;

  return (
    <SafeAreaView style={s.safe}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 32 }}>

        {/* Header */}
        <Animated.View entering={FadeInDown.delay(0).springify()} style={s.header}>
          <Text style={s.title}>Rewards</Text>
          <Text style={s.subtitle}>
            Earn points with every order.{'\n'}Unlock Silver and Gold benefits.
          </Text>
        </Animated.View>

        {/* Points card */}
        <Animated.View entering={FadeInDown.delay(80).springify()} style={s.pointsCard}>
          {/* Tier badge */}
          <View style={s.tierRow}>
            <View style={[s.tierBadge, { backgroundColor: tierCfg.color + '22' }]}>
              <View style={[s.tierDot, { backgroundColor: tierCfg.color }]} />
              <Text style={[s.tierLabel, { color: tierCfg.color }]}>
                {tierCfg.label.toUpperCase()}
              </Text>
            </View>
            <Text style={s.cardHeading}>Rewards</Text>
          </View>

          {/* Points */}
          <View style={s.pointsRow}>
            <Ionicons name="star" size={20} color={colors.warning} />
            <Text style={s.pointsNum}> {points}</Text>
            <Text style={s.pointsUnit}> {points === 1 ? 'point' : 'points'}</Text>
          </View>

          {/* Progress bar */}
          {tierCfg.next !== null ? (
            <>
              <ProgressBar progress={progress} color={tierCfg.color} />
              <View style={s.progressLabels}>
                <Text style={s.progressLabel}>{points} pts</Text>
                <Text style={s.progressLabel}>
                  {ptsToNext} pts to {tierCfg.nextLabel}
                </Text>
              </View>
            </>
          ) : (
            <Text style={s.goldAchieved}>
              You've reached Gold — maximum tier!
            </Text>
          )}

          <Text style={s.watermark}>NŪR</Text>
        </Animated.View>

        {/* Tier journey */}
        <Animated.View entering={FadeInDown.delay(160).springify()}>
          <Text style={s.sectionTitle}>Your journey</Text>
          <View style={s.tierSteps}>
            {TIER_STEPS.map((step, i) => {
              const cfg = TIERS[step.key];
              const isActive = step.key === tier;
              const isUnlocked = points >= step.threshold;
              return (
                <View key={step.key} style={s.tierStep}>
                  {/* Connector line */}
                  {i > 0 && (
                    <View style={[s.connector, isUnlocked && s.connectorActive]} />
                  )}
                  <View style={[
                    s.stepDot,
                    { borderColor: cfg.color },
                    isUnlocked && { backgroundColor: cfg.color },
                  ]}>
                    {isActive && <View style={s.stepDotInner} />}
                  </View>
                  <Text style={[s.stepLabel, { color: cfg.color }]}>
                    {cfg.label}
                  </Text>
                  <Text style={s.stepThreshold}>
                    {step.threshold === 0 ? 'Start' : `${step.threshold} pts`}
                  </Text>
                </View>
              );
            })}
          </View>
        </Animated.View>

        {/* Perks for current tier */}
        <Animated.View entering={FadeInDown.delay(240).springify()}>
          <Text style={s.sectionTitle}>{tierCfg.label} perks</Text>
          <View style={s.perksCard}>
            {TIER_PERKS[tier].map((perk, i) => (
              <View
                key={perk}
                style={[s.perkRow, i < TIER_PERKS[tier].length - 1 && s.perkBorder]}
              >
                <Ionicons name="checkmark-circle" size={20} color={tierCfg.color} />
                <Text style={s.perkText}>{perk}</Text>
              </View>
            ))}
          </View>
        </Animated.View>

        {/* All tiers breakdown */}
        <Animated.View entering={FadeInDown.delay(300).springify()}>
          <Text style={s.sectionTitle}>All tiers</Text>
          <View style={s.allTiersRow}>
            {TIER_STEPS.map((step) => {
              const cfg = TIERS[step.key];
              const isActive = step.key === tier;
              return (
                <View
                  key={step.key}
                  style={[s.tierCard, isActive && { borderColor: cfg.color, borderWidth: 2 }]}
                >
                  <View style={[s.tierDotLg, { backgroundColor: cfg.color }]} />
                  <Text style={[s.tierCardLabel, { color: cfg.color }]}>{cfg.label}</Text>
                  <Text style={s.tierCardThreshold}>
                    {step.threshold === 0 ? 'From 0 pts' : `From ${step.threshold} pts`}
                  </Text>
                </View>
              );
            })}
          </View>
        </Animated.View>

      </ScrollView>
    </SafeAreaView>
  );
}

// ── Animated progress bar ─────────────────────────────────────────────────────

function ProgressBar({ progress, color }: { progress: number; color: string }) {
  return (
    <View style={s.progressTrack}>
      <View style={[s.progressFill, { width: `${Math.round(progress * 100)}%` as any, backgroundColor: color }]} />
    </View>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },

  header: { paddingHorizontal: spacing.base, paddingTop: spacing.md, paddingBottom: spacing.sm },
  title: { ...t.display, color: colors.onBrand, textAlign: 'center' },
  subtitle: { ...t.body, color: colors.onBrand, opacity: 0.75, textAlign: 'center', marginTop: spacing.sm },

  // Points card
  pointsCard: {
    marginHorizontal: spacing.base, marginTop: spacing.base,
    backgroundColor: colors.card, borderRadius: radius['2xl'],
    padding: spacing.base, borderWidth: 1, borderColor: colors.border,
    overflow: 'hidden', ...shadow.card,
  },
  tierRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.base },
  tierBadge: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, borderRadius: radius.full, paddingHorizontal: spacing.sm, paddingVertical: 5 },
  tierDot: { width: 8, height: 8, borderRadius: 4 },
  tierLabel: { ...t.label, fontSize: 10 },
  cardHeading: { ...t.h2, color: colors.text },

  pointsRow: { flexDirection: 'row', alignItems: 'baseline', marginBottom: spacing.md },
  pointsNum: { ...t.h1, color: colors.text },
  pointsUnit: { ...t.body, color: colors.subText },

  progressTrack: { height: 6, backgroundColor: colors.border, borderRadius: 6, overflow: 'hidden', marginBottom: spacing.xs },
  progressFill: { height: '100%', borderRadius: 6 },
  progressLabels: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.sm },
  progressLabel: { ...t.caption, color: colors.subText },

  goldAchieved: { ...t.body, color: colors.subText, marginBottom: spacing.sm },

  watermark: {
    position: 'absolute', right: spacing.md, bottom: spacing.sm,
    fontSize: 72, color: colors.text, opacity: 0.04,
    fontFamily: 'Manrope_800ExtraBold',
  },

  // Section title
  sectionTitle: {
    ...t.h3, color: colors.onBrand,
    marginHorizontal: spacing.base, marginTop: spacing.xl, marginBottom: spacing.md,
  },

  // Tier journey steps
  tierSteps: {
    flexDirection: 'row', justifyContent: 'space-between',
    marginHorizontal: spacing.base, alignItems: 'flex-start',
  },
  tierStep: { flex: 1, alignItems: 'center', position: 'relative' },
  connector: {
    position: 'absolute', top: 10, right: '50%', left: '-50%',
    height: 2, backgroundColor: colors.border,
  },
  connectorActive: { backgroundColor: colors.brand },
  stepDot: {
    width: 22, height: 22, borderRadius: 11,
    borderWidth: 2, backgroundColor: colors.border,
    alignItems: 'center', justifyContent: 'center',
  },
  stepDotInner: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.card },
  stepLabel: { ...t.caption, fontFamily: 'Manrope_700Bold', marginTop: spacing.xs, textAlign: 'center' },
  stepThreshold: { ...t.caption, color: colors.subText, textAlign: 'center' },

  // Perks card
  perksCard: {
    marginHorizontal: spacing.base,
    backgroundColor: colors.card, borderRadius: radius.xl,
    borderWidth: 1, borderColor: colors.border, overflow: 'hidden',
  },
  perkRow: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.md,
    paddingHorizontal: spacing.base, paddingVertical: 14,
  },
  perkBorder: { borderBottomWidth: 1, borderBottomColor: colors.border },
  perkText: { ...t.body, color: colors.text, flex: 1 },

  // All tiers row
  allTiersRow: {
    flexDirection: 'row', gap: spacing.sm, marginHorizontal: spacing.base,
  },
  tierCard: {
    flex: 1, backgroundColor: colors.card, borderRadius: radius.xl,
    borderWidth: 1, borderColor: colors.border,
    padding: spacing.md, alignItems: 'center', gap: spacing.xs,
  },
  tierDotLg: { width: 16, height: 16, borderRadius: 8 },
  tierCardLabel: { ...t.label, fontSize: 12 },
  tierCardThreshold: { ...t.caption, color: colors.subText, textAlign: 'center' },
});
