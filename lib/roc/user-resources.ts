import { getAllResources } from "@/lib/roc/rocApi";
import { getGoodNameFromPriorityEra } from "@/lib/utils";

export async function getUserResources(): Promise<Record<string, number>> {
  const resources = await getAllResources();
  return resources.reduce(
    (acc, resource) => {
      acc[resource.id] = resource.amount;
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

  const match = key.match(/^(Primary|Secondary|Tertiary)_([A-Z]{2})$/);
  if (match) {
    const [, priority, era] = match;
    const goodName = getGoodNameFromPriorityEra(priority, era, userSelections);
    return goodName || key.toLowerCase();
  }

  return key.toLowerCase().replace(/\s+/g, "_");
}
