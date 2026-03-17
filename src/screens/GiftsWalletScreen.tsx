// src/screens/GiftsWalletScreen.tsx
import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useAuth } from '../context/AuthContext';
import colors from '../theme/colors';
import { spacing, radius, shadow } from '../theme/spacing';
import { type as t } from '../theme/typography';

const GIFT_CARDS = [
  { id: 'gc-1', color: colors.brand,     label: 'Classic', value: '£10' },
  { id: 'gc-2', color: colors.brandDark, label: 'Premium', value: '£25' },
  { id: 'gc-3', color: '#C0825A',        label: 'Deluxe',  value: '£50' },
];

const GIFTS_FAQ = [
  { q: 'Do Nur Café gift cards expire?',                  a: 'Gift cards do not expire.' },
  { q: 'How does the recipient redeem a gift card?',      a: 'Sign in to the Nur Café app and redeem from the Gift Cards section.' },
  { q: 'How do recipients view the available balance?',   a: 'Tap Gifts › Wallet or Settings › Wallet to view available balance.' },
  { q: "What if the recipient doesn't use it all at once?", a: 'The remaining balance stays in their Wallet for future purchases.' },
];

const WALLET_FAQ = [
  { q: 'Does Nur Café Balance expire?',          a: "Top-ups and gift cards never expire. Credits expire 1 year from the date they're added unless stated otherwise." },
  { q: 'How do I view my available balance?',    a: 'Tap Gifts › Wallet or Settings › Wallet and view available balance.' },
  { q: "What if I don't use it all in one order?", a: 'Any remaining balance is automatically applied to your next purchase.' },
  { q: 'Can I use Nur Café Balance overseas?',   a: 'You can only use Nur Café Balance in the country in which it was purchased.' },
];

const CONTACT_EMAIL = 'mailto:info@nurcafe.co.uk?subject=Gift%20Card%20Enquiry';

export default function GiftsWalletScreen() {
  const { profile } = useAuth();
  const walletBalance = profile?.wallet_balance ?? 0;

  const [tab, setTab] = useState<'gift' | 'wallet'>('gift');
  const [openGift, setOpenGift] = useState<number | null>(null);
  const [openWallet, setOpenWallet] = useState<number | null>(null);

  return (
    <SafeAreaView style={s.safe}>
      {/* Tab bar */}
      <View style={s.tabs}>
        {(['gift', 'wallet'] as const).map((key) => (
          <TouchableOpacity key={key} onPress={() => setTab(key)} style={s.tab}>
            <Text style={[s.tabText, tab === key && s.tabTextActive]}>
              {key === 'gift' ? 'Gift Cards' : 'Wallet'}
            </Text>
            {tab === key && <View style={s.tabUnderline} />}
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 32 }}>
        {tab === 'gift' ? (
          <>
            {/* Featured gift cards carousel */}
            <Animated.View entering={FadeInDown.delay(0).springify()}>
              <Text style={s.sectionTitle}>Featured gift cards</Text>
              <ScrollView
                horizontal showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ paddingHorizontal: spacing.base, gap: spacing.md }}
              >
                {GIFT_CARDS.map((gc) => (
                  <TouchableOpacity key={gc.id} style={[s.bigCard, { backgroundColor: gc.color }]} activeOpacity={0.9} onPress={() => Linking.openURL(CONTACT_EMAIL)}>
                    <Text style={s.bigCardBrand}>NŪR CAFÉ</Text>
                    <Text style={s.bigCardLabel}>{gc.label}</Text>
                    <Text style={s.bigCardValue}>{gc.value}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </Animated.View>

            {/* FAQ */}
            <Animated.View entering={FadeInDown.delay(80).springify()}>
              <Text style={s.sectionTitle}>Gift cards FAQ</Text>
              <View style={s.faqList}>
                {GIFTS_FAQ.map((f, i) => (
                  <FaqRow
                    key={`gfaq-${i}`}
                    q={f.q} a={f.a}
                    open={openGift === i}
                    onToggle={() => setOpenGift(openGift === i ? null : i)}
                    last={i === GIFTS_FAQ.length - 1}
                  />
                ))}
              </View>
            </Animated.View>

            <Animated.View entering={FadeInDown.delay(140).springify()} style={s.contactRow}>
              <Text style={s.contactLead}>Still got questions?</Text>
              <TouchableOpacity style={s.contactBtn} activeOpacity={0.9} onPress={() => Linking.openURL(CONTACT_EMAIL)}>
                <Text style={s.contactBtnText}>CONTACT US</Text>
              </TouchableOpacity>
            </Animated.View>
          </>
        ) : (
          <>
            {/* Wallet balance card — reads from Supabase profile */}
            <Animated.View entering={FadeInDown.delay(0).springify()} style={s.walletCard}>
              <View style={s.walletIconWrap}>
                <Ionicons name="wallet-outline" size={28} color={colors.brand} />
              </View>
              <Text style={s.walletLabel}>
                {walletBalance > 0 ? 'AVAILABLE BALANCE' : "YOUR WALLET'S EMPTY"}
              </Text>
              <Text style={s.walletBalance}>£{walletBalance.toFixed(2)}</Text>

              <TouchableOpacity
                style={s.walletBtn} activeOpacity={0.9}
                onPress={() => Linking.openURL('mailto:info@nurcafe.co.uk?subject=Wallet%20Top-Up%20Request&body=Hi%20N%C5%ABr%20Caf%C3%A9%20team%2C%20I%27d%20like%20to%20top%20up%20my%20wallet.%20Amount%3A%20%0D%0AName%3A%20')}
              >
                <Ionicons name="mail-outline" size={16} color={colors.brand} />
                <Text style={s.walletBtnText}>REQUEST TOP-UP</Text>
              </TouchableOpacity>
              <Text style={s.walletNote}>We'll confirm and add funds within 24 hours.</Text>
              <Text style={s.watermark}>NŪR</Text>
            </Animated.View>

            {/* Wallet FAQ */}
            <Animated.View entering={FadeInDown.delay(80).springify()}>
              <Text style={s.sectionTitle}>Wallet FAQ</Text>
              <View style={s.faqList}>
                {WALLET_FAQ.map((f, i) => (
                  <FaqRow
                    key={`wfaq-${i}`}
                    q={f.q} a={f.a}
                    open={openWallet === i}
                    onToggle={() => setOpenWallet(openWallet === i ? null : i)}
                    last={i === WALLET_FAQ.length - 1}
                  />
                ))}
              </View>
            </Animated.View>

            <Animated.View entering={FadeInDown.delay(140).springify()} style={s.contactRow}>
              <Text style={s.contactLead}>Still got questions?</Text>
              <TouchableOpacity style={s.contactBtn} activeOpacity={0.9} onPress={() => Linking.openURL(CONTACT_EMAIL)}>
                <Text style={s.contactBtnText}>CONTACT US</Text>
              </TouchableOpacity>
            </Animated.View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

// ── FAQ row component ─────────────────────────────────────────────────────────

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

// ── Styles ────────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },

  // Tabs
  tabs: {
    flexDirection: 'row', alignSelf: 'center', gap: spacing.xl,
    paddingTop: spacing.md, paddingBottom: spacing.sm,
  },
  tab: { alignItems: 'center', paddingBottom: 6 },
  tabText: { ...t.h3, color: '#EED3CB' },
  tabTextActive: { color: colors.card },
  tabUnderline: { marginTop: 4, height: 3, width: 36, backgroundColor: colors.card, borderRadius: 2 },

  sectionTitle: {
    ...t.h3, color: colors.onBrand,
    marginHorizontal: spacing.base, marginTop: spacing.xl, marginBottom: spacing.md,
  },

  // Gift card carousel
  bigCard: {
    width: 300, height: 170, borderRadius: radius['2xl'],
    padding: spacing.base, justifyContent: 'space-between',
    borderWidth: 2, borderColor: 'rgba(255,255,255,0.2)',
  },
  bigCardBrand: { ...t.label, color: 'rgba(255,255,255,0.85)', letterSpacing: 3 },
  bigCardLabel: { ...t.h2, color: '#FFF' },
  bigCardValue: { ...t.display, color: '#FFF', fontSize: 28 },

  // FAQ
  faqList: {
    marginHorizontal: spacing.base,
    backgroundColor: colors.card, borderRadius: radius.xl,
    borderWidth: 1, borderColor: colors.border, overflow: 'hidden',
  },
  faqRow: { paddingHorizontal: spacing.base, paddingVertical: spacing.md },
  faqBorder: { borderBottomWidth: 1, borderBottomColor: colors.border },
  faqHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  faqQ: { ...t.body, fontFamily: 'Manrope_700Bold', color: colors.text, flex: 1 },
  faqA: { ...t.body, color: colors.subText, marginTop: spacing.sm, lineHeight: 22 },

  // Contact footer
  contactRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    marginHorizontal: spacing.base, marginTop: spacing.xl,
  },
  contactLead: { ...t.h3, color: colors.onBrand },
  contactBtn: {
    backgroundColor: colors.card, borderRadius: radius.full,
    paddingHorizontal: spacing.base, paddingVertical: spacing.sm,
    borderWidth: 2, borderColor: colors.brand,
  },
  contactBtnText: { ...t.label, color: colors.brand, fontSize: 11 },

  // Wallet card
  walletCard: {
    marginHorizontal: spacing.base, marginTop: spacing.md,
    backgroundColor: colors.card, borderRadius: radius['2xl'],
    padding: spacing.xl, alignItems: 'center',
    borderWidth: 1, borderColor: colors.border,
    overflow: 'hidden', ...shadow.card,
  },
  walletIconWrap: {
    width: 56, height: 56, borderRadius: radius.full,
    backgroundColor: colors.brandSoft,
    alignItems: 'center', justifyContent: 'center', marginBottom: spacing.md,
  },
  walletLabel: { ...t.label, color: colors.subText, letterSpacing: 1, marginBottom: spacing.sm },
  walletBalance: { fontSize: 48, fontFamily: 'Manrope_800ExtraBold', color: colors.text, marginBottom: spacing.base },
  walletBtn: {
    width: '100%', borderRadius: radius.full,
    paddingVertical: spacing.base, alignItems: 'center',
    borderWidth: 2, borderColor: colors.brand, marginTop: spacing.sm,
    flexDirection: 'row', justifyContent: 'center', gap: spacing.xs,
  },
  walletBtnSecondary: { borderColor: colors.border },
  walletBtnText: { ...t.label, color: colors.brand },
  walletNote: { ...t.caption, color: colors.muted, textAlign: 'center', marginTop: spacing.sm },
  watermark: {
    position: 'absolute', right: spacing.md, bottom: spacing.sm,
    fontSize: 64, color: colors.text, opacity: 0.04,
    fontFamily: 'Manrope_800ExtraBold',
  },
});
