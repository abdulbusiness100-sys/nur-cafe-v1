// src/components/GiftCardModal.tsx
// Phase 6 — Gift card detail bottom sheet: tier info + buy + send as gift
import { useEffect } from 'react';
import {
  View, Text, StyleSheet, Pressable, TouchableOpacity,
  Dimensions, Share, ScrollView,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  runOnJS,
  Easing,
  FadeIn,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import type { GiftCardTier } from '../services/giftCards';
import colors from '../theme/colors';
import { fonts } from '../theme/typography';
import { spacing, radius } from '../theme/spacing';
import { springs } from '../theme/springs';

const { height: SCREEN_H } = Dimensions.get('window');
const SHEET_H = SCREEN_H * 0.85;
const DISMISS_THRESHOLD = 80;

type Props = {
  tier:    GiftCardTier | null;
  onClose: () => void;
  onBuy:   (tier: GiftCardTier) => void;
};

export default function GiftCardModal({ tier, onClose, onBuy }: Props) {
  const translateY     = useSharedValue(SHEET_H);
  const overlayOpacity = useSharedValue(0);

  useEffect(() => {
    if (tier) {
      translateY.value     = withSpring(0, springs.modal);
      overlayOpacity.value = withTiming(1, { duration: 250 });
    } else {
      translateY.value     = withTiming(SHEET_H, { duration: 280, easing: Easing.in(Easing.quad) });
      overlayOpacity.value = withTiming(0, { duration: 250 });
    }
  }, [tier]);

  const dismiss = () => {
    translateY.value = withTiming(
      SHEET_H,
      { duration: 280, easing: Easing.in(Easing.quad) },
      (done) => { if (done) runOnJS(onClose)(); },
    );
    overlayOpacity.value = withTiming(0, { duration: 250 });
  };

  const dragGesture = Gesture.Pan()
    .runOnJS(true)
    .onUpdate((e) => {
      if (e.translationY > 0) translateY.value = e.translationY;
    })
    .onEnd((e) => {
      if (e.translationY > DISMISS_THRESHOLD || e.velocityY > 800) {
        dismiss();
      } else {
        translateY.value = withSpring(0, springs.modal);
      }
    });

  const sheetStyle   = useAnimatedStyle(() => ({ transform: [{ translateY: translateY.value }] }));
  const overlayStyle = useAnimatedStyle(() => ({ opacity: overlayOpacity.value }));

  if (!tier) return null;

  const handleSendAsGift = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await Share.share({
      message: `I'm sending you a Nūr Café ${tier.label} Gift Card worth £${tier.value}! Use it in the Nūr Café app. ☕`,
      title: `Nūr Café ${tier.label} Gift Card`,
    });
  };

  return (
    <Animated.View style={[s.overlay, overlayStyle]} pointerEvents={tier ? 'auto' : 'none'}>
      <Pressable style={s.backdrop} onPress={dismiss} />

      <GestureDetector gesture={dragGesture}>
        <Animated.View style={[s.sheet, sheetStyle]}>
          <View style={s.handle} />

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.content}>
            {/* Visual card */}
            <Animated.View
              entering={FadeIn.delay(100).duration(300)}
              style={[s.cardVisual, { backgroundColor: tier.color }]}
            >
              <Text style={s.cardBrand}>NŪR CAFÉ</Text>
              <Text style={s.cardTier}>{tier.label.toUpperCase()}</Text>
              <Text style={s.cardValue}>£{tier.value.toFixed(2)}</Text>
            </Animated.View>

            <Text style={s.tierName}>{tier.label} Gift Card</Text>
            <Text style={s.tierPrice}>£{tier.value.toFixed(2)}</Text>

            <View style={s.divider} />

            <Text style={s.sectionTitle}>What's included</Text>
            <View style={s.benefitRow}>
              <Ionicons name="star" size={16} color={colors.arabicGold} />
              <Text style={s.benefitText}>{tier.bonusPoints} loyalty points</Text>
            </View>
            <View style={s.benefitRow}>
              <Ionicons name="cafe-outline" size={16} color={colors.terracotta} />
              <Text style={s.benefitText}>
                {tier.freeItems} free drink{tier.freeItems > 1 ? 's' : ''} of your choice
              </Text>
            </View>
            <View style={s.benefitRow}>
              <Ionicons name="ribbon-outline" size={16} color={colors.terracotta} />
              <Text style={s.benefitText}>{tier.perk}</Text>
            </View>

            <View style={s.divider} />

            <Text style={s.sectionTitle}>How to use</Text>
            <Text style={s.howToText}>
              After purchasing, your gift card code will be emailed to you.
              Enter the code at checkout to redeem your balance.
            </Text>

            <View style={{ height: spacing['2xl'] }} />

            <Pressable
              style={({ pressed }) => [s.buyBtn, pressed && { opacity: 0.88 }]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                onBuy(tier);
              }}
            >
              <Text style={s.buyBtnText}>BUY FOR £{tier.value.toFixed(2)}</Text>
            </Pressable>

            <TouchableOpacity style={s.sendBtn} onPress={handleSendAsGift} activeOpacity={0.8}>
              <Ionicons name="gift-outline" size={16} color={colors.terracotta} />
              <Text style={s.sendBtnText}>SEND AS GIFT</Text>
            </TouchableOpacity>
          </ScrollView>
        </Animated.View>
      </GestureDetector>
    </Animated.View>
  );
}

const s = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex:         100,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  sheet: {
    height:               SHEET_H,
    backgroundColor:      colors.cream,
    borderTopLeftRadius:  radius['3xl'],
    borderTopRightRadius: radius['3xl'],
    shadowColor:          colors.deepBrown,
    shadowOpacity:        0.15,
    shadowRadius:         20,
    shadowOffset:         { width: 0, height: -6 },
    elevation:            16,
  },
  handle: {
    width:           36,
    height:          4,
    borderRadius:    2,
    backgroundColor: colors.creamDeep,
    alignSelf:       'center',
    marginTop:       spacing.md,
    marginBottom:    spacing.sm,
  },
  content: {
    paddingHorizontal: spacing['2xl'],
    paddingBottom:     spacing['3xl'],
  },
  cardVisual: {
    width:          280,
    height:         175,
    borderRadius:   radius.xl,
    alignSelf:      'center',
    marginVertical: spacing.xl,
    padding:        spacing.xl,
    justifyContent: 'space-between',
    borderWidth:    1.5,
    borderColor:    'rgba(255,255,255,0.2)',
    shadowColor:    '#000',
    shadowOpacity:  0.2,
    shadowRadius:   12,
    shadowOffset:   { width: 0, height: 6 },
    elevation:      8,
  },
  cardBrand: {
    fontFamily:    fonts.amiriBold,
    fontSize:      14,
    color:         'rgba(255,255,255,0.85)',
    letterSpacing: 3,
  },
  cardTier: {
    fontFamily:    fonts.extrabold,
    fontSize:      22,
    color:         '#FFF',
    letterSpacing: 2,
  },
  cardValue: {
    fontFamily: fonts.amiriBold,
    fontSize:   32,
    color:      '#FFF',
  },
  tierName: {
    fontFamily: fonts.extrabold,
    fontSize:   24,
    color:      colors.deepBrown,
    textAlign:  'center',
  },
  tierPrice: {
    fontFamily:   fonts.amiriBold,
    fontSize:     20,
    color:        colors.terracotta,
    textAlign:    'center',
    marginTop:    spacing.xs,
    marginBottom: spacing.lg,
  },
  divider: {
    height:          1,
    backgroundColor: colors.creamDeep,
    marginVertical:  spacing.lg,
  },
  sectionTitle: {
    fontFamily:   fonts.bold,
    fontSize:     16,
    color:        colors.deepBrown,
    marginBottom: spacing.md,
  },
  benefitRow: {
    flexDirection: 'row',
    alignItems:    'center',
    gap:           spacing.sm,
    marginBottom:  spacing.sm,
  },
  benefitText: {
    fontFamily: fonts.medium,
    fontSize:   14,
    color:      colors.subText,
    flex:       1,
  },
  howToText: {
    fontFamily: fonts.regular,
    fontSize:   14,
    color:      colors.subText,
    lineHeight: 22,
  },
  buyBtn: {
    backgroundColor: colors.terracotta,
    height:          56,
    borderRadius:    14,
    alignItems:      'center',
    justifyContent:  'center',
    marginBottom:    spacing.md,
  },
  buyBtnText: {
    fontFamily:    fonts.extrabold,
    fontSize:      15,
    color:         colors.cream,
    letterSpacing: 1.5,
  },
  sendBtn: {
    height:         48,
    borderRadius:   14,
    borderWidth:    1.5,
    borderColor:    colors.terracotta,
    alignItems:     'center',
    justifyContent: 'center',
    flexDirection:  'row',
    gap:            spacing.sm,
  },
  sendBtnText: {
    fontFamily:    fonts.extrabold,
    fontSize:      13,
    color:         colors.terracotta,
    letterSpacing: 1.2,
  },
});
