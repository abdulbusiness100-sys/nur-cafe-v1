// src/screens/OrderDetailScreen.tsx
import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';
import { getOrder, ORDER_STATUS_LABELS } from '../services/orders';
import type { Order, OrderStatus } from '../types/database';
import type { OrderItem } from '../services/orders';
import colors from '../theme/colors';
import { type as t } from '../theme/typography';
import { spacing, radius, touchTarget, shadow } from '../theme/spacing';

type Props = NativeStackScreenProps<RootStackParamList, 'OrderDetail'>;

export default function OrderDetailScreen({ navigation, route }: Props) {
  const { orderId } = route.params;
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getOrder(orderId).then((o) => { setOrder(o); setLoading(false); });
  }, [orderId]);

  if (loading) {
    return (
      <SafeAreaView style={s.safe}>
        <ActivityIndicator color={colors.onBrand} style={{ flex: 1 }} />
      </SafeAreaView>
    );
  }

  const items = (order?.items ?? []) as OrderItem[];
  const date = order ? new Date(order.created_at) : new Date();
  const dateStr = date.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  const timeStr = date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });

  return (
    <SafeAreaView style={s.safe}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn}>
          <Ionicons name="chevron-back" size={22} color={colors.onBrand} />
        </TouchableOpacity>
        <Text style={s.headerTitle}>Order Detail</Text>
        <View style={{ width: touchTarget }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 32 }}>
        {/* Order ID + status */}
        <Animated.View entering={FadeInDown.springify()} style={s.heroCard}>
          <Text style={s.orderId}>#{orderId.slice(0, 8).toUpperCase()}</Text>
          <View style={s.statusBadge}>
            <Text style={s.statusText}>
              {order ? ORDER_STATUS_LABELS[order.status as OrderStatus] : ''}
            </Text>
          </View>
          <Text style={s.dateText}>{dateStr}</Text>
          <Text style={s.timeText}>{timeStr}</Text>
        </Animated.View>

        {/* Items */}
        <Animated.View entering={FadeInDown.delay(100).springify()} style={s.panel}>
          <Text style={s.panelLabel}>ITEMS ORDERED</Text>
          {items.map((item, i) => (
            <View key={i} style={[s.lineItem, i === items.length - 1 && { borderBottomWidth: 0 }]}>
              <View style={{ flex: 1 }}>
                <Text style={s.itemName}>{item.name}</Text>
                {item.extras.length > 0 && (
                  <Text style={s.itemExtras}>{item.extras.join(', ')}</Text>
                )}
              </View>
              <Text style={s.itemQty}>×{item.qty}</Text>
              <Text style={s.itemPrice}>£{((item.price + item.extraTotal) * item.qty).toFixed(2)}</Text>
            </View>
          ))}
        </Animated.View>

        {/* Summary */}
        <Animated.View entering={FadeInDown.delay(200).springify()} style={[s.panel, { marginTop: spacing.sm }]}>
          <Text style={s.panelLabel}>SUMMARY</Text>
          <View style={s.summaryRow}>
            <Text style={s.summaryLabel}>Total</Text>
            <Text style={s.summaryValue}>£{Number(order?.subtotal ?? 0).toFixed(2)}</Text>
          </View>
          <View style={[s.summaryRow, { borderBottomWidth: 0 }]}>
            <Text style={s.summaryLabel}>Points earned</Text>
            <View style={s.pointsPill}>
              <Ionicons name="star" size={12} color={colors.warning} />
              <Text style={s.pointsText}> +{order?.total_points ?? 0} pts</Text>
            </View>
          </View>
        </Animated.View>

        {/* Location */}
        <Animated.View entering={FadeInDown.delay(300).springify()} style={[s.panel, { marginTop: spacing.sm }]}>
          <Text style={s.panelLabel}>LOCATION</Text>
          <View style={s.locationRow}>
            <Ionicons name="location" size={18} color={colors.brand} />
            <View>
              <Text style={s.locationTitle}>NUR CAFÉ — Deansgate</Text>
              <Text style={s.locationAddr}>45 Deansgate, Manchester M3 2AY</Text>
            </View>
          </View>
        </Animated.View>

        {/* Re-order button */}
        <Animated.View entering={FadeInDown.delay(400).springify()}>
          <TouchableOpacity
            style={s.reorderBtn}
            activeOpacity={0.9}
            onPress={() => navigation.reset({ index: 0, routes: [{ name: 'RootTabs', params: { screen: 'Order' } }] })}
          >
            <Ionicons name="refresh" size={16} color={colors.brand} />
            <Text style={s.reorderText}>ORDER AGAIN</Text>
          </TouchableOpacity>
        </Animated.View>
      </ScrollView>
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

  heroCard: {
    marginHorizontal: spacing.base, marginBottom: spacing.sm,
    backgroundColor: colors.card, borderRadius: radius['2xl'],
    padding: spacing.xl, alignItems: 'center', gap: spacing.sm,
    ...shadow.card,
  },
  orderId: { ...t.h1, color: colors.text },
  statusBadge: {
    backgroundColor: colors.brandSoft, borderRadius: radius.full,
    paddingHorizontal: spacing.md, paddingVertical: 4,
  },
  statusText: { ...t.label, color: colors.brandDark },
  dateText: { ...t.bodyLg, color: colors.subText },
  timeText: { ...t.caption, color: colors.muted },

  panel: {
    marginHorizontal: spacing.base,
    backgroundColor: colors.card,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
    ...shadow.sm,
  },
  panelLabel: {
    ...t.label, color: colors.muted,
    paddingHorizontal: spacing.base,
    paddingTop: spacing.base, paddingBottom: spacing.sm,
    borderBottomWidth: 1, borderBottomColor: colors.border,
  },
  lineItem: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.sm,
    paddingHorizontal: spacing.base, paddingVertical: spacing.md,
    borderBottomWidth: 1, borderBottomColor: colors.border,
  },
  itemName: { ...t.bodyLg, color: colors.text },
  itemExtras: { ...t.caption, color: colors.subText, marginTop: 2 },
  itemQty: { ...t.body, color: colors.subText },
  itemPrice: { ...t.price, color: colors.text },

  summaryRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: spacing.base, paddingVertical: spacing.md,
    borderBottomWidth: 1, borderBottomColor: colors.border,
  },
  summaryLabel: { ...t.bodyLg, color: colors.subText },
  summaryValue: { ...t.price, color: colors.text },
  pointsPill: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#FEF3C7', borderRadius: radius.full,
    paddingHorizontal: spacing.sm, paddingVertical: 4,
  },
  pointsText: { ...t.caption, color: '#92400E' },

  locationRow: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.md,
    padding: spacing.base,
  },
  locationTitle: { ...t.h3, color: colors.text },
  locationAddr: { ...t.caption, color: colors.subText },

  reorderBtn: {
    marginHorizontal: spacing.base, marginTop: spacing.base,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: colors.card, borderRadius: radius.full,
    paddingVertical: spacing.base,
    borderWidth: 2, borderColor: colors.brand,
  },
  reorderText: { ...t.label, color: colors.brand },
});
