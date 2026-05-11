// src/RootTabs.tsx
// Phase 5 — Swipeable tabs + custom animated TabBar
import { useRef, useCallback } from 'react';
import { View } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import * as Haptics from 'expo-haptics';

import HomeScreen from './screens/HomeScreen';
import OrderScreen from './screens/OrderScreen';
import LoyaltyScreen from './screens/LoyaltyScreen';
import GiftsWalletScreen from './screens/GiftsWalletScreen';
import TabBar from './components/TabBar';
import type { RootTabParamList } from './navigation/types';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';

const Tab = createBottomTabNavigator<RootTabParamList>();

const TABS: (keyof RootTabParamList)[] = ['Home', 'Order', 'Loyalty', 'Gifts & Wallet'];

export default function RootTabs() {
  // Refs hold latest tab state — avoids stale closures in gesture handler
  const tabNavRef     = useRef<any>(null);
  const currentIdxRef = useRef(0);

  const renderTabBar = useCallback((props: BottomTabBarProps) => {
    tabNavRef.current     = props.navigation;
    currentIdxRef.current = props.state.index;
    return <TabBar {...props} />;
  }, []);

  // Horizontal swipe → navigate between tabs
  // activeOffsetX/failOffsetY ensure scroll views in individual tabs take priority
  const swipeGesture = Gesture.Pan()
    .runOnJS(true)
    .activeOffsetX([-20, 20])
    .failOffsetY([-15, 15])
    .onEnd((e) => {
      const nav = tabNavRef.current;
      const idx = currentIdxRef.current;
      if (!nav) return;

      if (e.velocityX < -500 && e.translationX < -50) {
        const next = Math.min(idx + 1, TABS.length - 1);
        if (next !== idx) {
          Haptics.selectionAsync();
          nav.navigate(TABS[next]);
        }
      }

      if (e.velocityX > 500 && e.translationX > 50) {
        const prev = Math.max(idx - 1, 0);
        if (prev !== idx) {
          Haptics.selectionAsync();
          nav.navigate(TABS[prev]);
        }
      }
    });

  return (
    <GestureDetector gesture={swipeGesture}>
      <View style={{ flex: 1 }}>
        <Tab.Navigator
          screenOptions={{ headerShown: false }}
          tabBar={renderTabBar}
        >
          <Tab.Screen name="Home"           component={HomeScreen} />
          <Tab.Screen name="Order"          component={OrderScreen} />
          <Tab.Screen name="Loyalty"        component={LoyaltyScreen} />
          <Tab.Screen name="Gifts & Wallet" component={GiftsWalletScreen} />
        </Tab.Navigator>
      </View>
    </GestureDetector>
  );
}
