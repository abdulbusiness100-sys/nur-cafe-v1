// src/screens/OrderConfirmationScreen.tsx
import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  useSharedValue, useAnimatedStyle,
  withSpring, withDelay, withTiming, FadeInDown,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';
import { getOrder } from '../services/orders';
import type { Order } from '../types/database';
import type { OrderItem } from '../services/orders';
import colors from '../theme/colors';
import { type as t } from '../theme/typography';
import { spacing, radius, shadow } from '../theme/spacing';

type Props = NativeStackScreenProps<RootStackParamList, 'OrderConfirmation'>;

const READY_IN_MINS = 10;

export default function OrderConfirmationScreen({ navigation, route }: Props) {
  const { orderId } = route.params;
  const [order, setOrder] = useState<Order | null>(null);
  const scale   = useSharedValue(0);
  const opacity = useSharedValue(0);
  const firedHaptic = useRef(false);

  useEffect(() => {
    getOrder(orderId).then(setOrder);
    scale.value   = withDelay(100, withSpring(1, { damping: 12, stiffness: 180 }));
    opacity.value = withDelay(100, withTiming(1, { duration: 300 }));
    if (!firedHaptic.current) {
      firedHaptic.current = true;
      setTimeout(() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success), 300);
    }
  }, [orderId]);

  const iconStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  const shortId  = orderId.slice(0, 8).toUpperCase();
  const items    = (order?.items as OrderItem[] | undefined) ?? [];
  const total    = Number((order as any)?.final_total ?? order?.subtotal ?? 0);
  const readyAt  = new Date(Date.now() + READY_IN_MINS * 60 * 1000);
  const readyStr = readyAt.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });

  return (
    <SafeAreaView style={s.safe}>
      <ScrollView
        contentContainerStyle={s.container}
        showsVerticalScrollIndicator={false}
      >
        {/* Animated tick */}
        <Animated.View style={[s.iconWrap, iconStyle]}>
          <View style={s.iconCircle}>
            <Ionicons name="checkmark" size={52} color={colors.cream} />
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(300).springify()} style={{ alignItems: 'center' }}>
          <Text style={s.title}>Order Placed!</Text>
          <Text style={s.sub}>NUR CAFÉ — Deansgate</Text>

          <View style={s.orderIdPill}>
            <Text style={s.orderIdLabel}>ORDER</Text>
            <Text style={s.orderId}>#{shortId}</Text>
          </View>
        </Animated.View>

        {/* ETA */}
        <Animated.View entering={FadeInDown.delay(420).springify()} style={s.etaCard}>
          <Ionicons name="time-outline" size={20} color={colors.brand} />
          <View>
            <Text style={s.etaLabel}>ESTIMATED READY TIME</Text>
            <Text style={s.etaValue}>~{READY_IN_MINS} min · ready by {readyStr}</Text>
          </View>
        </Animated.View>

        {/* Order summary */}
        {items.length > 0 ? (
          <Animated.View entering={FadeInDown.delay(520).springify()} style={s.summaryCard}>
            <Text style={s.summaryTitle}>YOUR ORDER</Text>
            {items.map((item, i) => (
              <View key={i} style={s.summaryRow}>
                <Text style={s.summaryQty}>×{item.qty}</Text>
                <Text style={s.summaryName} numberOfLines={1}>{item.name}</Text>
                <Text style={s.summaryPrice}>£{((item.price + item.extraTotal) * item.qty).toFixed(2)}</Text>
              </View>
            ))}
            <View style={s.totalRow}>
              <Text style={s.totalLabel}>TOTAL</Text>
              <Text style={s.totalValue}>£{total.toFixed(2)}</Text>
            </View>
          </Animated.View>
        ) : (
          <View style={s.summaryCard}>
            <ActivityIndicator color={colors.brand} size="small" />
          </View>
        )}

        {/* Actions */}
        <Animated.View entering={FadeInDown.delay(640).springify()} style={s.actions}>
          <TouchableOpacity
            style={s.trackBtn}
            activeOpacity={0.9}
            onPress={() => navigation.replace('OrderTracking', { orderId })}
          >
            <Ionicons name="time-outline" size={18} color={colors.onBrand} />
            <Text style={s.trackBtnText}>TRACK ORDER</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={s.homeBtn}
            activeOpacity={0.9}
            onPress={() => navigation.reset({ index: 0, routes: [{ name: 'RootTabs' }] })}
          >
            <Text style={s.homeBtnText}>BACK TO HOME</Text>
          </TouchableOpacity>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe:      { flex: 1, backgroundColor: colors.bg },
  container: { alignItems: 'center', paddingHorizontal: spacing['2xl'], paddingVertical: spacing['2xl'] },

  iconWrap:   { marginBottom: spacing['2xl'] },
  iconCircle: {
    width: 120, height: 120, borderRadius: 60,
    backgroundColor: colors.brandDark,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 4, borderColor: colors.cream,
    ...shadow.card,
  },

  title: { ...t.display, color: colors.onBrand, textAlign: 'center', marginBottom: spacing.sm },
  sub:   { ...t.bodyLg, color: colors.onBrand, opacity: 0.75, textAlign: 'center' },

  orderIdPill: {
    marginTop: spacing.lg,
    backgroundColor: colors.card, borderRadius: radius.full,
    paddingHorizontal: spacing.xl, paddingVertical: spacing.md,
    alignItems: 'center', ...shadow.md,
  },
  orderIdLabel: { ...t.labelLg, color: colors.muted, marginBottom: 2 },
  orderId:      { ...t.h2, color: colors.text },

  etaCard: {
    width: '100%', flexDirection: 'row', alignItems: 'center', gap: spacing.md,
    backgroundColor: colors.card, borderRadius: radius.xl,
    borderWidth: 1, borderColor: colors.brand + '40',
    padding: spacing.base, marginTop: spacing.xl, ...shadow.sm,
  },
  etaLabel: { ...t.labelLg, color: colors.muted, fontSize: 10 },
  etaValue:  { ...t.body, color: colors.text, fontFamily: 'Manrope_700Bold', marginTop: 2 },

  summaryCard: {
    width: '100%', backgroundColor: colors.card,
    borderRadius: radius.xl, borderWidth: 1, borderColor: colors.border,
    padding: spacing.base, marginTop: spacing.md, gap: spacing.sm, ...shadow.sm,
    alignItems: 'center',
  },
  summaryTitle: { ...t.labelLg, color: colors.muted, alignSelf: 'flex-start', marginBottom: spacing.xs },
  summaryRow:   { flexDirection: 'row', alignItems: 'center', width: '100%', gap: spacing.sm },
  summaryQty:   { ...t.body, color: colors.brand, fontFamily: 'Manrope_800ExtraBold', width: 28 },
  summaryName:  { ...t.body, color: colors.text, flex: 1 },
  summaryPrice: { ...t.body, color: colors.subText, fontFamily: 'Manrope_600SemiBold' },
  totalRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    width: '100%', borderTopWidth: 1, borderTopColor: colors.border,
    paddingTop: spacing.sm, marginTop: spacing.xs,
  },
  totalLabel: { ...t.labelLg, color: colors.muted },
  totalValue: { ...t.h3, color: colors.text, fontFamily: 'Manrope_800ExtraBold' },

  actions:      { width: '100%', marginTop: spacing['2xl'], gap: spacing.md },
  trackBtn: {
    backgroundColor: colors.card, borderRadius: radius.full,
    paddingVertical: spacing.base,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: spacing.sm, borderWidth: 2, borderColor: colors.onBrand,
  },
  trackBtnText: { ...t.labelLg, color: colors.onBrand },
  homeBtn:      { borderRadius: radius.full, paddingVertical: spacing.base, alignItems: 'center' },
  homeBtnText:  { ...t.labelLg, color: colors.onBrand, opacity: 0.55 },
});
