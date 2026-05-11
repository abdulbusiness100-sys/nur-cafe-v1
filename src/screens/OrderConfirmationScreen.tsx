// src/screens/OrderConfirmationScreen.tsx
import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  useSharedValue, useAnimatedStyle,
  withSpring, withDelay, withTiming, FadeInDown,
} from 'react-native-reanimated';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';
import colors from '../theme/colors';
import { type as t } from '../theme/typography';
import { spacing, radius, shadow } from '../theme/spacing';

type Props = NativeStackScreenProps<RootStackParamList, 'OrderConfirmation'>;

export default function OrderConfirmationScreen({ navigation, route }: Props) {
  const { orderId } = route.params;
  const scale = useSharedValue(0);
  const opacity = useSharedValue(0);

  useEffect(() => {
    scale.value = withDelay(100, withSpring(1, { damping: 12, stiffness: 180 }));
    opacity.value = withDelay(100, withTiming(1, { duration: 300 }));
  }, []);

  const iconStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  const shortId = orderId.slice(0, 8).toUpperCase();

  return (
    <SafeAreaView style={s.safe}>
      <View style={s.container}>

        {/* Animated tick */}
        <Animated.View style={[s.iconWrap, iconStyle]}>
          <View style={s.iconCircle}>
            <Ionicons name="checkmark" size={52} color={colors.onBrand} />
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(300).springify()}>
          <Text style={s.title}>Order Placed!</Text>
          <Text style={s.sub}>
            Your order is being received at{'\n'}NUR CAFÉ — Deansgate
          </Text>

          <View style={s.orderIdPill}>
            <Text style={s.orderIdLabel}>ORDER</Text>
            <Text style={s.orderId}>#{shortId}</Text>
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(500).springify()} style={s.actions}>
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
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  container: {
    flex: 1, alignItems: 'center', justifyContent: 'center',
    paddingHorizontal: spacing['2xl'],
  },

  iconWrap: { marginBottom: spacing['2xl'] },
  iconCircle: {
    width: 120, height: 120, borderRadius: 60,
    backgroundColor: colors.brandDark,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 4, borderColor: colors.onBrand,
    ...shadow.card,
  },

  title: { ...t.display, color: colors.onBrand, textAlign: 'center', marginBottom: spacing.md },
  sub: {
    ...t.bodyLg, color: colors.onBrand, opacity: 0.85,
    textAlign: 'center', lineHeight: 26,
  },

  orderIdPill: {
    marginTop: spacing.xl,
    backgroundColor: colors.card,
    borderRadius: radius.full,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    alignSelf: 'center',
    alignItems: 'center',
    ...shadow.md,
  },
  orderIdLabel: { ...t.labelLg, color: colors.muted, marginBottom: 2 },
  orderId: { ...t.h2, color: colors.text },

  actions: { width: '100%', marginTop: spacing['3xl'], gap: spacing.md },
  trackBtn: {
    backgroundColor: colors.card,
    borderRadius: radius.full,
    paddingVertical: spacing.base,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    borderWidth: 2,
    borderColor: colors.onBrand,
  },
  trackBtnText: { ...t.labelLg, color: colors.onBrand },

  homeBtn: {
    borderRadius: radius.full,
    paddingVertical: spacing.base,
    alignItems: 'center',
  },
  homeBtnText: { ...t.labelLg, color: colors.onBrand, opacity: 0.6 },
});
