// src/screens/ProductScreen.tsx
import { useMemo, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Image, Pressable, TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { resolveImage } from '../utils/imageHelper';
import type { RootStackParamList } from '../navigation/types';
import { getAllowedOptionIds } from '../data/productExtras';
import colors from '../theme/colors';
import { spacing, radius, shadow, touchTarget } from '../theme/spacing';
import { type as t } from '../theme/typography';
import { useCart } from '../context/CartContext';

type Props = NativeStackScreenProps<RootStackParamList, 'Product'>;

type Opt = { id: string; label: string; price: number };

const MILK: Opt[] = [
  { id: 'semi',    label: 'Semi Skimmed Milk', price: 0    },
  { id: 'oat',     label: 'Oat Milk',          price: 0.5  },
  { id: 'coconut', label: 'Coconut Milk',       price: 0.5  },
  { id: 'almond',  label: 'Almond Milk',        price: 0.5  },
];
const SYRUP: Opt[] = [
  { id: 'caramel',  label: 'Caramel Syrup',        price: 0.5 },
  { id: 'hazelnut', label: 'Hazelnut Syrup',        price: 0.5 },
  { id: 'vanilla',  label: 'French Vanilla Syrup',  price: 0.5 },
];
const EXTRAS: Opt[] = [
  { id: 'ice',          label: 'Ice',          price: 0.5 },
  { id: 'extra-shot',   label: 'Extra Shot',   price: 0.5 },
  { id: 'cheese-foam',  label: 'Cheese Foam',  price: 2.0 },
  { id: 'decaf',        label: 'Decaf',        price: 0   },
  { id: 'extra-hot',    label: 'Extra Hot',    price: 0   },
];

const ALL_OPTS = [...MILK, ...SYRUP, ...EXTRAS];

const SIZE: Opt[] = [
  { id: 'size-regular', label: 'Regular', price: 0   },
  { id: 'size-large',   label: 'Large',   price: 1.0 },
];

export default function ProductScreen({ route, navigation }: Props) {
  const { item } = route.params;
  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const [selectedSize, setSelectedSize] = useState<string>('size-regular');
  const [notes, setNotes] = useState('');
  const [added, setAdded] = useState(false);
  const { addItem } = useCart();

  const isJuice = item.category === 'juices';

  const toggle = (id: string) => setSelected((s) => ({ ...s, [id]: !s[id] }));

  const allowedIds = useMemo(
    () => new Set(getAllowedOptionIds(item.category, item.id)),
    [item.category, item.id],
  );

  const allowedMilk   = MILK.filter((o) => allowedIds.has(o.id));
  const allowedSyrup  = SYRUP.filter((o) => allowedIds.has(o.id));
  const allowedExtras = EXTRAS.filter((o) => allowedIds.has(o.id));

  const extraTotal = useMemo(() => {
    const optsTotal = ALL_OPTS
      .filter((o) => allowedIds.has(o.id))
      .reduce((sum, o) => (selected[o.id] ? sum + o.price : sum), 0);
    const sizeExtra = isJuice ? (SIZE.find((s) => s.id === selectedSize)?.price ?? 0) : 0;
    return optsTotal + sizeExtra;
  }, [selected, allowedIds, selectedSize, isJuice]);

  const selectedLabels = useMemo(() => {
    const extraLabels = ALL_OPTS
      .filter((o) => allowedIds.has(o.id) && selected[o.id])
      .map((o) => o.label);
    if (isJuice) {
      const sizeLabel = SIZE.find((s) => s.id === selectedSize)?.label ?? 'Regular';
      return [sizeLabel, ...extraLabels];
    }
    return extraLabels;
  }, [selected, allowedIds, selectedSize, isJuice]);

  const total = (item.price + extraTotal).toFixed(2);

  const handleAddToOrder = () => {
    const allExtras = notes.trim()
      ? [...selectedLabels, `Note: ${notes.trim()}`]
      : selectedLabels;
    addItem(item, allExtras, extraTotal);
    setAdded(true);
    setTimeout(() => navigation.goBack(), 700);
  };

  return (
    <SafeAreaView style={s.safe} edges={['bottom']}>
      {/* Back button — overlays the hero */}
      <Pressable
        onPress={() => navigation.goBack()}
        style={s.backBtn}
        accessibilityLabel="Go back"
        accessibilityRole="button"
      >
        <Ionicons name="chevron-back" size={20} color={colors.brand} />
      </Pressable>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
        {/* Hero image */}
        <View style={s.heroWrap}>
          {resolveImage(item.image) ? (
            <Image source={resolveImage(item.image) as any} style={s.heroImg} resizeMode="cover" />
          ) : (
            <View style={[s.heroImg, s.heroPlaceholder]} />
          )}
        </View>

        {/* Name + price */}
        <Animated.View entering={FadeInDown.delay(60).springify()} style={s.titleWrap}>
          <Text style={s.name}>{item.name}</Text>
          {item.description ? (
            <Text style={s.description}>{item.description}</Text>
          ) : null}
          <Text style={s.basePrice}>from £{item.price.toFixed(2)}</Text>
        </Animated.View>

        {/* Customisation sections */}
        {isJuice && (
          <Animated.View entering={FadeInDown.delay(100).springify()}>
            <SizeSection data={SIZE} selectedId={selectedSize} onSelect={setSelectedSize} />
          </Animated.View>
        )}
        {allowedMilk.length > 0 && (
          <Animated.View entering={FadeInDown.delay(120).springify()}>
            <OptSection title="Milk" data={allowedMilk} selected={selected} toggle={toggle} />
          </Animated.View>
        )}
        {allowedSyrup.length > 0 && (
          <Animated.View entering={FadeInDown.delay(180).springify()}>
            <OptSection title="Syrup" data={allowedSyrup} selected={selected} toggle={toggle} />
          </Animated.View>
        )}
        {allowedExtras.length > 0 && (
          <Animated.View entering={FadeInDown.delay(240).springify()}>
            <OptSection title="Extras" data={allowedExtras} selected={selected} toggle={toggle} />
          </Animated.View>
        )}
        {!isJuice && allowedMilk.length === 0 && allowedSyrup.length === 0 && allowedExtras.length === 0 && (
          <View style={{ paddingHorizontal: spacing.base, paddingVertical: spacing.md }}>
            <Text style={{ fontFamily: 'Manrope_400Regular', fontSize: 14, color: colors.muted, textAlign: 'center' }}>
              This item has no customisation options.
            </Text>
          </View>
        )}

        {/* Special instructions */}
        <Animated.View entering={FadeInDown.delay(300).springify()}>
          <View style={[s.section, { marginBottom: spacing.xl }]}>
            <Text style={s.sectionTitle}>Special Instructions</Text>
            <TextInput
              style={s.notesInput}
              value={notes}
              onChangeText={setNotes}
              placeholder="E.g. extra hot, no foam, allergy note..."
              placeholderTextColor={colors.muted}
              multiline
              numberOfLines={3}
              maxLength={200}
              returnKeyType="done"
              blurOnSubmit
            />
          </View>
        </Animated.View>
      </ScrollView>

      {/* Sticky footer CTA */}
      <Animated.View entering={FadeInDown.delay(300).springify()} style={s.footer}>
        <TouchableOpacity
          style={[s.cta, added && s.ctaAdded]}
          activeOpacity={0.9}
          onPress={handleAddToOrder}
          disabled={added}
        >
          <Text style={s.ctaText}>
            {added ? 'ADDED \u2713' : `ADD TO ORDER  •  £${total}`}
          </Text>
        </TouchableOpacity>
      </Animated.View>
    </SafeAreaView>
  );
}

// ── Sub-components ────────────────────────────────────────────────────────────

function OptSection({
  title, data, selected, toggle,
}: {
  title: string;
  data: Opt[];
  selected: Record<string, boolean>;
  toggle: (id: string) => void;
}) {
  return (
    <View style={s.section}>
      <Text style={s.sectionTitle}>{title}</Text>
      {data.map((o, i) => (
        <TouchableOpacity
          key={o.id}
          onPress={() => toggle(o.id)}
          style={[s.optRow, i < data.length - 1 && s.optBorder]}
          activeOpacity={0.8}
        >
          <View style={[s.checkbox, selected[o.id] && s.checkboxOn]}>
            {selected[o.id] && <Ionicons name="checkmark" size={12} color={colors.card} />}
          </View>
          <Text style={s.optText}>{o.label}</Text>
          <Text style={s.optPrice}>
            {o.price > 0 ? `+£${o.price.toFixed(2)}` : 'FREE'}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

function SizeSection({
  data,
  selectedId,
  onSelect,
}: {
  data: Opt[];
  selectedId: string;
  onSelect: (id: string) => void;
}) {
  return (
    <View style={s.section}>
      <Text style={s.sectionTitle}>Size</Text>
      {data.map((o, i) => (
        <TouchableOpacity
          key={o.id}
          onPress={() => onSelect(o.id)}
          style={[s.optRow, i < data.length - 1 && s.optBorder]}
          activeOpacity={0.8}
        >
          {/* Radio dot */}
          <View style={[s.radio, selectedId === o.id && s.radioOn]}>
            {selectedId === o.id && <View style={s.radioDot} />}
          </View>
          <Text style={s.optText}>{o.label}</Text>
          <Text style={s.optPrice}>{o.price > 0 ? `+£${o.price.toFixed(2)}` : 'Included'}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },

  backBtn: {
    position: 'absolute', top: 12, left: spacing.base, zIndex: 20,
    width: touchTarget, height: touchTarget, borderRadius: radius.full,
    backgroundColor: colors.card, alignItems: 'center', justifyContent: 'center',
    ...shadow.sm,
  },

  heroWrap: { width: '100%', height: 280 },
  heroImg: { width: '100%', height: '100%' },
  heroPlaceholder: { backgroundColor: colors.brandSoft },

  titleWrap: { padding: spacing.base, paddingTop: spacing.xl },
  name: { ...t.h1, color: colors.onBrand, lineHeight: 34 },
  description: { ...t.body, color: colors.onBrand, opacity: 0.75, marginTop: spacing.sm },
  basePrice: { ...t.price, color: colors.onBrand, marginTop: spacing.sm },

  section: {
    marginHorizontal: spacing.base, marginBottom: spacing.md,
    backgroundColor: colors.card, borderRadius: radius.xl,
    borderWidth: 1, borderColor: colors.border, overflow: 'hidden',
  },
  sectionTitle: {
    ...t.h3, color: colors.text,
    padding: spacing.base,
    borderBottomWidth: 1, borderBottomColor: colors.border,
  },
  optRow: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.md,
    paddingHorizontal: spacing.base, paddingVertical: 14,
    minHeight: touchTarget,
  },
  optBorder: { borderBottomWidth: 1, borderBottomColor: colors.border },
  checkbox: {
    width: 22, height: 22, borderRadius: 6,
    borderWidth: 1.5, borderColor: colors.muted,
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  checkboxOn: { backgroundColor: colors.brand, borderColor: colors.brand },
  optText: { flex: 1, ...t.body, color: colors.text },
  optPrice: { ...t.body, color: colors.subText },

  radio: {
    width: 22, height: 22, borderRadius: 11,
    borderWidth: 1.5, borderColor: colors.muted,
    alignItems: 'center', justifyContent: 'center',
  },
  radioOn: { borderColor: colors.brand, backgroundColor: 'transparent' },
  radioDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: colors.brand },

  notesInput: {
    padding: spacing.base,
    fontFamily: 'Manrope_400Regular',
    fontSize: 14,
    color: colors.text,
    minHeight: 72,
    textAlignVertical: 'top',
  },

  footer: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    padding: spacing.base, paddingBottom: spacing.xl,
    backgroundColor: colors.bg,
    shadowColor: '#000', shadowOpacity: 0.08, shadowOffset: { width: 0, height: -4 }, shadowRadius: 12,
  },
  cta: {
    backgroundColor: colors.brand, borderRadius: radius.full,
    paddingVertical: spacing.base, alignItems: 'center',
  },
  ctaAdded: { backgroundColor: '#4A8A5A' },
  ctaText: { ...t.labelLg, color: '#FFF', fontSize: 14 },
});
