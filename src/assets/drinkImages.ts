// src/assets/drinkImages.ts
// Nūr Café drink images — 3D isolated renders (transparent PNG)
//
// TO GENERATE 3D ASSETS:
//   cd fal-workflows && FAL_KEY=your_key node generate-assets.js
//   Get your key at https://fal.ai/dashboard
//
// Until 3D assets are generated, originals are used as fallback.

// ─── 3D Render imports (post-generation) ─────────────────────────────────────
// Uncomment these after running generate-assets.js:
//
// import espresso3d       from '../../assets/images/drinks/3d/espresso.png';
// import cortado3d        from '../../assets/images/drinks/3d/cortado.png';
// import flatWhite3d      from '../../assets/images/drinks/3d/flat-white.png';
// import cappuccino3d     from '../../assets/images/drinks/3d/cappuccino.png';
// import spanishHot3d     from '../../assets/images/drinks/3d/spanish-hot.png';
// import turkish3d        from '../../assets/images/drinks/3d/turkish.png';
// import pistachioHot3d   from '../../assets/images/drinks/3d/pistachio-hot.png';
// import icedLatte3d      from '../../assets/images/drinks/3d/iced-latte.png';
// import icedAmericano3d  from '../../assets/images/drinks/3d/iced-americano.png';
// import icedV603d        from '../../assets/images/drinks/3d/iced-v60.png';
// import spanishIced3d    from '../../assets/images/drinks/3d/spanish-iced.png';
// import pistachioIced3d  from '../../assets/images/drinks/3d/pistachio-iced.png';
// import dubaiKnaffe3d    from '../../assets/images/drinks/3d/dubai-knaffe.png';
// import pourOverV603d    from '../../assets/images/drinks/3d/pour-over-v60.png';
// import hotChoc3d        from '../../assets/images/drinks/3d/hot-choc.png';
// import mocha3d          from '../../assets/images/drinks/3d/mocha.png';
// import turmeric3d       from '../../assets/images/drinks/3d/turmeric.png';
// import chai3d           from '../../assets/images/drinks/3d/chai.png';
// import karakHot3d       from '../../assets/images/drinks/3d/karak-hot.png';
// import karakIced3d      from '../../assets/images/drinks/3d/karak-iced.png';
// import earlGrey3d       from '../../assets/images/drinks/3d/earl-grey.png';
// import englishBreakfast3d from '../../assets/images/drinks/3d/english-breakfast.png';
// import chamomile3d      from '../../assets/images/drinks/3d/chamomile.png';
// import teaFor13d        from '../../assets/images/drinks/3d/tea-for-one.png';
// import orangeJuice3d    from '../../assets/images/drinks/3d/orange-juice.png';
// import carrotGinger3d   from '../../assets/images/drinks/3d/carrot-ginger-boost.png';
// import matchaLychee3d   from '../../assets/images/drinks/3d/matcha-lychee.png';
// import matchaWhiteChoc3d from '../../assets/images/drinks/3d/matcha-white-choc.png';
// import matchaStrawberry3d from '../../assets/images/drinks/3d/matcha-strawberry-rasp.png';
// import matchaMango3d    from '../../assets/images/drinks/3d/matcha-mango.png';

const drinkImages = {
  // ─── Hot Coffee ───────────────────────────────────────────
  espresso:              require('../../assets/images/drinks/espresso.jpg'),
  cortado:               require('../../assets/images/drinks/cortado.jpg'),
  flatWhite:             require('../../assets/images/drinks/flat-white.jpg'),
  cappuccino:            require('../../assets/images/drinks/cappuccino.jpg'),
  spanishHot:            require('../../assets/images/drinks/spanish-hot.jpg'),
  spanishHot2:           require('../../assets/images/drinks/spanish-hot-2.jpg'),
  turkish:               require('../../assets/images/drinks/turkish.jpg'),
  pistachioHot:          require('../../assets/images/drinks/pistachio-hot.jpg'),

  // ─── Iced Coffee ──────────────────────────────────────────
  icedLatte:             require('../../assets/images/drinks/iced-latte.jpg'),
  icedLatte2:            require('../../assets/images/drinks/iced-latte-2.jpg'),
  icedAmericano:         require('../../assets/images/drinks/iced-americano.jpg'),
  icedV60:               require('../../assets/images/drinks/iced-v60.jpg'),
  spanishIced:           require('../../assets/images/drinks/spanish-iced.jpg'),
  pistachioIced:         require('../../assets/images/drinks/pistachio-cold.jpg'),

  // ─── Specialty ────────────────────────────────────────────
  dubaiKnaffe:           require('../../assets/images/drinks/iced-latte.jpg'), // replace with 3D
  pourOverV60:           require('../../assets/images/drinks/iced-v60.jpg'),   // replace with 3D

  // ─── Not Coffee ───────────────────────────────────────────
  hotChoc:               require('../../assets/images/drinks/hot-choc.jpg'),
  mocha:                 require('../../assets/images/drinks/mocha.jpg'),
  turmeric:              require('../../assets/images/drinks/turmeric.jpg'),
  chai:                  require('../../assets/images/drinks/chai.jpg'),
  karakHot:              require('../../assets/images/drinks/karak-hot.jpg'),
  karakIced:             require('../../assets/images/drinks/karak-iced.jpg'),
  arabicTea:             require('../../assets/images/drinks/arabic-tea.jpg'),

  // ─── Loose Tea ────────────────────────────────────────────
  earlGrey:              require('../../assets/images/drinks/arabic-tea.jpg'),   // replace with 3D
  englishBreakfast:      require('../../assets/images/drinks/arabic-tea.jpg'),   // replace with 3D
  chamomile:             require('../../assets/images/drinks/arabic-tea.jpg'),   // replace with 3D
  teaFor1:               require('../../assets/images/drinks/tea-for-1.jpg'),

  // ─── Juices ───────────────────────────────────────────────
  orangeJuice:           require('../../assets/images/drinks/orange-juice.jpg'),
  carrotGingerBoost:     require('../../assets/images/drinks/orange-juice.jpg'), // replace with 3D

  // ─── Matcha ───────────────────────────────────────────────
  matchaLychee:          require('../../assets/images/drinks/matcha-lychee.jpg'),
  matchaWhiteChoc:       require('../../assets/images/drinks/matcha-white-choc.jpg'),
  matchaStrawberryRasp:  require('../../assets/images/drinks/matcha-strawberry-rasp.jpg'),
  matchaMango:           require('../../assets/images/drinks/matcha-mango.jpg'),
} as const;

export default drinkImages;

// ─── Category icon map (populated after generate-assets.js) ─────────────────
// These will be replaced with 3D renders from /assets/icons/3d/
export const categoryIconPlaceholders: Record<string, any> = {
  'hot-coffee':   require('../../assets/images/drinks/espresso.jpg'),
  'iced-coffee':  require('../../assets/images/drinks/iced-latte.jpg'),
  'signature':    require('../../assets/images/drinks/spanish-hot.jpg'),
  'not-coffee':   require('../../assets/images/drinks/hot-choc.jpg'),
  'loose-tea':    require('../../assets/images/drinks/arabic-tea.jpg'),
  'juices':       require('../../assets/images/drinks/orange-juice.jpg'),
  'matcha':       require('../../assets/images/drinks/matcha-lychee.jpg'),
  'whats-new':    require('../../assets/images/drinks/iced-latte.jpg'),
};
