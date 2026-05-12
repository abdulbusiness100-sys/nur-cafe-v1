// src/screens/NotificationsScreen.tsx
import { useEffect, useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList,
  TouchableOpacity, ActivityIndicator, RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';
import { useAuth } from '../context/AuthContext';
import {
  getUserNotifications,
  markAllRead,
  markNotificationRead,
  subscribeToNotifications,
} from '../services/notifications';
import type { Notification } from '../types/database';
import colors from '../theme/colors';
import { type as t } from '../theme/typography';
import { spacing, radius, touchTarget, shadow } from '../theme/spacing';

export default function NotificationsScreen() {
  const nav = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { user } = useAuth();
  const [notifs, setNotifs] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    if (!user) return;
    const data = await getUserNotifications(user.id).catch(() => []);
    setNotifs(data);
  }, [user]);

  useEffect(() => { load().finally(() => setLoading(false)); }, [load]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }, [load]);

  // Realtime — prepend new notifications as they arrive
  useEffect(() => {
    if (!user) return;
    const sub = subscribeToNotifications(user.id, (newNotif) => {
      setNotifs((prev) => [newNotif, ...prev]);
    });
    return () => { sub.unsubscribe(); };
  }, [user?.id]);

  const handleMarkAllRead = async () => {
    if (!user) return;
    await markAllRead(user.id).catch(() => null);
    setNotifs((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const handleTap = async (notif: Notification) => {
    if (!notif.read) {
      await markNotificationRead(notif.id).catch(() => null);
      setNotifs((prev) =>
        prev.map((n) => (n.id === notif.id ? { ...n, read: true } : n)),
      );
    }
    // Deep-link to the relevant screen based on notification content
    if (notif.order_id) {
      nav.navigate('OrderTracking', { orderId: notif.order_id });
    } else if ((notif as any).type === 'order_ready') {
      nav.navigate('OrderHistory');
    }
  };

  const unreadCount = notifs.filter((n) => !n.read).length;

  return (
    <SafeAreaView style={s.safe}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => nav.goBack()} style={s.backBtn}>
          <Ionicons name="chevron-back" size={22} color={colors.onBrand} />
        </TouchableOpacity>
        <Text style={s.headerTitle}>Notifications</Text>
        {unreadCount > 0 ? (
          <TouchableOpacity onPress={handleMarkAllRead} style={s.readAllBtn}>
            <Text style={s.readAllText}>Mark all read</Text>
          </TouchableOpacity>
        ) : (
          <View style={{ width: touchTarget }} />
        )}
      </View>

      {loading ? (
        <ActivityIndicator color={colors.onBrand} style={{ flex: 1 }} />
      ) : notifs.length === 0 ? (
        <View style={s.empty}>
          <Ionicons name="notifications-off-outline" size={56} color={colors.muted} />
          <Text style={s.emptyTitle}>No notifications yet</Text>
          <Text style={s.emptySub}>Order updates will appear here</Text>
        </View>
      ) : (
        <FlatList
          data={notifs}
          keyExtractor={(n) => n.id}
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
          renderItem={({ item: notif, index }) => (
            <Animated.View entering={FadeInDown.delay(index * 40).springify()}>
              <TouchableOpacity
                style={[s.card, !notif.read && s.cardUnread]}
                activeOpacity={0.85}
                onPress={() => handleTap(notif)}
              >
                <View style={[s.dot, notif.read && s.dotRead]} />
                <View style={{ flex: 1 }}>
                  <Text style={s.cardTitle}>{notif.title}</Text>
                  <Text style={s.cardBody}>{notif.body}</Text>
                  <Text style={s.cardTime}>
                    {new Date(notif.created_at).toLocaleDateString('en-GB', {
                      day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit',
                    })}
                  </Text>
                </View>
              </TouchableOpacity>
            </Animated.View>
          )}
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
  readAllBtn: { paddingHorizontal: spacing.sm, paddingVertical: spacing.xs },
  readAllText: { ...t.caption, color: colors.brand },

  empty: {
    flex: 1, alignItems: 'center', justifyContent: 'center',
    gap: spacing.md, paddingHorizontal: spacing['2xl'],
  },
  emptyTitle: { ...t.h2, color: colors.onBrand },
  emptySub: { ...t.body, color: colors.onBrand, opacity: 0.7, textAlign: 'center' },

  card: {
    flexDirection: 'row', alignItems: 'flex-start', gap: spacing.md,
    backgroundColor: colors.card, borderRadius: radius.xl,
    borderWidth: 1, borderColor: colors.border,
    padding: spacing.base, ...shadow.sm,
  },
  cardUnread: { borderColor: colors.brand, backgroundColor: colors.brandSoft },
  dot: {
    width: 8, height: 8, borderRadius: 4,
    backgroundColor: colors.brand, marginTop: 6,
  },
  dotRead: { backgroundColor: colors.muted },
  cardTitle: { ...t.h3, color: colors.text, marginBottom: 2 },
  cardBody: { ...t.body, color: colors.subText, lineHeight: 20 },
  cardTime: { ...t.caption, color: colors.muted, marginTop: spacing.xs },
});
