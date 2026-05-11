// src/components/MenuCard.tsx
// Phase 4 redesign — 80x80 image · name + description · price + ADD button (spring)
import { View, Text, Image, StyleSheet, Pressable, TouchableOpacity } from 'react-native';
import * as Haptics from 'expo-haptics';
import Animated, {
  useSharedValue, useAnimatedStyle, withSpring, withSequence,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import colors from '../theme/colors';
import { fonts } from '../theme/typography';
import { spacing, radius } from '../theme/spacing';
import { springs } from '../theme/springs';
import type { MenuItem } from '../data/menu';
import { resolveImage } from '../utils/imageHelper';

type Props = {
  item:     MenuItem;
  onPress?: (item: MenuItem) => void;
  onAdd?:   (item: MenuItem) => void;
};

export default function MenuCard({ item, onPress, onAdd }: Props) {
  const src = resolveImage(item.image);

  // Bouncy ADD confirmation: 1 → 0.8 → 1.2 → 1.0
  const addScale = useSharedValue(1);
  const addStyle = useAnimatedStyle(() => ({
    transform: [{ scale: addScale.value }],
  }));

  const handleAdd = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    addScale.value = withSequence(
      withSpring(0.8, springs.addButton),
      withSpring(1.2, springs.addButton),
      withSpring(1.0, springs.addButton),
    );
    onAdd?.(item);
  };

  return (
    <Pressable
      style={({ pressed }) => [s.row, pressed && s.rowPressed]}
      onPress={() => onPress?.(item)}
      accessibilityRole="button"
      accessibilityLabel={`${item.name}, £${item.price.toFixed(2)}`}
    >
      {/* ── Image ─────────────────────────────────────────────────── */}
      <View style={s.imgWrap}>
        {src
          ? <Image source={src as any} style={s.img} resizeMode="cover" />
          : <View style={s.imgPlaceholder} />
        }
      </View>

      {/* ── Text ──────────────────────────────────────────────────── */}
      <View style={s.center}>
        <Text style={s.name} numberOfLines={2}>{item.name}</Text>
        {!!item.description && (
          <Text style={s.description} numberOfLines={2}>{item.description}</Text>
        )}
      </View>

      {/* ── Price + ADD ───────────────────────────────────────────── */}
      <View style={s.right}>
        <Text style={s.price}>£{item.price.toFixed(2)}</Text>
        <Animated.View style={addStyle}>
          <TouchableOpacity
            style={s.addBtn}
            onPress={handleAdd}
            accessibilityLabel={`Add ${item.name} to cart`}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons name="add" size={20} color={colors.cream} />
          </TouchableOpacity>
        </Animated.View>
      </View>
    </Pressable>
  );
}

const s = StyleSheet.create({
  row: {
    flexDirection:   'row',
    alignItems:      'center',
    gap:             spacing.md,
    backgroundColor: colors.cream,
    borderRadius:    radius.xl,
    padding:         spacing.md,
  },
  rowPressed: { opacity: 0.87 },

  imgWrap: {
    width:        80,
    height:       80,
    borderRadius: 12,
    overflow:     'hidden',
    flexShrink:   0,
  },
  img: { width: '100%', height: '100%' },
  imgPlaceholder: {
    width:           '100%',
    height:          '100%',
    backgroundColor: colors.creamDeep,
  },

  center: { flex: 1 },
  name: {
    fontFamily:   fonts.bold,
    fontSize:     16,
    color:        colors.deepBrown,
    lineHeight:   21,
    marginBottom: 3,
  },
  description: {
    fontFamily: fonts.regular,
    fontSize:   13,
    color:      colors.subText,
    lineHeight: 18,
  },

  right: {
    alignItems: 'center',
    gap:        spacing.sm,
    flexShrink: 0,
  },
  price: {
    fontFamily: fonts.extrabold,
    fontSize:   16,
    color:      colors.terracotta,
  },
  addBtn: {
    width:           32,
    height:          32,
    borderRadius:    16,
    backgroundColor: colors.terracotta,
    alignItems:      'center',
    justifyContent:  'center',
  },
});
