// src/services/orders.ts
import { supabase } from '../config/supabase';
import type { Order, OrderStatus } from '../types/database';
import type { CartItem } from '../context/CartContext';

export type OrderItem = {
  itemId: string;
  name: string;
  price: number;
  qty: number;
  extras: string[];
  extraTotal: number;
};

export async function createOrder(
  userId: string,
  items: CartItem[],
  subtotal: number,
): Promise<Order> {
  const orderItems: OrderItem[] = items.map((ci) => ({
    itemId: ci.item.id,
    name: ci.item.name,
    price: ci.item.price,
    qty: ci.quantity,
    extras: ci.extras,
    extraTotal: ci.extraTotal,
  }));

  const totalPoints = Math.floor(subtotal);

  const { data, error } = await supabase
    .from('orders')
    .insert({
      user_id: userId,
      items: orderItems as any,
      subtotal,
      total_points: totalPoints,
      status: 'pending',
      location_id: 'deansgate',
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getUserOrders(userId: string): Promise<Order[]> {
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data ?? [];
}

export async function getOrder(orderId: string): Promise<Order | null> {
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .eq('id', orderId)
    .single();

  if (error) return null;
  return data;
}

export function subscribeToOrder(
  orderId: string,
  onUpdate: (order: Order) => void,
) {
  return supabase
    .channel(`order:${orderId}`)
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'orders',
        filter: `id=eq.${orderId}`,
      },
      (payload) => onUpdate(payload.new as Order),
    )
    .subscribe();
}

export async function awardPoints(userId: string, points: number) {
  const { error } = await supabase.rpc('increment_points', {
    user_id: userId,
    points_to_add: points,
  });
  if (error) throw error;
}

// Status display helpers
export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  pending:   'Order Received',
  preparing: 'Being Prepared',
  ready:     'Ready for Collection',
  complete:  'Collected',
  cancelled: 'Cancelled',
};

export const ORDER_STATUS_STEPS: OrderStatus[] = ['pending', 'preparing', 'ready', 'complete'];
