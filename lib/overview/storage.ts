import { BuildingEntity, TechnoEntity } from "@/lib/storage/dexie";
import { buildingsAbbr, eras } from "@/lib/constants";
import { slugify, parseNumber } from "@/lib/utils";
import { storage } from "#imports";

// background communication
async function sendDexieMessage(type: string, payload?: any): Promise<any> {
  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage({ type, payload }, (response) => {
      if (chrome.runtime.lastError) {
        reject(new Error(chrome.runtime.lastError.message));
      } else if (response?.success) {
        resolve(response.data);
      } else {
        reject(new Error(response?.error || "Unknown error"));
      }
    });
  });
}

// buildings operations
export const getBuildings = () => sendDexieMessage("DEXIE_GET_BUILDINGS");
export const saveBuilding = (building: Omit<BuildingEntity, "updatedAt">) =>
  sendDexieMessage("DEXIE_SAVE_BUILDING", building);
export const updateBuildingQuantity = (id: string, newQuantity: number) =>
  sendDexieMessage("DEXIE_UPDATE_BUILDING_QUANTITY", { id, newQuantity });
export const toggleBuildingHidden = (id: string) =>
  sendDexieMessage("DEXIE_TOGGLE_BUILDING_HIDDEN", { id });
export const removeBuilding = (id: string) =>
  sendDexieMessage("DEXIE_REMOVE_BUILDING", { id });
export const removeAllBuildings = () =>
  sendDexieMessage("DEXIE_REMOVE_ALL_BUILDINGS");

// technologies operations
export const getTechnos = () => sendDexieMessage("DEXIE_GET_TECHNOS");
export const saveTechno = (techno: Omit<TechnoEntity, "updatedAt">) =>
  sendDexieMessage("DEXIE_SAVE_TECHNO", techno);
export const toggleTechnoHidden = (eraPath: string) =>
  sendDexieMessage("DEXIE_TOGGLE_TECHNO_HIDDEN", { eraPath });
export const removeTechno = (id: string) =>
  sendDexieMessage("DEXIE_REMOVE_TECHNO", { id });
export const removeAllTechnos = () =>
  sendDexieMessage("DEXIE_REMOVE_ALL_TECHNOS");
export const saveEraTechnos = (eraPath: string, technos: TechnoEntity[]) =>
  sendDexieMessage("DEXIE_SAVE_ERA_TECHNOS", { eraPath, technos });
export const clearEraTechnos = (eraPath: string) =>
  sendDexieMessage("DEXIE_CLEAR_ERA_TECHNOS", { eraPath });

// hide/show all
export const hideAllBuildings = () =>
  sendDexieMessage("DEXIE_HIDE_ALL_BUILDINGS");
export const showAllBuildings = () =>
  sendDexieMessage("DEXIE_SHOW_ALL_BUILDINGS");
export const hideAllTechnos = () => sendDexieMessage("DEXIE_HIDE_ALL_TECHNOS");
export const showAllTechnos = () => sendDexieMessage("DEXIE_SHOW_ALL_TECHNOS");

// ==================== ✅ OTTOMAN OPERATIONS ====================
export const getOttomanAreas = () =>
  sendDexieMessage("DEXIE_GET_OTTOMAN_AREAS");
export const saveOttomanArea = (
  area: Omit<import("@/lib/storage/dexie").OttomanAreaEntity, "updatedAt">,
) => sendDexieMessage("DEXIE_SAVE_OTTOMAN_AREA", area);
export const toggleOttomanAreaHidden = (id: string) =>
  sendDexieMessage("DEXIE_TOGGLE_OTTOMAN_AREA_HIDDEN", { id });
export const removeOttomanArea = (id: string) =>
  sendDexieMessage("DEXIE_REMOVE_OTTOMAN_AREA", { id });
export const removeAllOttomanAreas = () =>
  sendDexieMessage("DEXIE_REMOVE_ALL_OTTOMAN_AREAS");

export const getOttomanTradePosts = () =>
  sendDexieMessage("DEXIE_GET_OTTOMAN_TRADEPOSTS");
export const saveOttomanTradePost = (
  tradePost: Omit<
    import("@/lib/storage/dexie").OttomanTradePostEntity,
    "updatedAt"
  >,
) => sendDexieMessage("DEXIE_SAVE_OTTOMAN_TRADEPOST", tradePost);
export const toggleOttomanTradePostHidden = (id: string) =>
  sendDexieMessage("DEXIE_TOGGLE_OTTOMAN_TRADEPOST_HIDDEN", { id });
export const toggleOttomanTradePostLevel = (
  id: string,
  level: "unlock" | "lvl2" | "lvl3" | "lvl4" | "lvl5",
) => sendDexieMessage("DEXIE_TOGGLE_OTTOMAN_TRADEPOST_LEVEL", { id, level });
export const removeOttomanTradePost = (id: string) =>
  sendDexieMessage("DEXIE_REMOVE_OTTOMAN_TRADEPOST", { id });
export const removeAllOttomanTradePosts = () =>
  sendDexieMessage("DEXIE_REMOVE_ALL_OTTOMAN_TRADEPOSTS");

export const hideAllOttomanAreas = () =>
  sendDexieMessage("DEXIE_HIDE_ALL_OTTOMAN_AREAS");
export const showAllOttomanAreas = () =>
  sendDexieMessage("DEXIE_SHOW_ALL_OTTOMAN_AREAS");
export const hideAllOttomanTradePosts = () =>
  sendDexieMessage("DEXIE_HIDE_ALL_OTTOMAN_TRADEPOSTS");
export const showAllOttomanTradePosts = () =>
  sendDexieMessage("DEXIE_SHOW_ALL_OTTOMAN_TRADEPOSTS");

// watch system
const buildingsListeners = new Set<(data: BuildingEntity[]) => void>();
const technosListeners = new Set<(data: TechnoEntity[]) => void>();

// cache initialization
let cacheInitialized = false;
let buildingsCache: BuildingEntity[] = [];
let technosCache: TechnoEntity[] = [];

async function initCache() {
  if (cacheInitialized) return;
  [buildingsCache, technosCache] = await Promise.all([
    getBuildings(),
    getTechnos(),
  ]);
  cacheInitialized = true;
}

// background listener
if (typeof chrome !== "undefined" && chrome.runtime?.onMessage) {
  chrome.runtime.onMessage.addListener((message) => {
    if (message.type !== "DEXIE_CHANGED") return;

    if (watchersSuspended) {
      console.log("[Storage] Watchers suspended, ignoring broadcast");
      return;
    }

    const { type: changeType, data } = message.payload;

    if (changeType === "BUILDINGS") {
      buildingsCache = data || [];
      buildingsListeners.forEach((cb) => cb(buildingsCache));
    } else if (changeType === "TECHNOS") {
      technosCache = data || [];
      technosListeners.forEach((cb) => cb(technosCache));
    }
    // ✅ AJOUT: Ottoman changes
    else if (changeType === "OTTOMAN_AREAS") {
      ottomanAreasCache = data || [];
      ottomanAreasListeners.forEach((cb) => cb(ottomanAreasCache));
    } else if (changeType === "OTTOMAN_TRADEPOSTS") {
      ottomanTradePostsCache = data || [];
      ottomanTradePostsListeners.forEach((cb) => cb(ottomanTradePostsCache));
    }
  });
}

export function watchBuildings(callback: (data: BuildingEntity[]) => void) {
  buildingsListeners.add(callback);

  initCache().then(() => callback(buildingsCache));

  return () => buildingsListeners.delete(callback);
}

export function watchTechnos(callback: (data: TechnoEntity[]) => void) {
  technosListeners.add(callback);

  initCache().then(() => callback(technosCache));

  return () => technosListeners.delete(callback);
}

// utilities
const RESOURCE_TYPES = {
  coins: "coins",
  coin: "coins",
  pennies: "pennies",
  "wu zhu": "wu_zhu",
  deben: "deben",
  dirham: "dirham",
  asper: "asper",
  aspers: "aspers",
  food: "food",
  cocoa: "cocoa",
  rice: "rice",
  gems: "gems",
  goods: "goods",
} as const;

export interface SavedBuilding {
  id: string;
  costs: Record<string, number | Array<{ type: string; amount: number }>>;
  maxQty: number;
  quantity: number;
  hidden: boolean;
}

export function flattenAndSortTechnos(technos: TechnoEntity[]): TechnoEntity[] {
  const eraOrder = eras.map((e) => e.abbr);
  const eraNameToAbbr = Object.fromEntries(eras.map((e) => [e.id, e.abbr]));
  const byEra: Record<string, TechnoEntity[]> = {};

  technos.forEach((t) => {
    const era = t.id.split("_").slice(1, -1).join("_");
    (byEra[era] ??= []).push(t);
  });

  return Object.keys(byEra)
    .sort((a, b) => {
      const idxA = eraOrder.indexOf(eraNameToAbbr[a] || a);
      const idxB = eraOrder.indexOf(eraNameToAbbr[b] || b);
      return (idxA === -1 ? Infinity : idxA) - (idxB === -1 ? Infinity : idxB);
    })
    .flatMap((era) =>
      byEra[era].sort((a, b) => {
        const numA = parseInt(a.id.split("_").pop() || "0");
        const numB = parseInt(b.id.split("_").pop() || "0");
        return numA - numB;
      }),
    );
}

export function extractCosts(row: HTMLTableRowElement): SavedBuilding["costs"] {
  const cells = Array.from(row.cells);
  const headerRow = row.parentElement?.querySelector("tr");
  const columnMap: Record<number, string> = {};

  if (headerRow) {
    Array.from(headerRow.cells).forEach((th, i) => {
      columnMap[i] = th.textContent?.trim().toLowerCase() || "";
    });
  }

  const costs: SavedBuilding["costs"] = {};

  cells.forEach((cell, i) => {
    const resourceKey =
      RESOURCE_TYPES[columnMap[i] as keyof typeof RESOURCE_TYPES];
    if (!resourceKey) return;

    if (resourceKey === "goods") {
      costs.goods = extractGoodsDetails(cell);
      return;
    }

    let text = "";
    cell.childNodes.forEach((node) => {
      if (node.nodeType === Node.TEXT_NODE) {
        text += (node as any).dataOriginal ?? node.textContent ?? "";
      }
    });

    const value = parseNumber(text.replace(/\w+\.png/g, "").trim());
    if (value > 0) costs[resourceKey] = value;
  });

  return costs;
}

function extractGoodsDetails(
  cell: HTMLTableCellElement,
): Array<{ type: string; amount: number }> {
  const details: Array<{ type: string; amount: number }> = [];
  let html = "";

  cell.childNodes.forEach((node) => {
    if (node.nodeType === Node.TEXT_NODE) {
      html += (node as any).dataOriginal ?? node.textContent ?? "";
    } else if (node.nodeName === "BR") {
      html += "<br>";
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      html += (node as HTMLElement).outerHTML;
    }
  });

  html.split(/<br\s*\/?>/i).forEach((line) => {
    if (!line.trim()) return;

    const div = document.createElement("div");
    div.innerHTML = line.trim();
    const text = div.textContent || "";

    const patterns = [
      { regex: /Primary:\s*([A-Z]+)\s*([\d,]+)/i, prefix: "Primary_" },
      { regex: /Secondary:\s*([A-Z]+)\s*([\d,]+)/i, prefix: "Secondary_" },
      { regex: /Tertiary:\s*([A-Z]+)\s*([\d,]+)/i, prefix: "Tertiary_" },
    ];

    for (const { regex, prefix } of patterns) {
      const match = text.match(regex);
      if (match) {
        details.push({
          type: `${prefix}${match[1]}`,
          amount: parseNumber(match[2]),
        });
        return;
      }
    }

    const img = div.querySelector("img");
    if (img) {
      const alt = img.getAttribute("alt")?.replace(".png", "").trim();
      const src = img.getAttribute("src") || "";
      const goodType =
        alt || src.match(/\/([^\/]+)\.png/i)?.[1].replace(/^\d+px-/, "") || "";
      const valueMatch = text.match(/([\d,]+)/);

      if (goodType && valueMatch) {
        const normalizedType = slugify(goodType);

        details.push({
          type: normalizedType,
          amount: parseNumber(valueMatch[1]),
        });
      }
    }
  });

  return details;
}

// building selections
const DEFAULT_SELECTIONS = buildingsAbbr.map(() => ["", "", ""]);

export async function getBuildingSelections(): Promise<string[][]> {
  try {
    const stored = await storage.getItem<string>("local:buildingSelections");

    if (!stored) {
      return DEFAULT_SELECTIONS;
    }

    const parsed = JSON.parse(stored);
    return Array.isArray(parsed) ? parsed : DEFAULT_SELECTIONS;
  } catch {
    return DEFAULT_SELECTIONS;
  }
}

const selectionsListeners = new Set<(data: string[][]) => void>();
let selectionsCache: string[][] = DEFAULT_SELECTIONS;
let selectionsCacheInitialized = false;

async function initSelectionsCache() {
  if (selectionsCacheInitialized) return;
  selectionsCache = await getBuildingSelections();
  selectionsCacheInitialized = true;
}

export function watchBuildingSelections(callback: (data: string[][]) => void) {
  selectionsListeners.add(callback);

  initSelectionsCache().then(() => callback(selectionsCache));

  const unwatch = storage.watch<string>(
    "local:buildingSelections",
    (newValue) => {
      if (!newValue) return;

      try {
        const parsed = JSON.parse(newValue);
        if (Array.isArray(parsed)) {
          selectionsCache = parsed;
          selectionsListeners.forEach((cb) => cb(selectionsCache));
        }
      } catch {}
    },
  );

  return () => {
    selectionsListeners.delete(callback);
    unwatch();
  };
}

// PRESET

let watchersSuspended = false;

// Modifier la fonction qui écoute les changements du background
if (typeof chrome !== "undefined" && chrome.runtime?.onMessage) {
  chrome.runtime.onMessage.addListener((message) => {
    if (message.type !== "DEXIE_CHANGED") return;

    // ✅ Ignorer les broadcasts si les watchers sont suspendus
    if (watchersSuspended) {
      console.log("[Storage] Watchers suspended, ignoring broadcast");
      return;
    }

    const { type: changeType, data } = message.payload;

    if (changeType === "BUILDINGS") {
      buildingsCache = data || [];
      buildingsListeners.forEach((cb) => cb(buildingsCache));
    } else if (changeType === "TECHNOS") {
      technosCache = data || [];
      technosListeners.forEach((cb) => cb(technosCache));
    }
  });
}

// ✅ Nouvelles fonctions pour suspendre/reprendre les watchers
export function suspendWatchers() {
  watchersSuspended = true;
}

export function resumeWatchers() {
  watchersSuspended = false;
}

// ✅ Nouvelle fonction pour forcer un refresh manuel
export async function forceRefreshWatchers() {
  const [buildings, technos, ottomanAreas, ottomanTradePosts] =
    await Promise.all([
      getBuildings(),
      getTechnos(),
      getOttomanAreas(),
      getOttomanTradePosts(),
    ]);

  buildingsCache = buildings;
  technosCache = technos;
  ottomanAreasCache = ottomanAreas;
  ottomanTradePostsCache = ottomanTradePosts;

  buildingsListeners.forEach((cb) => cb(buildingsCache));
  technosListeners.forEach((cb) => cb(technosCache));
  ottomanAreasListeners.forEach((cb) => cb(ottomanAreasCache));
  ottomanTradePostsListeners.forEach((cb) => cb(ottomanTradePostsCache));
}

// ✅ Ottoman watchers
const ottomanAreasListeners = new Set<
  (data: import("@/lib/storage/dexie").OttomanAreaEntity[]) => void
>();
const ottomanTradePostsListeners = new Set<
  (data: import("@/lib/storage/dexie").OttomanTradePostEntity[]) => void
>();

let ottomanAreasCache: import("@/lib/storage/dexie").OttomanAreaEntity[] = [];
let ottomanTradePostsCache: import("@/lib/storage/dexie").OttomanTradePostEntity[] =
  [];
let ottomanCacheInitialized = false;

async function initOttomanCache() {
  if (ottomanCacheInitialized) return;
  [ottomanAreasCache, ottomanTradePostsCache] = await Promise.all([
    getOttomanAreas(),
    getOttomanTradePosts(),
  ]);
  ottomanCacheInitialized = true;
}

export function watchOttomanAreas(
  callback: (data: import("@/lib/storage/dexie").OttomanAreaEntity[]) => void,
) {
  ottomanAreasListeners.add(callback);
  initOttomanCache().then(() => callback(ottomanAreasCache));
  return () => ottomanAreasListeners.delete(callback);
}

export function watchOttomanTradePosts(
  callback: (
    data: import("@/lib/storage/dexie").OttomanTradePostEntity[],
  ) => void,
) {
  ottomanTradePostsListeners.add(callback);
  initOttomanCache().then(() => callback(ottomanTradePostsCache));
  return () => ottomanTradePostsListeners.delete(callback);
}
