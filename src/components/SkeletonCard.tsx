// src/components/SkeletonCard.tsx
// Phase 7 — Shimmer skeleton for loading states (menu items, home featured cards)
import { useEffect } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  interpolate,
  Easing,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import colors from '../theme/colors';
import { spacing } from '../theme/spacing';

const { width: W } = Dimensions.get('window');
const SHIMMER_W = W * 1.5;

// ─── Shimmer sweep ────────────────────────────────────────────────────────────
function Shimmer({ width, height, borderRadius = 8, style }: {
  width: number | string;
  height: number | string;
  borderRadius?: number;
  style?: object;
}) {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withRepeat(
      withTiming(1, { duration: 1200, easing: Easing.linear }),
      -1,
      false,
    );
  }, []);

  const animStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateX: interpolate(progress.value, [0, 1], [-SHIMMER_W, SHIMMER_W]),
      },
    ],
  }));

  return (
    <View style={[{ width, height, borderRadius, overflow: 'hidden', backgroundColor: colors.creamDeep }, style]}>
      <Animated.View style={[StyleSheet.absoluteFill, animStyle]}>
        <LinearGradient
          colors={[colors.creamDeep, colors.offWhite, colors.cream, colors.offWhite, colors.creamDeep]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={{ width: SHIMMER_W, height: '100%' }}
        />
      </Animated.View>
    </View>
  );
}

// ─── Menu card skeleton (matches MenuCard layout) ─────────────────────────────
export function MenuCardSkeleton() {
  return (
    <View style={s.menuRow}>
      <Shimmer width={80} height={80} borderRadius={12} />
      <View style={s.menuCenter}>
        <Shimmer width="85%" height={16} borderRadius={6} />
        <Shimmer width="60%" height={13} borderRadius={5} style={{ marginTop: 6 }} />
      </View>
      <View style={s.menuRight}>
        <Shimmer width={44} height={16} borderRadius={6} />
        <Shimmer width={32} height={32} borderRadius={16} style={{ marginTop: 6 }} />
      </View>
    </View>
  );
}

// ─── Featured card skeleton (matches HomeScreen carousel card) ────────────────
export function FeaturedCardSkeleton() {
  return (
    <View style={s.featuredCard}>
      <Shimmer width="100%" height="100%" borderRadius={0} />
    </View>
  );
}

// ─── Category cell skeleton (3×N grid) ───────────────────────────────────────
export function CategoryCellSkeleton({ size }: { size: number }) {
  return (
    <View style={[s.categoryCell, { width: size }]}>
      <Shimmer width={72} height={72} borderRadius={20} />
      <Shimmer width="70%" height={12} borderRadius={4} style={{ marginTop: spacing.sm }} />
      <Shimmer width="50%" height={12} borderRadius={4} style={{ marginTop: 4 }} />
    </View>
  );
}

// ─── Default export — generic block skeleton ──────────────────────────────────
export default function SkeletonCard({
  width = '100%',
  height = 80,
  borderRadius = 12,
  style,
}: {
  width?: number | string;
  height?: number | string;
  borderRadius?: number;
  style?: object;
}) {
  return <Shimmer width={width} height={height} borderRadius={borderRadius} style={style} />;
}

const s = StyleSheet.create({
  menuRow: {
    flexDirection:   'row',
    alignItems:      'center',
    gap:             spacing.md,
    backgroundColor: colors.cream,
    borderRadius:    20,
    padding:         spacing.md,
  },
  menuCenter: {
    flex: 1,
    gap:  spacing.xs,
  },
  menuRight: {
    alignItems: 'center',
    gap:        spacing.sm,
    flexShrink: 0,
  },
  featuredCard: {
    width:        280,
    height:       180,
    borderRadius: 20,
    overflow:     'hidden',
  },
  categoryCell: {
    alignItems:      'center',
    backgroundColor: colors.cream,
    borderRadius:    20,
    padding:         spacing.md,
    gap:             spacing.xs,
  },
});
