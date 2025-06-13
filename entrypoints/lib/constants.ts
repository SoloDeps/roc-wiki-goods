export type EraAbbr = (typeof eras)[number]["abbr"];

export const WIKI_URL = "riseofcultures.wiki.gg";

export const eras = [
  { name: "Stone Age", abbr: "SA" },
  { name: "Bronze Age", abbr: "BA" },
  { name: "Minoan Era", abbr: "ME" },
  { name: "Classical Greece", abbr: "CG" },
  { name: "Early Rome", abbr: "ER" },
  { name: "Roman Empire", abbr: "RE" },
  { name: "Byzantine Era", abbr: "BE" },
  { name: "Age of the Franks", abbr: "AF" },
  { name: "Feudal Age", abbr: "FA" },
  { name: "Iberian Era", abbr: "IE" },
  { name: "Kingdom of Sicily", abbr: "KS" },
  { name: "High Middle Ages", abbr: "HM" },
  // { name: "Early Gothic", abbr: "EG" },
] as const;

export const buildingsAbbr = [
  {
    title: "Bronze Age ~ Roman Empire",
    buildings: ["Tailor", "Stone Mason", "Artisan"],
    abbreviations: ["SA", "BA", "ME", "CG", "ER", "RE"],
  },
  {
    title: "Byzantine Era ~ High Middle Ages",
    buildings: ["Scribe", "Carpenter", "Spice Merchant"],
    abbreviations: ["BE", "AF", "FA", "IE", "KS", "HM"],
  },
  // {
  //   title: "Early Gothic",
  //   buildings: ["Jeweler", "Alchemist", "Glassblower"],
  //   abbreviations: ["EG"],
  // },
];

export const DEFAULT_IMG_URL = "/images/thumb/3/36/Goods.png/25px-Goods.png";

export const goodsUrlByEra = new Map<EraAbbr, Map<string, string>>([
  [
    "SA",
    new Map([
      ["tailor", "/images/thumb/3/34/Wool.png/25px-Wool.png"],
      [
        "stone_mason",
        "/images/thumb/6/6e/Alabaster_Idol.png/25px-Alabaster_Idol.png",
      ],
      [
        "artisan",
        "/images/thumb/3/3c/Bronze_Bracelet.png/25px-Bronze_Bracelet.png",
      ],
    ]),
  ],
  [
    "BA",
    new Map([
      ["tailor", "/images/thumb/3/34/Wool.png/25px-Wool.png"],
      [
        "stone_mason",
        "/images/thumb/6/6e/Alabaster_Idol.png/25px-Alabaster_Idol.png",
      ],
      [
        "artisan",
        "/images/thumb/3/3c/Bronze_Bracelet.png/25px-Bronze_Bracelet.png",
      ],
    ]),
  ],
  [
    "ME",
    new Map([
      ["tailor", "/images/thumb/8/8a/Linen_Shirt.png/25px-Linen_Shirt.png"],
      [
        "stone_mason",
        "/images/thumb/b/b1/Marble_Bust.png/25px-Marble_Bust.png",
      ],
      ["artisan", "/images/thumb/6/62/Iron_Pendant.png/25px-Iron_Pendant.png"],
    ]),
  ],
  [
    "CG",
    new Map([
      ["tailor", "/images/thumb/a/a3/Toga.png/25px-Toga.png"],
      ["stone_mason", "/images/thumb/5/5e/Column.png/25px-Column.png"],
      ["artisan", "/images/thumb/c/cc/Silver_Ring.png/25px-Silver_Ring.png"],
    ]),
  ],
  [
    "ER",
    new Map([
      ["tailor", "/images/thumb/5/5b/Tunic.png/25px-Tunic.png"],
      [
        "stone_mason",
        "/images/thumb/0/04/Stone_Tablet.png/25px-Stone_Tablet.png",
      ],
      ["artisan", "/images/thumb/e/e3/Gold_Laurel.png/25px-Gold_Laurel.png"],
    ]),
  ],
  [
    "RE",
    new Map([
      ["tailor", "/images/thumb/6/6e/Cape.png/25px-Cape.png"],
      ["stone_mason", "/images/thumb/f/f4/Mosaic.png/25px-Mosaic.png"],
      ["artisan", "/images/thumb/b/b2/Goblet.png/25px-Goblet.png"],
    ]),
  ],
  [
    "BE",
    new Map([
      ["scribe", "/images/thumb/4/48/Parchment.png/25px-Parchment.png"],
      ["carpenter", "/images/thumb/b/b9/Planks.png/25px-Planks.png"],
      ["spice_merchant", "/images/thumb/5/50/Pepper.png/25px-Pepper.png"],
    ]),
  ],
  [
    "AF",
    new Map([
      ["scribe", "/images/thumb/e/e1/Ink.png/25px-Ink.png"],
      ["carpenter", "/images/thumb/c/c2/Cartwheel.png/25px-Cartwheel.png"],
      ["spice_merchant", "/images/thumb/7/77/Salt.png/25px-Salt.png"],
    ]),
  ],
  [
    "FA",
    new Map([
      ["scribe", "/images/thumb/7/73/Manuscript.png/25px-Manuscript.png"],
      ["carpenter", "/images/thumb/a/a1/Barrel.png/25px-Barrel.png"],
      ["spice_merchant", "/images/thumb/7/79/Herbs.png/25px-Herbs.png"],
    ]),
  ],
  [
    "IE",
    new Map([
      ["scribe", "/images/thumb/c/c1/Wax_Seal.png/25px-Wax_Seal.png"],
      ["carpenter", "/images/thumb/3/36/Door.png/25px-Door.png"],
      ["spice_merchant", "/images/thumb/8/8c/Saffron.png/25px-Saffron.png"],
    ]),
  ],
  [
    "KS",
    new Map([
      ["scribe", "/images/thumb/8/8e/Tome.png/25px-Tome.png"],
      ["carpenter", "/images/thumb/1/15/Wardrobe.png/25px-Wardrobe.png"],
      ["spice_merchant", "/images/thumb/d/de/Chili.png/25px-Chili.png"],
    ]),
  ],
  [
    "HM",
    new Map([
      ["scribe", "/images/thumb/2/2a/Grimoire.png/25px-Grimoire.png"],
      [
        "carpenter",
        "/images/thumb/8/85/Secretary_Desk.png/25px-Secretary_Desk.png",
      ],
      ["spice_merchant", "/images/thumb/1/1b/Cinnamon.png/25px-Cinnamon.png"],
    ]),
  ],
  // [
  //   "EG",
  //   new Map([
  //     ["jeweler", "/images/thumb/a/af/Fine_Jewelry.png/120px-Fine_Jewelry.png"],
  //     ["alchemist", "/images/thumb/5/5c/Ointment.png/120px-Ointment.png"],
  //     ["glassblower", "/images/thumb/e/e2/Lead_Glass.png/120px-Lead_Glass.png"],
  //   ]),
  // ],
]);

export const formatColumns = [
  "coin",
  "coins",
  "pennies",
  "cocoa",
  "wu zhu",
  "deben",
  "dirham",
  "rice",
  "food",
  "build cost",
  // eg_coins_allied
  // eg_food_allied
];

export const skipColumns = ["level", "time", "max qty", "culture", "gallery"];

export const limitPrimaryWorkshop = [
  {
    abbrev: "BA",
    maxQty: 1,
  },
  {
    abbrev: "ME",
    maxQty: 2,
  },
  {
    abbrev: "CG",
    maxQty: 3,
  },
  {
    abbrev: "ER",
    maxQty: 4,
  },
  {
    abbrev: "RE",
    maxQty: 4,
  },
  {
    abbrev: "BE",
    maxQty: 4,
  },
  {
    abbrev: "AF",
    maxQty: 4,
  },
  {
    abbrev: "FA",
    maxQty: 4,
  },
  {
    abbrev: "IE",
    maxQty: 4,
  },
  {
    abbrev: "KS",
    maxQty: 4,
  },
  {
    abbrev: "HM",
    maxQty: 4,
  },
  // {
  //   abbrev: "EG",
  //   maxQty: 4,
  // },
];
