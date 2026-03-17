// src/data/menu.ts
import drinkImages from '../assets/drinkImages';

export type CategoryKey =
  | 'whats-new'
  | 'hot-coffee'
  | 'iced-coffee'
  | 'speciality-coffee'
  | 'not-coffee'
  | 'loose-tea'
  | 'juices'
  | 'matcha';

export type MenuItem = {
  id: string;
  name: string;
  description?: string;
  price: number;
  image?: string | number;   // string = remote URI, number = local require()
  category: CategoryKey;
};

// --- Featured tiles (What's New carousel on Home) ---
export const featured: MenuItem[] = [
  {
    id: 'ft-dubai-knaffe',
    name: 'Dubai Pistachio Knaffe Iced Latte',
    price: 8.0,
    category: 'speciality-coffee',
    image: drinkImages.pistachioIced,
  },
  {
    id: 'ft-spanish',
    name: 'Spanish Latte',
    price: 4.25,
    category: 'speciality-coffee',
    image: drinkImages.spanishHot,
  },
];

// --- Full drinks menu ---
export const menu: MenuItem[] = [

  // ── HOT COFFEE ─────────────────────────────────────────────────────────────
  { id: 'hc-espresso',       name: 'Espresso',          price: 3.00, category: 'hot-coffee', image: drinkImages.espresso },
  { id: 'hc-long-black',     name: 'Long Black',         price: 3.20, category: 'hot-coffee' },
  { id: 'hc-cortado',        name: 'Cortado',            price: 3.20, category: 'hot-coffee', image: drinkImages.cortado },
  { id: 'hc-macchiato',      name: 'Coffee Macchiato',   price: 3.10, category: 'hot-coffee' },
  { id: 'hc-flat-white',     name: 'Flat White',         price: 3.30, category: 'hot-coffee', image: drinkImages.flatWhite },
  { id: 'hc-latte',          name: 'Latte',              price: 3.50, category: 'hot-coffee' },
  { id: 'hc-cappuccino',     name: 'Cappuccino',         price: 3.50, category: 'hot-coffee', image: drinkImages.cappuccino },
  { id: 'hc-dark-mocha',     name: 'Dark Mocha',         price: 3.90, category: 'hot-coffee', image: drinkImages.mocha },
  { id: 'hc-white-mocha',    name: 'White Mocha',        price: 3.90, category: 'hot-coffee', image: drinkImages.mocha },
  { id: 'hc-americano',      name: 'Americano',          price: 4.00, category: 'hot-coffee' },
  { id: 'hc-cold-brew',      name: 'Cold Brew',          price: 4.00, category: 'hot-coffee' },
  { id: 'hc-espresso-tonic', name: 'Espresso Tonic',     price: 6.00, category: 'hot-coffee' },
  { id: 'hc-babycinno',      name: 'Babyccino',          price: 2.50, category: 'hot-coffee' },

  // ── ICED COFFEE ────────────────────────────────────────────────────────────
  { id: 'ic-iced-latte',       name: 'Iced Latte',          price: 4.00, category: 'iced-coffee', image: drinkImages.icedLatte },
  { id: 'ic-iced-americano',   name: 'Iced Americano',      price: 3.50, category: 'iced-coffee', image: drinkImages.icedAmericano },
  { id: 'ic-iced-white-mocha', name: 'Iced White Mocha',   price: 4.40, category: 'iced-coffee', image: drinkImages.mocha },
  { id: 'ic-iced-dark-mocha',  name: 'Iced Dark Mocha',    price: 4.40, category: 'iced-coffee', image: drinkImages.mocha },
  { id: 'ic-iced-spanish',     name: 'Iced Spanish Latte', price: 5.25, category: 'iced-coffee', image: drinkImages.spanishIced },
  { id: 'ic-iced-pistachio',   name: 'Iced Pistachio Latte',price: 5.75, category: 'iced-coffee', image: drinkImages.pistachioIced },

  // ── SPECIALITY COFFEE ──────────────────────────────────────────────────────
  { id: 'sp-coco-black',   name: 'Coco Black (Iced)',                  price:  7.00, category: 'speciality-coffee' },
  { id: 'sp-spanish',      name: 'Spanish Latte',                      price:  4.25, category: 'speciality-coffee', image: drinkImages.spanishHot },
  { id: 'sp-turkish',      name: 'Turkish Coffee',                     price:  4.50, category: 'speciality-coffee', image: drinkImages.turkish },
  { id: 'sp-psl',          name: 'Pumpkin Spice Latte',                price:  4.25, category: 'speciality-coffee' },
  { id: 'sp-pistachio',    name: 'Pistachio Latte',                    price:  4.75, category: 'speciality-coffee', image: drinkImages.pistachioHot },
  { id: 'sp-gingerbread',  name: 'Gingerbread Latte',                  price:  4.25, category: 'speciality-coffee' },
  { id: 'sp-dubai-knaffe', name: 'Dubai Pistachio Knaffe Iced Latte',  price:  8.00, category: 'speciality-coffee', image: drinkImages.pistachioIced },
  { id: 'sp-aerocano',     name: 'Aerocano',                           price:  3.50, category: 'speciality-coffee' },
  { id: 'sp-v60-colombia', name: 'Pour-Over V60 — Colombia',           price:  6.00, category: 'speciality-coffee', image: drinkImages.icedV60 },
  { id: 'sp-v60-rwanda',   name: 'Pour-Over V60 — Rwanda',             price:  6.00, category: 'speciality-coffee', image: drinkImages.icedV60 },
  { id: 'sp-v60-ethiopia', name: 'Pour-Over V60 — Ethiopia',           price:  6.00, category: 'speciality-coffee', image: drinkImages.icedV60 },
  { id: 'sp-v60-peru',     name: 'Pour-Over V60 — Peru w/ Gesha',      price:  7.00, category: 'speciality-coffee', image: drinkImages.icedV60 },
  { id: 'sp-arabic-pot-s', name: 'Arabic Coffee Pot (Small, 2 People)',price: 10.00, category: 'speciality-coffee' },

  // ── NOT COFFEE ─────────────────────────────────────────────────────────────
  { id: 'nc-hlgh',         name: 'Hot Lemon, Ginger & Honey',         price: 4.00, category: 'not-coffee' },
  { id: 'nc-belgian-white',name: 'Hot Choc — Belgian White (28%)',    price: 4.00, category: 'not-coffee', image: drinkImages.hotChoc },
  { id: 'nc-belgian-dark', name: 'Hot Choc — Belgian Dark (54%)',     price: 4.00, category: 'not-coffee', image: drinkImages.hotChoc },
  { id: 'nc-turmeric',     name: 'Turmeric Latte',                    price: 4.00, category: 'not-coffee', image: drinkImages.turmeric },
  { id: 'nc-chai',         name: 'Chai Latte',                        price: 4.00, category: 'not-coffee', image: drinkImages.chai },
  { id: 'nc-karak',        name: 'Karak',                             price: 4.50, category: 'not-coffee', image: drinkImages.karakHot },
  { id: 'nc-iced-karak',   name: 'Iced Karak',                        price: 4.50, category: 'not-coffee', image: drinkImages.karakIced },
  { id: 'nc-arab-tea',     name: 'Arab Tea Pot (2 People)',            price: 6.00, category: 'not-coffee', image: drinkImages.arabicTea },
  { id: 'nc-moroccan-mint',name: 'Moroccan Mint Tea Pot (4 People)',   price: 7.00, category: 'not-coffee' },

  // ── LOOSE LEAVES TEA ───────────────────────────────────────────────────────
  { id: 'lt-tea-for-1',    name: 'Tea for One',             price: 6.00, category: 'loose-tea', image: drinkImages.teaFor1 },
  { id: 'lt-breakfast',    name: 'English Breakfast Tea',   price: 3.20, category: 'loose-tea' },
  { id: 'lt-earl-grey',    name: 'Earl Grey',               price: 3.20, category: 'loose-tea' },
  { id: 'lt-chamomile',    name: 'Chamomile',               price: 3.20, category: 'loose-tea' },
  { id: 'lt-lemongrass',   name: 'Lemongrass Ginger',       price: 3.20, category: 'loose-tea' },
  { id: 'lt-fruit',        name: 'Fruit Exotic Tea',        price: 3.20, category: 'loose-tea' },
  { id: 'lt-blood-orange', name: 'Blood Orange Tea',        price: 3.20, category: 'loose-tea' },
  { id: 'lt-green',        name: 'Green Tea',               price: 3.20, category: 'loose-tea' },
  { id: 'lt-rooibos',      name: 'Rooibos',                 price: 3.20, category: 'loose-tea' },
  { id: 'lt-floral',       name: 'Floral Tea',              price: 4.00, category: 'loose-tea' },

  // ── JUICES ─────────────────────────────────────────────────────────────────
  { id: 'ju-apple',                name: 'Freshly Squeezed Apple Juice',   price: 5.75, category: 'juices' },
  { id: 'ju-orange',               name: 'Fresh Orange Juice',             price: 5.75, category: 'juices', image: drinkImages.orangeJuice },
  { id: 'ju-carrot-ginger-orange', name: 'Carrot, Ginger & Orange Boost', price: 6.50, category: 'juices' },

  // ── MATCHA ─────────────────────────────────────────────────────────────────
  { id: 'ma-pink-berry',      name: 'Pink Berry Matcha',             price: 6.00, category: 'matcha', description: 'Raspberry, white chocolate, rose.' },
  { id: 'ma-lychee',          name: 'Lychee Matcha',                 price: 5.00, category: 'matcha', image: drinkImages.matchaLychee },
  { id: 'ma-white-choc',      name: 'White Chocolate Matcha',        price: 5.00, category: 'matcha', image: drinkImages.matchaWhiteChoc },
  { id: 'ma-strawberry-rasp', name: 'Strawberry & Raspberry Matcha', price: 5.00, category: 'matcha', image: drinkImages.matchaStrawberryRasp },
  { id: 'ma-coconut-water',   name: 'Coconut Water Iced Matcha',     price: 5.00, category: 'matcha', image: drinkImages.matchaLychee },
  { id: 'ma-mango',           name: 'Mango Iced Matcha',             price: 5.00, category: 'matcha', image: drinkImages.matchaMango },
  { id: 'ma-guava',           name: 'Guava Matcha',                  price: 5.00, category: 'matcha' },
  { id: 'ma-latte-split',     name: 'Matcha × Latte Split',          price: 12.00, category: 'matcha', description: 'Your choice of matcha paired with your choice of latte.' },
];

// ── Category tab config (smoothies & milkshakes removed — not on menu) ────────
export const categories: { key: CategoryKey; label: string; icon: string }[] = [
  { key: 'whats-new',         label: "What's New",        icon: 'flame' },
  { key: 'matcha',            label: 'Signature Matchas', icon: 'beaker' },
  { key: 'speciality-coffee', label: 'Signature Lattes',  icon: 'sparkles' },
  { key: 'hot-coffee',        label: 'Hot Coffee',        icon: 'cafe' },
  { key: 'iced-coffee',       label: 'Iced Coffee',       icon: 'snow' },
  { key: 'not-coffee',        label: 'Not Coffee',        icon: 'leaf' },
  { key: 'loose-tea',         label: 'Loose Leaves Tea',  icon: 'leaf-outline' },
  { key: 'juices',            label: 'Juices',            icon: 'water' },
];
