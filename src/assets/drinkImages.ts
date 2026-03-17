// src/assets/drinkImages.ts
// All Nūr Café drink photos — local bundled assets

const drinkImages = {
  // Hot Coffee
  espresso:        require('../../assets/images/drinks/espresso.jpg'),
  cortado:         require('../../assets/images/drinks/cortado.jpg'),
  flatWhite:       require('../../assets/images/drinks/flat-white.jpg'),
  cappuccino:      require('../../assets/images/drinks/cappuccino.jpg'),
  spanishHot:      require('../../assets/images/drinks/spanish-hot.jpg'),
  spanishHot2:     require('../../assets/images/drinks/spanish-hot-2.jpg'),
  turkish:         require('../../assets/images/drinks/turkish.jpg'),
  pistachioHot:    require('../../assets/images/drinks/pistachio-hot.jpg'),

  // Iced Coffee
  icedLatte:       require('../../assets/images/drinks/iced-latte.jpg'),
  icedLatte2:      require('../../assets/images/drinks/iced-latte-2.jpg'),
  icedAmericano:   require('../../assets/images/drinks/iced-americano.jpg'),
  icedV60:         require('../../assets/images/drinks/iced-v60.jpg'),
  spanishIced:     require('../../assets/images/drinks/spanish-iced.jpg'),
  pistachioIced:   require('../../assets/images/drinks/pistachio-cold.jpg'),

  // Not Coffee
  hotChoc:         require('../../assets/images/drinks/hot-choc.jpg'),
  mocha:           require('../../assets/images/drinks/mocha.jpg'),
  turmeric:        require('../../assets/images/drinks/turmeric.jpg'),
  chai:            require('../../assets/images/drinks/chai.jpg'),
  karakHot:        require('../../assets/images/drinks/karak-hot.jpg'),
  karakIced:       require('../../assets/images/drinks/karak-iced.jpg'),
  arabicTea:       require('../../assets/images/drinks/arabic-tea.jpg'),

  // Juices
  orangeJuice:     require('../../assets/images/drinks/orange-juice.jpg'),

  // Matcha
  matchaLychee:        require('../../assets/images/drinks/matcha-lychee.jpg'),
  matchaWhiteChoc:     require('../../assets/images/drinks/matcha-white-choc.jpg'),
  matchaStrawberryRasp: require('../../assets/images/drinks/matcha-strawberry-rasp.jpg'),
  matchaMango:         require('../../assets/images/drinks/matcha-mango.jpg'),

  // Tea
  teaFor1:         require('../../assets/images/drinks/tea-for-1.jpg'),
} as const;

export default drinkImages;
