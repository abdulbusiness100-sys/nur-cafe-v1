// src/services/giftCards.ts
// Gift card validation and redemption against the Supabase gift_cards table
import { supabase } from '../config/supabase';

// ─── Tier definitions (client-side, no DB column required) ───────────────────
export type GiftCardTierId = 'classic' | 'premium' | 'deluxe';

export interface GiftCardTier {
  id:          GiftCardTierId;
  label:       string;
  value:       number;     // GBP face value
  bonusPoints: number;
  freeItems:   number;
  perk:        string;
  color:       string;     // card background
}

export const GIFT_CARD_TIERS: GiftCardTier[] = [
  {
    id:          'classic',
    label:       'Classic',
    value:       10,
    bonusPoints: 200,
    freeItems:   1,
    perk:        'Any drink up to £6',
    color:       '#9C5148',   // terracotta
  },
  {
    id:          'premium',
    label:       'Premium',
    value:       25,
    bonusPoints: 500,
    freeItems:   2,
    perk:        'Free size upgrade on all drinks for 30 days',
    color:       '#7E3E37',   // terracotta dark
  },
  {
    id:          'deluxe',
    label:       'Deluxe',
    value:       50,
    bonusPoints: 1000,
    freeItems:   3,
    perk:        'Priority ordering for 1 month',
    color:       '#C0825A',   // arabic gold
  },
];

// ─── Database row shape ───────────────────────────────────────────────────────
export interface GiftCard {
  id:           string;
  code:         string;
  value:        number;
  purchased_by: string | null;
  redeemed_by:  string | null;
  created_at:   string;
  expires_at:   string | null;
}

// ─── Validate a code entered at checkout ─────────────────────────────────────
// Returns the gift card if valid, throws with a user-friendly message otherwise
export async function validateGiftCard(code: string): Promise<GiftCard> {
  const { data, error } = (await supabase
    .from('gift_cards')
    .select('*')
    .eq('code', code.trim().toUpperCase())
    .single()) as any;

  if (error || !data) {
    throw new Error('Gift card not found. Please check the code and try again.');
  }

  const card = data as GiftCard;

  if (card.redeemed_by) {
    throw new Error('This gift card has already been redeemed.');
  }

  if (card.expires_at && new Date(card.expires_at) < new Date()) {
    throw new Error('This gift card has expired.');
  }

  return card;
}

// ─── Mark a gift card as redeemed ────────────────────────────────────────────
export async function redeemGiftCard(
  code: string,
  userId: string,
): Promise<void> {
  const q = supabase.from('gift_cards') as any;
  const { error } = await q
    .update({ redeemed_by: userId })
    .eq('code', code.trim().toUpperCase())
    .is('redeemed_by', null); // guard against double redemption

  if (error) {
    throw new Error('Failed to redeem gift card. Please contact support.');
  }
}

// ─── Get gift cards purchased by a user ──────────────────────────────────────
export async function getUserGiftCards(userId: string): Promise<GiftCard[]> {
  const { data, error } = await supabase
    .from('gift_cards')
    .select('*')
    .eq('purchased_by', userId)
    .order('created_at', { ascending: false });

  if (error) return [];
  return (data ?? []) as GiftCard[];
}
