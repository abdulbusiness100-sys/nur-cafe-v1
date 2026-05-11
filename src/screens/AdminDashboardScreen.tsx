// src/screens/AdminDashboardScreen.tsx
// Admin order management — live Supabase Realtime feed with haptic alerts
import { useEffect, useState, useCallback, useRef } from 'react';
import {
  View, Text, StyleSheet, FlatList,
  TouchableOpacity, ActivityIndicator, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown, FadeIn } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { supabase } from '../config/supabase';
import { useAuth } from '../context/AuthContext';
import type { Order, OrderStatus } from '../types/database';
import type { OrderItem } from '../services/orders';
import { ORDER_STATUS_LABELS } from '../services/orders';
import colors from '../theme/colors';
import { type as t } from '../theme/typography';
import { spacing, radius, shadow } from '../theme/spacing';

const STATUS_TABS: { key: OrderStatus | 'all'; label: string }[] = [
  { key: 'all',       label: 'All'    },
  { key: 'pending',   label: 'New'    },
  { key: 'preparing', label: 'Making' },
  { key: 'ready',     label: 'Ready'  },
  { key: 'complete',  label: 'Done'   },
];

const STATUS_COLORS: Record<OrderStatus, string> = {
  pending:   '#FEF3C7',
  preparing: '#DBEAFE',
  ready:     '#D1FAE5',
  complete:  '#F3F4F6',
  cancelled: '#FEE2E2',
};
const STATUS_TEXT_COLORS: Record<OrderStatus, string> = {
  pending:   '#92400E',
  preparing: '#1E40AF',
  ready:     '#065F46',
  complete:  '#374151',
  cancelled: '#991B1B',
};

const NEXT_ACTION: Partial<Record<OrderStatus, { label: string; next: OrderStatus }>> = {
  pending:   { label: 'START MAKING',   next: 'preparing' },
  preparing: { label: 'MARK READY',     next: 'ready'     },
  ready:     { label: 'MARK COLLECTED', next: 'complete'  },
};

type AdminOrder = Order & { customer_name?: string };

export default function AdminDashboardScreen() {
  const { signOut } = useAuth();
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<OrderStatus | 'all'>('pending');
  const [updating, setUpdating] = useState<string | null>(null);
  const prevPendingCount = useRef(0);

  const fetchOrders = useCallback(async () => {
    const { data, error } = await supabase
      .from('orders')
      .select('*, profiles(name)')
      .order('created_at', { ascending: true });

    if (!error && data) {
      const mapped: AdminOrder[] = data.map((o: any) => ({
        ...o,
        customer_name: o.profiles?.name ?? 'Guest',
      }));
      setOrders(mapped);

      // Haptic + switch to New tab when a fresh order arrives
      const newPending = mapped.filter((o) => o.status === 'pending').length;
      if (newPending > prevPendingCount.current) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
        setTab('pending');
      }
      prevPendingCount.current = newPending;
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchOrders();
    const channel = supabase
      .channel('admin-orders')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, fetchOrders)
      .subscribe();
    return () => { channel.unsubscribe(); };
  }, [fetchOrders]);

  const VALID_STATUSES: OrderStatus[] = ['pending', 'preparing', 'ready', 'complete', 'cancelled'];

  const updateStatus = async (order: AdminOrder, newStatus: OrderStatus) => {
    if (!VALID_STATUSES.includes(newStatus)) return;
    setUpdating(order.id);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase as any).from('orders').update({ status: newStatus }).eq('id', order.id);
    if (error) {
      Alert.alert('Error', 'Could not update order status.');
    } else if (newStatus === 'ready' && order.user_id) {
      // Notify the customer their order is ready
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (supabase as any).from('notifications').insert({
        user_id:    order.user_id,
        title:      'Your order is ready ☕',
        body:       'Head to the counter to collect your order.',
        type:       'order_ready',
        read:       false,
        created_at: new Date().toISOString(),
      });
    }
    setUpdating(null);
  };

  const cancelOrder = (order: AdminOrder) =>
    Alert.alert('Cancel Order', 'Are you sure?', [
      { text: 'No', style: 'cancel' },
      { text: 'Cancel Order', style: 'destructive', onPress: () => updateStatus(order, 'cancelled') },
    ]);

  // Daily stats
  const today = new Date().toDateString();
  const todayOrders = orders.filter((o) => new Date(o.created_at).toDateString() === today && o.status !== 'cancelled');
  const todayRevenue = todayOrders.reduce((s, o) => s + Number(o.subtotal), 0);
  const pendingCount = orders.filter((o) => o.status === 'pending').length;

  const displayed = tab === 'all'
    ? orders.filter((o) => o.status !== 'complete' && o.status !== 'cancelled')
    : orders.filter((o) => o.status === tab);

  return (
    <SafeAreaView style={s.safe}>
      {/* ── Header ── */}
      <View style={s.header}>
        <View>
          <Text style={s.brandText}>NŪR CAFÉ</Text>
          <Text style={s.headerSub}>Order Dashboard</Text>
        </View>
        <View style={s.headerRight}>
          {pendingCount > 0 && (
            <Animated.View entering={FadeIn} style={s.alertBadge}>
              <Text style={s.alertBadgeText}>{pendingCount} NEW</Text>
            </Animated.View>
          )}
          <TouchableOpacity onPress={signOut} style={s.logoutBtn} accessibilityLabel="Sign out">
            <Ionicons name="log-out-outline" size={20} color={colors.onBrand} />
          </TouchableOpacity>
        </View>
      </View>

      {/* ── Today's stats strip ── */}
      <View style={s.statsRow}>
        <View style={s.statChip}>
          <Text style={s.statChipValue}>{todayOrders.length}</Text>
          <Text style={s.statChipLabel}>Today's orders</Text>
        </View>
        <View style={s.statDivider} />
        <View style={s.statChip}>
          <Text style={s.statChipValue}>£{todayRevenue.toFixed(2)}</Text>
          <Text style={s.statChipLabel}>Today's revenue</Text>
        </View>
        <View style={s.statDivider} />
        <View style={s.statChip}>
          <Text style={[s.statChipValue, pendingCount > 0 && { color: '#DC2626' }]}>{pendingCount}</Text>
          <Text style={s.statChipLabel}>Awaiting</Text>
        </View>
      </View>

      {/* ── Filter tabs ── */}
      <View style={s.tabsRow}>
        {STATUS_TABS.map((st) => {
          const count = st.key === 'all'
            ? orders.filter((o) => o.status !== 'complete' && o.status !== 'cancelled').length
            : orders.filter((o) => o.status === st.key).length;
          const active = tab === st.key;
          return (
            <TouchableOpacity key={st.key} onPress={() => setTab(st.key)} style={[s.tabChip, active && s.tabChipActive]}>
              <Text style={[s.tabChipText, active && s.tabChipTextActive]}>
                {st.label}{count > 0 ? ` (${count})` : ''}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* ── Order list ── */}
      {loading ? (
        <ActivityIndicator color={colors.onBrand} style={{ flex: 1 }} />
      ) : displayed.length === 0 ? (
        <View style={s.empty}>
          <Ionicons name="checkmark-circle-outline" size={56} color={colors.muted} />
          <Text style={s.emptyText}>All clear</Text>
        </View>
      ) : (
        <FlatList
          data={displayed}
          keyExtractor={(o) => o.id}
          contentContainerStyle={{ padding: spacing.base, gap: spacing.sm, paddingBottom: 32 }}
          showsVerticalScrollIndicator={false}
          renderItem={({ item: order, index }) => {
            const items = order.items as OrderItem[];
            const action = NEXT_ACTION[order.status as OrderStatus];
            const elapsed = Math.round((Date.now() - new Date(order.created_at).getTime()) / 60000);
            const isUrgent = order.status === 'pending' && elapsed >= 5;

            return (
              <Animated.View entering={FadeInDown.delay(index * 40).springify()}>
                <View style={[s.card, isUrgent && s.cardUrgent]}>
                  {/* Urgent stripe */}
                  {isUrgent && (
                    <View style={s.urgentStripe}>
                      <Ionicons name="time" size={12} color="#FFF" />
                      <Text style={s.urgentText}>WAITING {elapsed}m — ACTION NEEDED</Text>
                    </View>
                  )}

                  {/* Top row */}
                  <View style={s.cardTop}>
                    <View style={{ flex: 1 }}>
                      <Text style={s.cardId}>#{order.id.slice(0, 8).toUpperCase()}</Text>
                      <Text style={s.cardCustomer}>{order.customer_name}</Text>
                    </View>
                    <View style={s.cardTopRight}>
                      <View style={[s.statusPill, { backgroundColor: STATUS_COLORS[order.status as OrderStatus] }]}>
                        <Text style={[s.statusPillText, { color: STATUS_TEXT_COLORS[order.status as OrderStatus] }]}>
                          {ORDER_STATUS_LABELS[order.status as OrderStatus].toUpperCase()}
                        </Text>
                      </View>
                      <Text style={[s.elapsed, isUrgent && { color: '#DC2626', fontFamily: 'Manrope_700Bold' }]}>
                        {elapsed}m ago
                      </Text>
                    </View>
                  </View>

                  {/* Items */}
                  <View style={s.itemList}>
                    {items.map((it, i) => (
                      <Text key={i} style={s.itemLine} numberOfLines={2}>
                        ×{it.qty}  {it.name}
                        {it.extras.length > 0 ? `  ·  ${it.extras.join(', ')}` : ''}
                      </Text>
                    ))}
                  </View>

                  {/* Total */}
                  <View style={s.totalRow}>
                    <Text style={s.totalLabel}>Order total</Text>
                    <Text style={s.totalValue}>£{Number(order.subtotal).toFixed(2)}</Text>
                  </View>

                  {/* Primary action */}
                  {action && (
                    <TouchableOpacity
                      style={s.actionBtn}
                      activeOpacity={0.85}
                      disabled={updating === order.id}
                      onPress={() => updateStatus(order, action.next)}
                    >
                      {updating === order.id
                        ? <ActivityIndicator size="small" color="#FFF" />
                        : <Text style={s.actionBtnText}>{action.label}</Text>}
                    </TouchableOpacity>
                  )}

                  {/* Cancel */}
                  {(order.status === 'pending' || order.status === 'preparing') && (
                    <TouchableOpacity style={s.cancelBtn} activeOpacity={0.85} onPress={() => cancelOrder(order)}>
                      <Text style={s.cancelBtnText}>CANCEL ORDER</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </Animated.View>
            );
          }}
        />
      )}
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },

  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: spacing.base, paddingVertical: spacing.md,
    borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.12)',
  },
  brandText: { fontFamily: 'Amiri_700Bold', fontSize: 22, color: colors.onBrand, letterSpacing: 3 },
  headerSub: { ...t.caption, color: colors.muted, marginTop: 2 },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  alertBadge: {
    backgroundColor: '#DC2626', borderRadius: radius.full,
    paddingHorizontal: spacing.sm, paddingVertical: 4,
  },
  alertBadgeText: { color: '#FFF', fontFamily: 'Manrope_800ExtraBold', fontSize: 11 },
  logoutBtn: {
    width: 40, height: 40, borderRadius: radius.full,
    backgroundColor: colors.card, alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: colors.border,
  },

  // Stats strip
  statsRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around',
    paddingVertical: spacing.md,
    backgroundColor: 'rgba(0,0,0,0.12)',
    borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.08)',
  },
  statChip: { alignItems: 'center' },
  statChipValue: { ...t.h2, color: colors.onBrand },
  statChipLabel: { ...t.caption, color: colors.muted, marginTop: 2 },
  statDivider: { width: 1, height: 32, backgroundColor: 'rgba(255,255,255,0.15)' },

  // Tabs
  tabsRow: {
    flexDirection: 'row', paddingHorizontal: spacing.base,
    paddingVertical: spacing.sm, gap: spacing.xs, flexWrap: 'wrap',
  },
  tabChip: {
    paddingHorizontal: spacing.md, paddingVertical: 8,
    borderRadius: radius.full, backgroundColor: colors.card,
    borderWidth: 1, borderColor: colors.border,
  },
  tabChipActive: { backgroundColor: colors.brand, borderColor: colors.brand },
  tabChipText: { ...t.labelLg, color: colors.subText, fontSize: 12 },
  tabChipTextActive: { color: '#FFF' },

  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.md },
  emptyText: { ...t.h3, color: colors.muted },

  // Cards
  card: {
    backgroundColor: colors.card, borderRadius: radius.xl,
    borderWidth: 1, borderColor: colors.border,
    overflow: 'hidden', ...shadow.card,
  },
  cardUrgent: { borderColor: '#FCA5A5', borderWidth: 2 },
  urgentStripe: {
    backgroundColor: '#DC2626', flexDirection: 'row', alignItems: 'center',
    gap: spacing.xs, paddingHorizontal: spacing.base, paddingVertical: 6,
  },
  urgentText: { color: '#FFF', fontFamily: 'Manrope_800ExtraBold', fontSize: 10, letterSpacing: 0.5 },

  cardTop: { flexDirection: 'row', alignItems: 'flex-start', padding: spacing.base, paddingBottom: spacing.sm },
  cardId: { ...t.h3, color: colors.text },
  cardCustomer: { ...t.caption, color: colors.subText, marginTop: 2 },
  cardTopRight: { alignItems: 'flex-end', gap: 4 },
  statusPill: { borderRadius: radius.full, paddingHorizontal: spacing.sm, paddingVertical: 4 },
  statusPillText: { fontFamily: 'Manrope_800ExtraBold', fontSize: 10 },
  elapsed: { ...t.caption, color: colors.muted },

  itemList: {
    backgroundColor: colors.bg, marginHorizontal: spacing.base,
    borderRadius: radius.md, padding: spacing.md, marginBottom: spacing.sm, gap: 4,
  },
  itemLine: { ...t.body, color: colors.text },

  totalRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    paddingHorizontal: spacing.base, paddingBottom: spacing.md,
  },
  totalLabel: { ...t.body, color: colors.subText },
  totalValue: { ...t.price, color: colors.text },

  actionBtn: {
    backgroundColor: colors.brand, marginHorizontal: spacing.base,
    borderRadius: radius.full, paddingVertical: spacing.base,
    alignItems: 'center', marginBottom: spacing.sm,
  },
  actionBtnText: { ...t.labelLg, color: '#FFF' },

  cancelBtn: {
    marginHorizontal: spacing.base, marginBottom: spacing.base,
    borderRadius: radius.full, paddingVertical: spacing.sm,
    alignItems: 'center', borderWidth: 1, borderColor: '#DC2626',
  },
  cancelBtnText: { ...t.labelLg, color: '#DC2626', fontSize: 12 },
});