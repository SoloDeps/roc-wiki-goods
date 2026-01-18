import { db, BuildingEntity, TechnoEntity } from "./dexie";

const now = () => Date.now();

// buildings
export const getBuildings = () => db.buildings.toArray();

export async function saveBuilding(
  building: Omit<BuildingEntity, "updatedAt">,
) {
  await db.buildings.put({ ...building, hidden: false, updatedAt: now() } as BuildingEntity);
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
  await db.technos.put({ ...techno, hidden: false, updatedAt: now() } as TechnoEntity);
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

// batch operations
export async function saveBuildingsBatch(
  buildings: Omit<BuildingEntity, "updatedAt">[],
) {
  const timestamp = now();
  await db.buildings.bulkPut(
    buildings.map((b) => ({ ...b, hidden: false, updatedAt: timestamp }) as BuildingEntity),
  );
}

export async function saveTechnosBatch(
  technos: Omit<TechnoEntity, "updatedAt">[],
) {
  const timestamp = now();
  await db.technos.bulkPut(
    technos.map((t) => ({ ...t, hidden: false, updatedAt: timestamp }) as TechnoEntity),
  );
}

// era-specific operations
export async function getTechnosByEra(eraPrefix: string) {
  return db.technos.where("id").startsWith(`techno_${eraPrefix}`).toArray();
}

export async function removeTechnosByEra(eraPrefix: string) {
  const toDelete = await getTechnosByEra(eraPrefix);
  await db.technos.bulkDelete(toDelete.map((t) => t.id));
}
