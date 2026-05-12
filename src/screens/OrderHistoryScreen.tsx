// src/screens/OrderHistoryScreen.tsx
import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList,
  TouchableOpacity, ActivityIndicator, RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';
import { getUserOrders, ORDER_STATUS_LABELS } from '../services/orders';
import type { Order, OrderStatus } from '../types/database';
import type { OrderItem } from '../services/orders';
import { useAuth } from '../context/AuthContext';
import colors from '../theme/colors';
import { type as t } from '../theme/typography';
import { spacing, radius, touchTarget, shadow } from '../theme/spacing';

type Props = NativeStackScreenProps<RootStackParamList, 'OrderHistory'>;

const STATUS_COLORS: Record<OrderStatus, string> = {
  pending:   '#FEF3C7',
  preparing: '#DBEAFE',
  ready:     '#D1FAE5',
  complete:  colors.brandSoft,
  cancelled: '#FEE2E2',
};

const STATUS_TEXT: Record<OrderStatus, string> = {
  pending:   '#92400E',
  preparing: '#1E40AF',
  ready:     '#065F46',
  complete:  colors.brandDark,
  cancelled: '#991B1B',
};

export default function OrderHistoryScreen({ navigation }: Props) {
  const { user } = useAuth();
  const [orders, setOrders]       = useState<Order[]>([]);
  const [loading, setLoading]     = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchOrders = useCallback(async () => {
    if (!user) return;
    const data = await getUserOrders(user.id).catch(() => []);
    setOrders(data);
  }, [user]);

  useEffect(() => {
    fetchOrders().finally(() => setLoading(false));
  }, [fetchOrders]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchOrders();
    setRefreshing(false);
  }, [fetchOrders]);

  const renderItem = ({ item: order, index }: { item: Order; index: number }) => {
    const items = order.items as OrderItem[];
    const firstItem = items[0]?.name ?? 'Order';
    const extraCount = items.length - 1;
    const date = new Date(order.created_at);
    const dateStr = date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

    return (
      <Animated.View entering={FadeInDown.delay(index * 60).springify()}>
        <TouchableOpacity
          style={s.card}
          activeOpacity={0.85}
          onPress={() => navigation.navigate('OrderDetail', { orderId: order.id })}
        >
          <View style={s.cardTop}>
            <View style={{ flex: 1 }}>
              <Text style={s.cardTitle} numberOfLines={1}>
                {firstItem}{extraCount > 0 ? ` +${extraCount} more` : ''}
              </Text>
              <Text style={s.cardDate}>{dateStr}</Text>
            </View>
            <View style={[s.statusBadge, { backgroundColor: STATUS_COLORS[order.status] }]}>
              <Text style={[s.statusText, { color: STATUS_TEXT[order.status] }]}>
                {ORDER_STATUS_LABELS[order.status].toUpperCase()}
              </Text>
            </View>
          </View>
          <View style={s.cardBottom}>
            <Text style={s.cardTotal}>£{Number((order as any).final_total ?? order.subtotal).toFixed(2)}</Text>
            <View style={s.pointsRow}>
              <Ionicons name="star" size={12} color={colors.warning} />
              <Text style={s.pointsText}> {order.total_points} pts</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color={colors.muted} />
          </View>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  return (
    <SafeAreaView style={s.safe}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn}>
          <Ionicons name="chevron-back" size={22} color={colors.onBrand} />
        </TouchableOpacity>
        <Text style={s.headerTitle}>Order History</Text>
        <View style={{ width: touchTarget }} />
      </View>

      {loading ? (
        <ActivityIndicator color={colors.onBrand} style={{ flex: 1 }} />
      ) : orders.length === 0 ? (
        <View style={s.empty}>
          <Ionicons name="receipt-outline" size={56} color={colors.muted} />
          <Text style={s.emptyTitle}>No orders yet</Text>
          <Text style={s.emptySub}>Your order history will appear here</Text>
          <TouchableOpacity
            style={s.browseBtn}
            onPress={() => navigation.reset({ index: 0, routes: [{ name: 'RootTabs' }] })}
          >
            <Text style={s.browseBtnText}>BROWSE MENU</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={orders}
          keyExtractor={(o) => o.id}
          renderItem={renderItem}
          contentContainerStyle={{ padding: spacing.base, gap: spacing.sm, paddingBottom: 32 }}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={colors.brand}
              colors={[colors.brand]}
            />
          }
        />
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

  card: {
    backgroundColor: colors.card,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.base,
    ...shadow.sm,
  },
  cardTop: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm, marginBottom: spacing.sm },
  cardTitle: { ...t.h3, color: colors.text },
  cardDate: { ...t.caption, color: colors.subText, marginTop: 2 },
  statusBadge: {
    borderRadius: radius.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    alignSelf: 'flex-start',
  },
  statusText: { ...t.labelLg, fontSize: 10 },
  cardBottom: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  cardTotal: { ...t.price, color: colors.text, flex: 1 },
  pointsRow: { flexDirection: 'row', alignItems: 'center' },
  pointsText: { ...t.caption, color: colors.subText },

  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.md, paddingHorizontal: spacing['2xl'] },
  emptyTitle: { ...t.h2, color: colors.onBrand },
  emptySub: { ...t.body, color: colors.onBrand, opacity: 0.7, textAlign: 'center' },
  browseBtn: {
    marginTop: spacing.md,
    backgroundColor: colors.card,
    borderRadius: radius.full,
    paddingVertical: spacing.base,
    paddingHorizontal: spacing['2xl'],
    borderWidth: 2,
    borderColor: colors.brand,
  },
  browseBtnText: { ...t.labelLg, color: colors.brand },
});
