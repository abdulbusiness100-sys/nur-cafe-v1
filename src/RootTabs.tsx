import React from "react";
import { Platform } from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Ionicons from "@expo/vector-icons/Ionicons";
import HomeScreen from "./screens/HomeScreen";
import OrderScreen from "./screens/OrderScreen";
import LoyaltyScreen from "./screens/LoyaltyScreen";
import GiftsWalletScreen from "./screens/GiftsWalletScreen";
import colors from "./theme/colors";

const Tab = createBottomTabNavigator();

export default function RootTabs() {
  const insets = useSafeAreaInsets();
  const BASE = 50;

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.brand,   // red icons/text (active)
        tabBarInactiveTintColor: colors.muted, // muted beige
        tabBarLabelStyle: {
          fontSize: 10,
          marginTop: 2,
          fontFamily: "Manrope_600SemiBold",
        },
        tabBarStyle: {
          position: "absolute",
          height: BASE + insets.bottom,
          paddingBottom: Math.max(8, insets.bottom),
          paddingTop: 6,
          backgroundColor: colors.card,        // beige tabbar
          borderTopWidth: 0,
          shadowColor: "#000",
          shadowOpacity: 0.08,
          shadowOffset: { width: 0, height: -2 },
          shadowRadius: 10,
          elevation: 10,
        },
        tabBarIcon: ({ focused, color }) => {
          let name: keyof typeof Ionicons.glyphMap = "home-outline";
          if (route.name === "Home") name = focused ? "home" : "home-outline";
          if (route.name === "Order") name = focused ? "cafe" : "cafe-outline";
          if (route.name === "Loyalty") name = focused ? "star" : "star-outline";
          if (route.name === "Gifts & Wallet") name = focused ? "wallet" : "wallet-outline";
          return <Ionicons name={name} size={20} color={color} />;
        },
        tabBarHideOnKeyboard: Platform.OS === "android",
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Order" component={OrderScreen} />
      <Tab.Screen name="Loyalty" component={LoyaltyScreen} />
      <Tab.Screen name="Gifts & Wallet" component={GiftsWalletScreen} />
    </Tab.Navigator>
  );
}
