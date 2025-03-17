export const eras = [
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
];

export const buildings = [
  {
    Tailor: {
      BA: "wool",
      ME: "linen_shirt",
      CG: "toga",
      ER: "tunic",
      RE: "cape",
    },
    "Stone Mason": {
      BA: "alabaster_idol",
      ME: "marble_bust",
      CG: "column",
      ER: "stone_tablet",
      RE: "mosaic",
    },
    Artisan: {
      BA: "bronze_bracelet",
      ME: "iron_pendant",
      CG: "silver_ring",
      ER: "gold_laurel",
      RE: "goblet",
    },
  },
  {
    Scribe: {
      BE: "parchment",
      AF: "ink",
      FA: "manuscript",
      IE: "wax_seal",
      KS: "tome",
      HMA: "grimoire",
    },
    Carpenter: {
      BE: "planks",
      AF: "cartwheel",
      FA: "barrel",
      IE: "door",
      KS: "wardrobe",
      HMA: "secretary_desk",
    },
    "Spice Merchant": {
      BE: "pepper",
      AF: "salt",
      FA: "herbs",
      IE: "saffron",
      KS: "chili",
      HMA: "cinnamon",
    },
  },
];
