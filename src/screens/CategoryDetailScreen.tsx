// src/screens/CategoryDetailScreen.tsx
// Category drill-down — shows filtered menu items for a single category
import { useState, useEffect, useMemo } from 'react';
import {
  View, Text, FlatList, TextInput, TouchableOpacity,
  ScrollView, StyleSheet, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';
import { menu as staticMenu, featured as staticFeatured, type MenuItem } from '../data/menu';
import { fetchMenu, fetchFeatured } from '../services/menu';
import { useCart } from '../context/CartContext';
import MenuCard from '../components/MenuCard';
import colors from '../theme/colors';
import { fonts } from '../theme/typography';
import { spacing, radius } from '../theme/spacing';

type Props = NativeStackScreenProps<RootStackParamList, 'CategoryDetail'>;

export default function CategoryDetailScreen({ route }: Props) {
  const { category, titleEn, titleAr } = route.params;
  const nav = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { addItem } = useCart();

  const [menuItems,  setMenuItems]  = useState<MenuItem[]>(staticMenu);
  const [featured,   setFeatured]   = useState<MenuItem[]>(staticFeatured);
  const [loading,    setLoading]    = useState(false);
  const [query,      setQuery]      = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [activeChip, setActiveChip] = useState<string>('All');

  useEffect(() => {
    setLoading(true);
    Promise.all([fetchMenu(), fetchFeatured()])
      .then(([full, feat]) => {
        setMenuItems(full);
        setFeatured(feat);
      })
      .finally(() => setLoading(false));
  }, []);

  // ─── Price-range chips ───────────────────────────────────────────────────────
  const CHIPS = [
    { key: 'All',      label: 'All',      test: (_p: number) => true          },
    { key: 'Under £4', label: 'Under £4', test: (p: number) => p < 4          },
    { key: '£4 – £6',  label: '£4 – £6',  test: (p: number) => p >= 4 && p <= 6 },
    { key: 'Over £6',  label: 'Over £6',  test: (p: number) => p > 6          },
  ];

  const items = useMemo(() => {
    const base = category === 'whats-new' ? featured : menuItems.filter((m) => m.category === category);

    // Search filter
    const searched = !query.trim()
      ? base
      : base.filter((m) => m.name.toLowerCase().includes(query.trim().toLowerCase()));

    // Price chip filter
    const chip = CHIPS.find((c) => c.key === activeChip);
    return chip && chip.key !== 'All' ? searched.filter((m) => chip.test(m.price)) : searched;
  }, [category, menuItems, featured, query, activeChip]);

  // Only show chips if more than one price bracket is occupied
  const visibleChips = useMemo(() => {
    const base = category === 'whats-new' ? featured : menuItems.filter((m) => m.category === category);
    const occupied = CHIPS.filter((c) => c.key !== 'All' && base.some((m) => c.test(m.price)));
    return occupied.length > 1 ? CHIPS : [];
  }, [category, menuItems, featured]);

  return (
    <SafeAreaView style={s.safe} edges={['top']}>

      {/* ── Header ─────────────────────────────────────────────────────── */}
      <View style={s.header}>
        <TouchableOpacity
          style={s.backBtn}
          onPress={() => nav.goBack()}
          accessibilityLabel="Go back"
        >
          <Ionicons name="chevron-back" size={22} color={colors.terracotta} />
        </TouchableOpacity>

        <View style={s.titleBlock}>
          <Text style={s.titleEn}>{titleEn}</Text>
        </View>

        <TouchableOpacity
          style={s.searchToggle}
          onPress={() => {
            setShowSearch((v) => !v);
            if (showSearch) setQuery('');
          }}
          accessibilityLabel="Toggle search"
        >
          <Ionicons
            name={showSearch ? 'close' : 'search'}
            size={20}
            color={colors.terracotta}
          />
        </TouchableOpacity>
      </View>

      {/* ── Search bar — slides down when toggled ────────────────────── */}
      {showSearch && (
        <Animated.View
          entering={FadeInDown.duration(200)}
          style={s.searchBar}
        >
          <Ionicons name="search" size={16} color={colors.muted} />
          <TextInput
            autoFocus
            style={s.searchInput}
            placeholder={`Search ${titleEn.toLowerCase()}...`}
            placeholderTextColor={colors.muted}
            value={query}
            onChangeText={setQuery}
            returnKeyType="search"
          />
          {!!query && (
            <TouchableOpacity onPress={() => setQuery('')}>
              <Ionicons name="close-circle" size={18} color={colors.muted} />
            </TouchableOpacity>
          )}
        </Animated.View>
      )}

      {/* ── Price-range chip filters ─────────────────────────────────── */}
      {visibleChips.length > 0 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={s.chipsRow}
        >
          {visibleChips.map((chip) => (
            <TouchableOpacity
              key={chip.key}
              onPress={() => setActiveChip(chip.key)}
              style={[s.chip, activeChip === chip.key && s.chipActive]}
              activeOpacity={0.75}
            >
              <Text style={[s.chipText, activeChip === chip.key && s.chipTextActive]}>
                {chip.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}

      {/* ── Item list ───────────────────────────────────────────────── */}
      {loading ? (
        <View style={s.loadingWrap}>
          <ActivityIndicator color={colors.terracotta} />
        </View>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={s.listContent}
          ItemSeparatorComponent={() => <View style={s.separator} />}
          renderItem={({ item, index }) => (
            <Animated.View entering={FadeInDown.delay(index * 40).springify()}>
              <MenuCard
                item={item}
                onPress={(it) => nav.navigate('Product', { item: it })}
                onAdd={(it) => addItem(it)}
              />
            </Animated.View>
          )}
          ListEmptyComponent={
            <View style={s.emptyWrap}>
              <Ionicons name="cafe-outline" size={40} color={colors.muted} />
              <Text style={s.emptyText}>Nothing found</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.sand },

  // ─── Header ────────────────────────────────────────────────────────────
  header: {
    flexDirection:     'row',
    alignItems:        'center',
    paddingHorizontal: spacing.base,
    paddingVertical:   spacing.sm,
    gap:               spacing.sm,
  },
  backBtn: {
    width:           40,
    height:          40,
    borderRadius:    radius.full,
    backgroundColor: colors.cream,
    alignItems:      'center',
    justifyContent:  'center',
    borderWidth:     1,
    borderColor:     colors.creamDeep,
  },
  titleBlock: { flex: 1, alignItems: 'center' },
  titleEn: {
    fontFamily: fonts.extrabold,
    fontSize:   18,
    color:      colors.deepBrown,
    lineHeight: 22,
  },
  searchToggle: {
    width:           40,
    height:          40,
    borderRadius:    radius.full,
    backgroundColor: colors.cream,
    alignItems:      'center',
    justifyContent:  'center',
    borderWidth:     1,
    borderColor:     colors.creamDeep,
  },

  // ─── Search bar ────────────────────────────────────────────────────────
  searchBar: {
    flexDirection:     'row',
    alignItems:        'center',
    gap:               spacing.sm,
    backgroundColor:   colors.cream,
    marginHorizontal:  spacing.base,
    marginBottom:      spacing.sm,
    borderRadius:      12,
    paddingHorizontal: spacing.base,
    height:            44,
    borderWidth:       1,
    borderColor:       colors.creamDeep,
  },
  searchInput: {
    flex:       1,
    fontFamily: fonts.medium,
    fontSize:   15,
    color:      colors.deepBrown,
    paddingVertical: 0,
  },

  // ─── List ──────────────────────────────────────────────────────────────
  listContent: {
    paddingHorizontal: spacing.base,
    paddingTop:        spacing.sm,
    paddingBottom:     32,
  },
  separator: {
    height:          1,
    backgroundColor: colors.creamDeep,
    marginVertical:  4,
    marginHorizontal: spacing.md,
  },

  // ─── States ───────────────────────────────────────────────────────────
  loadingWrap: {
    flex: 1,
    alignItems:     'center',
    justifyContent: 'center',
  },
  emptyWrap: {
    alignItems:     'center',
    justifyContent: 'center',
    paddingTop:     60,
    gap:            spacing.sm,
  },
  emptyText: {
    fontFamily: fonts.medium,
    fontSize:   15,
    color:      colors.muted,
  },

  // ─── Chips ─────────────────────────────────────────────────────────────
  chipsRow: {
    paddingHorizontal: spacing.base,
    paddingBottom:     spacing.sm,
    gap:               spacing.sm,
    flexDirection:     'row',
  },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical:   6,
    borderRadius:      radius.full,
    backgroundColor:   colors.cream,
    borderWidth:       1,
    borderColor:       colors.creamDeep,
  },
  chipActive: {
    backgroundColor: colors.terracotta,
    borderColor:     colors.terracotta,
  },
  chipText: {
    fontFamily: fonts.bold,
    fontSize:   12,
    color:      colors.subText,
  },
  chipTextActive: {
    color: '#FFF',
  },
});
