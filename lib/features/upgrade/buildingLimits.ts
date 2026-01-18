import {
  EraAbbr,
  alliedCity,
  limitAllBuildingsByEra,
  limitAlliedBuildingsByEra,
} from "@/lib/constants";

export function getMaxQty(
  eraAbbr: EraAbbr,
  mainSection: string,
  subSection?: string,
  buildingName?: string,
  tableType?: string
): number {
  if (!buildingName) return 1;

  if (mainSection === "home_cultures") {
    const name = subSection === "workshops" ? "workshops" : buildingName;
    return limitAllBuildingsByEra[eraAbbr]?.[name] ?? 1;
  }

  if (mainSection === "allied_cultures") {
    if (!subSection) return 1;
    const city = subSection as alliedCity;

    if (tableType === "construction") {
      const data = limitAlliedBuildingsByEra[city]?.[buildingName];
      if (!data) return 1;
      const values = Object.values(data);
      return values[values.length - 1] ?? 1;
    }

    return limitAlliedBuildingsByEra[city]?.[buildingName]?.[eraAbbr] ?? 1;
  }

  return limitAllBuildingsByEra[eraAbbr]?.[buildingName] ?? 1;
}
