// src/screens/ProfileScreen.tsx
import { Linking, View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';
import colors from '../theme/colors';
import { spacing, radius } from '../theme/spacing';
import { type as t } from '../theme/typography';
import { useAuth } from '../context/AuthContext';

type Nav = NativeStackNavigationProp<RootStackParamList>;

type RowProps = {
  label: string;
  onPress?: () => void;
  last?: boolean;
  icon?: keyof typeof Ionicons.glyphMap;
  disabled?: boolean;
};

function Row({ label, onPress, last, icon, disabled }: RowProps) {
  return (
    <TouchableOpacity
      activeOpacity={disabled ? 1 : 0.7}
      onPress={disabled ? undefined : onPress}
      style={[s.row, last && { borderBottomWidth: 0 }]}
    >
      {icon && (
        <Ionicons
          name={icon}
          size={18}
          color={colors.muted}
          style={{ marginRight: spacing.md }}
        />
      )}
      <Text style={[s.rowText, disabled && { color: colors.muted }]}>{label}</Text>
      {!disabled && <Ionicons name="chevron-forward" size={16} color={colors.muted} />}
    </TouchableOpacity>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <>
      <Text style={s.sectionTitle}>{title}</Text>
      <View style={s.card}>{children}</View>
    </>
  );
}

export default function ProfileScreen() {
  const nav = useNavigation<Nav>();
  const { profile, signOut } = useAuth();
  const userName = profile?.name ?? 'Guest';
  const initial = userName.charAt(0).toUpperCase();
  const points = profile?.points ?? 0;
  const tier = profile?.tier ?? 'bronze';

  const openEmail = () => Linking.openURL('mailto:info@nurcafe.co.uk');
  const openWebsite = () => Linking.openURL('https://www.nurcafe.co.uk');

  return (
    <SafeAreaView style={s.safe}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 32 }}>

        {/* Header with gradient */}
        <View style={s.headerWrap}>
          <LinearGradient
            colors={[colors.bg, '#F6EDE6']}
            start={{ x: 0.5, y: 0 }}
            end={{ x: 0.5, y: 1 }}
            style={s.headerGrad}
          />
          <View style={s.headerCurve} />
          <View style={s.hero}>
            <View style={s.avatar}>
              <Text style={s.initial}>{initial}</Text>
            </View>
            <Text style={s.name}>{userName}</Text>
            <View style={s.statRow}>
              <View style={s.stat}>
                <Ionicons name="star" size={14} color={colors.warning} />
                <Text style={s.statValue}> {points}</Text>
                <Text style={s.statLabel}> pts</Text>
              </View>
              <View style={s.statDivider} />
              <View style={s.stat}>
                <Text style={s.statValue}>{tier.charAt(0).toUpperCase() + tier.slice(1)}</Text>
                <Text style={s.statLabel}> member</Text>
              </View>
            </View>
          </View>
        </View>

        <Section title="Profile">
          <Row label="Account"        onPress={() => nav.navigate('Account')}       icon="person-outline" />
          <Row label="Wallet"         onPress={() => nav.navigate('RootTabs', { screen: 'Gifts & Wallet' } as any)} icon="wallet-outline" />
          <Row label="Loyalty"        onPress={() => nav.navigate('RootTabs', { screen: 'Loyalty' } as any)}        icon="star-outline" />
          <Row label="Order history"  onPress={() => nav.navigate('OrderHistory')}  icon="receipt-outline" />
          <Row label="Notifications"  onPress={() => nav.navigate('Notifications')} icon="notifications-outline" last />
        </Section>

        <Section title="Gifting">
          <Row label="Gift cards" onPress={() => nav.navigate('RootTabs', { screen: 'Gifts & Wallet' } as any)} icon="gift-outline" last />
        </Section>

        <Section title="Support">
          <Row label="Contact us"       onPress={openEmail}   icon="chatbubble-outline" />
          <Row label="Visit our website" onPress={openWebsite} icon="globe-outline" last />
        </Section>

        <Section title="About">
          <Row label="Privacy"      onPress={() => Linking.openURL('https://www.nurcafe.co.uk/privacy')}    icon="lock-closed-outline" />
          <Row label="Terms of Use" onPress={() => Linking.openURL('https://www.nurcafe.co.uk/terms')}      icon="document-text-outline" last />
        </Section>

        <TouchableOpacity activeOpacity={0.85} style={s.logout} onPress={signOut}>
          <Text style={s.logoutText}>LOG OUT</Text>
        </TouchableOpacity>

        <Text style={s.version}>App version 1.0.0</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },

  headerWrap: { position: 'relative' },
  headerGrad: { height: 140, width: '100%' },
  headerCurve: {
    height: 28, backgroundColor: colors.bg,
    borderTopLeftRadius: 32, borderTopRightRadius: 32, marginTop: -14,
  },
  hero: { alignItems: 'center', paddingTop: 4, paddingBottom: spacing.md },
  avatar: {
    width: 96, height: 96, borderRadius: 48,
    backgroundColor: colors.brand,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 5, borderColor: colors.bg,
    shadowColor: colors.shadow, shadowOpacity: 0.18, shadowRadius: 10,
    elevation: 6,
  },
  initial: { color: colors.card, fontSize: 40, fontFamily: 'Manrope_800ExtraBold' },
  name: { ...t.h2, color: colors.text, marginTop: spacing.md },

  statRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, marginTop: spacing.sm },
  stat: { flexDirection: 'row', alignItems: 'baseline' },
  statValue: { ...t.body, fontFamily: 'Manrope_700Bold', color: colors.text },
  statLabel: { ...t.caption, color: colors.subText },
  statDivider: { width: 1, height: 14, backgroundColor: colors.border },

  sectionTitle: {
    paddingHorizontal: spacing.base, marginTop: spacing.xl, marginBottom: spacing.sm,
    ...t.h3, color: colors.text,
  },
  card: {
    marginHorizontal: spacing.base, borderRadius: radius.xl,
    backgroundColor: colors.card, overflow: 'hidden',
    borderWidth: 1, borderColor: colors.border,
    shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 }, elevation: 2,
  },
  row: {
    paddingHorizontal: spacing.base, paddingVertical: spacing.base,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    borderBottomWidth: 1, borderBottomColor: colors.border,
    minHeight: 52,
  },
  rowText: { ...t.body, color: colors.text, flex: 1 },

  logout: {
    backgroundColor: '#E8DCD2',
    marginHorizontal: spacing.base, marginTop: spacing.xl,
    borderRadius: radius.full, paddingVertical: spacing.base,
    alignItems: 'center',
  },
  logoutText: { ...t.labelLg, color: '#5A4638' },
  version: { ...t.caption, color: colors.subText, textAlign: 'center', marginVertical: spacing.md },
});
