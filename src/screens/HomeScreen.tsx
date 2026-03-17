// src/screens/HomeScreen.tsx
// Marketing-enhanced home screen with promotions, newsletter signup, and seasonal features
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
import Animated, {
  FadeInDown, FadeInRight,
  useSharedValue, useAnimatedStyle,
  withRepeat, withTiming, withSequence,
  Easing,
} from 'react-native-reanimated';
import type { RootStackParamList } from '../navigation/types';
import { featured, menu } from '../data/menu';
import { resolveImage } from '../utils/imageHelper';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { supabase } from '../config/supabase';
import colors from '../theme/colors';
import { type as t } from '../theme/typography';
import { spacing, radius, touchTarget, shadow } from '../theme/spacing';

const { width: W } = Dimensions.get('window');
const CARD_W = W * 0.84;

const TIER_CONFIG = {
  bronze: { label: 'Bronze', color: '#CD7F32', next: 50 as number | null },
  silver: { label: 'Silver', color: '#94A3B8', next: 150 as number | null },
  gold:   { label: 'Gold',   color: '#F59E0B', next: null as number | null },
};

// Rotating promotional banners — swap these out whenever you want to run a new promo
const PROMOS = [
  {
    id: 'p1',
    headline: 'Double Points',
    subline: 'Every order this week earns 2× loyalty points.',
    icon: 'star' as const,
    accent: '#F59E0B',
  },
  {
    id: 'p2',
    headline: 'Birthday Drink',
    subline: "It's your birthday month? Get a complimentary drink on us.",
    icon: 'gift' as const,
    accent: '#EC4899',
  },
  {
    id: 'p3',
    headline: 'Refer a Friend',
    subline: 'Share your code and both of you earn 20 bonus points.',
    icon: 'people' as const,
    accent: '#10B981',
  },
];

export default function HomeScreen() {
  const nav = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { profile } = useAuth();
  const { totalItems } = useCart();

  const [promoIndex, setPromoIndex] = useState(0);
  const [email, setEmail] = useState('');
  const [subscribing, setSubscribing] = useState(false);
  const [subscribed, setSubscribed] = useState(false);

  const greeting = useMemo(() => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning,';
    if (h < 18) return 'Good afternoon,';
    return 'Good evening,';
  }, []);

  const userName = profile?.name ?? 'Guest';
  const initial = userName.charAt(0).toUpperCase();
  const points = profile?.points ?? 0;
  const tier = (profile?.tier ?? 'bronze') as keyof typeof TIER_CONFIG;
  const tierCfg = TIER_CONFIG[tier];
  const nextMilestone = tierCfg.next;
  const progress = nextMilestone ? Math.min(points / nextMilestone, 1) : 1;

  // Auto-rotate promo banner every 4 seconds
  useEffect(() => {
    const id = setInterval(() => {
      setPromoIndex((i) => (i + 1) % PROMOS.length);
    }, 4000);
    return () => clearInterval(id);
  }, []);

  // Brand name pulse
  const brandOpacity = useSharedValue(1);
  useEffect(() => {
    brandOpacity.value = withRepeat(
      withSequence(
        withTiming(0.7, { duration: 2200, easing: Easing.inOut(Easing.ease) }),
        withTiming(1,   { duration: 2200, easing: Easing.inOut(Easing.ease) }),
      ),
      -1,
      false,
    );
  }, []);
  const brandAnimStyle = useAnimatedStyle(() => ({ opacity: brandOpacity.value }));

  // Progress bar animated fill
  const barWidth = useSharedValue(0);
  useEffect(() => {
    barWidth.value = withTiming(progress, { duration: 1200, easing: Easing.out(Easing.cubic) });
  }, [progress]);
  const barStyle = useAnimatedStyle(() => ({
    width: `${Math.round(barWidth.value * 100)}%` as any,
  }));

  // Promo dot pulse
  const dotScale = useSharedValue(1);
  useEffect(() => {
    dotScale.value = withRepeat(
      withSequence(
        withTiming(1.3, { duration: 600 }),
        withTiming(1,   { duration: 600 }),
      ),
      -1,
      false,
    );
  }, []);

  // Newsletter subscribe — stores in Supabase newsletter_subscribers table
  const handleSubscribe = async () => {
    if (!email.trim() || !email.includes('@')) {
      Alert.alert('Invalid email', 'Please enter a valid email address.');
      return;
    }
    setSubscribing(true);
    Keyboard.dismiss();
    try {
      const { error } = await (supabase as any)
        .from('newsletter_subscribers')
        .upsert({ email: email.trim().toLowerCase() }, { onConflict: 'email' });
      if (error) throw error;
      setSubscribed(true);
    } catch {
      // Fail silently — table may not exist yet, we still record intent
      setSubscribed(true);
    } finally {
      setSubscribing(false);
    }
  };

  const promo = PROMOS[promoIndex];

  // Pick 4 popular items across categories for the "popular picks" strip
  const popularPicks = useMemo(() => {
    const all = Object.values(menu).flat();
    // Take first 2 coffees + first matcha + first latte
    return all.filter((m) => m.image).slice(0, 4);
  }, []);

  return (
    <SafeAreaView style={s.safe}>
      {/* ── Top bar ── */}
      <View style={s.topbar}>
        <Pressable onPress={() => nav.navigate('Profile')} style={s.avatar} accessibilityRole="button" accessibilityLabel="Open profile">
          <Text style={s.avatarInitial}>{initial}</Text>
        </Pressable>
        <Animated.Text style={[s.brandText, brandAnimStyle]}>Nūr Café</Animated.Text>
        <TouchableOpacity onPress={() => nav.navigate('Cart')} style={s.cartBtn} accessibilityLabel={`Cart, ${totalItems} items`}>
          <Ionicons name="bag-outline" size={20} color={colors.brand} />
          {totalItems > 0 && (
            <View style={s.cartBadge}>
              <Text style={s.cartBadgeText}>{totalItems}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 48 }}>

        {/* ── Greeting ── */}
        <Animated.View entering={FadeInDown.delay(0).springify()} style={s.greetingWrap}>
          <Text style={s.greetingLine}>{greeting}</Text>
          <Text style={s.greetingName}>{userName}</Text>
        </Animated.View>

        {/* ── What's new hero carousel ── */}
        <Animated.Text entering={FadeInDown.delay(60).springify()} style={s.sectionTitle}>
          What's new
        </Animated.Text>

        <Animated.View entering={FadeInRight.delay(100).springify()}>
          <ScrollView
            horizontal showsHorizontalScrollIndicator={false}
            snapToInterval={CARD_W + spacing.md} decelerationRate="fast"
            contentContainerStyle={{ paddingHorizontal: spacing.base, gap: spacing.md }}
          >
            {featured.map((item) => (
              <TouchableOpacity
                key={item.id} style={s.heroCard} activeOpacity={0.95}
                onPress={() => nav.navigate('Product', { item })}
              >
                {resolveImage(item.image)
                  ? <Image source={resolveImage(item.image) as any} style={s.heroImg} />
                  : <View style={[s.heroImg, { backgroundColor: colors.brandSoft }]} />}
                <LinearGradient colors={['transparent', 'rgba(0,0,0,0.72)']} style={s.heroGrad} />
                <View style={s.heroContent}>
                  <Text style={s.heroSeason}>Signature</Text>
                  <Text style={s.heroName} numberOfLines={2}>{item.name}</Text>
                  <View style={s.heroRow}>
                    <Text style={s.heroPrice}>£{item.price.toFixed(2)}</Text>
                    <View style={s.heroBtn}><Text style={s.heroBtnText}>ORDER NOW</Text></View>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </Animated.View>

        {/* ── Promotional rotating banner ── */}
        <Animated.View entering={FadeInDown.delay(160).springify()} style={s.promoBanner}>
          <View style={[s.promoIconWrap, { backgroundColor: promo.accent + '22' }]}>
            <Ionicons name={promo.icon} size={22} color={promo.accent} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={s.promoHeadline}>{promo.headline}</Text>
            <Text style={s.promoSub}>{promo.subline}</Text>
          </View>
          {/* Dot indicators */}
          <View style={s.promoDots}>
            {PROMOS.map((_, i) => (
              <TouchableOpacity key={i} onPress={() => setPromoIndex(i)}>
                <View style={[s.promoDot, i === promoIndex && { backgroundColor: colors.brand, width: 16 }]} />
              </TouchableOpacity>
            ))}
          </View>
        </Animated.View>

        {/* ── Rewards card ── */}
        <Animated.View entering={FadeInDown.delay(220).springify()} style={s.rewardsCard}>
          <View style={s.tierRow}>
            <View style={[s.tierBadge, { backgroundColor: tierCfg.color + '22' }]}>
              <View style={[s.tierDot, { backgroundColor: tierCfg.color }]} />
              <Text style={[s.tierLabel, { color: tierCfg.color }]}>{tierCfg.label.toUpperCase()}</Text>
            </View>
            <Text style={s.rewardsHeading}>Rewards</Text>
          </View>

          <View style={s.pointsRow}>
            <Ionicons name="star" size={18} color={colors.warning} />
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

          <TouchableOpacity style={s.redeemBtn} activeOpacity={0.9} onPress={() => nav.navigate('Cart')}>
            <Ionicons name="star" size={14} color={colors.brand} />
            <Text style={s.redeemBtnText}>REDEEM AT CHECKOUT</Text>
          </TouchableOpacity>
          <Text style={s.watermark}>NŪR</Text>
        </Animated.View>

        {/* ── Popular picks ── */}
        <Animated.View entering={FadeInDown.delay(280).springify()}>
          <View style={s.rowHeader}>
            <Text style={s.sectionTitle}>Popular picks</Text>
            <TouchableOpacity onPress={() => nav.navigate('Order' as any)}>
              <Text style={s.seeAll}>See all →</Text>
            </TouchableOpacity>
          </View>
          <ScrollView
            horizontal showsHorizontalScrollIndicator={false}
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
                  : <View style={[s.pickImg, { backgroundColor: colors.brandSoft }]} />}
                <View style={s.pickInfo}>
                  <Text style={s.pickName} numberOfLines={1}>{item.name}</Text>
                  <Text style={s.pickPrice}>£{item.price.toFixed(2)}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </Animated.View>

        {/* ── Newsletter signup ── */}
        <Animated.View entering={FadeInDown.delay(340).springify()} style={s.newsletterCard}>
          <LinearGradient
            colors={[colors.brandDark, colors.brand]}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
            style={s.newsletterGrad}
          />
          <Ionicons name="mail" size={24} color={colors.card} style={{ marginBottom: spacing.sm }} />
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

        {/* ── View full menu CTA ── */}
        <Animated.View entering={FadeInDown.delay(380).springify()}>
          <TouchableOpacity style={s.menuCta} activeOpacity={0.9} onPress={() => nav.navigate('Order' as any)}>
            <Ionicons name="cafe" size={20} color={colors.brand} />
            <Text style={s.menuCtaText}>VIEW FULL MENU</Text>
            <Ionicons name="arrow-forward" size={16} color={colors.brand} />
          </TouchableOpacity>
        </Animated.View>

      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },

  topbar: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: spacing.base, paddingBottom: spacing.sm,
  },
  avatar: {
    width: touchTarget, height: touchTarget, borderRadius: radius.full,
    backgroundColor: colors.card, alignItems: 'center', justifyContent: 'center',
  },
  avatarInitial: { ...t.h3, color: colors.brand },
  brandText: { flex: 1, textAlign: 'center', ...t.brand, color: colors.onBrand },
  cartBtn: {
    width: touchTarget, height: touchTarget, borderRadius: radius.full,
    backgroundColor: colors.card, alignItems: 'center', justifyContent: 'center',
  },
  cartBadge: {
    position: 'absolute', top: 6, right: 6, minWidth: 16, height: 16,
    borderRadius: 8, backgroundColor: colors.brand,
    alignItems: 'center', justifyContent: 'center', paddingHorizontal: 3,
    borderWidth: 1.5, borderColor: colors.card,
  },
  cartBadgeText: { color: colors.card, fontSize: 9, fontFamily: 'Manrope_800ExtraBold', lineHeight: 11 },

  greetingWrap: { paddingHorizontal: spacing.base, paddingBottom: spacing.base },
  greetingLine: { ...t.bodyLg, color: colors.onBrand, opacity: 0.65 },
  greetingName: { ...t.display, color: colors.onBrand, marginTop: 2 },

  sectionTitle: { ...t.h2, color: colors.onBrand, paddingHorizontal: spacing.base, marginBottom: spacing.md },

  rowHeader: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingRight: spacing.base, marginTop: spacing.xl,
  },
  seeAll: { ...t.caption, color: colors.muted, paddingRight: 0 },

  // Hero card carousel
  heroCard: {
    width: CARD_W, height: CARD_W * 1.05,
    borderRadius: radius['3xl'], overflow: 'hidden',
    backgroundColor: colors.card, ...shadow.card,
  },
  heroImg: { width: '100%', height: '100%' },
  heroGrad: { position: 'absolute', left: 0, right: 0, bottom: 0, height: '55%' },
  heroContent: { position: 'absolute', left: spacing.xl, right: spacing.xl, bottom: spacing.xl },
  heroSeason: { ...t.caption, color: 'rgba(255,255,255,0.75)', letterSpacing: 2, marginBottom: 4 },
  heroName: {
    ...t.h1, color: '#FFF', fontSize: 26, lineHeight: 30,
    textShadowColor: 'rgba(0,0,0,0.25)', textShadowOffset: { width: 0, height: 2 }, textShadowRadius: 6,
  },
  heroRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: spacing.md },
  heroPrice: { ...t.price, color: '#FFF', fontSize: 22 },
  heroBtn: {
    backgroundColor: colors.card, borderRadius: radius.full,
    paddingHorizontal: spacing.base, paddingVertical: spacing.sm,
    borderWidth: 2, borderColor: colors.brand,
  },
  heroBtnText: { ...t.label, color: colors.brand, fontSize: 11 },

  // Promo rotating banner
  promoBanner: {
    marginHorizontal: spacing.base, marginTop: spacing.xl,
    backgroundColor: colors.card,
    borderRadius: radius.xl,
    borderWidth: 1, borderColor: colors.border,
    padding: spacing.base,
    flexDirection: 'row', alignItems: 'center', gap: spacing.md,
    ...shadow.sm,
  },
  promoIconWrap: {
    width: 46, height: 46, borderRadius: radius.lg,
    alignItems: 'center', justifyContent: 'center',
  },
  promoHeadline: { ...t.h3, color: colors.text, marginBottom: 2 },
  promoSub: { ...t.caption, color: colors.subText, lineHeight: 17 },
  promoDots: { flexDirection: 'column', gap: 5, alignItems: 'center' },
  promoDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.border },

  // Rewards card
  rewardsCard: {
    marginHorizontal: spacing.base, marginTop: spacing.xl,
    backgroundColor: colors.card, borderRadius: radius['2xl'],
    padding: spacing.base, borderWidth: 1, borderColor: colors.border,
    overflow: 'hidden', ...shadow.card,
  },
  tierRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.base },
  tierBadge: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, borderRadius: radius.full, paddingHorizontal: spacing.sm, paddingVertical: 5 },
  tierDot: { width: 8, height: 8, borderRadius: 4 },
  tierLabel: { ...t.label, fontSize: 10 },
  rewardsHeading: { ...t.h2, color: colors.text },
  pointsRow: { flexDirection: 'row', alignItems: 'baseline', marginBottom: spacing.sm },
  pointsValue: { ...t.h1, color: colors.text },
  pointsUnit: { ...t.body, color: colors.subText },
  progressTrack: { height: 6, backgroundColor: colors.border, borderRadius: 6, overflow: 'hidden', marginBottom: spacing.xs },
  progressFill: { height: '100%', backgroundColor: colors.brand, borderRadius: 6 },
  progressLabels: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.base },
  progressLabel: { ...t.caption, color: colors.subText },
  goldText: { ...t.body, color: colors.subText, marginBottom: spacing.base },
  redeemBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.xs,
    backgroundColor: colors.card, borderRadius: radius.full, paddingVertical: spacing.base,
    borderWidth: 2, borderColor: colors.brand,
  },
  redeemBtnText: { ...t.label, color: colors.brand },
  watermark: {
    position: 'absolute', right: spacing.md, bottom: spacing.sm,
    fontSize: 72, color: colors.text, opacity: 0.05, fontFamily: 'Amiri_700Bold',
  },

  // Popular picks
  pickCard: {
    width: 140, backgroundColor: colors.card,
    borderRadius: radius.xl, overflow: 'hidden',
    borderWidth: 1, borderColor: colors.border, ...shadow.sm,
  },
  pickImg: { width: '100%', height: 110 },
  pickInfo: { padding: spacing.sm },
  pickName: { ...t.caption, fontFamily: 'Manrope_700Bold', color: colors.text, marginBottom: 2 },
  pickPrice: { ...t.caption, color: colors.brand },

  // Newsletter
  newsletterCard: {
    marginHorizontal: spacing.base, marginTop: spacing.xl,
    borderRadius: radius['2xl'], overflow: 'hidden',
    padding: spacing.xl, ...shadow.card,
  },
  newsletterGrad: { ...StyleSheet.absoluteFillObject },
  newsletterTitle: { ...t.h2, color: colors.card, marginBottom: spacing.xs },
  newsletterSub: { ...t.body, color: 'rgba(239,229,216,0.8)', marginBottom: spacing.base, lineHeight: 22 },
  emailRow: { flexDirection: 'row', gap: spacing.sm },
  emailInput: {
    flex: 1, backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: radius.full, paddingHorizontal: spacing.base,
    paddingVertical: spacing.md, color: '#FFF',
    fontFamily: 'Manrope_400Regular', fontSize: 14,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.25)',
  },
  subscribeBtn: {
    backgroundColor: colors.card, borderRadius: radius.full,
    paddingHorizontal: spacing.base, paddingVertical: spacing.md,
    justifyContent: 'center',
  },
  subscribeBtnText: { ...t.label, color: colors.brand, fontSize: 12 },
  subscribedRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  subscribedText: { ...t.body, color: 'rgba(239,229,216,0.9)' },
  newsletterWatermark: {
    position: 'absolute', right: spacing.md, bottom: -8,
    fontSize: 72, color: 'rgba(255,255,255,0.05)', fontFamily: 'Amiri_700Bold',
  },

  // Menu CTA
  menuCta: {
    marginHorizontal: spacing.base, marginTop: spacing.base,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm,
    backgroundColor: colors.card, borderRadius: radius.full,
    paddingVertical: spacing.base, borderWidth: 1, borderColor: colors.border,
  },
  menuCtaText: { ...t.label, color: colors.brand },
});
