// src/data/categories.ts
// Nur Café drink categories — bilingual Arabic/English
// Used by CategoryGrid (OrderScreen) and CategoryDetailScreen

export type CategoryKey =
  | 'whats-new'
  | 'hot-coffee'
  | 'iced-coffee'
  | 'speciality-coffee'
  | 'not-coffee'
  | 'loose-tea'
  | 'juices'
  | 'matcha';

export interface Category {
  key: CategoryKey;
  en: string;          // English label
  ar: string;          // Arabic label (RTL)
  icon: string;        // slug matching /assets/icons/3d/[icon].png
  description: string; // Short English description shown in detail header
}

export const categories: Category[] = [
  {
    key: 'whats-new',
    en: "What's New",
    ar: 'الجديد',
    icon: 'whats-new',
    description: 'Our latest seasonal creations',
  },
  {
    key: 'hot-coffee',
    en: 'Hot Coffee',
    ar: 'قهوة ساخنة',
    icon: 'hot-coffee',
    description: 'Classic espresso-based hot drinks',
  },
  {
    key: 'iced-coffee',
    en: 'Iced Coffee',
    ar: 'قهوة مثلجة',
    icon: 'iced-coffee',
    description: 'Cold brews and iced espresso drinks',
  },
  {
    key: 'speciality-coffee',
    en: 'Signature',
    ar: 'توليفات مميزة',
    icon: 'signature',
    description: 'Our signature house creations',
  },
  {
    key: 'not-coffee',
    en: 'Not Coffee',
    ar: 'بدون قهوة',
    icon: 'not-coffee',
    description: 'Hot chocolates, chais and karaks',
  },
  {
    key: 'loose-tea',
    en: 'Loose Tea',
    ar: 'شاي',
    icon: 'loose-tea',
    description: 'Premium loose leaf teas',
  },
  {
    key: 'juices',
    en: 'Juices',
    ar: 'عصائر',
    icon: 'juices',
    description: 'Fresh pressed and blended juices',
  },
  {
    key: 'matcha',
    en: 'Matcha',
    ar: 'ماتشا',
    icon: 'matcha',
    description: 'Japanese matcha in signature flavours',
  },
];

export const getCategoryByKey = (key: CategoryKey): Category | undefined =>
  categories.find((c) => c.key === key);
