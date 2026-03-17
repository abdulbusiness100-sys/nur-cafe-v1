// src/types/database.ts
// Auto-generated type definitions matching the Supabase schema

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type OrderStatus = 'pending' | 'preparing' | 'ready' | 'complete' | 'cancelled';
export type UserTier = 'bronze' | 'silver' | 'gold';

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          name: string;
          email: string;
          points: number;
          wallet_balance: number;
          tier: UserTier;
          stripe_customer_id: string | null;
          is_admin: boolean;
          created_at: string;
        };
        Insert: {
          id: string;
          name: string;
          email: string;
          points?: number;
          wallet_balance?: number;
          tier?: UserTier;
          stripe_customer_id?: string | null;
          is_admin?: boolean;
          created_at?: string;
        };
        Update: {
          name?: string;
          email?: string;
          points?: number;
          wallet_balance?: number;
          tier?: UserTier;
          stripe_customer_id?: string | null;
          is_admin?: boolean;
        };
      };
      menu_items: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          price: number;
          category: string;
          image_url: string | null;
          available: boolean;
          sort_order: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string | null;
          price: number;
          category: string;
          image_url?: string | null;
          available?: boolean;
          sort_order?: number;
        };
        Update: {
          name?: string;
          description?: string | null;
          price?: number;
          category?: string;
          image_url?: string | null;
          available?: boolean;
          sort_order?: number;
        };
      };
      orders: {
        Row: {
          id: string;
          user_id: string;
          items: Json;
          subtotal: number;
          total_points: number;
          status: OrderStatus;
          payment_intent_id: string | null;
          location_id: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          items: Json;
          subtotal: number;
          total_points: number;
          status?: OrderStatus;
          payment_intent_id?: string | null;
          location_id?: string;
        };
        Update: {
          status?: OrderStatus;
          payment_intent_id?: string | null;
          updated_at?: string;
        };
      };
      gift_cards: {
        Row: {
          id: string;
          code: string;
          value: number;
          purchased_by: string | null;
          redeemed_by: string | null;
          created_at: string;
          expires_at: string | null;
        };
        Insert: {
          id?: string;
          code: string;
          value: number;
          purchased_by?: string | null;
          expires_at?: string | null;
        };
        Update: {
          redeemed_by?: string | null;
        };
      };
      notifications: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          body: string;
          order_id: string | null;
          read: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          body: string;
          order_id?: string | null;
          read?: boolean;
        };
        Update: {
          read?: boolean;
        };
      };
    };
  };
}

// Convenience types
export type Profile = Database['public']['Tables']['profiles']['Row'];
export type MenuItemDB = Database['public']['Tables']['menu_items']['Row'];
export type Order = Database['public']['Tables']['orders']['Row'];
export type Notification = Database['public']['Tables']['notifications']['Row'];
