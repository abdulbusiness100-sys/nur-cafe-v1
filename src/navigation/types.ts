// src/navigation/types.ts
import type { MenuItem } from '../data/menu';

export type RootStackParamList = {
  // Auth
  Login: undefined;
  SignUp: undefined;

  // Main
  RootTabs: undefined;

  // Stack screens
  Profile: undefined;
  Account: undefined;
  Product: { item: MenuItem };
  Cart: undefined;
  Checkout: undefined;
  OrderConfirmation: { orderId: string };
  OrderTracking: { orderId: string };
  OrderHistory: undefined;
  OrderDetail: { orderId: string };
  Notifications: undefined;
  Wallet: undefined;

  // Admin (only rendered when profile.is_admin = true)
  AdminDashboard: undefined;
};

export type RootTabParamList = {
  Home: undefined;
  Order: undefined;
  Loyalty: undefined;
  'Gifts & Wallet': undefined;
};

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
