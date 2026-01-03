export interface Item {
  name: string;
  href?: string;
  children?: string[];
  useRawHref?: boolean;
}

export const links: Record<string, Item> = {
  // racine
  root: {
    children: [
      "technology",
      "capital",
      "egypt",
      "china",
      "arabia",
      "maya_empire",
      "viking_kingdom",
    ],
    name: "Root",
  },

  // #region Capital
  capital: {
    children: [
      "homes",
      "farms",
      "barracks",
      "workshops",
      "culture_site",
      "harbor_houses",
      "ships",
      "warehouses",
    ],
    name: "Capital",
  },

  // homes
  homes: {
    children: ["small_home", "average_home", "luxurious_home"],
    name: "Homes",
  },
  small_home: {
    name: "Small Home",
    href: "/wiki/Home_Cultures/Homes/Small_Home",
  },
  average_home: {
    name: "Average Home",
    href: "/wiki/Home_Cultures/Homes/Average_Home",
  },
  luxurious_home: {
    name: "Luxurious Home",
    href: "/wiki/Home_Cultures/Homes/Luxurious_Home",
  },

  // farms
  farms: {
    children: ["rural_farm", "domestic_farm", "luxurious_farm"],
    name: "Farms",
  },
  rural_farm: {
    name: "Rural Farm",
    href: "/wiki/Home_Cultures/Farms/Rural_Farm",
  },
  domestic_farm: {
    name: "Domestic Farm",
    href: "/wiki/Home_Cultures/Farms/Domestic_Farm",
  },
  luxurious_farm: {
    name: "Luxurious Farm",
    href: "/wiki/Home_Cultures/Farms/Luxurious_Farm",
  },

  // barracks
  barracks: {
    children: [
      "infantry_barracks",
      "ranged_barracks",
      "cavalry_barracks",
      "heavy_infantry_barracks",
      "siege_barracks",
    ],
    name: "Barracks",
  },
  infantry_barracks: {
    name: "Infantry Barracks",
    href: "/wiki/Home_Cultures/Barracks/Infantry_Barracks",
  },
  ranged_barracks: {
    name: "Ranged Barracks",
    href: "/wiki/Home_Cultures/Barracks/Ranged_Barracks",
  },
  cavalry_barracks: {
    name: "Cavalry Barracks",
    href: "/wiki/Home_Cultures/Barracks/Cavalry_Barracks",
  },
  heavy_infantry_barracks: {
    name: "Heavy Infantry Barracks",
    href: "/wiki/Home_Cultures/Barracks/Heavy_Infantry_Barracks",
  },
  siege_barracks: {
    name: "Siege Barracks",
    href: "/wiki/Home_Cultures/Barracks/Siege_Barracks",
  },

  // workshops
  workshops: {
    children: [
      "artisan",
      "stone_mason",
      "tailor",
      "scribe",
      "spice_merchant",
      "carpenter",
      "jeweler",
      "alchemist",
      "glassblower",
    ],
    name: "Workshops",
  },
  // Bronze Age ~ Roman Empire
  artisan: { name: "Artisan", href: "/wiki/Home_Cultures/Workshops/Artisan" },
  stone_mason: {
    name: "Stone Mason",
    href: "/wiki/Home_Cultures/Workshops/Stone_Mason",
  },
  tailor: { name: "Tailor", href: "/wiki/Home_Cultures/Workshops/Tailor" },
  // Byzantine Era ~ High Middle Ages
  scribe: { name: "Scribe", href: "/wiki/Home_Cultures/Workshops/Scribe" },
  carpenter: {
    name: "Carpenter",
    href: "/wiki/Home_Cultures/Workshops/Carpenter",
  },
  spice_merchant: {
    name: "Spice Merchant",
    href: "/wiki/Home_Cultures/Workshops/Spice_Merchant",
  },
  // Early Gothic Era
  jeweler: { name: "Jeweler", href: "/wiki/Home_Cultures/Workshops/Jeweler" },
  alchemist: {
    name: "Alchemist",
    href: "/wiki/Home_Cultures/Workshops/Alchemist",
  },
  glassblower: {
    name: "Glassblower",
    href: "/wiki/Home_Cultures/Workshops/Glassblower",
  },

  // Culture Sites
  culture_site: {
    children: [
      "little_culture_site",
      "compact_culture_site",
      "moderate_culture_site",
      "large_culture_site",
      "luxurious_culture_site",
    ],
    name: "Culture Sites",
  },
  little_culture_site: {
    name: "Little Culture Site",
    href: "/wiki/Home_Cultures/Culture_Sites/Little_Culture_Site",
  },
  compact_culture_site: {
    name: "Compact Culture Site",
    href: "/wiki/Home_Cultures/Culture_Sites/Compact_Culture_Site",
  },
  moderate_culture_site: {
    name: "Moderate Culture Site",
    href: "/wiki/Home_Cultures/Culture_Sites/Moderate_Culture_Site",
  },
  large_culture_site: {
    name: "Large Culture Site",
    href: "/wiki/Home_Cultures/Culture_Sites/Large_Culture_Site",
  },
  luxurious_culture_site: {
    name: "Luxurious Culture Site",
    href: "/wiki/Home_Cultures/Culture_Sites/Luxurious_Culture_Site",
  },

  // Harbor Houses
  harbor_houses: {
    children: ["seafarer_house", "luxurious_seafarer_house"],
    name: "Harbor Houses",
  },
  seafarer_house: {
    name: "Seafarer House",
    href: "/wiki/Home_Cultures/Harbor_Houses/Seafarer_House",
  },
  luxurious_seafarer_house: {
    name: "Luxurious Seafarer House",
    href: "/wiki/Home_Cultures/Harbor_Houses/Luxurious_Seafarer_House",
  },

  // Ships
  ships: {
    children: ["shipyard"],
    name: "Ships",
  },
  shipyard: { name: "Shipyard", href: "/wiki/Home_Cultures/Ships/Shipyard" },

  // Warehouses
  warehouses: {
    children: ["common_warehouse", "large_warehouse"],
    name: "Warehouses",
  },
  common_warehouse: {
    name: "Common Warehouse",
    href: "/wiki/Home_Cultures/Warehouses/Common_Warehouse",
  },
  large_warehouse: {
    name: "Large Warehouse",
    href: "/wiki/Home_Cultures/Warehouses/Large_Warehouse",
  },
  // #endregion

  // #region Egypt
  egypt: {
    children: [
      "egypt_homes",
      "papyrus_fields",
      "gold_mines",
      "egypt_workshops",
    ],
    name: "Egypt",
  },
  // egypt homes
  egypt_homes: {
    children: [
      "egypt_small_home",
      "egypt_average_home",
      "egypt_luxurious_home",
    ],
    name: "Homes",
  },
  egypt_small_home: {
    name: "Small Home",
    href: "/wiki/Allied_Cultures/Egypt/Small_Home",
  },
  egypt_average_home: {
    name: "Average Home",
    href: "/wiki/Allied_Cultures/Egypt/Average_Home",
  },
  egypt_luxurious_home: {
    name: "Luxurious Home",
    href: "/wiki/Allied_Cultures/Egypt/Luxurious_Home",
  },
  // Papyrus Fields
  papyrus_fields: {
    children: ["papyrus_field", "luxurious_papyrus_field"],
    name: "Papyrus Fields",
  },
  papyrus_field: {
    name: "Papyrus Field",
    href: "/wiki/Allied_Cultures/Egypt/Papyrus_Field",
  },
  luxurious_papyrus_field: {
    name: "Luxurious Papyrus Field",
    href: "/wiki/Allied_Cultures/Egypt/Luxurious_Papyrus_Field",
  },

  // Gold Mines
  gold_mines: {
    children: ["gold_mine", "luxurious_gold_mine"],
    name: "Gold Mines",
  },
  gold_mine: {
    name: "Gold Mine",
    href: "/wiki/Allied_Cultures/Egypt/Gold_Mine",
  },
  luxurious_gold_mine: {
    name: "Luxurious Gold Mine",
    href: "/wiki/Allied_Cultures/Egypt/Luxurious_Gold_Mine",
  },

  // Workshops
  egypt_workshops: {
    children: ["papyrus_press", "goldsmith"],
    name: "Workshops",
  },
  papyrus_press: {
    name: "Papyrus Press",
    href: "/wiki/Allied_Cultures/Egypt/Papyrus_Press",
  },
  goldsmith: {
    name: "Goldsmith",
    href: "/wiki/Allied_Cultures/Egypt/Goldsmith",
  },

  // TODO: add irrigation for egypt
  // #endregion

  // #region China
  china: {
    children: ["china_homes", "china_farms", "china_workshops"],
    name: "China",
  },
  // china homes
  china_homes: {
    children: [
      "china_small_home",
      "china_average_home",
      "china_luxurious_home",
    ],
    name: "Homes",
  },
  china_small_home: {
    name: "Small Home",
    href: "/wiki/Allied_Cultures/China/Small_Home",
  },
  china_average_home: {
    name: "Average Home",
    href: "/wiki/Allied_Cultures/China/Average_Home",
  },
  china_luxurious_home: {
    name: "Luxurious Home",
    href: "/wiki/Allied_Cultures/China/Luxurious_Home",
  },
  // china farms
  china_farms: {
    children: ["rice_farm", "luxurious_rice_farm"],
    name: "Farms",
  },
  rice_farm: {
    name: "Rice Farm",
    href: "/wiki/Allied_Cultures/China/Rice_Farm",
  },
  luxurious_rice_farm: {
    name: "Luxurious Rice Farm",
    href: "/wiki/Allied_Cultures/China/Luxurious_Rice_Farm",
  },
  // china workshops
  china_workshops: {
    children: [
      "thread_processor",
      "silk_workshop",
      "clay_processor",
      "porcelain_workshop",
    ],
    name: "Workshops",
  },
  thread_processor: {
    name: "Thread Processor",
    href: "/wiki/Allied_Cultures/China/Workshops#Construction",
    useRawHref: true,
  },
  silk_workshop: {
    name: "Silk Workshop",
    href: "/wiki/Allied_Cultures/China/Workshops#Construction_2",
    useRawHref: true,
  },
  clay_processor: {
    name: "Clay Processor",
    href: "/wiki/Allied_Cultures/China/Workshops#Construction_3",
    useRawHref: true,
  },
  porcelain_workshop: {
    name: "Porcelain Workshop",
    href: "/wiki/Allied_Cultures/China/Workshops#Construction_4",
    useRawHref: true,
  },
  // #endregion

  // #region Maya Empire
  maya_empire: {
    children: [
      "maya_homes",
      "maya_quarries",
      "maya_aviaries",
      "maya_workshops",
      "maya_ritual_sites",
    ],
    name: "Maya Empire",
  },
  // maya homes
  maya_homes: {
    children: ["maya_worker_home", "maya_priest_home", "maya_luxurious_home"],
    name: "Homes",
  },
  maya_worker_home: {
    name: "Worker Home",
    href: "/wiki/Allied_Cultures/Maya/Worker_Home",
  },
  maya_priest_home: {
    name: "Priest Home",
    href: "/wiki/Allied_Cultures/Maya/Priest_Home",
  },
  maya_luxurious_home: {
    name: "Luxurious Home",
    href: "/wiki/Allied_Cultures/Maya/Luxurious_Home",
  },
  // maya quarries
  maya_quarries: {
    children: [
      "maya_obsidian_quarry",
      "maya_jade_quarry",
      "maya_luxurious_quarry",
    ],
    name: "Quarries",
  },
  maya_obsidian_quarry: {
    name: "Obsidian Quarry",
    href: "/wiki/Allied_Cultures/Maya_Empire/Obsidian_Quarry",
  },
  maya_jade_quarry: {
    name: "Jade Quarry",
    href: "/wiki/Allied_Cultures/Maya_Empire/Jade_Quarry",
  },
  maya_luxurious_quarry: {
    name: "Luxurious Quarry",
    href: "/wiki/Allied_Cultures/Maya_Empire/Luxurious_Quarry",
  },
  // maya aviaries
  maya_aviaries: {
    name: "Aviaries",
    children: ["maya_average_aviary", "maya_luxurious_aviary"],
  },
  maya_average_aviary: {
    name: "Average Aviary",
    href: "/wiki/Allied_Cultures/Maya_Empire/Average_Aviary",
  },
  maya_luxurious_aviary: {
    name: "Luxurious Aviary",
    href: "/wiki/Allied_Cultures/Maya_Empire/Luxurious_Aviary#Construction",
    useRawHref: true,
  },
  // maya workshops
  maya_workshops: {
    children: [
      "maya_chronicler",
      "maya_mask_sculptor",
      "maya_ceremony_outfitter",
      "maya_ritual_carver",
      "maya_luxurious_workshop",
    ],
    name: "Workshops",
  },
  // Workshop types
  maya_chronicler: {
    name: "Chronicler",
    href: "/wiki/Allied_Cultures/Maya_Empire/Chronicler#Construction",
    useRawHref: true,
  },
  maya_mask_sculptor: {
    name: "Mask Sculptor",
    href: "/wiki/Allied_Cultures/Maya_Empire/Mask_Sculptor#Construction",
    useRawHref: true,
  },
  maya_ceremony_outfitter: {
    name: "Ceremony Outfitter",
    href: "/wiki/Allied_Cultures/Maya_Empire/Ceremony_Outfitter#Construction",
    useRawHref: true,
  },
  maya_ritual_carver: {
    name: "Ritual Carver",
    href: "/wiki/Allied_Cultures/Maya_Empire/Ritual_Carver#Construction",
    useRawHref: true,
  },
  maya_luxurious_workshop: {
    name: "Luxurious Workshop",
    href: "/wiki/Allied_Cultures/Maya_Empire/Luxurious_Workshop#Construction",
    useRawHref: true,
  },

  // ritual sites
  // TODO: fix - needs individual title/href for each ritual site
  maya_ritual_sites: {
    name: "Ritual Sites",
    href: "/wiki/Allied_Cultures/Maya_Empire/Ritual_Sites",
  },
  // #endregion

  // #region Arabia
  arabia: {
    children: [
      "arabia_homes",
      "arabia_camel_farm",
      "arabia_workshops",
      "arabia_merchants",
    ],
    name: "Arabia",
  },
  // arabia homes
  arabia_homes: {
    children: ["arabia_medium_home", "arabia_luxurious_home"],
    name: "Homes",
  },
  arabia_medium_home: {
    name: "Medium Home",
    href: "/wiki/Allied_Cultures/Arabia/Medium_Home",
  },
  arabia_luxurious_home: {
    name: "Luxurious Home",
    href: "/wiki/Allied_Cultures/Arabia/Luxurious_Home",
  },
  // arabia merchants
  arabia_merchants: {
    children: ["arabia_merchant", "arabia_luxurious_merchant"],
    name: "Merchants",
  },
  arabia_merchant: {
    name: "Merchant",
    href: "/wiki/Allied_Cultures/Arabia/Merchant",
  },
  arabia_luxurious_merchant: {
    name: "Luxurious Merchant",
    href: "/wiki/Allied_Cultures/Arabia/Luxurious_Merchant",
  },
  // camel farm
  arabia_camel_farm: {
    name: "Camel Farm",
    href: "/wiki/Allied_Cultures/Arabia/Camel_Farm",
  },

  // arabia workshops
  arabia_workshops: {
    children: [
      "coffee_brewer",
      "incense_maker",
      "carpet_factory",
      "oil_lamp_crafter",
      "luxurious_workshop",
    ],
    name: "Workshops",
  },
  coffee_brewer: {
    name: "Coffee Brewer",
    href: "/wiki/Allied_Cultures/Arabia/Coffee_Brewer#Construction",
    useRawHref: true,
  },
  incense_maker: {
    name: "Incense Maker",
    href: "/wiki/Allied_Cultures/Arabia/Incense_Maker#Construction",
    useRawHref: true,
  },
  carpet_factory: {
    name: "Carpet Factory",
    href: "/wiki/Allied_Cultures/Arabia/Carpet_Factory#Construction",
    useRawHref: true,
  },
  oil_lamp_crafter: {
    name: "Oil Lamp Crafter",
    href: "/wiki/Allied_Cultures/Arabia/Oil_Lamp_Crafter#Construction",
    useRawHref: true,
  },
  luxurious_workshop: {
    name: "Luxurious Workshop",
    href: "/wiki/Allied_Cultures/Arabia/Luxurious_Workshop",
  },
  // #endregion

  // #region Viking Kingdom
  viking_kingdom: {
    name: "Viking Kingdom",
    children: [
      "viking_homes",
      "viking_fishing_piers",
      "viking_workshops",
      "viking_beehive",
    ],
    // "viking_runestones"
  },

  // homes
  viking_homes: {
    name: "Homes",
    children: [
      "viking_worker_home",
      "viking_sailor_home",
      "viking_luxurious_home",
    ],
  },
  viking_worker_home: {
    name: "Worker Home",
    href: "/wiki/Allied_Cultures/Viking/Worker_Home",
  },
  viking_sailor_home: {
    name: "Sailor Home",
    href: "/wiki/Allied_Cultures/Viking/Sailor_Home",
  },
  viking_luxurious_home: {
    name: "Luxurious Home",
    href: "/wiki/Allied_Cultures/Viking/Luxurious_Home",
  },

  // beehive
  viking_beehive: {
    name: "Beehive",
    href: "/wiki/Allied_Cultures/Viking/Beehive",
  },

  // fishing pier
  viking_fishing_piers: {
    name: "Fishing Piers",
    children: ["viking_fishing_pier", "viking_luxurious_fishing_pier"],
  },
  viking_fishing_pier: {
    name: "Fishing Pier",
    href: "/wiki/Allied_Cultures/Viking/Fishing_Pier",
  },
  viking_luxurious_fishing_pier: {
    name: "Luxurious Fishing Pier",
    href: "/wiki/Allied_Cultures/Viking/Luxurious_Fishing_Pier",
  },

  // workshops
  viking_workshops: {
    name: "Workshops",
    children: [
      "viking_tavern",
      "viking_expedition_pier",
      "viking_sailor_port",
      "viking_luxurious_sailor_port",
    ],
  },
  viking_tavern: {
    name: "Tavern",
    href: "/wiki/Allied_Cultures/Viking/Tavern",
  },
  viking_expedition_pier: {
    name: "Expedition Pier",
    href: "/wiki/Allied_Cultures/Viking/Expedition_Pier",
  },
  viking_sailor_port: {
    name: "Sailor Port",
    href: "/wiki/Allied_Cultures/Viking/Sailor_Port",
  },
  viking_luxurious_sailor_port: {
    name: "Luxurious Sailor Port",
    href: "/wiki/Allied_Cultures/Viking/Luxurious_Sailor_Port",
  },

  // runestones
  // viking_runestones: { name: "Runestones", href: "/wiki/Allied_Cultures/Viking/Runestones" },

  // #endregion

  // #region Technos
  technology: {
    children: [
      "stone_age",
      "bronze_age",
      "minoan_era",
      "classical_greece",
      "early_rome",
      "roman_empire",
      "byzantine_era",
      "age_of_the_franks",
      "feudal_age",
      "iberian_era",
      "kingdom_of_sicily",
      "high_middle_ages",
      "early_gothic_era",
    ],
    name: "Technologies",
  },

  stone_age: {
    name: "Stone Age",
    href: "/wiki/Home_Cultures/Stone_Age",
    useRawHref: true,
  },
  bronze_age: {
    name: "Bronze Age",
    href: "/wiki/Home_Cultures/Bronze_Age",
    useRawHref: true,
  },
  minoan_era: {
    name: "Minoan Era",
    href: "/wiki/Home_Cultures/Minoan_Era",
    useRawHref: true,
  },
  classical_greece: {
    name: "Classical Greece",
    href: "/wiki/Home_Cultures/Classical_Greece",
    useRawHref: true,
  },
  early_rome: {
    name: "Early Rome",
    href: "/wiki/Home_Cultures/Early_Rome",
    useRawHref: true,
  },
  roman_empire: {
    name: "Roman Empire",
    href: "/wiki/Home_Cultures/Roman_Empire",
    useRawHref: true,
  },
  byzantine_era: {
    name: "Byzantine Era",
    href: "/wiki/Home_Cultures/Byzantine_Era",
    useRawHref: true,
  },
  age_of_the_franks: {
    name: "Age of the Franks",
    href: "/wiki/Home_Cultures/Age_of_the_Franks",
    useRawHref: true,
  },
  feudal_age: {
    name: "Feudal Age",
    href: "/wiki/Home_Cultures/Feudal_Age",
    useRawHref: true,
  },
  iberian_era: {
    name: "Iberian Era",
    href: "/wiki/Home_Cultures/Iberian_Era",
    useRawHref: true,
  },
  kingdom_of_sicily: {
    name: "Kingdom of Sicily",
    href: "/wiki/Home_Cultures/Kingdom_of_Sicily",
    useRawHref: true,
  },
  high_middle_ages: {
    name: "High Middle Ages",
    href: "/wiki/Home_Cultures/High_Middle_Ages",
    useRawHref: true,
  },
  early_gothic_era: {
    name: "Early Gothic",
    href: "/wiki/Home_Cultures/Early_Gothic_Era",
    },
};
