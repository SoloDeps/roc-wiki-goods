export type EraAbbr = (typeof eras)[number]["abbr"];
export type alliedCity =
  | "egypt"
  | "china"
  | "maya_empire"
  | "viking_kingdom"
  | "arabia";

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
  { name: "Early Gothic", abbr: "EG" },
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
  {
    title: "Early Gothic",
    buildings: ["Jeweler", "Alchemist", "Glassblower"],
    abbreviations: ["EG"],
  },
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
  [
    "EG",
    new Map([
      ["jeweler", "/images/thumb/a/af/Fine_Jewelry.png/120px-Fine_Jewelry.png"],
      ["alchemist", "/images/thumb/5/5c/Ointment.png/120px-Ointment.png"],
      ["glassblower", "/images/thumb/e/e2/Lead_Glass.png/120px-Lead_Glass.png"],
    ]),
  ],
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

export const skipColumns = ["level", "time", "max qty", "culture", "gallery", "size"];

export const luxuriousBuilding = [
  "luxurious_home",
  "luxurious_farm",
  "luxurious_culture_site",
];

export const skipBuildingLimit = [
  "ranged_barracks",
  "siege_barracks",
  "cavalry_barracks",
  "heavy_infantry_barracks",
  "large_culture_site",
];

export const limitCapitalBuildingsByEra: Record<
  EraAbbr,
  Record<string, number>
> = {
  SA: {
    domestic_farm: 2,
    rural_farm: 3,
    small_home: 7,
    compact_culture_site: 4,
    moderate_culture_site: 2,
    infantry_barracks: 2,
  },
  BA: {
    domestic_farm: 3,
    rural_farm: 4,
    small_home: 12,
    average_home: 2,
    little_culture_site: 3,
    compact_culture_site: 5,
    moderate_culture_site: 2,
    infantry_barracks: 2,
    workshops: 1,
  },
  ME: {
    domestic_farm: 4,
    rural_farm: 5,
    small_home: 14,
    average_home: 4,
    little_culture_site: 4,
    compact_culture_site: 6,
    moderate_culture_site: 3,
    infantry_barracks: 2,
    workshops: 2,
  },
  CG: {
    domestic_farm: 5,
    rural_farm: 7,
    small_home: 18,
    average_home: 5,
    little_culture_site: 4,
    compact_culture_site: 7,
    moderate_culture_site: 3,
    infantry_barracks: 2,
    workshops: 3,
  },
  ER: {
    domestic_farm: 6,
    rural_farm: 8,
    small_home: 20,
    average_home: 6,
    little_culture_site: 5,
    compact_culture_site: 8,
    moderate_culture_site: 3,
    infantry_barracks: 2,
    workshops: 4,
  },
  RE: {
    domestic_farm: 7,
    rural_farm: 9,
    small_home: 22,
    average_home: 7,
    little_culture_site: 6,
    compact_culture_site: 8,
    moderate_culture_site: 4,
    infantry_barracks: 2,
    workshops: 4,
  },
  BE: {
    domestic_farm: 8,
    rural_farm: 9,
    small_home: 24,
    average_home: 8,
    little_culture_site: 7,
    compact_culture_site: 9,
    moderate_culture_site: 4,
    infantry_barracks: 2,
    workshops: 4,
  },
  AF: {
    domestic_farm: 8,
    rural_farm: 10,
    small_home: 25,
    average_home: 9,
    little_culture_site: 7,
    compact_culture_site: 9,
    moderate_culture_site: 4,
    infantry_barracks: 2,
    workshops: 4,
  },
  FA: {
    domestic_farm: 9,
    rural_farm: 10,
    small_home: 26,
    average_home: 10,
    little_culture_site: 7,
    compact_culture_site: 9,
    moderate_culture_site: 4,
    infantry_barracks: 2,
    workshops: 4,
  },
  IE: {
    domestic_farm: 9,
    rural_farm: 11,
    small_home: 27,
    average_home: 11,
    little_culture_site: 7,
    compact_culture_site: 9,
    moderate_culture_site: 4,
    infantry_barracks: 2,
    workshops: 4,
  },
  KS: {
    domestic_farm: 10,
    rural_farm: 11,
    small_home: 28,
    average_home: 12,
    little_culture_site: 7,
    compact_culture_site: 9,
    moderate_culture_site: 5,
    infantry_barracks: 2,
    workshops: 4,
  },
  HM: {
    domestic_farm: 10,
    rural_farm: 12,
    small_home: 29,
    average_home: 13,
    little_culture_site: 8,
    compact_culture_site: 9,
    moderate_culture_site: 5,
    infantry_barracks: 2,
    workshops: 4,
  },
  EG: {
    domestic_farm: 11,
    rural_farm: 13,
    small_home: 30,
    average_home: 14,
    little_culture_site: 9,
    compact_culture_site: 9,
    moderate_culture_site: 6,
    infantry_barracks: 2,
    workshops: 5,
    shipyard: 5,
    seafarer_house: 8,
    common_warehouse: 3,
  },
};

export const limitLuxuriousBuildingsByEra: Record<
  EraAbbr,
  Record<string, number>
> = {
  SA: { luxurious_home: 2, luxurious_farm: 1, luxurious_culture_site: 2 },
  BA: { luxurious_home: 4, luxurious_farm: 3, luxurious_culture_site: 2 },
  ME: { luxurious_home: 5, luxurious_farm: 4, luxurious_culture_site: 3 },
  CG: { luxurious_home: 6, luxurious_farm: 4, luxurious_culture_site: 4 },
  ER: { luxurious_home: 7, luxurious_farm: 5, luxurious_culture_site: 5 },
  RE: { luxurious_home: 8, luxurious_farm: 6, luxurious_culture_site: 6 },
  BE: { luxurious_home: 9, luxurious_farm: 7, luxurious_culture_site: 6 },
  AF: { luxurious_home: 9, luxurious_farm: 7, luxurious_culture_site: 7 },
  FA: { luxurious_home: 9, luxurious_farm: 7, luxurious_culture_site: 7 },
  IE: { luxurious_home: 10, luxurious_farm: 8, luxurious_culture_site: 7 },
  KS: { luxurious_home: 11, luxurious_farm: 8, luxurious_culture_site: 8 },
  HM: { luxurious_home: 12, luxurious_farm: 8, luxurious_culture_site: 8 },
  EG: { luxurious_home: 12, luxurious_farm: 8, luxurious_culture_site: 8, luxurious_seafarer_house: 2, large_warehouse: 2 },
};

// Merge CapitalBuildings and LuxuriousBuildings
export const limitAllBuildingsByEra: Record<
  EraAbbr,
  Record<string, number>
> = Object.fromEntries(
  Object.keys({
    ...limitCapitalBuildingsByEra,
    ...limitLuxuriousBuildingsByEra,
  }).map((era) => [
    era,
    {
      ...limitCapitalBuildingsByEra[era as EraAbbr],
      ...limitLuxuriousBuildingsByEra[era as EraAbbr],
    },
  ])
) as Record<EraAbbr, Record<string, number>>;

export const limitAlliedBuildingsByEra: Record<
  alliedCity,
  Record<string, Partial<Record<EraAbbr, number>>>
> = {
  egypt: {
    small_home: { ME: 8, CG: 12 },
    average_home: { ME: 4, CG: 6 },
    luxurious_home: { ME: 4, CG: 8 },
    papyrus_field: { ME: 2, CG: 4 },
    luxurious_papyrus_field: { ME: 1, CG: 3 },
    gold_mine: { ME: 2, CG: 4 },
    luxurious_gold_mine: { ME: 1, CG: 3 },
    papyrus_press: { ME: 2, CG: 3 },
    goldsmith: { ME: 2, CG: 3 },
    irrigation: { ME: 6, CG: 7 },
  },
  china: {
    small_home: { ER: 15, RE: 25 },
    average_home: { ER: 5, RE: 8 },
    luxurious_home: { ER: 5, RE: 11 },
    rice_farm: { ER: 6, RE: 12 },
    luxurious_rice_farm: { ER: 4, RE: 8 },
    workshops: { ER: 2, RE: 4 },
  },
  maya_empire: {
    worker_home: { BE: 15, AF: 23 },
    priest_home: { BE: 6, AF: 13 },
    luxurious_home: { BE: 5, AF: 5 },
    obsidian_quarry: { BE: 3, AF: 5 },
    jade_quarry: { BE: 3, AF: 5 },
    luxurious_quarry: { BE: 2, AF: 2 },
    average_aviary: { AF: 4 },
    luxurious_aviary: { AF: 1 },
    chronicler: { BE: 2, AF: 2 },
    mask_sculptor: { BE: 2, AF: 2 },
    ceremony_outfitter: { AF: 2 },
    ritual_carver: { AF: 3 },
    luxurious_workshop: { BE: 2, AF: 2 },
    ritual_sites: { BE: 7 },
  },
  viking_kingdom: {
    worker_home: { FA: 15, IE: 30 },
    sailor_home: { FA: 10, IE: 20 },
    luxurious_home: { FA: 5, IE: 10 },
    beehive: { FA: 11, IE: 21 },
    fishing_pier: { FA: 6, IE: 11 },
    luxurious_fishing_pier: { FA: 6, IE: 6 },
    tavern: { FA: 5, IE: 9 },
    expedition_pier: { FA: 3, IE: 3 },
    sailor_port: { IE: 3 },
    luxurious_sailor_port: { FA: 4, IE: 4 },
  },
  arabia: {
    medium_home: { KS: 13, HM: 26 },
    luxurious_home: { KS: 6, HM: 6 },
    merchant: { KS: 8, HM: 16 },
    luxurious_merchant: { KS: 4, HM: 4 },
    camel_farm: { KS: 5, HM: 10 },
    coffee_brewer: { KS: 2, HM: 2 },
    incense_maker: { KS: 2, HM: 2 },
    carpet_factory: { HM: 2 },
    oil_lamp_crafter: { HM: 2 },
    luxurious_workshop: { KS: 2, HM: 2 },
  },
};
