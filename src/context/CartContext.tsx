// src/context/CartContext.tsx
import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { MenuItem } from '../data/menu';

export type CartItem = {
  item: MenuItem;
  quantity: number;
  extras: string[];
  extraTotal: number;
};

type CartContextValue = {
  items: CartItem[];
  addItem: (item: MenuItem, extras?: string[], extraTotal?: number) => void;
  removeItem: (itemId: string) => void;
  incrementItem: (itemId: string) => void;
  decrementItem: (itemId: string) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
};

const CART_KEY = '@nur_cafe_cart';
const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [hydrated, setHydrated] = useState(false);

  // Rehydrate cart from AsyncStorage on mount
  useEffect(() => {
    AsyncStorage.getItem(CART_KEY)
      .then((raw) => {
        if (raw) setItems(JSON.parse(raw));
      })
      .catch(() => {})
      .finally(() => setHydrated(true));
  }, []);

  // Persist cart to AsyncStorage on every change (after hydration)
  useEffect(() => {
    if (!hydrated) return;
    AsyncStorage.setItem(CART_KEY, JSON.stringify(items)).catch(() => {});
  }, [items, hydrated]);

  const addItem = useCallback((item: MenuItem, extras: string[] = [], extraTotal = 0) => {
    setItems((prev) => {
      // Match by item id AND extras fingerprint so different customisations are separate rows
      const extraKey = extras.slice().sort().join('|');
      const existing = prev.find(
        (ci) => ci.item.id === item.id && ci.extras.slice().sort().join('|') === extraKey,
      );
      if (existing) {
        return prev.map((ci) =>
          ci === existing ? { ...ci, quantity: ci.quantity + 1 } : ci,
        );
      }
      return [...prev, { item, quantity: 1, extras, extraTotal }];
    });
  }, []);

  const removeItem = useCallback((itemId: string) => {
    setItems((prev) => prev.filter((ci) => ci.item.id !== itemId));
  }, []);

  const incrementItem = useCallback((itemId: string) => {
    setItems((prev) =>
      prev.map((ci) => (ci.item.id === itemId ? { ...ci, quantity: ci.quantity + 1 } : ci)),
    );
  }, []);

  const decrementItem = useCallback((itemId: string) => {
    setItems((prev) =>
      prev
        .map((ci) => (ci.item.id === itemId ? { ...ci, quantity: ci.quantity - 1 } : ci))
        .filter((ci) => ci.quantity > 0),
    );
  }, []);

  const clearCart = useCallback(() => setItems([]), []);

  const totalItems = items.reduce((sum, ci) => sum + ci.quantity, 0);
  const totalPrice = items.reduce(
    (sum, ci) => sum + (ci.item.price + ci.extraTotal) * ci.quantity,
    0,
  );

  return (
    <CartContext.Provider
      value={{ items, addItem, removeItem, incrementItem, decrementItem, clearCart, totalItems, totalPrice }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
