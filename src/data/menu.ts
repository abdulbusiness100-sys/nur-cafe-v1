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
  { id: 'hc-espresso',       name: 'Espresso',          description: 'A concentrated double shot of our house espresso blend.',         price: 3.00, category: 'hot-coffee', image: drinkImages.espresso },
  { id: 'hc-long-black',     name: 'Long Black',         description: 'Two shots pulled over hot water for a clean, bold cup.',          price: 3.20, category: 'hot-coffee', image: 'https://images.unsplash.com/photo-1504630083234-14187a9df0f5?w=400&q=80&fit=crop&auto=format' },
  { id: 'hc-cortado',        name: 'Cortado',            description: 'Equal parts espresso and warm milk, no foam.',                    price: 3.20, category: 'hot-coffee', image: drinkImages.cortado },
  { id: 'hc-macchiato',      name: 'Coffee Macchiato',   description: 'A shot of espresso with a touch of steamed milk.',                price: 3.10, category: 'hot-coffee', image: 'https://images.unsplash.com/photo-1593443320739-77f74939d0da?w=400&q=80&fit=crop&auto=format' },
  { id: 'hc-flat-white',     name: 'Flat White',         description: 'Silky micro-foam over a double ristretto shot.',                  price: 3.30, category: 'hot-coffee', image: drinkImages.flatWhite },
  { id: 'hc-latte',          name: 'Latte',              description: 'Our house espresso topped with creamy steamed milk.',             price: 3.50, category: 'hot-coffee', image: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=400&q=80&fit=crop&auto=format' },
  { id: 'hc-cappuccino',     name: 'Cappuccino',         description: 'Equal thirds espresso, steamed milk, and thick foam.',            price: 3.50, category: 'hot-coffee', image: drinkImages.cappuccino },
  { id: 'hc-dark-mocha',     name: 'Dark Mocha',         description: 'Rich dark chocolate blended with espresso and steamed milk.',     price: 3.90, category: 'hot-coffee', image: drinkImages.mocha },
  { id: 'hc-white-mocha',    name: 'White Mocha',        description: 'Smooth white chocolate with espresso and velvety milk.',          price: 3.90, category: 'hot-coffee', image: drinkImages.mocha },
  { id: 'hc-americano',      name: 'Americano',          description: 'A long black with a clean, full-bodied finish.',                  price: 4.00, category: 'hot-coffee', image: 'https://images.unsplash.com/photo-1504630083234-14187a9df0f5?w=400&q=80&fit=crop&auto=format' },
  { id: 'hc-cold-brew',      name: 'Cold Brew',          description: 'Slow-steeped 16 hours for a smooth, low-acid cold coffee.',       price: 4.00, category: 'hot-coffee', image: 'https://images.unsplash.com/photo-1587663939437-9f9f1e8c9f82?w=400&q=80&fit=crop&auto=format' },
  { id: 'hc-espresso-tonic', name: 'Espresso Tonic',     description: 'Espresso over sparkling tonic water — crisp and surprising.',    price: 6.00, category: 'hot-coffee', image: 'https://images.unsplash.com/photo-1610889556528-9a770e32642f?w=400&q=80&fit=crop&auto=format' },
  { id: 'hc-babycinno',      name: 'Babyccino',          description: 'Warm steamed milk with a dusting of chocolate, for the little ones.', price: 2.50, category: 'hot-coffee', image: 'https://images.unsplash.com/photo-1516011762365-b3ae4a895b51?w=400&q=80&fit=crop&auto=format' },

  // ── ICED COFFEE ────────────────────────────────────────────────────────────
  { id: 'ic-iced-latte',       name: 'Iced Latte',          description: 'Espresso shaken over ice with cold milk.',                      price: 4.00, category: 'iced-coffee', image: drinkImages.icedLatte },
  { id: 'ic-iced-americano',   name: 'Iced Americano',      description: 'Double espresso over ice, clean and refreshing.',               price: 3.50, category: 'iced-coffee', image: drinkImages.icedAmericano },
  { id: 'ic-iced-white-mocha', name: 'Iced White Mocha',   description: 'White chocolate espresso drink poured over ice.',               price: 4.40, category: 'iced-coffee', image: drinkImages.mocha },
  { id: 'ic-iced-dark-mocha',  name: 'Iced Dark Mocha',    description: 'Dark chocolate and espresso over ice — rich and cold.',         price: 4.40, category: 'iced-coffee', image: drinkImages.mocha },
  { id: 'ic-iced-spanish',     name: 'Iced Spanish Latte', description: 'Sweetened condensed milk and espresso over ice.',               price: 5.25, category: 'iced-coffee', image: drinkImages.spanishIced },
  { id: 'ic-iced-pistachio',   name: 'Iced Pistachio Latte', description: 'Pistachio cream and espresso, iced and layered.',             price: 5.75, category: 'iced-coffee', image: drinkImages.pistachioIced },

  // ── SPECIALITY COFFEE ──────────────────────────────────────────────────────
  { id: 'sp-coco-black',   name: 'Coco Black (Iced)',                  description: 'Black cold brew meets coconut water — tropical and bold.',                             price:  7.00, category: 'speciality-coffee', image: 'https://images.unsplash.com/photo-1559496417-e7f25cb247f3?w=400&q=80&fit=crop&auto=format' },
  { id: 'sp-spanish',      name: 'Spanish Latte',                      description: 'Sweetened condensed milk stirred into espresso, served hot.',                         price:  4.25, category: 'speciality-coffee', image: drinkImages.spanishHot },
  { id: 'sp-turkish',      name: 'Turkish Coffee',                     description: 'Finely ground coffee brewed in a copper pot with cardamom.',                          price:  4.50, category: 'speciality-coffee', image: drinkImages.turkish },
  { id: 'sp-psl',          name: 'Pumpkin Spice Latte',                description: 'Spiced pumpkin with espresso, cinnamon, and steamed milk.',                          price:  4.25, category: 'speciality-coffee', image: 'https://images.unsplash.com/photo-1724198217375-f298dc745f55?w=400&q=80&fit=crop&auto=format' },
  { id: 'sp-pistachio',    name: 'Pistachio Latte',                    description: 'House pistachio cream with espresso and steamed milk.',                               price:  4.75, category: 'speciality-coffee', image: drinkImages.pistachioHot },
  { id: 'sp-gingerbread',  name: 'Gingerbread Latte',                  description: 'Warm gingerbread spices with espresso and steamed milk.',                             price:  4.25, category: 'speciality-coffee', image: 'https://images.unsplash.com/photo-1724198217375-f298dc745f55?w=400&q=80&fit=crop&auto=format' },
  { id: 'sp-dubai-knaffe', name: 'Dubai Pistachio Knaffe Iced Latte',  description: 'Dubai viral knafeh pistachio cream layered over iced espresso.',                     price:  8.00, category: 'speciality-coffee', image: drinkImages.pistachioIced },
  { id: 'sp-aerocano',     name: 'Aerocano',                           description: 'Espresso brewed aeropress-style for a smooth, concentrated cup.',                    price:  3.50, category: 'speciality-coffee', image: 'https://images.unsplash.com/photo-1504630083234-14187a9df0f5?w=400&q=80&fit=crop&auto=format' },
  { id: 'sp-v60-colombia', name: 'Pour-Over V60 — Colombia',           description: 'Light and bright with tropical fruit notes. Pour-over brewed to order.',              price:  6.00, category: 'speciality-coffee', image: drinkImages.icedV60 },
  { id: 'sp-v60-rwanda',   name: 'Pour-Over V60 — Rwanda',             description: 'Delicate floral notes and red berry sweetness. Pour-over brewed to order.',           price:  6.00, category: 'speciality-coffee', image: drinkImages.icedV60 },
  { id: 'sp-v60-ethiopia', name: 'Pour-Over V60 — Ethiopia',           description: 'Naturally processed. Blueberry and jasmine on a clean finish.',                      price:  6.00, category: 'speciality-coffee', image: drinkImages.icedV60 },
  { id: 'sp-v60-peru',     name: 'Pour-Over V60 — Peru w/ Gesha',      description: 'Rare Gesha varietal with bergamot, peach, and floral complexity.',                   price:  7.00, category: 'speciality-coffee', image: drinkImages.icedV60 },
  { id: 'sp-arabic-pot-s', name: 'Arabic Coffee Pot (Small, 2 People)', description: 'Traditional Arabic coffee with saffron and cardamom, serves 2.',                   price: 10.00, category: 'speciality-coffee', image: 'https://images.unsplash.com/photo-1773106287475-6a7c1b3e1e13?w=400&q=80&fit=crop&auto=format' },

  // ── NOT COFFEE ─────────────────────────────────────────────────────────────
  { id: 'nc-hlgh',         name: 'Hot Lemon, Ginger & Honey',         description: 'Fresh lemon, ginger, and honey in hot water — warming and bright.',        price: 4.00, category: 'not-coffee', image: 'https://images.unsplash.com/photo-1682530016979-3df4128ba004?w=400&q=80&fit=crop&auto=format' },
  { id: 'nc-belgian-white',name: 'Hot Choc — Belgian White (28%)',    description: 'Belgian 28% white chocolate melted into steamed milk.',                    price: 4.00, category: 'not-coffee', image: drinkImages.hotChoc },
  { id: 'nc-belgian-dark', name: 'Hot Choc — Belgian Dark (54%)',     description: 'Intense Belgian 54% dark cacao with steamed milk.',                        price: 4.00, category: 'not-coffee', image: drinkImages.hotChoc },
  { id: 'nc-turmeric',     name: 'Turmeric Latte',                    description: 'Turmeric, ginger, cinnamon, and black pepper in warm milk.',               price: 4.00, category: 'not-coffee', image: drinkImages.turmeric },
  { id: 'nc-chai',         name: 'Chai Latte',                        description: 'Spiced masala chai latte with cinnamon, cardamom, and ginger.',            price: 4.00, category: 'not-coffee', image: drinkImages.chai },
  { id: 'nc-karak',        name: 'Karak',                             description: 'Slow-brewed strong tea with evaporated milk and spices.',                  price: 4.50, category: 'not-coffee', image: drinkImages.karakHot },
  { id: 'nc-iced-karak',   name: 'Iced Karak',                        description: 'Karak tea poured over ice — strong, spiced, refreshing.',                 price: 4.50, category: 'not-coffee', image: drinkImages.karakIced },
  { id: 'nc-arab-tea',     name: 'Arab Tea Pot (2 People)',            description: 'Traditional loose-leaf tea brewed in a pot, serves 2.',                   price: 6.00, category: 'not-coffee', image: drinkImages.arabicTea },
  { id: 'nc-moroccan-mint',name: 'Moroccan Mint Tea Pot (4 People)',   description: 'Fresh mint steeped in a traditional Moroccan pot, serves 4.',             price: 7.00, category: 'not-coffee', image: 'https://images.unsplash.com/photo-1609016617751-e80552ae6ec2?w=400&q=80&fit=crop&auto=format' },

  // ── LOOSE LEAVES TEA ───────────────────────────────────────────────────────
  { id: 'lt-tea-for-1',    name: 'Tea for One',             description: 'Premium loose leaf tea brewed fresh in your own pot.',                price: 6.00, category: 'loose-tea', image: drinkImages.teaFor1 },
  { id: 'lt-breakfast',    name: 'English Breakfast Tea',   description: 'A full-bodied English Breakfast from our loose-leaf selection.',      price: 3.20, category: 'loose-tea', image: 'https://images.unsplash.com/photo-1593487806527-40dcc19864bd?w=400&q=80&fit=crop&auto=format' },
  { id: 'lt-earl-grey',    name: 'Earl Grey',               description: 'Classic Earl Grey with bergamot, light and fragrant.',                price: 3.20, category: 'loose-tea', image: 'https://images.unsplash.com/photo-1593487806527-40dcc19864bd?w=400&q=80&fit=crop&auto=format' },
  { id: 'lt-chamomile',    name: 'Chamomile',               description: 'Calming whole chamomile flowers, naturally caffeine-free.',           price: 3.20, category: 'loose-tea', image: 'https://images.unsplash.com/photo-1593487806527-40dcc19864bd?w=400&q=80&fit=crop&auto=format' },
  { id: 'lt-lemongrass',   name: 'Lemongrass Ginger',       description: 'Lemongrass and ginger, bright and cleansing.',                       price: 3.20, category: 'loose-tea', image: 'https://images.unsplash.com/photo-1593487806527-40dcc19864bd?w=400&q=80&fit=crop&auto=format' },
  { id: 'lt-fruit',        name: 'Fruit Exotic Tea',        description: 'A vibrant blend of exotic dried fruits and berries.',                 price: 3.20, category: 'loose-tea', image: 'https://images.unsplash.com/photo-1593487806527-40dcc19864bd?w=400&q=80&fit=crop&auto=format' },
  { id: 'lt-blood-orange', name: 'Blood Orange Tea',        description: 'Tart and sweet blood orange with a citrus finish.',                  price: 3.20, category: 'loose-tea', image: 'https://images.unsplash.com/photo-1682530016979-3df4128ba004?w=400&q=80&fit=crop&auto=format' },
  { id: 'lt-green',        name: 'Green Tea',               description: 'Delicate Japanese green tea, clean and grassy.',                     price: 3.20, category: 'loose-tea', image: 'https://images.unsplash.com/photo-1593487806527-40dcc19864bd?w=400&q=80&fit=crop&auto=format' },
  { id: 'lt-rooibos',      name: 'Rooibos',                 description: 'South African rooibos, naturally sweet and caffeine-free.',          price: 3.20, category: 'loose-tea', image: 'https://images.unsplash.com/photo-1593487806527-40dcc19864bd?w=400&q=80&fit=crop&auto=format' },
  { id: 'lt-floral',       name: 'Floral Tea',              description: 'A blend of rose, hibiscus, and elderflower petals.',                 price: 4.00, category: 'loose-tea', image: 'https://images.unsplash.com/photo-1593487806527-40dcc19864bd?w=400&q=80&fit=crop&auto=format' },

  // ── JUICES ─────────────────────────────────────────────────────────────────
  { id: 'ju-apple',                name: 'Freshly Squeezed Apple Juice',   description: 'Apples cold-pressed to order. Pure, no additions.',                   price: 5.75, category: 'juices', image: 'https://images.unsplash.com/photo-1509459331813-67a0c10e527c?w=400&q=80&fit=crop&auto=format' },
  { id: 'ju-orange',               name: 'Fresh Orange Juice',             description: 'Oranges squeezed to order. Bright and fresh.',                        price: 5.75, category: 'juices', image: drinkImages.orangeJuice },
  { id: 'ju-carrot-ginger-orange', name: 'Carrot, Ginger & Orange Boost', description: 'Carrot, ginger, and orange — pressed and energising.',                price: 6.50, category: 'juices', image: 'https://images.unsplash.com/photo-1555940726-1c297abcc1f1?w=400&q=80&fit=crop&auto=format' },

  // ── MATCHA ─────────────────────────────────────────────────────────────────
  { id: 'ma-pink-berry',      name: 'Pink Berry Matcha',             price: 6.00, category: 'matcha', description: 'Raspberry, white chocolate, rose.', image: 'https://images.unsplash.com/photo-1766589140059-9435dd7f65ae?w=400&q=80&fit=crop&auto=format' },
  { id: 'ma-lychee',          name: 'Lychee Matcha',                 description: 'Ceremonial matcha with lychee sweetness and steamed milk.',               price: 5.00, category: 'matcha', image: drinkImages.matchaLychee },
  { id: 'ma-white-choc',      name: 'White Chocolate Matcha',        description: 'Premium matcha with white chocolate and creamy milk.',                    price: 5.00, category: 'matcha', image: drinkImages.matchaWhiteChoc },
  { id: 'ma-strawberry-rasp', name: 'Strawberry & Raspberry Matcha', description: 'Matcha layered with strawberry and raspberry purée.',                     price: 5.00, category: 'matcha', image: drinkImages.matchaStrawberryRasp },
  { id: 'ma-coconut-water',   name: 'Coconut Water Iced Matcha',     description: 'Matcha whisked into coconut water over ice — clean and tropical.',        price: 5.00, category: 'matcha', image: drinkImages.matchaLychee },
  { id: 'ma-mango',           name: 'Mango Iced Matcha',             description: 'Mango purée and matcha over ice, sweet and earthy.',                      price: 5.00, category: 'matcha', image: drinkImages.matchaMango },
  { id: 'ma-guava',           name: 'Guava Matcha',                  description: 'Guava and ceremonial matcha, iced and layered.',                          price: 5.00, category: 'matcha', image: 'https://images.unsplash.com/photo-1631679263367-9095fca628de?w=400&q=80&fit=crop&auto=format' },
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
