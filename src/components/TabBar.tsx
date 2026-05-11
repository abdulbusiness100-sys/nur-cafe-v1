// src/components/TabBar.tsx
// Phase 5 — Custom animated tab bar: spring icons, fade labels, indicator dot
import { useEffect } from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
import Animated, {
  FadeIn,
  FadeOut,
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  interpolate,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import colors from '../theme/colors';
import { fonts } from '../theme/typography';
import { springs } from '../theme/springs';

// ─── Tab config ───────────────────────────────────────────────────────────────
const TAB_CONFIG: {
  name: string;
  label: string;
  icon: React.ComponentProps<typeof Ionicons>['name'];
  iconActive: React.ComponentProps<typeof Ionicons>['name'];
}[] = [
  { name: 'Home',           label: 'Home',    icon: 'home-outline',   iconActive: 'home'   },
  { name: 'Order',          label: 'Order',   icon: 'cafe-outline',   iconActive: 'cafe'   },
  { name: 'Loyalty',        label: 'Loyalty', icon: 'star-outline',   iconActive: 'star'   },
  { name: 'Gifts & Wallet', label: 'Gifts',   icon: 'wallet-outline', iconActive: 'wallet' },
];

const BAR_H = 72;

// ─── Individual tab item ──────────────────────────────────────────────────────
function TabItem({
  config,
  isFocused,
  onPress,
}: {
  config: typeof TAB_CONFIG[0];
  isFocused: boolean;
  onPress: () => void;
}) {
  const iconScale    = useSharedValue(isFocused ? 1.12 : 1);
  const labelOpacity = useSharedValue(isFocused ? 1 : 0);

  useEffect(() => {
    if (isFocused) {
      iconScale.value    = withSpring(1.12, springs.tabIcon);
      labelOpacity.value = withTiming(1, { duration: 180 });
    } else {
      iconScale.value    = withSpring(1.0, springs.tabIcon);
      labelOpacity.value = withTiming(0, { duration: 130 });
    }
  }, [isFocused]);

  const iconStyle = useAnimatedStyle(() => ({
    transform: [{ scale: iconScale.value }],
  }));

  const labelStyle = useAnimatedStyle(() => ({
    opacity: labelOpacity.value,
    transform: [{ translateY: interpolate(labelOpacity.value, [0, 1], [3, 0]) }],
  }));

  return (
    <Pressable
      onPress={onPress}
      style={s.tabItem}
      accessibilityRole="tab"
      accessibilityLabel={config.label}
      accessibilityState={{ selected: isFocused }}
    >
      <Animated.View style={iconStyle}>
        <Ionicons
          name={isFocused ? config.iconActive : config.icon}
          size={22}
          color={isFocused ? colors.terracotta : colors.muted}
        />
      </Animated.View>

      {/* Active indicator dot */}
      {isFocused && (
        <Animated.View
          entering={FadeIn.duration(150)}
          exiting={FadeOut.duration(100)}
          style={s.dot}
        />
      )}

      {/* Label — only visible when active */}
      <Animated.Text style={[s.label, labelStyle]}>
        {config.label}
      </Animated.Text>
    </Pressable>
  );
}

// ─── Tab bar root ─────────────────────────────────────────────────────────────
export default function TabBar({ state, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[s.bar, { height: BAR_H + insets.bottom, paddingBottom: insets.bottom }]}>
      <View style={s.topBorder} />
      <View style={s.inner}>
        {state.routes.map((route, index) => {
          const config    = TAB_CONFIG.find((t) => t.name === route.name) ?? TAB_CONFIG[0];
          const isFocused = state.index === index;

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });
            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          return (
            <TabItem
              key={route.key}
              config={config}
              isFocused={isFocused}
              onPress={onPress}
            />
          );
        })}
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  bar: {
    backgroundColor: colors.cream,
    shadowColor:     colors.deepBrown,
    shadowOpacity:   0.07,
    shadowRadius:    12,
    shadowOffset:    { width: 0, height: -4 },
    elevation:       12,
  },
  topBorder: {
    height:          1,
    backgroundColor: colors.creamDeep,
  },
  inner: {
    flex:           1,
    flexDirection:  'row',
    alignItems:     'center',
  },
  tabItem: {
    flex:           1,
    alignItems:     'center',
    justifyContent: 'center',
    paddingTop:     10,
    gap:            3,
  },
  dot: {
    width:           5,
    height:          5,
    borderRadius:    2.5,
    backgroundColor: colors.terracotta,
  },
  label: {
    fontFamily:    fonts.semibold,
    fontSize:      10,
    color:         colors.terracotta,
    letterSpacing: 0.2,
  },
});
