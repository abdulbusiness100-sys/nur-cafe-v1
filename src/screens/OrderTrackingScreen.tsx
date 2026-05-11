// src/screens/OrderTrackingScreen.tsx
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown, useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';
import { getOrder, subscribeToOrder, ORDER_STATUS_LABELS, ORDER_STATUS_STEPS } from '../services/orders';
import type { Order, OrderStatus } from '../types/database';
import colors from '../theme/colors';
import { type as t } from '../theme/typography';
import { spacing, radius, touchTarget, shadow } from '../theme/spacing';

type Props = NativeStackScreenProps<RootStackParamList, 'OrderTracking'>;

const STATUS_ICONS: Record<OrderStatus, keyof typeof Ionicons.glyphMap> = {
  pending:   'receipt-outline',
  preparing: 'cafe-outline',
  ready:     'checkmark-circle-outline',
  complete:  'checkmark-done-circle-outline',
  cancelled: 'close-circle-outline',
};

export default function OrderTrackingScreen({ navigation, route }: Props) {
  const { orderId } = route.params;
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getOrder(orderId).then((o) => { setOrder(o); setLoading(false); });
    const channel = subscribeToOrder(orderId, (updated) => setOrder(updated));
    return () => { channel.unsubscribe(); };
  }, [orderId]);

  const currentStepIndex = order
    ? ORDER_STATUS_STEPS.indexOf(order.status as OrderStatus)
    : 0;

  if (loading) {
    return (
      <SafeAreaView style={s.safe}>
        <ActivityIndicator color={colors.onBrand} style={{ flex: 1 }} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={s.safe}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn}>
          <Ionicons name="chevron-back" size={22} color={colors.onBrand} />
        </TouchableOpacity>
        <Text style={s.headerTitle}>Track Order</Text>
        <View style={{ width: touchTarget }} />
      </View>

      <View style={s.idRow}>
        <Text style={s.idLabel}>ORDER #{orderId.slice(0, 8).toUpperCase()}</Text>
      </View>

      {/* Status card */}
      <Animated.View entering={FadeInDown.springify()} style={s.statusCard}>
        <View style={s.statusIconWrap}>
          <Ionicons
            name={order ? STATUS_ICONS[order.status] : 'receipt-outline'}
            size={36}
            color={colors.brand}
          />
        </View>
        <Text style={s.statusTitle}>
          {order ? ORDER_STATUS_LABELS[order.status] : 'Loading...'}
        </Text>
        {order?.status === 'ready' && (
          <Text style={s.statusHint}>Head to the counter to collect your order</Text>
        )}
        {order?.status === 'preparing' && (
          <Text style={s.statusHint}>Our baristas are working on your order</Text>
        )}
      </Animated.View>

      {/* Progress stepper */}
      <View style={s.stepperWrap}>
        {ORDER_STATUS_STEPS.map((step, i) => {
          const done = i <= currentStepIndex;
          const active = i === currentStepIndex;
          return (
            <Animated.View
              key={step}
              entering={FadeInDown.delay(i * 80).springify()}
              style={s.stepRow}
            >
              <View style={[s.stepDot, done && s.stepDotDone, active && s.stepDotActive]}>
                {done && <Ionicons name="checkmark" size={12} color={colors.onBrand} />}
              </View>
              {i < ORDER_STATUS_STEPS.length - 1 && (
                <View style={[s.stepLine, done && i < currentStepIndex && s.stepLineDone]} />
              )}
              <Text style={[s.stepLabel, done && s.stepLabelDone]}>
                {ORDER_STATUS_LABELS[step]}
              </Text>
            </Animated.View>
          );
        })}
      </View>

      {/* Location */}
      <Animated.View entering={FadeInDown.delay(400).springify()} style={s.locationCard}>
        <Ionicons name="location" size={20} color={colors.brand} />
        <View style={{ flex: 1 }}>
          <Text style={s.locationTitle}>NUR CAFÉ — Deansgate</Text>
          <Text style={s.locationAddr}>45 Deansgate, Manchester M3 2AY</Text>
        </View>
      </Animated.View>

      {order?.status === 'complete' && (
        <TouchableOpacity
          style={s.doneBtn}
          activeOpacity={0.9}
          onPress={() => navigation.reset({ index: 0, routes: [{ name: 'RootTabs' }] })}
        >
          <Text style={s.doneBtnText}>BACK TO HOME</Text>
        </TouchableOpacity>
      )}
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

  idRow: { alignItems: 'center', marginBottom: spacing.base },
  idLabel: { ...t.labelLg, color: colors.onBrand, opacity: 0.6 },

  statusCard: {
    marginHorizontal: spacing.base,
    backgroundColor: colors.card,
    borderRadius: radius['2xl'],
    padding: spacing.xl,
    alignItems: 'center',
    gap: spacing.sm,
    ...shadow.card,
  },
  statusIconWrap: {
    width: 72, height: 72, borderRadius: 36,
    backgroundColor: colors.brandSoft,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  statusTitle: { ...t.h1, color: colors.text, textAlign: 'center' },
  statusHint: { ...t.body, color: colors.subText, textAlign: 'center' },

  stepperWrap: {
    marginHorizontal: spacing.base,
    marginTop: spacing.xl,
    backgroundColor: colors.card,
    borderRadius: radius['2xl'],
    padding: spacing.base,
    gap: 0,
    ...shadow.sm,
  },
  stepRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: spacing.sm },
  stepDot: {
    width: 24, height: 24, borderRadius: 12,
    borderWidth: 2, borderColor: colors.muted,
    alignItems: 'center', justifyContent: 'center',
    marginRight: spacing.md,
  },
  stepDotDone: { backgroundColor: colors.brand, borderColor: colors.brand },
  stepDotActive: { borderColor: colors.brand },
  stepLine: {
    position: 'absolute',
    left: 11, top: 36,
    width: 2, height: 20,
    backgroundColor: colors.border,
  },
  stepLineDone: { backgroundColor: colors.brand },
  stepLabel: { ...t.body, color: colors.muted },
  stepLabelDone: { color: colors.text, fontFamily: 'Manrope_700Bold' },

  locationCard: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.md,
    marginHorizontal: spacing.base,
    marginTop: spacing.base,
    backgroundColor: colors.card,
    borderRadius: radius.xl,
    padding: spacing.base,
    ...shadow.sm,
  },
  locationTitle: { ...t.h3, color: colors.text },
  locationAddr: { ...t.caption, color: colors.subText },

  doneBtn: {
    marginHorizontal: spacing.base,
    marginTop: spacing.base,
    backgroundColor: colors.card,
    borderRadius: radius.full,
    paddingVertical: spacing.base,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.brand,
  },
  doneBtnText: { ...t.labelLg, color: colors.brand },
});
