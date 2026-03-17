import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import colors from '../theme/colors';
import type { MenuItem } from '../data/menu';
import { resolveImage } from '../utils/imageHelper';

type Props = { item: MenuItem; onPress?: (item: MenuItem) => void };

export default function MenuCard({ item, onPress }: Props) {
  const src = resolveImage(item.image);
  return (
    <TouchableOpacity style={styles.row} onPress={() => onPress?.(item)} activeOpacity={0.85}>
      {src ? (
        <Image source={src as any} style={styles.thumb} resizeMode="cover" />
      ) : (
        <View style={styles.thumb} />
      )}
      <View style={styles.center}>
        <Text style={styles.name}>{item.name}</Text>
      </View>
      <Text style={styles.price}>{`\u00a3${item.price.toFixed(2)}`}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
    borderRadius: 16,
    marginHorizontal: 16,
    marginBottom: 12,
  },
  thumb: { width: 64, height: 64, borderRadius: 12, backgroundColor: '#E8E0D8' },
  center: { flex: 1 },
  name: { fontSize: 18, fontFamily: 'Manrope_700Bold', color: colors.text },
  price: { fontSize: 18, fontFamily: 'Manrope_700Bold', color: colors.text },
});

