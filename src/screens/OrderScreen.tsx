// src/screens/OrderScreen.tsx
import { useMemo, useRef, useState, useCallback, useEffect } from 'react';
import { resolveImage } from '../utils/imageHelper';
import {
  View,
  Text,
  StyleSheet,
  SectionList,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ViewToken,
  Dimensions,
  Image,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import colors from '../theme/colors';
import { menu as staticMenu, featured as staticFeatured, categories, type CategoryKey, type MenuItem } from '../data/menu';
import { fetchMenu, fetchFeatured } from '../services/menu';
import MenuCard from '../components/MenuCard';
import { useCart } from '../context/CartContext';
import type { RootStackParamList } from '../navigation/types';
import { spacing, radius, shadow } from '../theme/spacing';
import { type as t } from '../theme/typography';

type Nav = NativeStackNavigationProp<RootStackParamList>;
type SectionT = { title: string; key: CategoryKey | 'chips'; data: MenuItem[] };

const W = Dimensions.get('window').width;
const TILE_GAP = spacing.md;
const TILE_W = (W - spacing.base * 2 - TILE_GAP) / 2;
const CHIPS_H = 54;

export default function OrderScreen() {
  const nav = useNavigation<Nav>();
  const [query, setQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [active, setActive] = useState<CategoryKey>('whats-new');
  const [headerH, setHeaderH] = useState(0);
  const [menuItems, setMenuItems] = useState<MenuItem[]>(staticMenu);
  const [featuredItems, setFeaturedItems] = useState<MenuItem[]>(staticFeatured);
  const [loadingMenu, setLoadingMenu] = useState(false);
  const { totalItems } = useCart();
  const chipsRef = useRef<ScrollView>(null);

  // Load menu from Supabase (falls back to static data automatically)
  useEffect(() => {
    setLoadingMenu(true);
    Promise.all([fetchMenu(), fetchFeatured()])
      .then(([full, feat]) => {
        setMenuItems(full);
        setFeaturedItems(feat);
      })
      .finally(() => setLoadingMenu(false));
  }, []);

  const isOpen = useMemo(() => {
    const now = new Date();
    const total = now.getHours() * 60 + now.getMinutes();
    return total >= 6 * 60 + 30 && total < 20 * 60;
  }, []);

  const listRef = useRef<SectionList<MenuItem, SectionT>>(null);

  const menuSections: SectionT[] = useMemo(() => {
    const q = query.trim().toLowerCase();
    const match = (m: MenuItem) => !q || m.name.toLowerCase().includes(q);
    const from = (k: CategoryKey) => menuItems.filter((m) => m.category === k && match(m));

    return [
      { key: 'whats-new',          title: "What's New",        data: featuredItems.filter(match) },
      { key: 'matcha',             title: 'Signature Matchas',  data: from('matcha') },
      { key: 'speciality-coffee',  title: 'Signature Lattes',   data: from('speciality-coffee') },
      { key: 'hot-coffee',         title: 'Hot Coffee',         data: from('hot-coffee') },
      { key: 'iced-coffee',        title: 'Iced Coffee',        data: from('iced-coffee') },
      { key: 'not-coffee',         title: 'Not Coffee',         data: from('not-coffee') },
      { key: 'loose-tea',          title: 'Loose Leaves Tea',   data: from('loose-tea') },
      { key: 'juices',             title: 'Juices',             data: from('juices') },
    ];
  }, [query, menuItems, featuredItems]);

  const sections: SectionT[] = useMemo(
    () => [{ key: 'chips', title: '', data: [] }, ...menuSections],
    [menuSections],
  );

  const onViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      const header = viewableItems.find(
        (v) => v.section && v.index == null && v.section.key !== 'chips',
      );
      const k = header?.section?.key as CategoryKey | undefined;
      if (k && k !== active) setActive(k);
    },
  ).current;

  const goTo = useCallback(
    (key: CategoryKey) => {
      const idx = sections.findIndex((s) => s.key === key);
      if (idx >= 0) {
        setActive(key);
        listRef.current?.scrollToLocation({
          sectionIndex: idx,
          itemIndex: 0,
          animated: true,
          viewPosition: 0,
          viewOffset: headerH + CHIPS_H + 6,
        });
        // Scroll chips row so active chip is visible
        const chipIdx = categories.findIndex((c) => c.key === key);
        if (chipIdx >= 0) {
          chipsRef.current?.scrollTo({ x: chipIdx * 110, animated: true });
        }
      }
    },
    [sections, headerH],
  );

  const ListHeader = () => (
    <View onLayout={(e) => setHeaderH(e.nativeEvent.layout.height)}>
      {/* Top toolbar */}
      <View style={s.toolsRow}>
        <TouchableOpacity
          onPress={() => setShowSearch((v) => !v)}
          activeOpacity={0.85}
          style={s.iconPill}
          accessibilityLabel="Toggle search"
        >
          <Ionicons name={showSearch ? 'close' : 'search'} size={18} color={colors.brand} />
        </TouchableOpacity>
        <View style={{ flex: 1 }} />
        <TouchableOpacity
          onPress={() => nav.navigate('Cart')}
          activeOpacity={0.85}
          style={s.iconPill}
          accessibilityLabel={`Cart, ${totalItems} items`}
        >
          <Ionicons name="bag-outline" size={18} color={colors.brand} />
          {totalItems > 0 && (
            <View style={s.cartBadge}>
              <Text style={s.cartBadgeText}>{totalItems}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {showSearch && (
        <View style={s.searchBar}>
          <Ionicons name="search" size={16} color={colors.brand} />
          <TextInput
            autoFocus
            placeholder="Search menu"
            placeholderTextColor={colors.muted}
            value={query}
            onChangeText={setQuery}
            style={s.searchInput}
            returnKeyType="search"
          />
          {!!query && (
            <TouchableOpacity onPress={() => setQuery('')}>
              <Ionicons name="close-circle" size={18} color={colors.brand} />
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* Store card */}
      <View style={s.storeCard}>
        <Text style={s.storeTitle}>Nūr Café — Deansgate</Text>
        <View style={s.storeRow}>
          <View style={s.storeThumb} />
          <View style={{ flex: 1 }}>
            <Text style={s.storeAddress}>45 Deansgate, Manchester M3 2AY</Text>
            <Text style={s.storeHours}>
              {isOpen ? 'Open today ' : 'Closed today — opens '}
              <Text style={s.storeBold}>6:30AM – 8:00PM</Text>
            </Text>
          </View>
        </View>
        <View style={s.statusWrap}>
          <View style={[s.statusBadge, isOpen ? s.statusOpen : s.statusClosed]}>
            <Text style={[s.statusText, isOpen ? s.statusOpenText : s.statusClosedText]}>
              {isOpen ? 'OPEN NOW' : 'CLOSED'}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );

  const renderSectionHeader = ({ section }: { section: SectionT }) => {
    if (section.key === 'chips') {
      return (
        <View style={s.chipsSticky}>
          {/* Horizontal ScrollView fixes the overflow bug */}
          <ScrollView
            ref={chipsRef}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={s.chipsContent}
          >
            {menuSections.map((sec) => {
              const isActive = active === sec.key;
              const cat = categories.find((c) => c.key === sec.key);
              return (
                <TouchableOpacity
                  key={sec.key}
                  onPress={() => goTo(sec.key as CategoryKey)}
                  activeOpacity={0.8}
                  style={s.chip}
                >
                  <Text style={[s.chipText, isActive && s.chipTextActive]}>
                    {cat?.label ?? sec.title}
                  </Text>
                  {isActive && <View style={s.chipUnderline} />}
                </TouchableOpacity>
              );
            })}
          </ScrollView>
          <View style={s.chipsShadow} />
        </View>
      );
    }

    return (
      <View style={s.sectionHeader}>
        <Text style={s.sectionTitle}>{section.title}</Text>
      </View>
    );
  };

  const renderItem = ({
    item,
    section,
    index,
  }: {
    item: MenuItem;
    section: SectionT;
    index: number;
  }) => {
    if (section.key === 'chips') return null;

    if (section.key === 'whats-new') {
      if (index !== 0) return null;
      return (
        <View style={s.grid}>
          {section.data.map((m) => (
            <TouchableOpacity
              key={m.id}
              activeOpacity={0.9}
              onPress={() => nav.navigate('Product', { item: m })}
              style={s.tile}
            >
              {resolveImage(m.image) ? (
                <Image source={resolveImage(m.image) as any} style={s.tileThumb} resizeMode="cover" />
              ) : (
                <View style={s.tileThumb} />
              )}
              <Text numberOfLines={2} style={s.tileName}>{m.name}</Text>
              <Text style={s.tilePrice}>£{m.price.toFixed(2)}</Text>
              <View style={s.tileTagsRow}>
                <Text style={s.tag}>NEW</Text>
                <Text style={s.tag}>SEASONAL</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      );
    }

    return (
      <MenuCard
        item={item}
        onPress={(it) => nav.navigate('Product', { item: it })}
      />
    );
  };

  return (
    <View style={s.safe}>
      {loadingMenu && (
        <View style={s.loadingOverlay} pointerEvents="none">
          <ActivityIndicator size="small" color={colors.onBrand} />
        </View>
      )}
      <SectionList<MenuItem, SectionT>
        ref={listRef}
        sections={sections}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={ListHeader}
        renderSectionHeader={renderSectionHeader}
        renderItem={renderItem}
        stickySectionHeadersEnabled
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={{ viewAreaCoveragePercentThreshold: 30 }}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 24 }}
      />
    </View>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },

  loadingOverlay: {
    position: 'absolute', top: 12, right: 12, zIndex: 10,
  },

  // Toolbar
  toolsRow: {
    flexDirection: 'row',
    paddingHorizontal: spacing.base,
    paddingBottom: spacing.sm,
    alignItems: 'center',
  },
  iconPill: {
    width: 44, height: 44, borderRadius: radius.full,
    backgroundColor: colors.card,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: colors.brand,
  },
  cartBadge: {
    position: 'absolute', top: -4, right: -4,
    minWidth: 16, height: 16, borderRadius: 8,
    backgroundColor: colors.brand,
    alignItems: 'center', justifyContent: 'center',
    paddingHorizontal: 3, borderWidth: 1.5, borderColor: colors.card,
  },
  cartBadgeText: { color: colors.card, fontSize: 9, fontFamily: 'Manrope_800ExtraBold', lineHeight: 11 },

  searchBar: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: colors.card,
    marginHorizontal: spacing.base, marginBottom: spacing.sm,
    borderRadius: radius.full, paddingHorizontal: spacing.base, paddingVertical: 10,
    borderWidth: 2, borderColor: colors.brand,
  },
  searchInput: {
    flex: 1,
    fontFamily: 'Manrope_600SemiBold',
    color: colors.text, fontSize: 15,
    paddingVertical: 0, backgroundColor: 'transparent',
  },

  // Store card
  storeCard: {
    marginHorizontal: spacing.base, marginBottom: spacing.md, padding: spacing.base,
    backgroundColor: colors.card, borderRadius: radius['2xl'],
    borderWidth: 1, borderColor: colors.border,
    ...shadow.card,
  },
  storeTitle: { ...t.h2, color: colors.text, marginBottom: 6, fontFamily: 'Amiri_700Bold', fontSize: 22, letterSpacing: 2 },
  storeRow: { flexDirection: 'row', gap: spacing.md, alignItems: 'center' },
  storeThumb: { width: 56, height: 56, borderRadius: radius.lg, backgroundColor: colors.brandSoft },
  storeAddress: { ...t.bodyLg, color: colors.text, fontFamily: 'Manrope_700Bold' },
  storeHours: { ...t.body, color: colors.subText, marginTop: 2 },
  storeBold: { fontFamily: 'Manrope_800ExtraBold', color: colors.text },
  statusWrap: { marginTop: spacing.md, alignSelf: 'flex-start' },
  statusBadge: { paddingHorizontal: spacing.base, paddingVertical: 7, borderRadius: radius.full, borderWidth: 2 },
  statusOpen: { backgroundColor: '#D4EDDA', borderColor: '#2E7D32' },
  statusClosed: { backgroundColor: colors.brandSoft, borderColor: colors.brand },
  statusText: { fontFamily: 'Manrope_800ExtraBold', fontSize: 12, letterSpacing: 0.5 },
  statusOpenText: { color: '#2E7D32' },
  statusClosedText: { color: colors.brand },

  // Sticky chips bar — now properly scrollable
  chipsSticky: { backgroundColor: colors.bg },
  chipsContent: { paddingHorizontal: spacing.md, paddingTop: 10, paddingBottom: 6, gap: 4 },
  chipsShadow: {
    height: 8, backgroundColor: colors.bg,
    shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
  },
  chip: { marginHorizontal: 6, alignItems: 'center' },
  chipText: {
    fontFamily: 'Manrope_700Bold', color: '#EED3CB',
    fontSize: 15, paddingHorizontal: 8, paddingVertical: 6,
  },
  chipTextActive: { color: colors.card },
  chipUnderline: { marginTop: 4, height: 3, width: 32, borderRadius: 2, backgroundColor: colors.card },

  // Section header
  sectionHeader: {
    paddingHorizontal: spacing.base, paddingTop: spacing.md, paddingBottom: spacing.sm,
    backgroundColor: colors.bg,
  },
  sectionTitle: { ...t.h2, color: colors.onBrand },

  // What's New grid
  grid: {
    flexDirection: 'row', flexWrap: 'wrap', gap: TILE_GAP,
    paddingHorizontal: spacing.base, marginBottom: spacing.sm,
  },
  tile: {
    width: TILE_W,
    backgroundColor: colors.card, borderRadius: radius.xl,
    borderWidth: 1, borderColor: colors.border,
    padding: spacing.md, ...shadow.card,
  },
  tileThumb: {
    width: '100%', height: TILE_W - 24,
    borderRadius: radius.lg, backgroundColor: colors.brandSoft,
  },
  tileName: {
    ...t.body, fontFamily: 'Manrope_800ExtraBold',
    color: colors.text, marginTop: spacing.sm, lineHeight: 18,
  },
  tilePrice: { ...t.body, fontFamily: 'Manrope_800ExtraBold', color: colors.text, marginTop: 4 },
  tileTagsRow: { flexDirection: 'row', gap: 6, marginTop: spacing.sm },
  tag: {
    backgroundColor: colors.brandSoft, color: colors.brandDark,
    paddingHorizontal: 8, paddingVertical: 4,
    borderRadius: radius.sm, fontFamily: 'Manrope_800ExtraBold', fontSize: 10,
  },
});
