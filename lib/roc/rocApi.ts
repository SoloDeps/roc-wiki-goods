import { goodsList } from "@/lib/data/goods";
import { fetchWithAuth } from "@/lib/roc/tokenCapture";
import { gameDb } from "@/lib/storage/dexie";

// #region TYPES
export interface ResourceDefinition {
  id: string;
  resourceType: string;
  age: string;
  cities: string[];
  order: string;
  group: string;
}

export interface UserResource {
  id: string;
  amount: number;
  type: string;
  lastUpdated: string;
}

export const RocTypes = {
  ALLIANCE_MEMBERS: "type.googleapis.com/AllianceMembersResponse",
  CITY: "type.googleapis.com/CityDTO",
  PLAYER_PROFILE: "type.googleapis.com/PlayerProfile",
  RESOURCE_DEFINITION: "type.googleapis.com/ResourceDefinitionDTO",
  SELECTION_KIT_DEFINITION: "type.googleapis.com/SelectionKitDefinitionDTO",
} as const;
// #endregion

// #region FILTRAGE JSON
export function filterJsonData(data: any, type: string): any[] {
  const result: any[] = [];
  traverseJson(data, type, result);
  return result;
}

function traverseJson(data: any, type: string, result: any[]): void {
  if (Array.isArray(data)) {
    data.forEach((item) => traverseJson(item, type, result));
  } else if (typeof data === "object" && data !== null) {
    if (data["@type"] === type) {
      result.push(data);
    }
    Object.values(data).forEach((value) => traverseJson(value, type, result));
  }
}
// #endregion

// #region EXTRACTION
export function extractUserResources(startupData: any): UserResource[] {
  const resources: UserResource[] = [];

  function findResources(obj: any) {
    if (Array.isArray(obj)) {
      obj.forEach((item) => findResources(item));
    } else if (typeof obj === "object" && obj !== null) {
      if (
        (obj.definition?.["@type"] === RocTypes.RESOURCE_DEFINITION &&
          obj.amount) ||
        (obj.definition?.["@type"] === RocTypes.SELECTION_KIT_DEFINITION &&
          obj.amount)
      ) {
        resources.push({
          id: obj.definition.id,
          amount: parseInt(obj.amount) || 0,
          type: obj.definition.resourceType,
          lastUpdated: new Date().toISOString(),
        });
      }

      Object.values(obj).forEach((value) => findResources(value));
    }
  }

  findResources(startupData);
  console.log("[RoC API] Extraction done.", resources.length, "resources");
  return resources;
}
// #endregion

// #region DEXIE DB OPERATIONS
/**
 * Save all resources to gameDb using Dexie
 */
export async function saveResources(resources: UserResource[]): Promise<void> {
  try {
    await gameDb.userResources.clear();
    await gameDb.userResources.bulkAdd(
      resources.map((r) => ({ ...r, updatedAt: Date.now() })),
    );
    console.log(`[RoC DB] ${resources.length} resources saved to gameDb`);
  } catch (error) {
    console.error("[RoC DB] Error saving resources:", error);
    throw error;
  }
}

/**
 * Get all resources from gameDb
 */
export async function getAllResources(): Promise<UserResource[]> {
  try {
    return await gameDb.userResources.toArray();
  } catch (error) {
    console.error("[RoC DB] Error reading resources:", error);
    return [];
  }
}

/**
 * Get a specific resource by ID
 */
export async function getResource(id: string): Promise<UserResource | null> {
  try {
    const resource = await gameDb.userResources.get(id);
    return resource || null;
  } catch (error) {
    console.error(`[RoC DB] Error reading resource ${id}:`, error);
    return null;
  }
}

/**
 * Get resources filtered by type
 */
export async function getResourcesByType(
  type: string,
): Promise<UserResource[]> {
  try {
    return await gameDb.userResources.where("type").equals(type).toArray();
  } catch (error) {
    console.error(`[RoC DB] Error reading resources of type ${type}:`, error);
    return [];
  }
}
// #endregion

/**
 * Filter resources to keep only those in goodsList
 * Add missing goods with amount = 0
 */
export function filterAndCompleteResources(
  resources: UserResource[],
): UserResource[] {
  const resourceMap = new Map<string, UserResource>();
  resources.forEach((resource) => {
    resourceMap.set(resource.id, resource);
  });

  const filteredResources: UserResource[] = [];

  goodsList.forEach((good) => {
    const existingResource = resourceMap.get(good.gameName);
    if (existingResource) {
      filteredResources.push({
        ...existingResource,
        id: good.wikiName ? good.wikiName : good.gameName,
        type: good.type,
      });
    } else {
      filteredResources.push({
        id: good.wikiName ? good.wikiName : good.gameName,
        amount: 0,
        type: good.type,
        lastUpdated: new Date().toISOString(),
      });
    }
  });

  return filteredResources;
}

/**
 * Fetch game data and save filtered resources
 */
export async function syncGameResources(): Promise<UserResource[]> {
  console.log("[RoC API] 🔄 Synchronisation des ressources...");

  const startupData = await fetchWithAuth("/game/startup", { method: "POST" });

  const allResources = extractUserResources(startupData);
  console.log(`[RoC API] 📦 ${allResources.length} ressources trouvées`);

  const filteredResources = filterAndCompleteResources(allResources);
  console.log(
    `[RoC API] 🎯 ${filteredResources.length} ressources après filtrage`,
  );

  await saveResources(filteredResources);

  return filteredResources;
}
