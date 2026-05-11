// src/components/BrandSplash.tsx
// Cinematic post-login arrival moment — ~3.4s total
// Logo zooms in → Arabic subtitle → hairline → welcome → name → points → dissolves
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, StatusBar } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  useAnimatedReaction,
  withTiming,
  withSpring,
  runOnJS,
  Easing,
  FadeInDown,
  FadeInUp,
} from 'react-native-reanimated';
import type { Profile } from '../types/database';
import colors from '../theme/colors';
import { fonts } from '../theme/typography';
import { springs } from '../theme/springs';

interface Props {
  profile: Profile | null;
  onComplete: () => void;
}

export default function BrandSplash({ profile, onComplete }: Props) {
  const firstName = profile?.name?.split(' ')[0] ?? 'there';
  const points = profile?.points ?? 0;
  const tier = profile?.tier ?? 'bronze';
  const tierLabel = tier.charAt(0).toUpperCase() + tier.slice(1);

  // ─── Shared values ──────────────────────────────────────────────────────────
  const logoScale    = useSharedValue(0.25);
  const logoOpacity  = useSharedValue(0);
  const hairlineW    = useSharedValue(0); // 0→1 multiplier for 48px target width
  const exitScale    = useSharedValue(1);
  const exitOpacity  = useSharedValue(1);
  const pointsAnim   = useSharedValue(0);

  // ─── Sequential element visibility ──────────────────────────────────────────
  const [showArabic,   setShowArabic]   = useState(false);
  const [showHairline, setShowHairline] = useState(false);
  const [showWelcome,  setShowWelcome]  = useState(false);
  const [showName,     setShowName]     = useState(false);
  const [showPoints,   setShowPoints]   = useState(false);
  const [displayPts,   setDisplayPts]   = useState(0);

  // Drive displayPts from animated value for count-up effect
  useAnimatedReaction(
    () => Math.round(pointsAnim.value),
    (current, prev) => {
      if (current !== prev) runOnJS(setDisplayPts)(current);
    }
  );

  useEffect(() => {
    // ── t=0ms: Logo entrance ────────────────────────────────────────────────
    // Spring with intentional overshoot (underdamped): scale 0.25 → ~1.18 → 1.0
    logoScale.value   = withSpring(1.0, springs.splash);
    logoOpacity.value = withTiming(1, { duration: 600 });

    // ── t=900ms: Arabic subtitle ──────────────────────────────────────────
    const t1 = setTimeout(() => setShowArabic(true), 900);

    // ── t=1200ms: Hairline ────────────────────────────────────────────────
    const t2 = setTimeout(() => {
      setShowHairline(true);
      hairlineW.value = withTiming(1, { duration: 200 });
    }, 1200);

    // ── t=1500ms: "Welcome back," ─────────────────────────────────────────
    const t3 = setTimeout(() => setShowWelcome(true), 1500);

    // ── t=1900ms: First name ──────────────────────────────────────────────
    const t4 = setTimeout(() => setShowName(true), 1900);

    // ── t=2300ms: Points row + count-up ───────────────────────────────────
    const t5 = setTimeout(() => {
      setShowPoints(true);
      pointsAnim.value = withTiming(points, { duration: 600 });
    }, 2300);

    // ── t=3000ms: Exit — scale up + fade out ──────────────────────────────
    const t6 = setTimeout(() => {
      exitScale.value = withTiming(1.06, {
        duration: 400,
        easing: Easing.in(Easing.cubic),
      });
      exitOpacity.value = withTiming(0, {
        duration: 400,
        easing: Easing.in(Easing.cubic),
      }, (finished) => {
        if (finished) runOnJS(onComplete)();
      });
    }, 3000);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
      clearTimeout(t5);
      clearTimeout(t6);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ─── Animated styles ────────────────────────────────────────────────────────
  const logoStyle      = useAnimatedStyle(() => ({
    transform: [{ scale: logoScale.value }],
    opacity:   logoOpacity.value,
  }));

  const hairlineStyle  = useAnimatedStyle(() => ({
    width: hairlineW.value * 48,
  }));

  const containerStyle = useAnimatedStyle(() => ({
    transform: [{ scale: exitScale.value }],
    opacity:   exitOpacity.value,
  }));

  return (
    <Animated.View style={[s.container, containerStyle]}>
      <StatusBar barStyle="light-content" />

      {/* ── Logo group — scales as a unit ──────────────────────────────── */}
      <Animated.View style={[s.logoGroup, logoStyle]}>
        <Text style={s.logoNur}>NUR</Text>

        {showHairline && (
          <Animated.View style={[s.hairline, hairlineStyle]} />
        )}

        {showArabic && (
          <Animated.Text
            entering={FadeInDown.duration(300).springify()}
            style={s.logoArabic}
          >
            نور كافيه
          </Animated.Text>
        )}
      </Animated.View>

      {/* ── Personal welcome ───────────────────────────────────────────── */}
      <View style={s.welcomeGroup}>
        {showWelcome && (
          <Animated.Text
            entering={FadeInDown.duration(240).springify()}
            style={s.welcomeLabel}
          >
            Welcome back,
          </Animated.Text>
        )}

        {showName && (
          <Animated.Text
            entering={FadeInUp.duration(320).springify()}
            style={s.nameText}
          >
            {firstName}
          </Animated.Text>
        )}

        {showPoints && (
          <Animated.View
            entering={FadeInDown.duration(300).springify()}
            style={s.pointsRow}
          >
            <Text style={s.star}>⭐</Text>
            <Text style={s.pointsText}>
              {displayPts} pts · {tierLabel}
            </Text>
          </Animated.View>
        )}
      </View>
    </Animated.View>
  );
}

const s = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.terracotta,
    alignItems:      'center',
    justifyContent:  'center',
    zIndex:          999,
  },

  // ─── Logo ───────────────────────────────────────────────────────────────────
  logoGroup: {
    alignItems: 'center',
  },
  logoNur: {
    fontFamily:  fonts.amiriBold,
    fontSize:    72,
    color:       colors.cream,
    letterSpacing: 4,
    lineHeight:  80,
  },
  hairline: {
    height:          2,
    backgroundColor: colors.cream,
    borderRadius:    1,
    marginVertical:  10,
    overflow:        'hidden',
  },
  logoArabic: {
    fontFamily:  fonts.amiriBold,
    fontSize:    22,
    color:       colors.cream,
    letterSpacing: 3,
    textAlign:   'center',
  },

  // ─── Welcome ─────────────────────────────────────────────────────────────
  welcomeGroup: {
    alignItems:  'center',
    marginTop:   48,
  },
  welcomeLabel: {
    fontFamily:  fonts.amiri,
    fontSize:    20,
    fontStyle:   'italic',
    color:       colors.cream + 'CC', // 80% opacity
    textAlign:   'center',
  },
  nameText: {
    fontFamily:  fonts.extrabold,
    fontSize:    38,
    color:       colors.cream,
    textAlign:   'center',
    marginTop:   4,
  },
  pointsRow: {
    flexDirection:  'row',
    alignItems:     'center',
    marginTop:      14,
    gap:            6,
  },
  star: {
    fontSize: 16,
  },
  pointsText: {
    fontFamily: fonts.medium,
    fontSize:   16,
    color:      colors.cream + 'BF', // 75% opacity
  },
});
