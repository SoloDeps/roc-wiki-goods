import { normalizeGoodName } from "@/lib/utils";
import { db, BuildingEntity, TechnoEntity } from "./dexie";

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

  // simplified clamping
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

// ✅ Helper pour normaliser les costs (goods uniquement)
function normalizeCosts(
  costs: BuildingEntity["costs"] | TechnoEntity["costs"],
) {
  const normalized = { ...costs };

  // Normaliser les goods
  if (Array.isArray(normalized.goods)) {
    normalized.goods = normalized.goods.map((g) => ({
      type: normalizeGoodName(g.type),
      amount: g.amount,
    }));
  }

  return normalized;
}

// export preset db only
export async function exportPresetsJSON() {
  try {
    // Récupérer les tables
    const buildings = await db.buildings.toArray();
    const technos = await db.technos.toArray();

    // ✅ Transformer ET normaliser les goods
    const cleanBuildings = buildings.map(({ id, quantity, maxQty, costs }) => ({
      id,
      quantity,
      maxQty,
      costs: normalizeCosts(costs), // ✅ Normalisation des goods
    }));

    const cleanTechnos = technos.map(({ id, costs }) => ({
      id,
      costs: normalizeCosts(costs), // ✅ Normalisation des goods
    }));

    const json = {
      buildings: cleanBuildings,
      technos: cleanTechnos,
    };

    // Convertir en blob et télécharger
    const blob = new Blob([JSON.stringify(json, null, 2)], {
      type: "application/json",
    });

    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);

    // ✅ Nom de fichier avec timestamp pour éviter les écrasements
    const timestamp = new Date().toISOString().slice(0, 10);
    a.download = `preset_${timestamp}.json`;

    a.click();

    URL.revokeObjectURL(a.href);

    console.log(
      `✅ Exported ${cleanBuildings.length} buildings and ${cleanTechnos.length} technos with normalized goods`,
    );
  } catch (error) {
    console.error("Export presets failed:", error);
    throw error;
  }
}
