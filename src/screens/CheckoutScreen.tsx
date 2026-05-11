// src/screens/CheckoutScreen.tsx
// Payment: Stripe PaymentSheet via Supabase Edge Function + loyalty points redemption
import { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, Alert, Switch, TextInput, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useStripe } from '@stripe/stripe-react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { createOrder, awardPoints, type OrderDiscounts } from '../services/orders';
import { validateGiftCard, redeemGiftCard, type GiftCard } from '../services/giftCards';
import { supabase } from '../config/supabase';
import * as Haptics from 'expo-haptics';
import colors from '../theme/colors';
import { type as t } from '../theme/typography';
import { spacing, radius, touchTarget, shadow } from '../theme/spacing';

type Props = NativeStackScreenProps<RootStackParamList, 'Checkout'>;

const LOCATION = {
  label: 'NUR CAFÉ — Deansgate',
  address: '45 Deansgate, Manchester M3 2AY',
};

// 100 loyalty points = £1 off
const POINTS_PER_POUND = 100;

export default function CheckoutScreen({ navigation }: Props) {
  const { items, totalPrice, clearCart } = useCart();
  const { user, profile, refreshProfile } = useAuth();
  const { initPaymentSheet, presentPaymentSheet } = useStripe();

  const [loading,       setLoading]       = useState(false);
  const [usePoints,     setUsePoints]     = useState(false);
  const [gcCode,        setGcCode]        = useState('');
  const [gcApplying,    setGcApplying]    = useState(false);
  const [appliedGc,     setAppliedGc]     = useState<GiftCard | null>(null);

  const availablePoints   = profile?.points ?? 0;
  const maxPointDiscount  = parseFloat((availablePoints / POINTS_PER_POUND).toFixed(2));
  const pointDiscount     = usePoints ? Math.min(maxPointDiscount, totalPrice) : 0;
  const pointsUsed        = usePoints
    ? Math.min(availablePoints, Math.ceil(totalPrice * POINTS_PER_POUND))
    : 0;
  const gcDiscount        = appliedGc ? Math.min(appliedGc.value / 100, totalPrice - pointDiscount) : 0;
  const finalTotal        = Math.max(0, totalPrice - pointDiscount - gcDiscount);
  const pointsToEarn      = Math.floor(finalTotal);

  const handleApplyGiftCard = async () => {
    const trimmed = gcCode.trim();
    if (!trimmed) return;
    if (trimmed.length > 50) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Invalid Code', 'Please check your gift card code and try again.');
      return;
    }
    setGcApplying(true);
    try {
      const card = await validateGiftCard(gcCode);
      setAppliedGc(card);
      setGcCode('');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (e: any) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Invalid Gift Card', e.message);
    } finally {
      setGcApplying(false);
    }
  };

  const handlePlaceOrder = async () => {
    if (!user || items.length === 0) return;
    setLoading(true);

    try {
      // 1 — get Stripe PaymentIntent client secret from Supabase Edge Function
      const { data: fnData, error: fnError } = await supabase.functions.invoke(
        'create-payment-intent',
        { body: { amount: Math.round(finalTotal * 100), currency: 'gbp' } },
      );

      if (fnError || !fnData?.clientSecret) {
        throw new Error(fnError?.message ?? 'Could not initialise payment.');
      }

      // 2 — init PaymentSheet
      const { error: initError } = await initPaymentSheet({
        merchantDisplayName: 'Nūr Café',
        paymentIntentClientSecret: fnData.clientSecret,
        defaultBillingDetails: { name: profile?.name },
        appearance: {
          colors: {
            primary: colors.brand,
            background: colors.bg,
            componentBackground: colors.card,
            componentBorder: colors.border,
            primaryText: colors.text,
            secondaryText: colors.subText,
            componentText: colors.text,
            placeholderText: colors.muted,
          },
        },
      });
      if (initError) throw new Error(initError.message);

      // 3 — present sheet to user
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      const { error: presentError } = await presentPaymentSheet();
      if (presentError) {
        if (presentError.code !== 'Canceled') {
          Alert.alert('Payment failed', presentError.message);
        }
        setLoading(false);
        return;
      }

      // 4 — payment confirmed — write order + adjust points
      const discounts: OrderDiscounts = {
        discountPoints:   usePoints ? pointsUsed : 0,
        discountGcCode:   appliedGc?.code ?? null,
        discountGcAmount: gcDiscount,
      };
      const order = await createOrder(user.id, items, totalPrice, discounts);

      if (pointsToEarn > 0) await awardPoints(user.id, pointsToEarn);

      // Deduct redeemed points (awardPoints handles the typed RPC call)
      if (usePoints && pointsUsed > 0) {
        await awardPoints(user.id, -pointsUsed);
      }

      if (appliedGc) {
        await redeemGiftCard(appliedGc.code, user.id);
      }

      await refreshProfile();
      clearCart();
      navigation.replace('OrderConfirmation', { orderId: order.id });

    } catch (e: any) {
      Alert.alert('Order Failed', e.message ?? 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={s.safe}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn}>
          <Ionicons name="chevron-back" size={22} color={colors.onBrand} />
        </TouchableOpacity>
        <Text style={s.headerTitle}>Checkout</Text>
        <View style={{ width: touchTarget }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 140 }}>

        {/* Collection point */}
        <View style={s.panel}>
          <Text style={s.panelLabel}>COLLECTION POINT</Text>
          <View style={s.locationRow}>
            <Ionicons name="location" size={18} color={colors.brand} />
            <View style={{ flex: 1 }}>
              <Text style={s.locationTitle}>{LOCATION.label}</Text>
              <Text style={s.locationAddr}>{LOCATION.address}</Text>
            </View>
          </View>
        </View>

        {/* Order items */}
        <View style={[s.panel, { marginTop: spacing.sm }]}>
          <Text style={s.panelLabel}>YOUR ORDER</Text>
          {items.map((ci, i) => (
            <View
              key={ci.item.id + ci.extras.join(',')}
              style={[s.lineItem, i === items.length - 1 && { borderBottomWidth: 0 }]}
            >
              <View style={{ flex: 1 }}>
                <Text style={s.lineItemName}>{ci.item.name}</Text>
                {ci.extras.length > 0 && (
                  <Text style={s.lineItemExtras}>{ci.extras.join(', ')}</Text>
                )}
              </View>
              <Text style={s.lineItemQty}>×{ci.quantity}</Text>
              <Text style={s.lineItemPrice}>
                £{((ci.item.price + ci.extraTotal) * ci.quantity).toFixed(2)}
              </Text>
            </View>
          ))}
        </View>

        {/* Points redemption — only shown if user has enough */}
        {availablePoints >= POINTS_PER_POUND && (
          <View style={[s.panel, { marginTop: spacing.sm }]}>
            <Text style={s.panelLabel}>LOYALTY POINTS</Text>
            <View style={s.pointsRow}>
              <View style={{ flex: 1 }}>
                <Text style={s.pointsLabel}>Use my points</Text>
                <Text style={s.pointsSub}>
                  {availablePoints} pts available — worth £{maxPointDiscount.toFixed(2)} off
                </Text>
              </View>
              <Switch
                value={usePoints}
                onValueChange={(v) => { Haptics.selectionAsync(); setUsePoints(v); }}
                trackColor={{ true: colors.brand, false: colors.border }}
                thumbColor={colors.card}
              />
            </View>
            {usePoints && (
              <View style={s.discountBanner}>
                <Ionicons name="star" size={14} color={colors.warning} />
                <Text style={s.discountBannerText}>
                  {' '}{pointsUsed} pts redeemed — £{pointDiscount.toFixed(2)} off your order
                </Text>
              </View>
            )}
          </View>
        )}

        {/* Gift card redemption */}
        <View style={[s.panel, { marginTop: spacing.sm }]}>
          <Text style={s.panelLabel}>GIFT CARD</Text>
          {appliedGc ? (
            <View style={s.gcAppliedRow}>
              <Ionicons name="checkmark-circle" size={18} color={colors.success} />
              <Text style={s.gcAppliedText}>
                {appliedGc.code} · £{(appliedGc.value / 100).toFixed(2)} applied
              </Text>
              <TouchableOpacity onPress={() => setAppliedGc(null)}>
                <Ionicons name="close-circle-outline" size={18} color={colors.muted} />
              </TouchableOpacity>
            </View>
          ) : (
            <View style={s.gcInputRow}>
              <TextInput
                style={s.gcInput}
                placeholder="Enter code…"
                placeholderTextColor={colors.muted}
                value={gcCode}
                onChangeText={(v) => setGcCode(v.toUpperCase())}
                autoCapitalize="characters"
                returnKeyType="done"
                onSubmitEditing={handleApplyGiftCard}
              />
              <TouchableOpacity
                style={[s.gcApplyBtn, gcApplying && { opacity: 0.6 }]}
                onPress={handleApplyGiftCard}
                disabled={gcApplying}
              >
                {gcApplying
                  ? <ActivityIndicator size="small" color={colors.cream} />
                  : <Text style={s.gcApplyText}>APPLY</Text>
                }
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Summary */}
        <View style={[s.panel, { marginTop: spacing.sm }]}>
          <Text style={s.panelLabel}>SUMMARY</Text>
          <View style={s.summaryRow}>
            <Text style={s.summaryLabel}>Subtotal</Text>
            <Text style={s.summaryValue}>£{totalPrice.toFixed(2)}</Text>
          </View>
          {pointDiscount > 0 && (
            <View style={s.summaryRow}>
              <Text style={[s.summaryLabel, { color: '#065F46' }]}>Points discount</Text>
              <Text style={[s.summaryValue, { color: '#065F46' }]}>−£{pointDiscount.toFixed(2)}</Text>
            </View>
          )}
          {gcDiscount > 0 && (
            <View style={s.summaryRow}>
              <Text style={[s.summaryLabel, { color: '#065F46' }]}>Gift card</Text>
              <Text style={[s.summaryValue, { color: '#065F46' }]}>−£{gcDiscount.toFixed(2)}</Text>
            </View>
          )}
          <View style={[s.summaryRow, { borderBottomWidth: 0 }]}>
            <Text style={[s.summaryLabel, { fontFamily: 'Manrope_800ExtraBold', color: colors.text }]}>
              Total
            </Text>
            <Text style={[s.summaryValue, { fontSize: 20 }]}>£{finalTotal.toFixed(2)}</Text>
          </View>
        </View>

        {/* Points to earn notice */}
        {pointsToEarn > 0 && (
          <View style={s.earnPill}>
            <Ionicons name="star" size={13} color={colors.warning} />
            <Text style={s.earnText}> You'll earn {pointsToEarn} pts on this order</Text>
          </View>
        )}
      </ScrollView>

      {/* Sticky pay CTA */}
      <View style={s.footer}>
        <TouchableOpacity
          style={[s.payBtn, loading && { opacity: 0.7 }]}
          activeOpacity={0.9}
          onPress={handlePlaceOrder}
          disabled={loading}
        >
          <Ionicons name="card-outline" size={18} color="#FFF" />
          <Text style={s.payBtnText}>
            {loading ? 'PROCESSING...' : `PAY  £${finalTotal.toFixed(2)}`}
          </Text>
        </TouchableOpacity>
        <Text style={s.secureNote}>
          <Ionicons name="lock-closed-outline" size={11} color={colors.muted} /> Secured by Stripe
        </Text>
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },

  header: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: spacing.base, paddingBottom: spacing.sm,
  },
  backBtn: {
    width: touchTarget, height: touchTarget, borderRadius: radius.full,
    backgroundColor: colors.card, alignItems: 'center', justifyContent: 'center',
  },
  headerTitle: { flex: 1, textAlign: 'center', ...t.h2, color: colors.onBrand },

  panel: {
    marginHorizontal: spacing.base,
    backgroundColor: colors.card,
    borderRadius: radius.xl,
    borderWidth: 1, borderColor: colors.border,
    overflow: 'hidden', ...shadow.sm,
  },
  panelLabel: {
    ...t.labelLg, color: colors.muted,
    paddingHorizontal: spacing.base,
    paddingTop: spacing.base, paddingBottom: spacing.sm,
    borderBottomWidth: 1, borderBottomColor: colors.border,
  },

  locationRow: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.md,
    padding: spacing.base,
  },
  locationTitle: { ...t.h3, color: colors.text },
  locationAddr: { ...t.caption, color: colors.subText, marginTop: 2 },

  lineItem: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.sm,
    paddingHorizontal: spacing.base, paddingVertical: spacing.md,
    borderBottomWidth: 1, borderBottomColor: colors.border,
  },
  lineItemName: { ...t.body, fontFamily: 'Manrope_700Bold', color: colors.text },
  lineItemExtras: { ...t.caption, color: colors.subText, marginTop: 2 },
  lineItemQty: { ...t.body, color: colors.subText },
  lineItemPrice: { ...t.price, color: colors.text },

  pointsRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: spacing.base, paddingVertical: spacing.md,
  },
  pointsLabel: { ...t.body, fontFamily: 'Manrope_700Bold', color: colors.text },
  pointsSub: { ...t.caption, color: colors.subText, marginTop: 2 },
  discountBanner: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#F0FDF4',
    paddingHorizontal: spacing.base, paddingVertical: spacing.sm,
  },
  discountBannerText: { ...t.caption, color: '#065F46' },

  // Gift card
  gcInputRow: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.sm,
    paddingHorizontal: spacing.base, paddingVertical: spacing.md,
  },
  gcInput: {
    flex: 1,
    height: 44, borderRadius: radius.md,
    backgroundColor: colors.card,
    borderWidth: 1, borderColor: colors.border,
    paddingHorizontal: spacing.md,
    fontFamily: 'Manrope_600SemiBold', fontSize: 14,
    color: colors.text,
  },
  gcApplyBtn: {
    height: 44, borderRadius: radius.md,
    backgroundColor: colors.brand,
    paddingHorizontal: spacing.base,
    alignItems: 'center', justifyContent: 'center',
  },
  gcApplyText: { fontFamily: 'Manrope_800ExtraBold', fontSize: 12, color: '#FFF', letterSpacing: 0.8 },
  gcAppliedRow: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.sm,
    paddingHorizontal: spacing.base, paddingVertical: spacing.md,
  },
  gcAppliedText: { ...t.body, color: colors.success, flex: 1 },

  summaryRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: spacing.base, paddingVertical: spacing.md,
    borderBottomWidth: 1, borderBottomColor: colors.border,
  },
  summaryLabel: { ...t.body, color: colors.subText },
  summaryValue: { ...t.price, color: colors.text },

  earnPill: {
    flexDirection: 'row', alignItems: 'center',
    marginHorizontal: spacing.base, marginTop: spacing.md,
    backgroundColor: '#FEF3C7',
    borderRadius: radius.full,
    paddingHorizontal: spacing.base, paddingVertical: spacing.sm,
    alignSelf: 'flex-start',
  },
  earnText: { ...t.caption, color: '#92400E' },

  footer: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    padding: spacing.base, paddingBottom: spacing.xl,
    backgroundColor: colors.bg,
    shadowColor: '#000', shadowOpacity: 0.08, shadowOffset: { width: 0, height: -4 }, shadowRadius: 12,
    alignItems: 'center',
  },
  payBtn: {
    width: '100%',
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm,
    backgroundColor: colors.brand,
    borderRadius: radius.full,
    paddingVertical: spacing.base,
  },
  payBtnText: { ...t.labelLg, color: '#FFF', fontSize: 15 },
  secureNote: { ...t.caption, color: colors.muted, marginTop: spacing.sm },
});
