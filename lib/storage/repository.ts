import { slugify } from "@/lib/utils";
import {
  db,
  BuildingEntity,
  TechnoEntity,
  OttomanAreaEntity,
  OttomanTradePostEntity,
} from "./dexie";

const now = () => Date.now();

// buildings
export const getBuildings = () => db.buildings.toArray();

export async function saveBuilding(
  building: Omit<BuildingEntity, "updatedAt">,
) {
  await db.buildings.put({
    ...building,
    hidden: false,
    updatedAt: now(),
  } as BuildingEntity);
}

export async function updateBuildingQuantity(id: string, newQuantity: number) {
  const b = await db.buildings.get(id);
  if (!b) return;

  b.quantity = Math.max(1, Math.min(b.maxQty ?? 40, newQuantity));
  b.updatedAt = now();

  await db.buildings.put(b);
}

export async function toggleBuildingHidden(id: string) {
  const b = await db.buildings.get(id);
  if (!b) return;

  b.hidden = !b.hidden;
  b.updatedAt = now();

  await db.buildings.put(b);
}

export const removeBuilding = (id: string) => db.buildings.delete(id);

// technologies
export const getTechnos = () => db.technos.toArray();

export async function saveTechno(techno: Omit<TechnoEntity, "updatedAt">) {
  await db.technos.put({
    ...techno,
    hidden: false,
    updatedAt: now(),
  } as TechnoEntity);
}

export async function toggleTechnoHidden(eraPath: string) {
  const technos = await db.technos
    .where("id")
    .startsWith(`techno_${eraPath}`)
    .toArray();
  if (technos.length === 0) return;

  const newHiddenState = !technos[0].hidden;
  const timestamp = now();

  await db.technos.bulkPut(
    technos.map((t) => ({
      ...t,
      hidden: newHiddenState,
      updatedAt: timestamp,
    })),
  );
}

export const removeTechno = (id: string) => db.technos.delete(id);
export const removeAllTechnos = () => db.technos.clear();

// era-specific operations
export async function getTechnosByEra(eraPrefix: string) {
  return db.technos.where("id").startsWith(`techno_${eraPrefix}`).toArray();
}

export async function removeTechnosByEra(eraPrefix: string) {
  const toDelete = await getTechnosByEra(eraPrefix);
  await db.technos.bulkDelete(toDelete.map((t) => t.id));
}

// batch operations
export async function saveBatch<
  T extends { updatedAt?: number; hidden?: boolean },
>(table: keyof typeof db, items: Omit<T, "updatedAt" | "hidden">[]) {
  const timestamp = now();
  await (db[table] as any).bulkPut(
    items.map((item) => ({ ...item, hidden: false, updatedAt: timestamp })),
  );

  return (db[table] as any).toArray();
}

// Helper pour normaliser les costs (goods uniquement)
function normalizeCosts(
  costs: BuildingEntity["costs"] | TechnoEntity["costs"],
) {
  const normalized = { ...costs };

  if (Array.isArray(normalized.goods)) {
    normalized.goods = normalized.goods.map((g) => ({
      type: slugify(g.type),
      amount: g.amount,
    }));
  }

  return normalized;
}

// export preset db only
export async function exportPresetsJSON() {
  try {
    const buildings = await db.buildings.toArray();
    const technos = await db.technos.toArray();
    const ottomanAreas = await db.ottomanAreas.toArray();
    const ottomanTradePosts = await db.ottomanTradePosts.toArray();

    const cleanBuildings = buildings.map(({ id, quantity, maxQty, costs }) => ({
      id,
      quantity,
      maxQty,
      costs: normalizeCosts(costs),
    }));

    const cleanTechnos = technos.map(({ id, costs }) => ({
      id,
      costs: normalizeCosts(costs),
    }));

    const cleanOttomanAreas = ottomanAreas.map(({ id, areaIndex, costs }) => ({
      id,
      areaIndex,
      costs: normalizeCosts(costs),
    }));

    const cleanOttomanTradePosts = ottomanTradePosts.map(
      ({ id, name, area, resource, levels, costs, sourceData }) => ({
        id,
        name,
        area,
        resource,
        levels,
        costs: normalizeCosts(costs),
        sourceData
      }),
    );

    const json = {
      buildings: cleanBuildings,
      technos: cleanTechnos,
      ottomanAreas: cleanOttomanAreas,
      ottomanTradePosts: cleanOttomanTradePosts,
    };

    const blob = new Blob([JSON.stringify(json, null, 2)], {
      type: "application/json",
    });

    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);

    const timestamp = new Date().toISOString().slice(0, 10);
    a.download = `preset_${timestamp}.json`;

    a.click();

    URL.revokeObjectURL(a.href);

    console.log(
      `✅ Exported ${cleanBuildings.length} buildings, ${cleanTechnos.length} technos, ${cleanOttomanAreas.length} areas, ${cleanOttomanTradePosts.length} trade posts`,
    );
  } catch (error) {
    console.error("Export presets failed:", error);
    throw error;
  }
}

// ==================== ✅ OTTOMAN AREAS ====================
export const getOttomanAreas = () => db.ottomanAreas.toArray();

export async function saveOttomanArea(
  area: Omit<OttomanAreaEntity, "updatedAt">,
) {
  await db.ottomanAreas.put({
    ...area,
    hidden: false,
    updatedAt: now(),
  } as OttomanAreaEntity);
}

export async function toggleOttomanAreaHidden(id: string) {
  const area = await db.ottomanAreas.get(id);
  if (!area) return;

  area.hidden = !area.hidden;
  area.updatedAt = now();

  await db.ottomanAreas.put(area);
}

export const removeOttomanArea = (id: string) => db.ottomanAreas.delete(id);
export const removeAllOttomanAreas = () => db.ottomanAreas.clear();

export async function hideAllOttomanAreas() {
  const areas = await db.ottomanAreas.toArray();
  const timestamp = now();

  await db.ottomanAreas.bulkPut(
    areas.map((a) => ({
      ...a,
      hidden: true,
      updatedAt: timestamp,
    })),
  );
}

export async function showAllOttomanAreas() {
  const areas = await db.ottomanAreas.toArray();
  const timestamp = now();

  await db.ottomanAreas.bulkPut(
    areas.map((a) => ({
      ...a,
      hidden: false,
      updatedAt: timestamp,
    })),
  );
}

// ==================== ✅ OTTOMAN TRADE POSTS ====================
export const getOttomanTradePosts = () => db.ottomanTradePosts.toArray();

export async function saveOttomanTradePost(
  tradePost: Omit<OttomanTradePostEntity, "updatedAt">,
) {
  await db.ottomanTradePosts.put({
    ...tradePost,
    hidden: false,
    updatedAt: now(),
  } as OttomanTradePostEntity);
}

export async function toggleOttomanTradePostHidden(id: string) {
  const tradePost = await db.ottomanTradePosts.get(id);
  if (!tradePost) return;

  tradePost.hidden = !tradePost.hidden;
  tradePost.updatedAt = now();

  await db.ottomanTradePosts.put(tradePost);
}

// ✅ CRITICAL FIX: Recalculate costs when toggling level
export async function toggleOttomanTradePostLevel(
  id: string,
  level: keyof OttomanTradePostEntity["levels"],
) {
  const tradePost = await db.ottomanTradePosts.get(id);
  if (!tradePost) return;

  // Toggle the level
  tradePost.levels[level] = !tradePost.levels[level];

  // ✅ Recalculer les coûts en fonction des niveaux actifs
  if (tradePost.sourceData) {
    const recalculatedCosts = calculateTradePostCosts(
      tradePost.sourceData,
      tradePost.levels,
    );
    tradePost.costs = recalculatedCosts;
  }

  tradePost.updatedAt = now();

  await db.ottomanTradePosts.put(tradePost);
}

// ✅ Helper function to recalculate costs (moved from ottoman-parser)
function calculateTradePostCosts(
  tradePostData: any,
  enabledLevels: OttomanTradePostEntity["levels"],
): OttomanTradePostEntity["costs"] {
  const costs: OttomanTradePostEntity["costs"] = { goods: [], aspers: 0 };
  const goodsMap = new Map<string, number>();

  const ottomanGoods = [
    "wheat",
    "pomegranate",
    "confection",
    "syrup",
    "mohair",
    "apricot",
    "tea",
    "brocade",
  ];

  const levelMapping: Record<keyof OttomanTradePostEntity["levels"], number> = {
    unlock: 1,
    lvl2: 2,
    lvl3: 3,
    lvl4: 4,
    lvl5: 5,
  };

  Object.entries(enabledLevels).forEach(([levelKey, isEnabled]) => {
    if (!isEnabled) return;

    const levelNum =
      levelMapping[levelKey as keyof OttomanTradePostEntity["levels"]];
    const levelData = tradePostData.levels?.[levelNum];

    if (!levelData || !Array.isArray(levelData)) return;

    levelData.forEach((item: any) => {
      const resource = item.resource.toLowerCase();
      const amount = item.amount;

      let normalizedResource = resource;
      if (resource.includes("_eg") || resource.includes("lategothicera")) {
        normalizedResource = slugify(resource);
      }

      if (
        ottomanGoods.includes(resource) ||
        normalizedResource.match(/^(primary|secondary|tertiary)_/i)
      ) {
        const normalized = slugify(resource);
        goodsMap.set(normalized, (goodsMap.get(normalized) || 0) + amount);
      } else {
        costs[resource] = ((costs[resource] as number) || 0) + amount;
      }
    });
  });

  costs.goods = Array.from(goodsMap.entries()).map(([type, amount]) => ({
    type,
    amount,
  }));

  return costs;
}

export const removeOttomanTradePost = (id: string) =>
  db.ottomanTradePosts.delete(id);
export const removeAllOttomanTradePosts = () => db.ottomanTradePosts.clear();

export async function hideAllOttomanTradePosts() {
  const tradePosts = await db.ottomanTradePosts.toArray();
  const timestamp = now();

  await db.ottomanTradePosts.bulkPut(
    tradePosts.map((t) => ({
      ...t,
      hidden: true,
      updatedAt: timestamp,
    })),
  );
}

export async function showAllOttomanTradePosts() {
  const tradePosts = await db.ottomanTradePosts.toArray();
  const timestamp = now();

  await db.ottomanTradePosts.bulkPut(
    tradePosts.map((t) => ({
      ...t,
      hidden: false,
      updatedAt: timestamp,
    })),
  );
}
