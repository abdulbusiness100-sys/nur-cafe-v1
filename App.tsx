// App.tsx
import { useCallback, useEffect } from 'react';
import { View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import * as Linking from 'expo-linking';
import { supabase } from './src/config/supabase';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import {
  useFonts,
  Manrope_400Regular,
  Manrope_500Medium,
  Manrope_600SemiBold,
  Manrope_700Bold,
  Manrope_800ExtraBold,
} from '@expo-google-fonts/manrope';
import {
  Amiri_400Regular,
  Amiri_700Bold,
} from '@expo-google-fonts/amiri';
import * as SplashScreen from 'expo-splash-screen';

import { StripeProvider } from '@stripe/stripe-react-native';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import { CartProvider } from './src/context/CartContext';
import RootTabs from './src/RootTabs';
import type { RootStackParamList } from './src/navigation/types';
import colors from './src/theme/colors';

// Auth screens
import LoginScreen from './src/screens/LoginScreen';
import SignUpScreen from './src/screens/SignUpScreen';

// App screens
import ProfileScreen from './src/screens/ProfileScreen';
import AccountScreen from './src/screens/AccountScreen';
import ProductScreen from './src/screens/ProductScreen';
import CartScreen from './src/screens/CartScreen';
import CheckoutScreen from './src/screens/CheckoutScreen';
import OrderConfirmationScreen from './src/screens/OrderConfirmationScreen';
import OrderTrackingScreen from './src/screens/OrderTrackingScreen';
import OrderHistoryScreen from './src/screens/OrderHistoryScreen';
import OrderDetailScreen from './src/screens/OrderDetailScreen';
import NotificationsScreen from './src/screens/NotificationsScreen';

// Admin screen
import AdminDashboardScreen from './src/screens/AdminDashboardScreen';

SplashScreen.preventAutoHideAsync();

const Stack = createNativeStackNavigator<RootStackParamList>();

function RootNavigator() {
  const { user, loading, profile } = useAuth();

  if (loading) return <View style={{ flex: 1, backgroundColor: colors.bg }} />;

  // Admin users get a completely separate navigation stack
  if (user && profile?.is_admin) {
    return (
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="AdminDashboard" component={AdminDashboardScreen} />
      </Stack.Navigator>
    );
  }

  return (
    <Stack.Navigator
      screenOptions={{
        contentStyle: { backgroundColor: colors.bg },
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      {user ? (
        <>
          <Stack.Screen name="RootTabs" component={RootTabs} />
          <Stack.Screen name="Profile" component={ProfileScreen} />
          <Stack.Screen name="Account" component={AccountScreen} />
          <Stack.Screen name="Product" component={ProductScreen} />
          <Stack.Screen name="Cart" component={CartScreen} />
          <Stack.Screen name="Checkout" component={CheckoutScreen} />
          <Stack.Screen
            name="OrderConfirmation"
            component={OrderConfirmationScreen}
            options={{ animation: 'fade' }}
          />
          <Stack.Screen name="OrderTracking" component={OrderTrackingScreen} />
          <Stack.Screen name="OrderHistory" component={OrderHistoryScreen} />
          <Stack.Screen name="OrderDetail" component={OrderDetailScreen} />
          <Stack.Screen name="Notifications" component={NotificationsScreen} />
        </>
      ) : (
        <>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="SignUp" component={SignUpScreen} />
        </>
      )}
    </Stack.Navigator>
  );
}

// Handle nurcafe:// deep links — exchanges the token from email confirmation
function useDeepLinkAuth() {
  useEffect(() => {
    const handleUrl = async (url: string) => {
      const parsed = Linking.parse(url);
      const params = parsed.queryParams ?? {};
      const token = params['token'] as string | undefined;
      const type = params['type'] as string | undefined;

      if (token && (type === 'signup' || type === 'recovery' || type === 'email')) {
        await supabase.auth.verifyOtp({
          token_hash: token,
          type: type === 'recovery' ? 'recovery' : 'email',
        });
      }
    };

    Linking.getInitialURL().then((url) => { if (url) handleUrl(url); });
    const sub = Linking.addEventListener('url', ({ url }) => handleUrl(url));
    return () => sub.remove();
  }, []);
}

function AppContent() {
  useDeepLinkAuth();

  const [fontsLoaded] = useFonts({
    Manrope_400Regular,
    Manrope_500Medium,
    Manrope_600SemiBold,
    Manrope_700Bold,
    Manrope_800ExtraBold,
    Amiri_400Regular,
    Amiri_700Bold,
  });

  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded) await SplashScreen.hideAsync();
  }, [fontsLoaded]);

  if (!fontsLoaded) return null;

  const linking = {
    prefixes: [Linking.createURL('/'), 'nurcafe://'],
    config: { screens: {} },
  };

  return (
    <View style={{ flex: 1 }} onLayout={onLayoutRootView}>
      <NavigationContainer linking={linking}>
        <RootNavigator />
      </NavigationContainer>
    </View>
  );
}

export default function App() {
  return (
    <StripeProvider publishableKey="pk_live_51T94DHAYbM00bDyholxvbNvquZ9JsUfwdmxOUYsWo3kwKKvJZ6g4EIKfTsWjCDwQUm72dln56FnyHxFHqX2UxTAH00P02gVqWB">
      <SafeAreaProvider>
        <AuthProvider>
          <CartProvider>
            <AppContent />
          </CartProvider>
        </AuthProvider>
      </SafeAreaProvider>
    </StripeProvider>
  );
}
