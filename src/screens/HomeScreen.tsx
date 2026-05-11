// src/screens/HomeScreen.tsx
// Phase 3 redesign — sand background, Arabic greeting header, float carousel, upgraded loyalty card
import { useMemo, useEffect, useState } from 'react';
import {
  View, Text, ScrollView, Image, StyleSheet,
  TouchableOpacity, Pressable, Dimensions, TextInput,
  Alert, Keyboard,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import Animated, {
  FadeInDown, FadeInRight,
  useSharedValue, useAnimatedStyle,
  withRepeat, withTiming, withSequence, withSpring,
  Easing,
} from 'react-native-reanimated';
import type { RootStackParamList } from '../navigation/types';
import { featured, menu } from '../data/menu';
import { resolveImage } from '../utils/imageHelper';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { supabase } from '../config/supabase';
import colors from '../theme/colors';
import { fonts } from '../theme/typography';
import { spacing, radius, shadow } from '../theme/spacing';
import { springs } from '../theme/springs';

const { width: W } = Dimensions.get('window');
const CARD_W = W * 0.84;

const TIER_CONFIG = {
  bronze: { label: 'Bronze',  color: colors.bronze,     next: 50  as number | null },
  silver: { label: 'Silver',  color: colors.silver,     next: 150 as number | null },
  gold:   { label: 'Gold',    color: colors.gold,        next: null as number | null },
};

// Tier highlight color — arabicGold for Silver/Gold, bronze color for Bronze
const TIER_TEXT_COLOR = {
  bronze: colors.bronze,
  silver: colors.arabicGold,
  gold:   colors.gold,
};

const PROMOS = [
  {
    id: 'p1', headline: 'Double Points',
    subline: 'Every order this week earns 2× loyalty points.',
    icon: 'star' as const, accent: colors.gold,
  },
  {
    id: 'p2', headline: 'Birthday Drink',
    subline: "It's your birthday month? Get a complimentary drink on us.",
    icon: 'gift' as const, accent: '#EC4899',
  },
  {
    id: 'p3', headline: 'Refer a Friend',
    subline: 'Share your code and both of you earn 20 bonus points.',
    icon: 'people' as const, accent: '#10B981',
  },
];

export default function HomeScreen() {
  const nav = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { profile } = useAuth();
  const { totalItems } = useCart();

  const [promoIndex,   setPromoIndex]   = useState(0);
  const [email,        setEmail]        = useState('');
  const [subscribing,  setSubscribing]  = useState(false);
  const [subscribed,   setSubscribed]   = useState(false);

  // ─── Computed values ───────────────────────────────────────────────────────
  const userName = profile?.name ?? 'Guest';
  const initial  = userName.charAt(0).toUpperCase();
  const points   = profile?.points ?? 0;
  const tier     = (profile?.tier ?? 'bronze') as keyof typeof TIER_CONFIG;
  const tierCfg  = TIER_CONFIG[tier];
  const tierTextColor = TIER_TEXT_COLOR[tier];
  const nextMilestone = tierCfg.next;
  const progress      = nextMilestone ? Math.min(points / nextMilestone, 1) : 1;

  const popularPicks = useMemo(
    () => Object.values(menu).flat().filter((m) => m.image).slice(0, 4),
    []
  );

  // ─── Greetings — Arabic + English by time of day ───────────────────────────
  const { arabicGreeting, englishGreeting } = useMemo(() => {
    const h = new Date().getHours();
    if (h < 5)  return { arabicGreeting: 'ليلة طيبة،',  englishGreeting: 'Good night,' };
    if (h < 12) return { arabicGreeting: 'صباح النور،', englishGreeting: 'Good morning,' };
    if (h < 20) return { arabicGreeting: 'مساء النور،', englishGreeting: 'Good afternoon,' };
    return       { arabicGreeting: 'ليلة طيبة،',  englishGreeting: 'Good evening,' };
  }, []);

  // ─── Auto-rotate promo banner ──────────────────────────────────────────────
  useEffect(() => {
    const id = setInterval(() => setPromoIndex((i) => (i + 1) % PROMOS.length), 4000);
    return () => clearInterval(id);
  }, []);

  // ─── Points pill pulse — every 8s ─────────────────────────────────────────
  const pillScale = useSharedValue(1);
  useEffect(() => {
    const pulse = () => {
      pillScale.value = withSequence(
        withSpring(1.04, springs.pill),
        withSpring(1.0,  springs.pill),
      );
    };
    const id = setInterval(pulse, 8000);
    return () => clearInterval(id);
  }, []);
  const pillStyle = useAnimatedStyle(() => ({ transform: [{ scale: pillScale.value }] }));

  // ─── Featured carousel float animation ─────────────────────────────────────
  const floatY = useSharedValue(0);
  useEffect(() => {
    floatY.value = withRepeat(
      withSequence(
        withTiming(-4, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
        withTiming( 4, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
      ),
      -1,
      true,
    );
  }, []);
  const floatStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: floatY.value }],
  }));

  // ─── Loyalty progress bar ──────────────────────────────────────────────────
  const barWidth = useSharedValue(0);
  useEffect(() => {
    barWidth.value = withTiming(progress, { duration: 1200, easing: Easing.out(Easing.cubic) });
  }, [progress]);
  const barStyle = useAnimatedStyle(() => ({
    width: `${Math.round(barWidth.value * 100)}%` as any,
  }));

  // ─── Newsletter ───────────────────────────────────────────────────────────
  const handleSubscribe = async () => {
    if (!email.trim() || !email.includes('@')) {
      Alert.alert('Invalid email', 'Please enter a valid email address.');
      return;
    }
    setSubscribing(true);
    Keyboard.dismiss();
    try {
      await (supabase as any)
        .from('newsletter_subscribers')
        .upsert({ email: email.trim().toLowerCase() }, { onConflict: 'email' });
      setSubscribed(true);
    } catch {
      setSubscribed(true);
    } finally {
      setSubscribing(false);
    }
  };

  const promo = PROMOS[promoIndex];

  return (
    <SafeAreaView style={s.safe}>

      {/* ── Top navigation bar ──────────────────────────────────────────── */}
      <View style={s.topbar}>
        <Pressable
          onPress={() => nav.navigate('Profile')}
          style={s.avatar}
          accessibilityLabel="Open profile"
        >
          <Text style={s.avatarInitial}>{initial}</Text>
        </Pressable>

        <View style={s.greetingBlock}>
          {/* Arabic greeting — Amiri 400, terracottaDark */}
          <Text style={s.arabicGreeting} numberOfLines={1}>
            {arabicGreeting} {userName.split(' ')[0]}
          </Text>
          {/* English greeting — Manrope 800, deepBrown */}
          <Text style={s.englishGreeting} numberOfLines={1}>
            {englishGreeting} {userName.split(' ')[0]}
          </Text>
        </View>

        {/* Points pill */}
        <Animated.View style={pillStyle}>
          <TouchableOpacity
            style={s.pointsPill}
            onPress={() => {
              Haptics.selectionAsync();
              nav.navigate('Loyalty' as any);
            }}
            activeOpacity={0.85}
          >
            <Text style={s.pillStar}>⭐</Text>
            <Text style={s.pillText}>{points} pts</Text>
          </TouchableOpacity>
        </Animated.View>

        {/* Cart button */}
        <TouchableOpacity
          style={s.cartBtn}
          onPress={() => nav.navigate('Cart')}
          accessibilityLabel={`Cart, ${totalItems} items`}
        >
          <Ionicons name="bag-outline" size={20} color={colors.terracotta} />
          {totalItems > 0 && (
            <View style={s.cartBadge}>
              <Text style={s.cartBadgeText}>{totalItems}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 48 }}
      >

        {/* ── "What's new" hero carousel ──────────────────────────────── */}
        <Animated.Text
          entering={FadeInDown.delay(60).springify()}
          style={s.sectionTitle}
        >
          What's new
        </Animated.Text>

        <Animated.View entering={FadeInRight.delay(100).springify()}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            snapToInterval={CARD_W + spacing.md}
            decelerationRate="fast"
            contentContainerStyle={{ paddingHorizontal: spacing.base, gap: spacing.md }}
          >
            {featured.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={s.heroCard}
                activeOpacity={0.95}
                onPress={() => nav.navigate('Product', { item })}
              >
                {/* Float wrapper around image only */}
                <Animated.View style={[StyleSheet.absoluteFillObject, floatStyle]}>
                  {resolveImage(item.image)
                    ? <Image source={resolveImage(item.image) as any} style={s.heroImg} />
                    : <View style={[s.heroImg, { backgroundColor: colors.creamDeep }]} />
                  }
                </Animated.View>

                {/* Frosted glass content panel — rgba instead of LinearGradient */}
                <View style={s.heroGlassPanel}>
                  <Text style={s.heroSeason}>Signature</Text>
                  <Text style={s.heroName} numberOfLines={2}>{item.name}</Text>
                  <View style={s.heroRow}>
                    <Text style={s.heroPrice}>£{item.price.toFixed(2)}</Text>
                    <View style={s.heroBtn}>
                      <Text style={s.heroBtnText}>ORDER NOW</Text>
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </Animated.View>

        {/* ── Promotional rotating banner ─────────────────────────────── */}
        <Animated.View entering={FadeInDown.delay(160).springify()} style={s.promoBanner}>
          <View style={[s.promoIconWrap, { backgroundColor: promo.accent + '22' }]}>
            <Ionicons name={promo.icon} size={22} color={promo.accent} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={s.promoHeadline}>{promo.headline}</Text>
            <Text style={s.promoSub}>{promo.subline}</Text>
          </View>
          <View style={s.promoDots}>
            {PROMOS.map((_, i) => (
              <TouchableOpacity key={i} onPress={() => setPromoIndex(i)}>
                <View style={[s.promoDot, i === promoIndex && s.promoDotActive]} />
              </TouchableOpacity>
            ))}
          </View>
        </Animated.View>

        {/* ── Loyalty / Rewards card — glassmorphic ───────────────────── */}
        <Animated.View entering={FadeInDown.delay(220).springify()} style={s.rewardsCard}>
          {/* Subtle watermark */}
          <Text style={s.watermark}>NŪR</Text>

          <View style={s.tierRow}>
            <View style={[s.tierBadge, { backgroundColor: tierCfg.color + '18' }]}>
              <View style={[s.tierDot, { backgroundColor: tierCfg.color }]} />
              <Text style={[s.tierLabel, { color: tierTextColor }]}>
                {tierCfg.label.toUpperCase()}
              </Text>
            </View>
            <Text style={s.rewardsHeading}>Rewards</Text>
          </View>

          <View style={s.pointsRow}>
            <Ionicons name="star" size={18} color={colors.arabicGold} />
            <Text style={s.pointsValue}> {points}</Text>
            <Text style={s.pointsUnit}> {points === 1 ? 'point' : 'points'}</Text>
          </View>

          {nextMilestone ? (
            <>
              <View style={s.progressTrack}>
                <Animated.View style={[s.progressFill, barStyle]} />
              </View>
              <View style={s.progressLabels}>
                <Text style={s.progressLabel}>{points} pts</Text>
                <Text style={s.progressLabel}>
                  {nextMilestone - points} pts to {tier === 'bronze' ? 'Silver' : 'Gold'}
                </Text>
              </View>
            </>
          ) : (
            <Text style={s.goldText}>You've reached Gold — maximum tier!</Text>
          )}

          <TouchableOpacity
            style={s.redeemBtn}
            activeOpacity={0.9}
            onPress={() => {
              Haptics.selectionAsync();
              nav.navigate('Cart');
            }}
          >
            <Ionicons name="star" size={14} color={colors.cream} />
            <Text style={s.redeemBtnText}>REDEEM AT CHECKOUT</Text>
          </TouchableOpacity>
        </Animated.View>

        {/* ── Popular picks ──────────────────────────────────────────── */}
        <Animated.View entering={FadeInDown.delay(280).springify()}>
          <View style={s.rowHeader}>
            <Text style={s.sectionTitle}>Popular picks</Text>
            <TouchableOpacity onPress={() => nav.navigate('Order' as any)}>
              <Text style={s.seeAll}>See all →</Text>
            </TouchableOpacity>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: spacing.base, gap: spacing.sm }}
          >
            {popularPicks.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={s.pickCard}
                activeOpacity={0.9}
                onPress={() => nav.navigate('Product', { item })}
              >
                {resolveImage(item.image)
                  ? <Image source={resolveImage(item.image) as any} style={s.pickImg} />
                  : <View style={[s.pickImg, { backgroundColor: colors.creamDeep }]} />
                }
                <View style={s.pickInfo}>
                  <Text style={s.pickName} numberOfLines={1}>{item.name}</Text>
                  <Text style={s.pickPrice}>£{item.price.toFixed(2)}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </Animated.View>

        {/* ── Newsletter signup ───────────────────────────────────────── */}
        <Animated.View entering={FadeInDown.delay(340).springify()} style={s.newsletterCard}>
          <LinearGradient
            colors={[colors.terracottaDark, colors.terracotta]}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
            style={StyleSheet.absoluteFillObject}
          />
          <Ionicons name="mail" size={24} color={colors.cream} style={{ marginBottom: spacing.sm }} />
          <Text style={s.newsletterTitle}>Stay in the loop</Text>
          <Text style={s.newsletterSub}>
            Get exclusive offers, seasonal menus, and events straight to your inbox.
          </Text>
          {subscribed ? (
            <View style={s.subscribedRow}>
              <Ionicons name="checkmark-circle" size={18} color="#10B981" />
              <Text style={s.subscribedText}>You're in! Check your inbox.</Text>
            </View>
          ) : (
            <View style={s.emailRow}>
              <TextInput
                style={s.emailInput}
                value={email}
                onChangeText={setEmail}
                placeholder="your@email.com"
                placeholderTextColor="rgba(255,255,255,0.45)"
                keyboardType="email-address"
                autoCapitalize="none"
                returnKeyType="done"
                onSubmitEditing={handleSubscribe}
              />
              <TouchableOpacity
                style={[s.subscribeBtn, subscribing && { opacity: 0.7 }]}
                onPress={handleSubscribe}
                disabled={subscribing}
                activeOpacity={0.85}
              >
                <Text style={s.subscribeBtnText}>{subscribing ? '...' : 'JOIN'}</Text>
              </TouchableOpacity>
            </View>
          )}
          <Text style={s.newsletterWatermark}>NŪR</Text>
        </Animated.View>

        {/* ── View full menu CTA ──────────────────────────────────────── */}
        <Animated.View entering={FadeInDown.delay(380).springify()}>
          <TouchableOpacity
            style={s.menuCta}
            activeOpacity={0.9}
            onPress={() => nav.navigate('Order' as any)}
          >
            <Ionicons name="cafe" size={20} color={colors.terracotta} />
            <Text style={s.menuCtaText}>VIEW FULL MENU</Text>
            <Ionicons name="arrow-forward" size={16} color={colors.terracotta} />
          </TouchableOpacity>
        </Animated.View>

      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.sand },

  // ─── Top bar ─────────────────────────────────────────────────────────────
  topbar: {
    flexDirection:     'row',
    alignItems:        'center',
    paddingHorizontal: spacing.base,
    paddingBottom:     spacing.base,
    paddingTop:        spacing.xs,
    gap:               spacing.sm,
  },
  avatar: {
    width:           40,
    height:          40,
    borderRadius:    radius.full,
    backgroundColor: colors.cream,
    alignItems:      'center',
    justifyContent:  'center',
    borderWidth:     1,
    borderColor:     colors.creamDeep,
  },
  avatarInitial: {
    fontFamily: fonts.extrabold,
    fontSize:   16,
    color:      colors.terracotta,
  },
  greetingBlock: {
    flex: 1,
  },
  arabicGreeting: {
    fontFamily: fonts.amiri,
    fontSize:   17,
    color:      colors.terracottaDark,
    lineHeight: 22,
  },
  englishGreeting: {
    fontFamily: fonts.extrabold,
    fontSize:   20,
    color:      colors.deepBrown,
    lineHeight: 26,
    marginTop:  -2,
  },
  pointsPill: {
    flexDirection:     'row',
    alignItems:        'center',
    backgroundColor:   colors.terracotta,
    borderRadius:      20,
    paddingHorizontal: 12,
    paddingVertical:   6,
    gap:               4,
  },
  pillStar: { fontSize: 12 },
  pillText: {
    fontFamily: fonts.bold,
    fontSize:   13,
    color:      colors.cream,
  },
  cartBtn: {
    width:           36,
    height:          36,
    borderRadius:    radius.full,
    backgroundColor: colors.cream,
    alignItems:      'center',
    justifyContent:  'center',
    borderWidth:     1,
    borderColor:     colors.creamDeep,
  },
  cartBadge: {
    position:          'absolute',
    top:               4,
    right:             4,
    minWidth:          14,
    height:            14,
    borderRadius:      7,
    backgroundColor:   colors.terracotta,
    alignItems:        'center',
    justifyContent:    'center',
    paddingHorizontal: 2,
    borderWidth:       1.5,
    borderColor:       colors.cream,
  },
  cartBadgeText: {
    color:      colors.cream,
    fontSize:   9,
    fontFamily: fonts.extrabold,
    lineHeight: 11,
  },

  sectionTitle: {
    fontFamily:        fonts.extrabold,
    fontSize:          20,
    color:             colors.deepBrown,
    paddingHorizontal: spacing.base,
    marginTop:         spacing.xl,
    marginBottom:      spacing.md,
  },
  rowHeader: {
    flexDirection:  'row',
    alignItems:     'center',
    justifyContent: 'space-between',
    paddingRight:   spacing.base,
  },
  seeAll: {
    fontFamily: fonts.semibold,
    fontSize:   13,
    color:      colors.subText,
    letterSpacing: 0.3,
  },

  // ─── Hero card carousel ──────────────────────────────────────────────────
  heroCard: {
    width:           CARD_W,
    height:          CARD_W * 1.05,
    borderRadius:    radius['3xl'],
    overflow:        'hidden',
    backgroundColor: colors.creamDeep,
    ...shadow.card,
  },
  heroImg: {
    width:  '100%',
    height: '110%', // slightly oversize so float doesn't clip
    top:    '-5%',
  },
  heroGlassPanel: {
    position:         'absolute',
    left:             0,
    right:            0,
    bottom:           0,
    padding:          spacing.xl,
    backgroundColor:  'rgba(20, 10, 5, 0.55)',
    borderTopWidth:   1,
    borderTopColor:   'rgba(255,255,255,0.08)',
  },
  heroSeason: {
    fontFamily:    fonts.semibold,
    fontSize:      11,
    color:         'rgba(255,255,255,0.70)',
    letterSpacing: 2,
    marginBottom:  4,
    textTransform: 'uppercase' as const,
  },
  heroName: {
    fontFamily:       fonts.extrabold,
    fontSize:         24,
    color:            '#FFF',
    lineHeight:       28,
    textShadowColor:  'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 6,
  },
  heroRow: {
    flexDirection:  'row',
    alignItems:     'center',
    justifyContent: 'space-between',
    marginTop:      spacing.md,
  },
  heroPrice: {
    fontFamily: fonts.extrabold,
    fontSize:   22,
    color:      '#FFF',
  },
  heroBtn: {
    backgroundColor:  'rgba(255,255,255,0.15)',
    borderRadius:     radius.full,
    paddingHorizontal: spacing.base,
    paddingVertical:  spacing.sm,
    borderWidth:      1,
    borderColor:      'rgba(255,255,255,0.25)',
  },
  heroBtnText: {
    fontFamily:    fonts.extrabold,
    fontSize:      11,
    color:         '#FFF',
    letterSpacing: 1.5,
    textTransform: 'uppercase' as const,
  },

  // ─── Promo banner ────────────────────────────────────────────────────────
  promoBanner: {
    marginHorizontal: spacing.base,
    marginTop:        spacing.lg,
    backgroundColor:  colors.cream,
    borderRadius:     radius.xl,
    borderWidth:      1,
    borderColor:      colors.creamDeep,
    padding:          spacing.base,
    flexDirection:    'row',
    alignItems:       'center',
    gap:              spacing.md,
    ...shadow.sm,
  },
  promoIconWrap: {
    width:          46,
    height:         46,
    borderRadius:   radius.lg,
    alignItems:     'center',
    justifyContent: 'center',
  },
  promoHeadline: {
    fontFamily:   fonts.bold,
    fontSize:     15,
    color:        colors.deepBrown,
    marginBottom: 2,
  },
  promoSub: {
    fontFamily:  fonts.regular,
    fontSize:    13,
    color:       colors.subText,
    lineHeight:  17,
  },
  promoDots: {
    flexDirection: 'column',
    gap:           5,
    alignItems:    'center',
  },
  promoDot: {
    width:           6,
    height:          6,
    borderRadius:    3,
    backgroundColor: colors.creamDeep,
  },
  promoDotActive: {
    backgroundColor: colors.terracotta,
    width:           16,
  },

  // ─── Loyalty card — glassmorphic treatment ───────────────────────────────
  rewardsCard: {
    marginHorizontal: spacing.base,
    marginTop:        spacing.lg,
    backgroundColor:  colors.terracotta,
    borderRadius:     radius['2xl'],
    padding:          spacing.base,
    overflow:         'hidden',
    ...shadow.card,
  },
  tierRow: {
    flexDirection:  'row',
    alignItems:     'center',
    justifyContent: 'space-between',
    marginBottom:   spacing.base,
  },
  tierBadge: {
    flexDirection:     'row',
    alignItems:        'center',
    gap:               spacing.xs,
    borderRadius:      radius.full,
    paddingHorizontal: spacing.sm,
    paddingVertical:   5,
  },
  tierDot:   { width: 8, height: 8, borderRadius: 4 },
  tierLabel: {
    fontFamily:    fonts.bold,
    fontSize:      10,
    letterSpacing: 1.2,
    textTransform: 'uppercase' as const,
  },
  rewardsHeading: {
    fontFamily: fonts.extrabold,
    fontSize:   22,
    color:      colors.cream,
  },
  pointsRow: {
    flexDirection: 'row',
    alignItems:    'baseline',
    marginBottom:  spacing.sm,
  },
  pointsValue: {
    fontFamily: fonts.extrabold,
    fontSize:   32,
    color:      colors.cream,
  },
  pointsUnit: {
    fontFamily: fonts.medium,
    fontSize:   15,
    color:      colors.cream,
    opacity:    0.75,
  },
  progressTrack: {
    height:          6,
    backgroundColor: 'rgba(239,229,216,0.25)',
    borderRadius:    6,
    overflow:        'hidden',
    marginBottom:    spacing.xs,
  },
  progressFill: {
    height:          '100%',
    backgroundColor: colors.cream,
    borderRadius:    6,
  },
  progressLabels: {
    flexDirection:  'row',
    justifyContent: 'space-between',
    marginBottom:   spacing.base,
  },
  progressLabel: {
    fontFamily: fonts.medium,
    fontSize:   12,
    color:      colors.cream,
    opacity:    0.65,
  },
  goldText: {
    fontFamily:   fonts.medium,
    fontSize:     13,
    color:        colors.cream,
    opacity:      0.8,
    marginBottom: spacing.base,
  },
  redeemBtn: {
    flexDirection:    'row',
    alignItems:       'center',
    justifyContent:   'center',
    gap:              spacing.xs,
    backgroundColor:  'rgba(255,255,255,0.12)',
    borderRadius:     radius.full,
    paddingVertical:  spacing.base,
    borderWidth:      1,
    borderColor:      'rgba(255,255,255,0.20)',
  },
  redeemBtnText: {
    fontFamily:    fonts.extrabold,
    fontSize:      12,
    color:         colors.cream,
    letterSpacing: 1.5,
    textTransform: 'uppercase' as const,
  },
  watermark: {
    position:    'absolute',
    right:       spacing.md,
    bottom:      spacing.sm,
    fontSize:    72,
    color:       'rgba(255,255,255,0.06)',
    fontFamily:  fonts.amiriBold,
  },

  // ─── Popular picks ───────────────────────────────────────────────────────
  pickCard: {
    width:           140,
    backgroundColor: colors.cream,
    borderRadius:    radius.xl,
    overflow:        'hidden',
    borderWidth:     1,
    borderColor:     colors.creamDeep,
    ...shadow.sm,
  },
  pickImg:  { width: '100%', height: 110 },
  pickInfo: { padding: spacing.sm },
  pickName: {
    fontFamily:   fonts.bold,
    fontSize:     13,
    color:        colors.deepBrown,
    marginBottom: 2,
  },
  pickPrice: {
    fontFamily: fonts.extrabold,
    fontSize:   13,
    color:      colors.terracotta,
  },

  // ─── Newsletter ──────────────────────────────────────────────────────────
  newsletterCard: {
    marginHorizontal: spacing.base,
    marginTop:        spacing.xl,
    borderRadius:     radius['2xl'],
    overflow:         'hidden',
    padding:          spacing.xl,
    ...shadow.card,
  },
  newsletterTitle: {
    fontFamily:   fonts.extrabold,
    fontSize:     22,
    color:        colors.cream,
    marginBottom: spacing.xs,
  },
  newsletterSub: {
    fontFamily:   fonts.medium,
    fontSize:     14,
    color:        'rgba(239,229,216,0.8)',
    marginBottom: spacing.base,
    lineHeight:   22,
  },
  emailRow:     { flexDirection: 'row', gap: spacing.sm },
  emailInput:   {
    flex:            1,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius:    radius.full,
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.md,
    color:           '#FFF',
    fontFamily:      fonts.regular,
    fontSize:        14,
    borderWidth:     1,
    borderColor:     'rgba(255,255,255,0.25)',
  },
  subscribeBtn: {
    backgroundColor: colors.cream,
    borderRadius:    radius.full,
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.md,
    justifyContent:  'center',
  },
  subscribeBtnText: {
    fontFamily:    fonts.extrabold,
    fontSize:      12,
    color:         colors.terracotta,
    letterSpacing: 1,
  },
  subscribedRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  subscribedText: {
    fontFamily: fonts.medium,
    fontSize:   14,
    color:      'rgba(239,229,216,0.9)',
  },
  newsletterWatermark: {
    position:   'absolute',
    right:      spacing.md,
    bottom:     -8,
    fontSize:   72,
    color:      'rgba(255,255,255,0.05)',
    fontFamily: fonts.amiriBold,
  },

  // ─── Menu CTA ────────────────────────────────────────────────────────────
  menuCta: {
    marginHorizontal: spacing.base,
    marginTop:        spacing.base,
    flexDirection:    'row',
    alignItems:       'center',
    justifyContent:   'center',
    gap:              spacing.sm,
    backgroundColor:  colors.cream,
    borderRadius:     radius.full,
    paddingVertical:  spacing.base,
    borderWidth:      1,
    borderColor:      colors.creamDeep,
  },
  menuCtaText: {
    fontFamily:    fonts.extrabold,
    fontSize:      13,
    color:         colors.terracotta,
    letterSpacing: 1.5,
    textTransform: 'uppercase' as const,
  },
});
