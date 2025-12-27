// lib/overview/calculator.ts
import { loadSavedBuildings, watchSavedBuildings, SavedData, SavedBuilding } from "@/lib/overview/storage";

export interface ResourceTotals {
  main: Record<string, number>; // coins, food, rice, wu_zhu, etc.
  goods: Record<string, number>;
}


/**
 * Calcule les totaux à partir d'un SavedData
 */
export function calculateTotals(data: SavedData): ResourceTotals {
  const totals: ResourceTotals = {
    main: {},
    goods: {},
  };

  data.buildings.forEach((b) => {
    const qty = b.quantity;

    Object.entries(b.costs).forEach(([key, value]) => {
      if (key === "goods") {
        (value as { type: string; amount: number }[]).forEach((g) => {
          totals.goods[g.type] = (totals.goods[g.type] || 0) + g.amount * qty;
        });
        return;
      }

      if (typeof value === "number") {
        totals.main[key] = (totals.main[key] || 0) + value * qty;
      }
    });
  });

  return totals;
}


/**
 * Charge les données sauvegardées et calcule les totaux
 */
export async function getCalculatorTotals(): Promise<ResourceTotals> {
  const data = await loadSavedBuildings();
  return calculateTotals(data);
}

/**
 * Watch les changements dans le storage et appelle le callback avec les nouveaux totaux
 */
export function watchCalculatorTotals(callback: (totals: ResourceTotals) => void) {
  return watchSavedBuildings((newData: SavedData) => {
    const totals = calculateTotals(newData);
    callback(totals);
  });
}
