// lib/overview/calculator.ts
import {
  loadSavedBuildings,
  watchSavedBuildings,
  SavedData,
  SavedBuilding,
} from "@/lib/overview/storage";
import {
  loadSavedTechnos,
  watchSavedTechnos,
  SavedTechnosData,
  SavedTechno,
} from "@/lib/overview/storage";

export interface ResourceTotals {
  main: Record<string, number>; // coins, food, rice, wu_zhu, etc.
  goods: Record<string, number>;
}

/**
 * Calcule les totaux à partir des données de bâtiments
 */
export function calculateBuildingTotals(data: SavedData): ResourceTotals {
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
 * Calcule les totaux à partir des données de technologies
 */
export function calculateTechnoTotals(data: SavedTechnosData): ResourceTotals {
  const totals: ResourceTotals = {
    main: {},
    goods: {},
  };

  // Parcourir toutes les ères et technologies
  Object.values(data.technos).forEach((eraTechnos) => {
    Object.values(eraTechnos).forEach((techno) => {
      Object.entries(techno.costs).forEach(([key, value]) => {
        if (key === "goods") {
          (value as { type: string; amount: number }[]).forEach((g) => {
            totals.goods[g.type] = (totals.goods[g.type] || 0) + g.amount;
          });
          return;
        }

        if (typeof value === "number") {
          totals.main[key] = (totals.main[key] || 0) + value;
        }
      });
    });
  });

  return totals;
}

/**
 * Calcule les totaux combinés (bâtiments + technologies)
 */
export function calculateCombinedTotals(
  buildingsData: SavedData,
  technosData: SavedTechnosData
): ResourceTotals {
  const buildingTotals = calculateBuildingTotals(buildingsData);
  const technoTotals = calculateTechnoTotals(technosData);

  // Combiner les deux totaux
  const combined: ResourceTotals = {
    main: {},
    goods: {},
  };

  // Combiner les ressources principales
  Object.entries(buildingTotals.main).forEach(([key, value]) => {
    combined.main[key] = value;
  });
  Object.entries(technoTotals.main).forEach(([key, value]) => {
    combined.main[key] = (combined.main[key] || 0) + value;
  });

  // Combiner les goods
  Object.entries(buildingTotals.goods).forEach(([key, value]) => {
    combined.goods[key] = value;
  });
  Object.entries(technoTotals.goods).forEach(([key, value]) => {
    combined.goods[key] = (combined.goods[key] || 0) + value;
  });

  return combined;
}

/**
 * Charge les données sauvegardées et calcule les totaux combinés (bâtiments + technologies)
 */
export async function getCalculatorTotals(): Promise<ResourceTotals> {
  const buildingsData = await loadSavedBuildings();
  const technosData = await loadSavedTechnos();
  return calculateCombinedTotals(buildingsData, technosData);
}

/**
 * Watch les changements dans le storage et appelle le callback avec les nouveaux totaux combinés
 */
export function watchCalculatorTotals(
  callback: (totals: ResourceTotals) => void
) {
  let unwatchBuildings: (() => void) | undefined;
  let unwatchTechnos: (() => void) | undefined;

  // Fonction pour recalculer et notifier quand l'un des storages change
  const notify = async () => {
    const buildingsData = await loadSavedBuildings();
    const technosData = await loadSavedTechnos();
    const combinedTotals = calculateCombinedTotals(buildingsData, technosData);
    callback(combinedTotals);
  };

  // Watch les changements de bâtiments
  unwatchBuildings = watchSavedBuildings(() => {
    notify();
  });

  // Watch les changements de technologies
  unwatchTechnos = watchSavedTechnos(() => {
    notify();
  });

  // Retourner une fonction pour nettoyer les deux watches
  return () => {
    unwatchBuildings?.();
    unwatchTechnos?.();
  };
}
