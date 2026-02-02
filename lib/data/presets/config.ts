import type {
  BuildingEntity,
  TechnoEntity,
  OttomanAreaEntity,
  OttomanTradePostEntity,
} from "@/lib/storage/dexie";

export interface PresetData {
  buildings: Omit<BuildingEntity, "updatedAt">[];
  technos: Omit<TechnoEntity, "updatedAt">[];
  ottomanAreas?: Omit<OttomanAreaEntity, "updatedAt">[];
  ottomanTradePosts?: Omit<OttomanTradePostEntity, "updatedAt">[];
}

export const PRESET_KEYS = [
  "1_stone_age",
  "2_bronze_age",
  "3_minoan_era",
  "4_classical_greece",
  "5_early_rome",
  "6_roman_empire",
  "7_byzantine_era",
  "8_age_of_the_franks",
  "9_feudal_age",
  "10_iberian_era",
  "11_kingdom_of_sicily",
  "12_high_middle_ages",
  "13_early_gothic_era",
  "14_late_gothic_era",
] as const;

export type PresetKey = (typeof PRESET_KEYS)[number];
