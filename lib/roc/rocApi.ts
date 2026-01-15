import { goodsList } from "@/lib/data/goods";
import { fetchWithAuth } from "@/lib/roc/tokenCapture";

// #region TYPES
export interface ResourceDefinition {
  id: string; // "ankh"
  resourceType: string; // "good"
  age: string; // "MinoanEra"
  cities: string[]; // ["City_Egypt"]
  order: string; // "2"
  group: string; // "goldsmith"
}

export interface UserResource {
  id: string; // "ankh"
  amount: number; // 2210
  type: string; // "good" ou "soft_currency" ou "premium"
  lastUpdated: string; // ISO date
}

export const RocTypes = {
  ALLIANCE_MEMBERS: "type.googleapis.com/AllianceMembersResponse",
  CITY: "type.googleapis.com/CityDTO",
  PLAYER_PROFILE: "type.googleapis.com/PlayerProfile",
  RESOURCE_DEFINITION: "type.googleapis.com/ResourceDefinitionDTO",
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

  // Parcourir récursivement pour trouver les objets avec definition + amount
  function findResources(obj: any) {
    if (Array.isArray(obj)) {
      obj.forEach((item) => findResources(item));
    } else if (typeof obj === "object" && obj !== null) {
      // Si l'objet a une definition ET un amount
      if (
        obj.definition?.["@type"] === RocTypes.RESOURCE_DEFINITION &&
        obj.amount
      ) {
        resources.push({
          id: obj.definition.id,
          amount: parseInt(obj.amount) || 0,
          type: obj.definition.resourceType,
          lastUpdated: new Date().toISOString(),
        });
      }

      // Continuer la récursion
      Object.values(obj).forEach((value) => findResources(value));
    }
  }

  findResources(startupData);
  console.log("[RoC API] Extraction done.", resources.length, "resources");
  return resources;
}
// #endregion

// #region INDEXEDDB

const DB_NAME = "RocWikiDB";
const DB_VERSION = 1;
const STORE_NAME = "userResources";

let dbInstance: IDBDatabase | null = null;

/**
 * Ouvre/crée la base de données IndexedDB
 */
function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    // Si on a une instance valide, l'utiliser
    if (dbInstance && dbInstance.version === DB_VERSION) {
      resolve(dbInstance);
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      dbInstance = request.result;

      // Écouter la fermeture de la connexion pour nettoyer l'instance
      dbInstance.onclose = () => {
        dbInstance = null;
      };

      resolve(dbInstance);
    };

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;

      // Créer l'object store si il n'existe pas
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: "id" });
        store.createIndex("type", "type", { unique: false });
      }
    };
  });
}

/**
 * Sauvegarde toutes les ressources dans IndexedDB
 */
export async function saveResources(resources: UserResource[]): Promise<void> {
  try {
    const db = await openDB();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], "readwrite");
      const store = transaction.objectStore(STORE_NAME);

      // Vider le store avant d'insérer les nouvelles données
      store.clear();

      // Insérer toutes les ressources
      resources.forEach((resource) => {
        store.put(resource);
      });

      transaction.oncomplete = () => {
        console.log(`[RoC DB] ✅ ${resources.length} ressources sauvegardées`);
        resolve();
      };
      transaction.onerror = () => reject(transaction.error);
    });
  } catch (error) {
    console.error("[RoC DB] ❌ Erreur lors de la sauvegarde:", error);
    throw error;
  }
}

/**
 * Récupère toutes les ressources depuis IndexedDB
 */
export async function getAllResources(): Promise<UserResource[]> {
  try {
    const db = await openDB();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], "readonly");
      const store = transaction.objectStore(STORE_NAME);
      const request = store.getAll();

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.error("[RoC DB] ❌ Erreur lors de la lecture:", error);
    return [];
  }
}

/**
 * Récupère une ressource spécifique par ID
 */
export async function getResource(id: string): Promise<UserResource | null> {
  try {
    const db = await openDB();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], "readonly");
      const store = transaction.objectStore(STORE_NAME);
      const request = store.get(id);

      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.error(`[RoC DB] ❌ Erreur lors de la lecture de ${id}:`, error);
    return null;
  }
}

/**
 * Récupère les ressources filtrées par type
 */
export async function getResourcesByType(
  type: string
): Promise<UserResource[]> {
  try {
    const db = await openDB();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], "readonly");
      const store = transaction.objectStore(STORE_NAME);
      const index = store.index("type");
      const request = index.getAll(type);

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.error(
      `[RoC DB] ❌ Erreur lors de la lecture du type ${type}:`,
      error
    );
    return [];
  }
}

// #endregion

/**
 * Filtre les ressources pour ne garder que celles dans goodsList
 * Ajoute les goods manquants avec amount = 0
 */
export function filterAndCompleteResources(
  resources: UserResource[]
): UserResource[] {
  // Créer un Map des ressources existantes par ID
  const resourceMap = new Map<string, UserResource>();
  resources.forEach((resource) => {
    resourceMap.set(resource.id, resource);
  });

  // Filtrer pour ne garder que les ressources dans goodsList
  const filteredResources: UserResource[] = [];

  goodsList.forEach((good) => {
    const existingResource = resourceMap.get(good.name);
    if (existingResource) {
      // Garder la ressource existante si elle est dans goodsList
      filteredResources.push({
        ...existingResource,
        type: good.type, // S'assurer que le type correspond à goodsList
      });
    } else {
      // Ajouter le good manquant avec amount = 0
      filteredResources.push({
        id: good.name,
        amount: 0,
        type: good.type,
        lastUpdated: new Date().toISOString(),
      });
    }
  });

  return filteredResources;
}

/**
 * Récupère les données du jeu et sauvegarde les ressources filtrées
 */
export async function syncGameResources(): Promise<UserResource[]> {
  console.log("[RoC API] 🔄 Synchronisation des ressources...");

  // 1. Récupérer les données de startup
  const startupData = await fetchWithAuth("/game/startup", { method: "POST" });

  // 2. Extraire les ressources
  const allResources = extractUserResources(startupData);
  console.log(`[RoC API] 📦 ${allResources.length} ressources trouvées`);

  // 3. Filtrer et compléter selon goodsList
  const filteredResources = filterAndCompleteResources(allResources);
  console.log(
    `[RoC API] 🎯 ${filteredResources.length} ressources après filtrage`
  );

  // 4. Sauvegarder dans IndexedDB
  await saveResources(filteredResources);

  return filteredResources;
}
