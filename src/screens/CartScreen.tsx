// src/screens/CartScreen.tsx
import {
  View, Text, StyleSheet, FlatList,
  TouchableOpacity, Image,
} from 'react-native';
import { resolveImage } from '../utils/imageHelper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';
import colors from '../theme/colors';
import { spacing, radius, touchTarget } from '../theme/spacing';
import { type as t } from '../theme/typography';
import { useCart } from '../context/CartContext';
import * as Haptics from 'expo-haptics';

type Props = NativeStackScreenProps<RootStackParamList, 'Cart'>;

export default function CartScreen({ navigation }: Props) {
  const { items, incrementItem, decrementItem, clearCart, totalPrice, totalItems } = useCart();

  if (items.length === 0) {
    return (
      <SafeAreaView style={s.safe}>
        <Header onBack={() => navigation.goBack()} onClear={undefined} />
        <View style={s.empty}>
          <Ionicons name="cafe-outline" size={64} color={colors.muted} />
          <Text style={s.emptyTitle}>Your order is empty</Text>
          <Text style={s.emptySub}>Add something delicious from the menu</Text>
          <TouchableOpacity
            style={s.browseCta}
            activeOpacity={0.9}
            onPress={() => navigation.navigate('RootTabs', { screen: 'Order' } as any)}
          >
            <Text style={s.browseCtaText}>BROWSE MENU</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={s.safe}>
      <Header onBack={() => navigation.goBack()} onClear={clearCart} />

      {/* Location row */}
      <View style={s.locationRow}>
        <Ionicons name="location-outline" size={14} color={colors.onBrand} />
        <Text style={s.locationText}>NUR CAFÉ — Deansgate, Manchester</Text>
      </View>

      <FlatList
        data={items}
        keyExtractor={(ci) => ci.item.id + ci.extras.join(',')}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: spacing.base, paddingBottom: 140 }}
        renderItem={({ item: ci, index }) => (
          <Animated.View entering={FadeInDown.delay(index * 50).springify()}>
            <View style={s.card}>
              {/* Thumbnail */}
              {resolveImage(ci.item.image) ? (
                <Image source={resolveImage(ci.item.image) as any} style={s.thumb} resizeMode="cover" />
              ) : (
                <View style={s.thumb} />
              )}

              <View style={s.cardBody}>
                <Text style={s.itemName} numberOfLines={2}>{ci.item.name}</Text>
                {ci.extras.length > 0 && (
                  <Text style={s.itemExtras} numberOfLines={1}>{ci.extras.join(', ')}</Text>
                )}
                <Text style={s.itemPrice}>
                  £{((ci.item.price + ci.extraTotal) * ci.quantity).toFixed(2)}
                </Text>
              </View>

              {/* Qty stepper */}
              <View style={s.stepper}>
                <TouchableOpacity
                  style={s.stepBtn}
                  onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); decrementItem(ci.item.id); }}
                  accessibilityLabel="Decrease quantity"
                >
                  <Ionicons name="remove" size={18} color={colors.brand} />
                </TouchableOpacity>
                <Text style={s.qty}>{ci.quantity}</Text>
                <TouchableOpacity
                  style={s.stepBtn}
                  onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); incrementItem(ci.item.id); }}
                  accessibilityLabel="Increase quantity"
                >
                  <Ionicons name="add" size={18} color={colors.brand} />
                </TouchableOpacity>
              </View>
            </View>
          </Animated.View>
        )}
        ListFooterComponent={
          <View style={s.summary}>
            <View style={s.summaryRow}>
              <Text style={s.summaryLabel}>Subtotal</Text>
              <Text style={s.summaryValue}>£{totalPrice.toFixed(2)}</Text>
            </View>
            <View style={s.summaryRow}>
              <Text style={s.summaryLabel}>Items</Text>
              <Text style={s.summaryValue}>{totalItems}</Text>
            </View>
            <View style={[s.summaryRow, s.summaryPoints]}>
              <Ionicons name="star" size={14} color={colors.warning} />
              <Text style={s.summaryLabel}> You'll earn</Text>
              <Text style={[s.summaryValue, { color: colors.warning }]}>
                {Math.floor(totalPrice)} pts
              </Text>
            </View>
          </View>
        }
      />

      {/* Sticky checkout footer */}
      <View style={s.footer}>
        <TouchableOpacity
          style={s.checkoutBtn}
          activeOpacity={0.9}
          onPress={() => navigation.navigate('Checkout')}
        >
          <Text style={s.checkoutText}>
            PROCEED TO CHECKOUT  •  £{totalPrice.toFixed(2)}
          </Text>
          <Ionicons name="arrow-forward" size={16} color={colors.brand} />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

function Header({
  onBack, onClear,
}: {
  onBack: () => void;
  onClear: (() => void) | undefined;
}) {
  return (
    <View style={s.header}>
      <TouchableOpacity onPress={onBack} style={s.backBtn} accessibilityLabel="Go back">
        <Ionicons name="chevron-back" size={22} color={colors.onBrand} />
      </TouchableOpacity>
      <Text style={s.headerTitle}>Your Order</Text>
      {onClear ? (
        <TouchableOpacity onPress={onClear} style={s.clearBtn} accessibilityLabel="Clear cart">
          <Text style={s.clearText}>Clear</Text>
        </TouchableOpacity>
      ) : (
        <View style={{ width: 44 }} />
      )}
    </View>
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
  headerTitle: {
    flex: 1, textAlign: 'center',
    ...t.h2, color: colors.onBrand,
  },
  clearBtn: { width: 44, alignItems: 'flex-end', justifyContent: 'center' },
  clearText: { ...t.body, color: colors.muted },

  locationRow: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: spacing.base, paddingBottom: spacing.sm,
  },
  locationText: { ...t.caption, color: colors.onBrand, opacity: 0.8 },

  // Cart item card
  card: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.md,
    backgroundColor: colors.card, borderRadius: radius.lg,
    borderWidth: 1, borderColor: colors.border,
    padding: spacing.md, marginBottom: spacing.sm,
  },
  thumb: {
    width: 60, height: 60, borderRadius: radius.md,
    backgroundColor: colors.brandSoft,
  },
  cardBody: { flex: 1 },
  itemName: { ...t.body, fontFamily: 'Manrope_700Bold', color: colors.text, lineHeight: 20 },
  itemExtras: { ...t.caption, color: colors.subText, marginTop: 2 },
  itemPrice: { ...t.body, fontFamily: 'Manrope_800ExtraBold', color: colors.text, marginTop: 4 },

  // Qty stepper
  stepper: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: colors.brandSoft, borderRadius: radius.full,
    paddingHorizontal: 8, paddingVertical: 4,
  },
  stepBtn: { padding: 4 },
  qty: {
    ...t.body, fontFamily: 'Manrope_800ExtraBold',
    color: colors.text, minWidth: 20, textAlign: 'center',
  },

  // Order summary
  summary: {
    backgroundColor: colors.card, borderRadius: radius.lg,
    borderWidth: 1, borderColor: colors.border,
    padding: spacing.base, gap: spacing.sm, marginTop: spacing.sm,
  },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  summaryPoints: { paddingTop: spacing.sm, borderTopWidth: 1, borderTopColor: colors.border },
  summaryLabel: { ...t.body, color: colors.subText },
  summaryValue: { ...t.body, fontFamily: 'Manrope_800ExtraBold', color: colors.text },

  // Footer
  footer: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    padding: spacing.base, paddingBottom: spacing.xl,
    backgroundColor: colors.bg,
    shadowColor: '#000', shadowOpacity: 0.08, shadowOffset: { width: 0, height: -4 }, shadowRadius: 12,
  },
  checkoutBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm,
    backgroundColor: colors.card, borderRadius: radius.full,
    paddingVertical: spacing.base,
    borderWidth: 2, borderColor: colors.brand,
  },
  checkoutText: { ...t.labelLg, color: colors.brand, fontSize: 14 },

  // Empty state
  empty: {
    flex: 1, alignItems: 'center', justifyContent: 'center',
    gap: spacing.md, paddingHorizontal: spacing['2xl'],
  },
  emptyTitle: { ...t.h2, color: colors.onBrand, textAlign: 'center' },
  emptySub: { ...t.body, color: colors.onBrand, opacity: 0.75, textAlign: 'center' },
  browseCta: {
    marginTop: spacing.sm, backgroundColor: colors.card,
    borderRadius: radius.full, paddingVertical: spacing.base, paddingHorizontal: spacing['2xl'],
    borderWidth: 2, borderColor: colors.brand,
  },
  browseCtaText: { ...t.labelLg, color: colors.brand },
});
