// src/services/menu.ts
// Fetches menu from Supabase with static data fallback
import { supabase } from '../config/supabase';
import { menu as staticMenu, featured as staticFeatured } from '../data/menu';
import type { MenuItem } from '../data/menu';

function dbItemToMenuItem(row: any): MenuItem {
  return {
    id: row.id,
    name: row.name,
    description: row.description ?? undefined,
    price: Number(row.price),
    image: row.image_url ?? undefined,
    category: row.category,
  };
}

export async function fetchMenu(): Promise<MenuItem[]> {
  try {
    const { data, error } = await supabase
      .from('menu_items')
      .select('*')
      .eq('available', true)
      .order('sort_order', { ascending: true });

    if (error || !data || data.length === 0) return staticMenu;
    return data.map(dbItemToMenuItem);
  } catch {
    return staticMenu;
  }
}

export async function fetchFeatured(): Promise<MenuItem[]> {
  try {
    const { data, error } = await supabase
      .from('menu_items')
      .select('*')
      .eq('available', true)
      .eq('category', 'whats-new')
      .order('sort_order', { ascending: true });

    if (error || !data || data.length === 0) return staticFeatured;
    return data.map(dbItemToMenuItem);
  } catch {
    return staticFeatured;
  }
}
