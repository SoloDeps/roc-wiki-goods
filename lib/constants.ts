export type Era = (typeof eras)[number];
export type EraAbbr = (typeof eras)[number]["abbr"];
export type alliedCity =
  | "egypt"
  | "china"
  | "maya_empire"
  | "viking_kingdom"
  | "arabia"
  | "ottoman_empire";

export const WIKI_URL = "https://riseofcultures.wiki.gg";
export const WIKI_DISPLAY = "riseofcultures.wiki.gg";

export const eras = [
  { name: "Stone Age", abbr: "SA", id: "stone_age" },
  { name: "Bronze Age", abbr: "BA", id: "bronze_age" },
  { name: "Minoan Era", abbr: "ME", id: "minoan_era" },
  { name: "Classical Greece", abbr: "CG", id: "classical_greece" },
  { name: "Early Rome", abbr: "ER", id: "early_rome" },
  { name: "Roman Empire", abbr: "RE", id: "roman_empire" },
  { name: "Byzantine Era", abbr: "BE", id: "byzantine_era" },
  { name: "Age of the Franks", abbr: "AF", id: "age_of_the_franks" },
  { name: "Feudal Age", abbr: "FA", id: "feudal_age" },
  { name: "Iberian Era", abbr: "IE", id: "iberian_era" },
  { name: "Kingdom of Sicily", abbr: "KS", id: "kingdom_of_sicily" },
  { name: "High Middle Ages", abbr: "HM", id: "high_middle_ages" },
  { name: "Early Gothic Era", abbr: "EG", id: "early_gothic_era" },
] as const;

// Mapping des noms d'ères (format wiki) vers les IDs standardisés
export const eraWikiToId: Record<string, string> = eras.reduce((acc, era) => {
  acc[era.name.toLowerCase().replace(/ /g, "_")] = era.id;
  return acc;
}, {} as Record<string, string>);

// Fonction pour obtenir l'ID d'une ère à partir de son nom wiki
export function getEraId(wikiEraName: string | null): string {
  if (!wikiEraName) return "";
  const normalized = wikiEraName.toLowerCase().replace(/ /g, "_");
  return eraWikiToId[normalized] || normalized;
}

export const eraColors: Record<EraAbbr, string> = {
  SA: "191, 96, 96",
  BA: "232, 149, 47",
  ME: "93, 194, 152",
  CG: "90, 152, 189",
  ER: "104, 109, 196",
  RE: "191, 96, 96",
  BE: "232, 149, 47",
  AF: "93, 194, 152",
  FA: "90, 152, 189",
  IE: "104, 109, 196",
  KS: "191, 96, 96",
  HM: "232, 149, 47",
  EG: "93, 194, 152",
};

export const alliedCityColors: Record<alliedCity, string> = {
  egypt: "93, 194, 152",
  china: "104, 109, 196",
  maya_empire: "232, 149, 47",
  viking_kingdom: "90, 152, 189",
  arabia: "191, 96, 96",
  ottoman_empire: "93, 194, 152",
};

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

export const itemsUrl = {
  default: "/images/thumb/3/36/Goods.png/32px-Goods.png",
  coins: "/images/thumb/Coin.png/32px-Coin.png",
  food: "/images/thumb/Food.png/32px-Food.png",
  research: "/images/thumb/Research.png/32px-Research.png",
  gems: "/images/thumb/Gems.png/32px-Gems.png",
  // others
  asper: "/images/thumb/Asper.png/32px-Asper.png",
  cocoa: "/images/thumb/Cocoa.png/32px-Cocoa.png",
  deben: "/images/thumb/Deben.png/32px-Deben.png",
  dirham: "/images/thumb/Dirham.png/32px-Dirham.png",
  pennies: "/images/thumb/Pennies.png/32px-Pennies.png",
  rice: "/images/thumb/Rice.png/32px-Rice.png",
  wu_zhu: "/images/thumb/Wu_Zhu.png/32px-Wu_Zhu.png",
} as const;

export const goodsUrlByEra: Record<
  EraAbbr,
  Record<string, { name: string; url: string }>
> = {
  SA: {
    tailor: {
      name: "Wool",
      url: "/images/thumb/3/34/Wool.png/32px-Wool.png",
    },
    stone_mason: {
      name: "Alabaster Idol",
      url: "/images/thumb/6/6e/Alabaster_Idol.png/32px-Alabaster_Idol.png",
    },
    artisan: {
      name: "Bronze Bracelet",
      url: "/images/thumb/3/3c/Bronze_Bracelet.png/32px-Bronze_Bracelet.png",
    },
  },
  BA: {
    tailor: {
      name: "Wool",
      url: "/images/thumb/3/34/Wool.png/32px-Wool.png",
    },
    stone_mason: {
      name: "Alabaster Idol",
      url: "/images/thumb/6/6e/Alabaster_Idol.png/32px-Alabaster_Idol.png",
    },
    artisan: {
      name: "Bronze Bracelet",
      url: "/images/thumb/3/3c/Bronze_Bracelet.png/32px-Bronze_Bracelet.png",
    },
  },
  ME: {
    tailor: {
      name: "Linen Shirt",
      url: "/images/thumb/8/8a/Linen_Shirt.png/32px-Linen_Shirt.png",
    },
    stone_mason: {
      name: "Marble Bust",
      url: "/images/thumb/b/b1/Marble_Bust.png/32px-Marble_Bust.png",
    },
    artisan: {
      name: "Iron Pendant",
      url: "/images/thumb/6/62/Iron_Pendant.png/32px-Iron_Pendant.png",
    },
  },
  CG: {
    tailor: {
      name: "Toga",
      url: "/images/thumb/a/a3/Toga.png/32px-Toga.png",
    },
    stone_mason: {
      name: "Column",
      url: "/images/thumb/5/5e/Column.png/32px-Column.png",
    },
    artisan: {
      name: "Silver Ring",
      url: "/images/thumb/c/cc/Silver_Ring.png/32px-Silver_Ring.png",
    },
  },
  ER: {
    tailor: {
      name: "Tunic",
      url: "/images/thumb/5/5b/Tunic.png/32px-Tunic.png",
    },
    stone_mason: {
      name: "Stone Tablet",
      url: "/images/thumb/0/04/Stone_Tablet.png/32px-Stone_Tablet.png",
    },
    artisan: {
      name: "Gold Laurel",
      url: "/images/thumb/e/e3/Gold_Laurel.png/32px-Gold_Laurel.png",
    },
  },
  RE: {
    tailor: {
      name: "Cape",
      url: "/images/thumb/6/6e/Cape.png/32px-Cape.png",
    },
    stone_mason: {
      name: "Mosaic",
      url: "/images/thumb/f/f4/Mosaic.png/32px-Mosaic.png",
    },
    artisan: {
      name: "Goblet",
      url: "/images/thumb/b/b2/Goblet.png/32px-Goblet.png",
    },
  },
  BE: {
    scribe: {
      name: "Parchment",
      url: "/images/thumb/4/48/Parchment.png/32px-Parchment.png",
    },
    carpenter: {
      name: "Planks",
      url: "/images/thumb/b/b9/Planks.png/32px-Planks.png",
    },
    spice_merchant: {
      name: "Pepper",
      url: "/images/thumb/5/50/Pepper.png/32px-Pepper.png",
    },
  },
  AF: {
    scribe: {
      name: "Ink",
      url: "/images/thumb/e/e1/Ink.png/32px-Ink.png",
    },
    carpenter: {
      name: "Cartwheel",
      url: "/images/thumb/c/c2/Cartwheel.png/32px-Cartwheel.png",
    },
    spice_merchant: {
      name: "Salt",
      url: "/images/thumb/7/77/Salt.png/32px-Salt.png",
    },
  },
  FA: {
    scribe: {
      name: "Manuscript",
      url: "/images/thumb/7/73/Manuscript.png/32px-Manuscript.png",
    },
    carpenter: {
      name: "Barrel",
      url: "/images/thumb/a/a1/Barrel.png/32px-Barrel.png",
    },
    spice_merchant: {
      name: "Herbs",
      url: "/images/thumb/7/79/Herbs.png/32px-Herbs.png",
    },
  },
  IE: {
    scribe: {
      name: "Wax Seal",
      url: "/images/thumb/c/c1/Wax_Seal.png/32px-Wax_Seal.png",
    },
    carpenter: {
      name: "Door",
      url: "/images/thumb/3/36/Door.png/32px-Door.png",
    },
    spice_merchant: {
      name: "Saffron",
      url: "/images/thumb/8/8c/Saffron.png/32px-Saffron.png",
    },
  },
  KS: {
    scribe: {
      name: "Tome",
      url: "/images/thumb/8/8e/Tome.png/32px-Tome.png",
    },
    carpenter: {
      name: "Wardrobe",
      url: "/images/thumb/1/15/Wardrobe.png/32px-Wardrobe.png",
    },
    spice_merchant: {
      name: "Chili",
      url: "/images/thumb/d/de/Chili.png/32px-Chili.png",
    },
  },
  HM: {
    scribe: {
      name: "Grimoire",
      url: "/images/thumb/2/2a/Grimoire.png/32px-Grimoire.png",
    },
    carpenter: {
      name: "Secretary Desk",
      url: "/images/thumb/8/85/Secretary_Desk.png/32px-Secretary_Desk.png",
    },
    spice_merchant: {
      name: "Cinnamon",
      url: "/images/thumb/1/1b/Cinnamon.png/32px-Cinnamon.png",
    },
  },
  EG: {
    jeweler: {
      name: "Fine Jewelry",
      url: "/images/thumb/a/af/Fine_Jewelry.png/120px-Fine_Jewelry.png",
    },
    alchemist: {
      name: "Ointment",
      url: "/images/thumb/5/5c/Ointment.png/120px-Ointment.png",
    },
    glassblower: {
      name: "Lead Glass",
      url: "/images/thumb/e/e2/Lead_Glass.png/120px-Lead_Glass.png",
    },
  },
} as const;

// Mapping des vrais noms de goods vers le format Priority_Era
// Certains noms de goods apparaissent dans plusieurs ères (ex: Wool dans SA et BA)
export const goodsNameMapping: Record<
  string,
  Array<{ priority: "primary" | "secondary" | "tertiary"; era: EraAbbr }>
> = {
  // Bronze Age (mêmes noms que SA mais différente era)
  Wool: [
    { priority: "primary", era: "SA" },
    { priority: "primary", era: "BA" },
  ],
  "Alabaster Idol": [
    { priority: "secondary", era: "SA" },
    { priority: "secondary", era: "BA" },
  ],
  "Bronze Bracelet": [
    { priority: "tertiary", era: "SA" },
    { priority: "tertiary", era: "BA" },
  ],

  // Minoan Era
  "Linen Shirt": [{ priority: "primary", era: "ME" }],
  "Marble Bust": [{ priority: "secondary", era: "ME" }],
  "Iron Pendant": [{ priority: "tertiary", era: "ME" }],

  // Classical Greece
  Toga: [{ priority: "primary", era: "CG" }],
  Column: [{ priority: "secondary", era: "CG" }],
  "Silver Ring": [{ priority: "tertiary", era: "CG" }],

  // Early Rome
  Tunic: [{ priority: "primary", era: "ER" }],
  "Stone Tablet": [{ priority: "secondary", era: "ER" }],
  "Gold Laurel": [{ priority: "tertiary", era: "ER" }],

  // Roman Empire
  Cape: [{ priority: "primary", era: "RE" }],
  Mosaic: [{ priority: "secondary", era: "RE" }],
  Goblet: [{ priority: "tertiary", era: "RE" }],

  // Byzantine Era
  Parchment: [{ priority: "primary", era: "BE" }],
  Planks: [{ priority: "secondary", era: "BE" }],
  Pepper: [{ priority: "tertiary", era: "BE" }],

  // Age of the Franks
  Ink: [{ priority: "primary", era: "AF" }],
  Cartwheel: [{ priority: "secondary", era: "AF" }],
  Salt: [{ priority: "tertiary", era: "AF" }],

  // Feudal Age
  Manuscript: [{ priority: "primary", era: "FA" }],
  Barrel: [{ priority: "secondary", era: "FA" }],
  Herbs: [{ priority: "tertiary", era: "FA" }],

  // Iberian Era
  "Wax Seal": [{ priority: "primary", era: "IE" }],
  Door: [{ priority: "secondary", era: "IE" }],
  Saffron: [{ priority: "tertiary", era: "IE" }],

  // Kingdom of Sicily
  Tome: [{ priority: "primary", era: "KS" }],
  Wardrobe: [{ priority: "secondary", era: "KS" }],
  Chili: [{ priority: "tertiary", era: "KS" }],

  // High Middle Ages
  Grimoire: [{ priority: "primary", era: "HM" }],
  "Secretary Desk": [{ priority: "secondary", era: "HM" }],
  Cinnamon: [{ priority: "tertiary", era: "HM" }],

  // Early Gothic
  "Fine Jewelry": [{ priority: "primary", era: "EG" }],
  Ointment: [{ priority: "secondary", era: "EG" }],
  "Lead Glass": [{ priority: "tertiary", era: "EG" }],
};

// Mapping des goods par civilisation pour le regroupement des other goods
export const goodsByCivilization: Record<
  string,
  { name: string; goods: string[] }
> = {
  EGYPT: {
    name: "EGYPT",
    goods: ["Papyrus Scroll", "Ankh", "Golden Mask", "Ceremonial Dress"],
  },
  CHINA: {
    name: "CHINA",
    goods: ["Moth Cocoons", "Silk Threads", "Clay", "Silk", "Porcelain"],
  },
  "MAYA EMPIRE": {
    name: "MAYA EMPIRE",
    goods: ["Ancestor Mask", "Headdress", "Ritual Dagger", "Calendar Stone"],
  },
  "VIKING KINGDOM": {
    name: "VIKING KINGDOM",
    goods: [
      "Mead",
      "Ceramic Treasure",
      "Gold Treasure",
      "Stockfish",
      "Spice Treasure",
      "Jewel Treasure",
    ],
  },
  ARABIA: {
    name: "ARABIA",
    goods: ["Coffee", "Oil Lamp", "Incense", "Carpet"],
  },
  "OTTOMAN EMPIRE": {
    name: "OTTOMAN EMPIRE",
    goods: ["Confection", "Syrup", "Wheat", "Pomegranate"],
  },
};

export const alliedCityResources: Record<
  alliedCity,
  { name: string; resources: string[] }
> = {
  egypt: {
    name: "EGYPT",
    resources: ["deben"],
  },
  china: {
    name: "CHINA",
    resources: ["rice", "wu_zhu"],
  },
  maya_empire: {
    name: "MAYA EMPIRE",
    resources: ["cocoa"],
  },
  viking_kingdom: {
    name: "VIKING KINGDOM",
    resources: ["pennies"],
  },
  arabia: {
    name: "ARABIA",
    resources: ["dirham"],
  },
  ottoman_empire: {
    name: "OTTOMAN EMPIRE",
    resources: ["asper"],
  },
};

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

export const skipColumns = [
  "level",
  "time",
  "max qty",
  "culture",
  "gallery",
  "size",
];

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
    workshops: 3,
    shipyard: 9,
    seafarer_house: 14,
    common_warehouse: 8,
  },
};

// prettier-ignore
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
  ottoman_empire: {},
};
