// src/screens/GiftsWalletScreen.tsx
// Phase 6 — Gift card carousel + modal + wallet balance
import { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  FlatList, Dimensions, Alert, Share,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useStripe } from '@stripe/stripe-react-native';
import * as Haptics from 'expo-haptics';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../config/supabase';
import { GIFT_CARD_TIERS, type GiftCardTier } from '../services/giftCards';
import GiftCardModal from '../components/GiftCardModal';
import colors from '../theme/colors';
import { fonts } from '../theme/typography';
import { spacing, radius, shadow } from '../theme/spacing';

const { width: W } = Dimensions.get('window');
const CARD_W = W * 0.75;

// ─── FAQ data ─────────────────────────────────────────────────────────────────
const GIFTS_FAQ = [
  { q: 'Do Nur Café gift cards expire?',             a: 'Gift cards do not expire.' },
  { q: 'How does the recipient redeem a gift card?', a: 'Sign in to the Nūr Café app and enter the code at checkout.' },
  { q: 'What if the full balance isn\'t used?',      a: 'The remaining balance stays in their wallet for future orders.' },
];

const WALLET_FAQ = [
  { q: 'Does Nūr Café Balance expire?',               a: "Top-ups and gift cards never expire. Credits expire 1 year from the date they're added unless stated otherwise." },
  { q: 'How do I view my available balance?',         a: 'Tap Gifts & Wallet then the Wallet tab to see your balance.' },
  { q: 'What if I don\'t use it all in one order?',   a: 'Any remaining balance is automatically applied to your next purchase.' },
];

// ─── FAQ row ──────────────────────────────────────────────────────────────────
function FaqRow({
  q, a, open, onToggle, last,
}: {
  q: string; a: string; open: boolean; onToggle: () => void; last: boolean;
}) {
  return (
    <TouchableOpacity
      onPress={onToggle}
      activeOpacity={0.85}
      style={[s.faqRow, !last && s.faqBorder]}
    >
      <View style={s.faqHeader}>
        <Text style={s.faqQ}>{q}</Text>
        <Ionicons name={open ? 'chevron-up' : 'chevron-down'} size={16} color={colors.subText} />
      </View>
      {open && <Text style={s.faqA}>{a}</Text>}
    </TouchableOpacity>
  );
}

// ─── Gift card tile in carousel ───────────────────────────────────────────────
function GiftCardTile({ tier, onPress }: { tier: GiftCardTier; onPress: () => void }) {
  return (
    <TouchableOpacity
      style={[s.cardTile, { backgroundColor: tier.color }]}
      onPress={onPress}
      activeOpacity={0.88}
    >
      <Text style={s.tileBrand}>NŪR CAFÉ</Text>
      <View>
        <Text style={s.tileLabel}>{tier.label}</Text>
        <Text style={s.tileValue}>£{tier.value.toFixed(2)}</Text>
      </View>
      <View style={s.tileFooter}>
        <Text style={s.tilePerk} numberOfLines={2}>{tier.perk}</Text>
        <View style={s.tileBadge}>
          <Text style={s.tileBadgeText}>TAP TO GIFT</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

// ─── Main screen ──────────────────────────────────────────────────────────────
export default function GiftsWalletScreen() {
  const { profile } = useAuth();
  const { initPaymentSheet, presentPaymentSheet } = useStripe();

  const walletBalance  = profile?.wallet_balance ?? 0;
  const [tab, setTab]  = useState<'gift' | 'wallet'>('gift');
  const [selectedTier, setSelectedTier] = useState<GiftCardTier | null>(null);
  const [openGift,   setOpenGift]   = useState<number | null>(null);
  const [openWallet, setOpenWallet] = useState<number | null>(null);

  const handleBuy = useCallback(async (tier: GiftCardTier) => {
    if (!profile) return;
    setSelectedTier(null); // close modal first

    try {
      const { data: fnData, error: fnError } = await supabase.functions.invoke(
        'create-payment-intent',
        { body: { amount: Math.round(tier.value * 100), currency: 'gbp', type: 'gift_card', tier: tier.id } },
      );

      if (fnError || !fnData?.clientSecret) {
        throw new Error(fnError?.message ?? 'Could not initialise payment.');
      }

      const { error: initError } = await initPaymentSheet({
        merchantDisplayName: 'Nūr Café',
        paymentIntentClientSecret: fnData.clientSecret,
        defaultBillingDetails: { name: profile.name },
        appearance: {
          colors: {
            primary:             colors.terracotta,
            background:          colors.sand,
            componentBackground: colors.cream,
            componentBorder:     colors.creamDeep,
            primaryText:         colors.deepBrown,
            secondaryText:       colors.subText,
            componentText:       colors.deepBrown,
            placeholderText:     colors.muted,
          },
        },
      });

      if (initError) throw new Error(initError.message);

      const { error: presentError } = await presentPaymentSheet();
      if (presentError) {
        if (presentError.code !== 'Canceled') {
          Alert.alert('Payment failed', presentError.message);
        }
        return;
      }

      // Issue the gift card — generates code + inserts DB row
      const { data: gcData, error: gcError } = await supabase.functions.invoke(
        'issue-gift-card',
        { body: { tier: tier.id, amount: Math.round(tier.value * 100) } },
      );

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      const code: string = gcData?.code ?? 'Check your email';
      if (!gcError && gcData?.code) {
        Alert.alert(
          '🎁 Gift Card Issued!',
          `Your ${tier.label} gift card code:\n\n${code}\n\nTap Copy to save it.`,
          [
            { text: 'Share', onPress: () => Share.share({ message: `Nūr Café gift card code: ${code}` }) },
            { text: 'Done', style: 'cancel' },
          ],
        );
      } else {
        Alert.alert(
          '🎁 Payment Received',
          `Your ${tier.label} gift card (£${tier.value.toFixed(2)}) will be emailed to you shortly.`,
        );
      }
    } catch (e: any) {
      Alert.alert('Purchase Failed', e.message ?? 'Something went wrong. Please try again.');
    }
  }, [profile]);

  return (
    <SafeAreaView style={s.safe}>
      {/* Tab selector */}
      <View style={s.tabRow}>
        {(['gift', 'wallet'] as const).map((key) => (
          <TouchableOpacity
            key={key}
            onPress={() => setTab(key)}
            style={s.tabBtn}
            activeOpacity={0.8}
          >
            <Text style={[s.tabText, tab === key && s.tabTextActive]}>
              {key === 'gift' ? 'Gift Cards' : 'Wallet'}
            </Text>
            {tab === key && <View style={s.tabUnderline} />}
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        {tab === 'gift' ? (
          <>
            {/* Carousel */}
            <Animated.View entering={FadeInDown.delay(0).springify()}>
              <Text style={s.sectionTitle}>Choose a gift card</Text>
              <FlatList
                data={GIFT_CARD_TIERS}
                keyExtractor={(t) => t.id}
                horizontal
                showsHorizontalScrollIndicator={false}
                snapToInterval={CARD_W + spacing.md}
                decelerationRate="fast"
                contentContainerStyle={{ paddingHorizontal: spacing.base, gap: spacing.md }}
                renderItem={({ item }) => (
                  <GiftCardTile tier={item} onPress={() => setSelectedTier(item)} />
                )}
              />
            </Animated.View>

            {/* FAQ */}
            <Animated.View entering={FadeInDown.delay(80).springify()}>
              <Text style={s.sectionTitle}>Gift cards FAQ</Text>
              <View style={s.faqList}>
                {GIFTS_FAQ.map((f, i) => (
                  <FaqRow
                    key={`gfaq-${i}`}
                    q={f.q}
                    a={f.a}
                    open={openGift === i}
                    onToggle={() => setOpenGift(openGift === i ? null : i)}
                    last={i === GIFTS_FAQ.length - 1}
                  />
                ))}
              </View>
            </Animated.View>
          </>
        ) : (
          <>
            {/* Wallet balance */}
            <Animated.View entering={FadeInDown.delay(0).springify()} style={s.walletCard}>
              <View style={s.walletIconWrap}>
                <Ionicons name="wallet-outline" size={28} color={colors.terracotta} />
              </View>
              <Text style={s.walletLabel}>
                {walletBalance > 0 ? 'AVAILABLE BALANCE' : "YOUR WALLET'S EMPTY"}
              </Text>
              <Text style={s.walletBalance}>£{walletBalance.toFixed(2)}</Text>
              <Text style={s.walletNote}>
                Wallet balance is applied automatically at checkout.
              </Text>
              <Text style={s.watermark}>NŪR</Text>
            </Animated.View>

            {/* Wallet FAQ */}
            <Animated.View entering={FadeInDown.delay(80).springify()}>
              <Text style={s.sectionTitle}>Wallet FAQ</Text>
              <View style={s.faqList}>
                {WALLET_FAQ.map((f, i) => (
                  <FaqRow
                    key={`wfaq-${i}`}
                    q={f.q}
                    a={f.a}
                    open={openWallet === i}
                    onToggle={() => setOpenWallet(openWallet === i ? null : i)}
                    last={i === WALLET_FAQ.length - 1}
                  />
                ))}
              </View>
            </Animated.View>
          </>
        )}
      </ScrollView>

      {/* Gift card detail modal */}
      <GiftCardModal
        tier={selectedTier}
        onClose={() => setSelectedTier(null)}
        onBuy={handleBuy}
      />
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.sand },

  // ─── Tabs ─────────────────────────────────────────────────────────────────
  tabRow: {
    flexDirection:  'row',
    justifyContent: 'center',
    gap:            spacing['2xl'],
    paddingTop:     spacing.md,
    paddingBottom:  spacing.sm,
  },
  tabBtn: { alignItems: 'center', paddingBottom: 6 },
  tabText: {
    fontFamily: fonts.bold,
    fontSize:   17,
    color:      colors.muted,
  },
  tabTextActive: { color: colors.deepBrown },
  tabUnderline: {
    marginTop:       4,
    height:          3,
    width:           36,
    backgroundColor: colors.terracotta,
    borderRadius:    2,
  },

  sectionTitle: {
    fontFamily:     fonts.bold,
    fontSize:       18,
    color:          colors.deepBrown,
    marginHorizontal: spacing.base,
    marginTop:      spacing.xl,
    marginBottom:   spacing.md,
  },

  // ─── Gift card tile ───────────────────────────────────────────────────────
  cardTile: {
    width:          CARD_W,
    height:         190,
    borderRadius:   radius.xl,
    padding:        spacing.xl,
    justifyContent: 'space-between',
    borderWidth:    1.5,
    borderColor:    'rgba(255,255,255,0.18)',
    ...shadow.card,
  },
  tileBrand: {
    fontFamily:    fonts.amiriBold,
    fontSize:      13,
    color:         'rgba(255,255,255,0.8)',
    letterSpacing: 3,
  },
  tileLabel: {
    fontFamily:    fonts.extrabold,
    fontSize:      22,
    color:         '#FFF',
    letterSpacing: 1,
  },
  tileValue: {
    fontFamily: fonts.amiriBold,
    fontSize:   28,
    color:      '#FFF',
    marginTop:  2,
  },
  tileFooter: {
    flexDirection:  'row',
    justifyContent: 'space-between',
    alignItems:     'flex-end',
  },
  tilePerk: {
    fontFamily: fonts.medium,
    fontSize:   11,
    color:      'rgba(255,255,255,0.7)',
    flex:       1,
    marginRight: spacing.sm,
  },
  tileBadge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius:    radius.sm,
    paddingHorizontal: 8,
    paddingVertical:   4,
    borderWidth:    1,
    borderColor:    'rgba(255,255,255,0.3)',
  },
  tileBadgeText: {
    fontFamily:    fonts.extrabold,
    fontSize:      9,
    color:         '#FFF',
    letterSpacing: 1,
  },

  // ─── FAQ ──────────────────────────────────────────────────────────────────
  faqList: {
    marginHorizontal: spacing.base,
    backgroundColor:  colors.cream,
    borderRadius:     radius.xl,
    borderWidth:      1,
    borderColor:      colors.creamDeep,
    overflow:         'hidden',
  },
  faqRow:   { paddingHorizontal: spacing.base, paddingVertical: spacing.md },
  faqBorder: { borderBottomWidth: 1, borderBottomColor: colors.creamDeep },
  faqHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  faqQ: {
    fontFamily: fonts.bold,
    fontSize:   14,
    color:      colors.deepBrown,
    flex:       1,
  },
  faqA: {
    fontFamily: fonts.regular,
    fontSize:   13,
    color:      colors.subText,
    marginTop:  spacing.sm,
    lineHeight: 20,
  },

  // ─── Wallet card ──────────────────────────────────────────────────────────
  walletCard: {
    marginHorizontal: spacing.base,
    marginTop:        spacing.md,
    backgroundColor:  colors.cream,
    borderRadius:     radius['2xl'],
    padding:          spacing.xl,
    alignItems:       'center',
    borderWidth:      1,
    borderColor:      colors.creamDeep,
    overflow:         'hidden',
    ...shadow.card,
  },
  walletIconWrap: {
    width:           56,
    height:          56,
    borderRadius:    radius.full,
    backgroundColor: `${colors.terracotta}18`,
    alignItems:      'center',
    justifyContent:  'center',
    marginBottom:    spacing.md,
  },
  walletLabel: {
    fontFamily:    fonts.bold,
    fontSize:      11,
    color:         colors.subText,
    letterSpacing: 1.5,
    marginBottom:  spacing.sm,
  },
  walletBalance: {
    fontFamily:   fonts.extrabold,
    fontSize:     48,
    color:        colors.deepBrown,
    marginBottom: spacing.base,
  },
  walletNote: {
    fontFamily: fonts.medium,
    fontSize:   13,
    color:      colors.muted,
    textAlign:  'center',
  },
  watermark: {
    position:   'absolute',
    right:      spacing.md,
    bottom:     spacing.sm,
    fontSize:   64,
    color:      colors.deepBrown,
    opacity:    0.04,
    fontFamily: fonts.extrabold,
  },
});
