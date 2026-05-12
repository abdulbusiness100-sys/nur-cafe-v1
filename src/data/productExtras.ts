// src/data/productExtras.ts
import type { CategoryKey } from './menu';

// Option IDs as defined in ProductScreen:
// Milk:   'semi', 'oat', 'coconut', 'almond'
// Syrup:  'caramel', 'hazelnut', 'vanilla'
// Extras: 'ice', 'extra-shot', 'cheese-foam', 'decaf', 'extra-hot'

const ALL_MILK  = ['semi', 'oat', 'coconut', 'almond'];
const ALL_SYRUP = ['caramel', 'hazelnut', 'vanilla'];
const ALL_EXTRAS = ['ice', 'extra-shot', 'cheese-foam', 'decaf', 'extra-hot'];
const ICED_EXTRAS = ['extra-shot', 'cheese-foam', 'decaf']; // ice is default for iced; no extra-hot

// Per-category allowed option IDs
export const CATEGORY_ALLOWED: Record<CategoryKey, string[]> = {
  'hot-coffee':        [...ALL_MILK, ...ALL_SYRUP, ...ALL_EXTRAS],
  'iced-coffee':       [...ALL_MILK, ...ALL_SYRUP, ...ICED_EXTRAS],
  'speciality-coffee': [...ALL_MILK, ...ALL_SYRUP, ...ALL_EXTRAS],
  'whats-new':         [...ALL_MILK, ...ALL_SYRUP, ...ALL_EXTRAS],
  'matcha':            [...ALL_MILK, ...ALL_SYRUP, 'ice'],
  'not-coffee':        [...ALL_MILK, 'cheese-foam'],
  'loose-tea':         [], // no extras for tea
  'juices':            ['ice', 'size-regular', 'size-large'], // ice + size options for juices
};

// Per-item overrides (item IDs from menu.ts) — these OVERRIDE the category rules entirely
export const ITEM_ALLOWED: Record<string, string[]> = {
  // Babyccino — no extras at all
  'hc-babycinno':    [],
  // Karak and Iced Karak — milk already in drink, no milk add-ons
  'nc-karak':        ['cheese-foam'],
  'nc-iced-karak':   ['ice', 'cheese-foam'],
  // Chai Latte — milk already in it
  'nc-chai':         ['cheese-foam'],
  // Hot Lemon Ginger Honey — no milk, no syrup, no shots
  'nc-hlgh':         [],
  // Turkish Coffee — no milk/syrup
  'sp-turkish':      ['extra-hot'],
  // Arabic Coffee Pot — no milk/syrup/shots
  'sp-arabic-pot-s': [],
  // V60 Pour-Over — no milk/syrup (specialty brewing)
  'sp-v60-colombia': [],
  'sp-v60-rwanda':   [],
  'sp-v60-ethiopia': [],
  'sp-v60-peru':     [],
};

/**
 * Returns the list of allowed option IDs for a given category and item.
 * Item-level overrides (ITEM_ALLOWED) take full precedence over category rules.
 */
export function getAllowedOptionIds(categoryKey: CategoryKey, itemId: string): string[] {
  if (ITEM_ALLOWED[itemId] !== undefined) return ITEM_ALLOWED[itemId];
  return CATEGORY_ALLOWED[categoryKey] ?? [];
}
