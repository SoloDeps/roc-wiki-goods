import { getAllResources } from "@/lib/roc/rocApi";
import { getGoodNameFromPriorityEra } from "@/lib/utils";

export async function getUserResources(): Promise<Record<string, number>> {
  const resources = await getAllResources();

  // Calculer le total des PRS depuis les selection_kits
  let totalSelectionKitPrs = 0;
  resources.forEach((resource) => {
    if (resource.type === "selection_kit") {
      const prsValue = (resource.amount || 0) * (resource.prs || 0);
      totalSelectionKitPrs += prsValue;
    }
  });

  return resources.reduce(
    (acc, resource) => {
      // Ajouter les PRS des selection_kits aux research_points
      if (resource.id === "research_points") {
        acc[resource.id] = resource.amount + totalSelectionKitPrs;
      } else if (resource.type !== "selection_kit") {
        // Ignorer les selection_kits individuels (déjà comptabilisés dans research_points)
        acc[resource.id] = resource.amount;
      }
      return acc;
    },
    {} as Record<string, number>,
  );
}

export async function hasUserResources(): Promise<boolean> {
  try {
    const resources = await getAllResources();
    return resources.length > 0;
  } catch {
    return false;
  }
}

const RESOURCE_MAPPING: Record<string, string> = {
  research_points: "research_points",
  coins: "coins",
  food: "food",
  gems: "gems",
};

export function normalizeResourceKey(
  key: string,
  userSelections: string[][],
): string {
  if (RESOURCE_MAPPING[key]) return RESOURCE_MAPPING[key];

  // ✅ FIX: Accepter les deux formats (Primary_CG et primary_cg)
  const match = key.match(/^(primary|secondary|tertiary)_([a-z]{2})$/i);
  if (match) {
    const [, priority, era] = match;
    const goodName = getGoodNameFromPriorityEra(priority, era, userSelections);
    return goodName || key.toLowerCase();
  }

  return key.toLowerCase().replace(/\s+/g, "_");
}
