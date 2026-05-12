// src/screens/OrderScreen.tsx
import {
  View, Text, FlatList, Pressable, StyleSheet, Dimensions, TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  FadeInDown,
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useCart } from '../context/CartContext';
import { categories, type Category } from '../data/categories';
import type { RootStackParamList } from '../navigation/types';
import colors from '../theme/colors';
import { fonts } from '../theme/typography';
import { spacing, radius } from '../theme/spacing';

type Nav = NativeStackNavigationProp<RootStackParamList>;

const W = Dimensions.get('window').width;
const COL_GAP = 12;
const H_PAD = 16;
const CELL_W = (W - H_PAD * 2 - COL_GAP * 2) / 3;

// Ionicons per category
const CATEGORY_ICONS: Record<string, React.ComponentProps<typeof Ionicons>['name']> = {
  'whats-new':         'sparkles-outline',
  'hot-coffee':        'cafe-outline',
  'iced-coffee':       'snow-outline',
  'speciality-coffee': 'ribbon-outline',
  'not-coffee':        'heart-outline',
  'loose-tea':         'leaf-outline',
  'juices':            'nutrition-outline',
  'matcha':            'flower-outline',
};

// ─── Individual cell with its own float + press animation ────────────────────
function CategoryCell({
  cat,
  index,
  onPress,
}: {
  cat: Category;
  index: number;
  onPress: () => void;
}) {
  const pressScale = useSharedValue(1);
  const pressStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pressScale.value }],
  }));

  return (
    <Animated.View
      entering={FadeInDown.delay(index * 60).springify()}
      style={pressStyle}
    >
      <Pressable
        onPressIn={() => {
          pressScale.value = withSpring(0.93, { mass: 0.7, damping: 11, stiffness: 180 });
        }}
        onPressOut={() => {
          pressScale.value = withSpring(1.0, { mass: 0.7, damping: 11, stiffness: 180 });
        }}
        onPress={onPress}
        style={s.cell}
        accessibilityRole="button"
        accessibilityLabel={`${cat.en} category`}
      >
        <View style={s.iconWrap}>
          <Ionicons
            name={CATEGORY_ICONS[cat.key] ?? 'cafe-outline'}
            size={36}
            color={colors.terracotta}
          />
        </View>
        <Text style={s.cellEn} numberOfLines={1}>{cat.en}</Text>
      </Pressable>
    </Animated.View>
  );
}

// ─── Main screen ─────────────────────────────────────────────────────────────
export default function OrderScreen() {
  const nav    = useNavigation<Nav>();
  const insets = useSafeAreaInsets();
  const { totalItems } = useCart();

  const handleCategoryPress = (cat: Category) => {
    nav.navigate('CategoryDetail', {
      category: cat.key,
      titleEn:  cat.en,
      titleAr:  cat.ar,
    });
  };

  return (
    <View style={[s.safe, { paddingTop: insets.top }]}>
      <FlatList
        data={categories}
        keyExtractor={(c) => c.key}
        numColumns={3}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[s.listContent, { paddingBottom: insets.bottom + 24 }]}
        columnWrapperStyle={s.row}
        ListHeaderComponent={() => (
          <View style={s.header}>
            {/* Top bar — title + cart */}
            <View style={s.topBar}>
              <View style={{ flex: 1 }}>
                <Text style={s.headingEn}>What would you like?</Text>
              </View>
              <TouchableOpacity
                onPress={() => nav.navigate('Cart')}
                style={s.cartBtn}
                accessibilityLabel={`Cart, ${totalItems} items`}
                activeOpacity={0.85}
              >
                <Ionicons name="bag-outline" size={20} color={colors.terracotta} />
                {totalItems > 0 && (
                  <View style={s.cartBadge}>
                    <Text style={s.cartBadgeText}>{totalItems}</Text>
                  </View>
                )}
              </TouchableOpacity>
            </View>
          </View>
        )}
        renderItem={({ item, index }) => (
          <CategoryCell
            cat={item}
            index={index}
            onPress={() => handleCategoryPress(item)}
          />
        )}
      />
    </View>
  );
}

const s = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.sand,
  },

  listContent: {
    paddingHorizontal: H_PAD,
    paddingTop: spacing.sm,
  },

  row: {
    gap: COL_GAP,
    marginBottom: COL_GAP,
  },

  // ─── Header ────────────────────────────────────────────────────────────────
  header: {
    paddingBottom: spacing.xl,
  },
  topBar: {
    flexDirection: 'row',
    alignItems:    'center',
    paddingTop:    spacing.md,
  },
  headingEn: {
    fontFamily: fonts.extrabold,
    fontSize:   22,
    color:      colors.deepBrown,
    lineHeight: 28,
  },
  cartBtn: {
    width:           44,
    height:          44,
    borderRadius:    22,
    backgroundColor: colors.cream,
    alignItems:      'center',
    justifyContent:  'center',
    shadowColor:     colors.deepBrown,
    shadowOpacity:   0.08,
    shadowRadius:    6,
    shadowOffset:    { width: 0, height: 2 },
    elevation:       3,
  },
  cartBadge: {
    position:         'absolute',
    top:              -2,
    right:            -2,
    minWidth:         16,
    height:           16,
    borderRadius:     8,
    backgroundColor:  colors.terracotta,
    alignItems:       'center',
    justifyContent:   'center',
    paddingHorizontal: 3,
    borderWidth:      1.5,
    borderColor:      colors.sand,
  },
  cartBadgeText: {
    fontFamily: fonts.extrabold,
    fontSize:   9,
    color:      colors.cream,
    lineHeight: 11,
  },

  // ─── Category cell ─────────────────────────────────────────────────────────
  cell: {
    width:           CELL_W,
    backgroundColor: colors.cream,
    borderRadius:    20,
    padding:         spacing.md,
    alignItems:      'center',
    shadowColor:     colors.deepBrown,
    shadowOpacity:   0.06,
    shadowRadius:    8,
    shadowOffset:    { width: 0, height: 3 },
    elevation:       3,
  },
  iconWrap: {
    width:           72,
    height:          72,
    borderRadius:    radius.xl,
    backgroundColor: `${colors.terracotta}12`,
    alignItems:      'center',
    justifyContent:  'center',
    marginBottom:    spacing.sm,
  },
  cellEn: {
    fontFamily: fonts.bold,
    fontSize:   12,
    color:      colors.deepBrown,
    textAlign:  'center',
    lineHeight: 16,
  },
});
