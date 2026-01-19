import { goodsList } from "@/lib/data/goods";
import { fetchWithAuth } from "@/lib/roc/tokenCapture";
import { gameDb } from "@/lib/storage/dexie";

// #region TYPES
export interface UserResource {
  id: string;
  amount: number;
  type: string;
  prs?: number;
  lastUpdated: string;
}

export const RocTypes = {
  ALLIANCE_MEMBERS: "type.googleapis.com/AllianceMembersResponse",
  CITY: "type.googleapis.com/CityDTO",
  PLAYER_PROFILE: "type.googleapis.com/PlayerProfile",
  RESOURCE_DEFINITION: "type.googleapis.com/ResourceDefinitionDTO",
  SELECTION_KIT_DEFINITION: "type.googleapis.com/SelectionKitDefinitionDTO",
} as const;

const SELECT_KIT_PR_NAME = "selection_kit_allianceincident_research";
// #endregion

// #region FILTRAGE JSON
export function filterJsonData(data: unknown, type: string): any[] {
  const result: any[] = [];
  traverseJson(data, type, result);
  return result;
}

function traverseJson(data: unknown, type: string, result: any[]): void {
  if (Array.isArray(data)) {
    data.forEach((item) => traverseJson(item, type, result));
  } else if (typeof data === "object" && data !== null) {
    const obj = data as Record<string, unknown>;
    if (obj["@type"] === type) {
      result.push(obj);
    }
    Object.values(obj).forEach((value) => traverseJson(value, type, result));
  }
}
// #endregion

// #region EXTRACTION
export function extractUserResources(startupData: unknown): UserResource[] {
  const resources: UserResource[] = [];

  function findResources(obj: unknown): void {
    if (Array.isArray(obj)) {
      obj.forEach((item) => findResources(item));
    } else if (typeof obj === "object" && obj !== null) {
      const data = obj as Record<string, any>;

      // Extraction des goods
      if (
        data.definition?.["@type"] === RocTypes.RESOURCE_DEFINITION &&
        data.amount !== undefined &&
        data.definition.resourceType
      ) {
        resources.push({
          id: data.definition.id,
          amount: parseInt(String(data.amount), 10) || 0,
          type: data.definition.resourceType,
          lastUpdated: new Date().toISOString(),
        });
      }

      // Extraction des selection kit PRS
      if (
        data.definition?.["@type"] === RocTypes.SELECTION_KIT_DEFINITION &&
        data.amount !== undefined
      ) {
        const definitionId = String(data.definition.id).toLowerCase();
        if (definitionId.includes(SELECT_KIT_PR_NAME)) {
          resources.push({
            id: data.definition.id,
            amount: parseInt(String(data.amount), 10) || 0,
            type: "selection_kit",
            prs: data.definition.rewards?.[0]?.amount,
            lastUpdated: new Date().toISOString(),
          });
        }
      }

      Object.values(data).forEach((value) => findResources(value));
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

// #region FILTERING AND COMPLETION
/**
 * Filter resources to keep only those in goodsList
 * Add missing goods with amount = 0
 * Keep selection_kit resources as they are not in goodsList
 */
export function filterAndCompleteResources(
  resources: UserResource[],
): UserResource[] {
  const resourceMap = new Map<string, UserResource>();
  const selectionKits: UserResource[] = [];

  // Un seul passage sur les ressources
  resources.forEach((resource) => {
    if (resource.type === "selection_kit") {
      selectionKits.push(resource);
    } else {
      resourceMap.set(resource.id, resource);
    }
  });

  // Traiter goodsList et ajouter les selection_kits
  const filteredResources = goodsList.map((good) => {
    const existingResource = resourceMap.get(good.gameName);
    if (existingResource) {
      return {
        ...existingResource,
        id: good.wikiName || good.gameName,
        type: good.type,
      };
    }
    return {
      id: good.wikiName || good.gameName,
      amount: 0,
      type: good.type,
      lastUpdated: new Date().toISOString(),
    };
  });

  // Concaténer directement lors du return
  filteredResources.push(...selectionKits);
  return filteredResources;
}
// #endregion

// #region SYNC
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
// #endregion
