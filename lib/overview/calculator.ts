import {
  getBuildings,
  getTechnos,
  watchBuildings,
  watchTechnos,
  getBuildingSelections,
  watchBuildingSelections,
} from "@/lib/overview/storage";
import {
  getUserResources,
  normalizeResourceKey,
} from "@/lib/roc/user-resources";
import type { BuildingEntity, TechnoEntity } from "@/lib/storage/dexie";

export interface ResourceTotals {
  main: Record<string, number>;
  goods: Record<string, number>;
}

export interface ComparedTotals extends ResourceTotals {
  isCompareMode: boolean;
  differences?: {
    main: Record<string, number>;
    goods: Record<string, number>;
  };
}

// Liste des ressources monétaires des allied cities à déplacer vers goods
const ALLIED_CURRENCIES = new Set([
  "deben",
  "wu_zhu",
  "rice",
  "cocoa",
  "pennies",
  "dirham",
  "aspers",
]);

function sumResources(costs: any, multiplier: number = 1): ResourceTotals {
  const totals: ResourceTotals = { main: {}, goods: {} };

  // Vérification de sécurité
  if (!costs || typeof costs !== "object") {
    return totals;
  }

  Object.entries(costs).forEach(([key, value]) => {
    if (key === "goods" && Array.isArray(value)) {
      value.forEach((g) => {
        if (g && g.type && typeof g.amount === "number") {
          // ✅ Les goods sont déjà normalisés à la source (storage.ts et techno.ts)
          totals.goods[g.type] =
            (totals.goods[g.type] || 0) + g.amount * multiplier;
        }
      });
    } else if (typeof value === "number") {
      // ✅ Déplacer les monnaies alliées vers goods pour regroupement par civilisation
      if (ALLIED_CURRENCIES.has(key)) {
        totals.goods[key] = (totals.goods[key] || 0) + value * multiplier;
      } else {
        totals.main[key] = (totals.main[key] || 0) + value * multiplier;
      }
    }
  });

  return totals;
}

function mergeTotals(a: ResourceTotals, b: ResourceTotals): ResourceTotals {
  const merged: ResourceTotals = { main: { ...a.main }, goods: { ...a.goods } };

  Object.entries(b.main).forEach(([k, v]) => {
    merged.main[k] = (merged.main[k] || 0) + v;
  });

  Object.entries(b.goods).forEach(([k, v]) => {
    merged.goods[k] = (merged.goods[k] || 0) + v;
  });

  return merged;
}

export async function getCalculatorTotals(
  compareMode = false,
): Promise<ComparedTotals> {
  try {
    const [buildings, technos, userSelections] = await Promise.all([
      getBuildings(),
      getTechnos(),
      getBuildingSelections(),
    ]);

    // Vérifications de sécurité
    const safeBuildings = Array.isArray(buildings) ? buildings : [];
    const safeTechnos = Array.isArray(technos) ? technos : [];
    const safeSelections = Array.isArray(userSelections) ? userSelections : [];

    const visibleBuildings = safeBuildings.filter(
      (b: BuildingEntity) => !b.hidden,
    );
    const visibleTechnos = safeTechnos.filter((t: TechnoEntity) => !t.hidden);

    const buildingTotals = visibleBuildings.reduce(
      (acc: ResourceTotals, b: BuildingEntity) =>
        mergeTotals(acc, sumResources(b.costs, b.quantity || 1)),
      { main: {}, goods: {} } as ResourceTotals,
    );

    const technoTotals = visibleTechnos.reduce(
      (acc: ResourceTotals, t: TechnoEntity) =>
        mergeTotals(acc, sumResources(t.costs)),
      { main: {}, goods: {} } as ResourceTotals,
    );

    const totals = mergeTotals(buildingTotals, technoTotals);

    if (!compareMode) return { ...totals, isCompareMode: false };

    // compare mode: calculate differences
    const userResources = await getUserResources();
    const differences = {
      main: {} as Record<string, number>,
      goods: {} as Record<string, number>,
    };

    // Main resources
    Object.entries(totals.main).forEach(([key, needed]) => {
      try {
        const apiKey = normalizeResourceKey(key, safeSelections);
        differences.main[key] = (userResources[apiKey] || 0) - needed;
      } catch (error) {
        console.warn(`Error normalizing key ${key}:`, error);
        differences.main[key] = 0 - needed;
      }
    });

    // Goods
    Object.entries(totals.goods).forEach(([key, needed]) => {
      try {
        const apiKey = normalizeResourceKey(key, safeSelections);
        differences.goods[key] = (userResources[apiKey] || 0) - needed;
      } catch (error) {
        console.warn(`Error normalizing key ${key}:`, error);
        differences.goods[key] = 0 - needed;
      }
    });

    // Identifier les ères qui ont des besoins
    const PRIORITIES = ["primary", "secondary", "tertiary"] as const;
    const erasWithNeeds = new Set<string>();

    Object.keys(totals.goods).forEach((key) => {
      // ✅ Accepter les deux formats: primary_cg ou Primary_CG
      const match = key.match(/^(primary|secondary|tertiary)_([a-z]{2})$/i);
      if (match) {
        erasWithNeeds.add(match[2].toLowerCase());
      }
    });

    // Ajouter SEULEMENT les Priority goods des ères qui ont des besoins
    erasWithNeeds.forEach((eraAbbr) => {
      PRIORITIES.forEach((priority) => {
        // ✅ Clés en minuscules pour cohérence
        const key = `${priority}_${eraAbbr}`;

        if (!(key in differences.goods)) {
          try {
            const apiKey = normalizeResourceKey(key, safeSelections);
            const userAmount = userResources[apiKey] || 0;
            differences.goods[key] = userAmount;
          } catch (error) {
            console.warn(`Error adding missing key ${key}:`, error);
            differences.goods[key] = 0;
          }
        }
      });
    });

    return { ...totals, isCompareMode: true, differences };
  } catch (error) {
    console.error("Error in getCalculatorTotals:", error);
    return {
      main: {},
      goods: {},
      isCompareMode: compareMode,
      differences: compareMode ? { main: {}, goods: {} } : undefined,
    };
  }
}

export function watchCalculatorTotals(
  callback: (totals: ComparedTotals) => void,
  compareMode = false,
) {
  let buildingsCache: BuildingEntity[] = [];
  let technosCache: TechnoEntity[] = [];
  let selectionsCache: string[][] = [];
  let isInitialized = false;

  const recalculate = async () => {
    if (!isInitialized) return;

    try {
      const visibleBuildings = buildingsCache.filter(
        (b: BuildingEntity) => !b.hidden,
      );
      const visibleTechnos = technosCache.filter(
        (t: TechnoEntity) => !t.hidden,
      );

      const buildingTotals = visibleBuildings.reduce(
        (acc: ResourceTotals, b: BuildingEntity) =>
          mergeTotals(acc, sumResources(b.costs, b.quantity || 1)),
        { main: {}, goods: {} } as ResourceTotals,
      );

      const technoTotals = visibleTechnos.reduce(
        (acc: ResourceTotals, t: TechnoEntity) =>
          mergeTotals(acc, sumResources(t.costs)),
        { main: {}, goods: {} } as ResourceTotals,
      );

      const totals = mergeTotals(buildingTotals, technoTotals);

      if (!compareMode) {
        callback({ ...totals, isCompareMode: false });
        return;
      }

      // compare mode
      const userResources = await getUserResources();
      const differences = {
        main: {} as Record<string, number>,
        goods: {} as Record<string, number>,
      };

      Object.entries(totals.main).forEach(([key, needed]) => {
        try {
          const apiKey = normalizeResourceKey(key, selectionsCache);
          differences.main[key] = (userResources[apiKey] || 0) - needed;
        } catch (error) {
          console.warn(`Error normalizing key ${key}:`, error);
          differences.main[key] = 0 - needed;
        }
      });

      Object.entries(totals.goods).forEach(([key, needed]) => {
        try {
          const apiKey = normalizeResourceKey(key, selectionsCache);
          differences.goods[key] = (userResources[apiKey] || 0) - needed;
        } catch (error) {
          console.warn(`Error normalizing key ${key}:`, error);
          differences.goods[key] = 0 - needed;
        }
      });

      const PRIORITIES = ["primary", "secondary", "tertiary"] as const;
      const erasWithNeeds = new Set<string>();

      Object.keys(totals.goods).forEach((key) => {
        // ✅ Accepter les deux formats: primary_cg ou Primary_CG
        const match = key.match(/^(primary|secondary|tertiary)_([a-z]{2})$/i);
        if (match) {
          erasWithNeeds.add(match[2].toLowerCase());
        }
      });

      erasWithNeeds.forEach((eraAbbr) => {
        PRIORITIES.forEach((priority) => {
          // ✅ Clés en minuscules pour cohérence
          const key = `${priority}_${eraAbbr}`;

          if (!(key in differences.goods)) {
            try {
              const apiKey = normalizeResourceKey(key, selectionsCache);
              const userAmount = userResources[apiKey] || 0;
              differences.goods[key] = userAmount;
            } catch (error) {
              console.warn(`Error adding missing key ${key}:`, error);
              differences.goods[key] = 0;
            }
          }
        });
      });

      callback({ ...totals, isCompareMode: true, differences });
    } catch (error) {
      console.error("Error in recalculate:", error);
      callback({
        main: {},
        goods: {},
        isCompareMode: compareMode,
        differences: compareMode ? { main: {}, goods: {} } : undefined,
      });
    }
  };

  const unwatchBuildings = watchBuildings((data) => {
    buildingsCache = Array.isArray(data) ? data : [];
    isInitialized = true;
    recalculate();
  });

  const unwatchTechnos = watchTechnos((data) => {
    technosCache = Array.isArray(data) ? data : [];
    isInitialized = true;
    recalculate();
  });

  const unwatchSelections = watchBuildingSelections((data) => {
    selectionsCache = Array.isArray(data) ? data : [];
    isInitialized = true;
    recalculate();
  });

  return () => {
    unwatchBuildings();
    unwatchTechnos();
    unwatchSelections();
  };
}
