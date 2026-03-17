import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import colors from '../theme/colors';

type Tab = {
  key: string;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  iconActive?: keyof typeof Ionicons.glyphMap;
};

type Props = {
  value: string;
  onChange: (key: string) => void;
  tabs: Tab[];
};

export default function TabBar({ value, onChange, tabs }: Props) {
  const inset = useSafeAreaInsets();
  const bottomPad = Math.max(inset.bottom, 8);

  return (
    <View style={[styles.wrap, { paddingBottom: bottomPad }]}>
      {tabs.map((t) => {
        const active = t.key === value;
        return (
          <TouchableOpacity
            key={t.key}
            style={styles.item}
            onPress={() => onChange(t.key)}
            activeOpacity={0.85}
          >
            <Ionicons
              name={(active ? t.iconActive : t.icon) as any}
              size={22}
              color={active ? colors.text : colors.muted}
            />
            <Text numberOfLines={1} style={[styles.label, active && styles.labelActive]}>
              {t.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const TAB_H = 54; // slim, not chunky

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    height: TAB_H + (Platform.OS === 'android' ? 4 : 0),
    backgroundColor: colors.card,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
    alignItems: 'center',
    justifyContent: 'space-around',
    shadowColor: colors.shadow,
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 6,
  },
  item: { alignItems: 'center', minWidth: 68, gap: 4 },
  label: { fontSize: 12, color: colors.muted, fontFamily: 'Manrope_600SemiBold' },
  labelActive: { color: colors.text, fontFamily: 'Manrope_700Bold' },
});
