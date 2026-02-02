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

// #region CONTEXT DETECTION
/**
 * Détecter si on est dans le background script ou non
 */
function isBackgroundContext(): boolean {
  // Dans le background, il n'y a pas de window.location
  return typeof window === "undefined" || !window.location;
}
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
 * ✅ SOLUTION : Fonction interne pour sauvegarder directement dans Dexie
 * (utilisée par le background)
 */
async function saveResourcesDirectly(resources: UserResource[]): Promise<void> {
  await gameDb.userResources.clear();
  await gameDb.userResources.bulkAdd(
    resources.map((r) => ({ ...r, updatedAt: Date.now() })),
  );
  console.log(
    `[RoC DB] ${resources.length} resources saved directly to gameDb`,
  );
}

/**
 * Save all resources - détecte automatiquement le contexte
 */
export async function saveResources(resources: UserResource[]): Promise<void> {
  try {
    // ✅ Si on est dans le background, sauvegarder directement
    if (isBackgroundContext()) {
      console.log("[RoC API] Background context detected, saving directly");
      await saveResourcesDirectly(resources);
      return;
    }

    // ✅ Sinon, envoyer au background pour broadcaster
    console.log("[RoC API] Non-background context, sending to background");
    await new Promise<void>((resolve, reject) => {
      chrome.runtime.sendMessage(
        {
          type: "DEXIE_SAVE_USER_RESOURCES",
          payload: { resources },
        },
        (response) => {
          if (chrome.runtime.lastError) {
            reject(new Error(chrome.runtime.lastError.message));
          } else if (response?.success) {
            console.log(
              `[RoC DB] ${resources.length} resources saved via background`,
            );
            resolve();
          } else {
            reject(new Error(response?.error || "Failed to save resources"));
          }
        },
      );
    });
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
export function filterAndCompleteResources(
  resources: UserResource[],
): UserResource[] {
  const resourceMap = new Map<string, UserResource>();
  const selectionKits: UserResource[] = [];

  resources.forEach((resource) => {
    if (resource.type === "selection_kit") {
      selectionKits.push(resource);
    } else {
      resourceMap.set(resource.id, resource);
    }
  });

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

  filteredResources.push(...selectionKits);
  return filteredResources;
}
// #endregion

// #region SYNC
export async function syncGameResources(): Promise<UserResource[]> {
  console.log("[RoC API] 🔄 Synchronisation des ressources...");

  const startupData = await fetchWithAuth("/game/startup", { method: "POST" });

  const allResources = extractUserResources(startupData);
  console.log(`[RoC API] 📦 ${allResources.length} ressources trouvées`);

  const filteredResources = filterAndCompleteResources(allResources);
  console.log(
    `[RoC API] 🎯 ${filteredResources.length} ressources après filtrage`,
  );

  // ✅ saveResources() détecte automatiquement le contexte
  await saveResources(filteredResources);

  // ✅ Si on est dans le background, broadcaster manuellement
  if (isBackgroundContext()) {
    console.log("[RoC API] Broadcasting from background context");
    // Le background doit broadcaster lui-même
    try {
      const allData = await gameDb.userResources.toArray();
      await broadcastUserResourcesChange(allData);
    } catch (error) {
      console.warn("[RoC API] Could not broadcast from background:", error);
    }
  }

  console.log("[RoC API] ✅ Resources saved");

  return filteredResources;
}

async function broadcastUserResourcesChange(data: UserResource[]) {
  const message = {
    type: "DEXIE_CHANGED",
    payload: { type: "USER_RESOURCES", data },
  };

  // Broadcaster uniquement vers les onglets compatibles
  const tabs = await chrome.tabs.query({});
  const validTabs = tabs.filter(
    (tab) =>
      tab.url?.includes("riseofcultures.com") ||
      tab.url?.includes("riseofcultures.wiki.gg"),
  );

  validTabs.forEach((tab) => {
    if (tab.id) {
      chrome.tabs.sendMessage(tab.id, message).catch(() => {});
    }
  });

  chrome.runtime.sendMessage(message).catch(() => {});

  console.log(
    `[RoC API] Broadcasted USER_RESOURCES to ${validTabs.length} valid tabs`,
  );
}

// #region WATCH SYSTEM
const userResourcesListeners = new Set<(data: UserResource[]) => void>();
let userResourcesCache: UserResource[] = [];
let cacheInitialized = false;

async function initUserResourcesCache() {
  if (cacheInitialized) return;
  userResourcesCache = await getAllResources();
  cacheInitialized = true;
}

// Listen to background broadcasts
if (typeof chrome !== "undefined" && chrome.runtime?.onMessage) {
  chrome.runtime.onMessage.addListener((message) => {
    if (message.type !== "DEXIE_CHANGED") return;

    const { type: changeType, data } = message.payload;

    if (changeType === "USER_RESOURCES") {
      console.log("[RoC API] User resources changed, updating cache");
      userResourcesCache = data || [];
      userResourcesListeners.forEach((cb) => cb(userResourcesCache));
    }
  });
}

/**
 * Watch user resources for changes
 */
export function watchUserResources(callback: (data: UserResource[]) => void) {
  userResourcesListeners.add(callback);

  initUserResourcesCache().then(() => callback(userResourcesCache));

  return () => userResourcesListeners.delete(callback);
}
// #endregion
