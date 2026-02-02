import {
  getBuildings,
  getTechnos,
  getOttomanAreas,
  getOttomanTradePosts,
  watchBuildings,
  watchTechnos,
  watchOttomanAreas,
  watchOttomanTradePosts,
  getBuildingSelections,
  watchBuildingSelections,
} from "@/lib/overview/storage";
import {
  getUserResources,
  normalizeResourceKey,
} from "@/lib/roc/user-resources";
import { getGoodNameFromPriorityEra } from "@/lib/utils";
import type {
  BuildingEntity,
  TechnoEntity,
  OttomanAreaEntity,
  OttomanTradePostEntity,
} from "@/lib/storage/dexie";

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

// ✅ AJOUT: Mapping des main resources
const RESOURCE_MAPPING: Record<string, string> = {
  research_points: "research_points",
  coins: "coins",
  food: "food",
  gems: "gems",
};

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
    const [
      buildings,
      technos,
      ottomanAreas,
      ottomanTradePosts,
      userSelections,
    ] = await Promise.all([
      getBuildings(),
      getTechnos(),
      getOttomanAreas(),
      getOttomanTradePosts(),
      getBuildingSelections(),
    ]);

    // Vérifications de sécurité
    const safeBuildings = Array.isArray(buildings) ? buildings : [];
    const safeTechnos = Array.isArray(technos) ? technos : [];
    const safeOttomanAreas = Array.isArray(ottomanAreas) ? ottomanAreas : [];
    const safeOttomanTradePosts = Array.isArray(ottomanTradePosts)
      ? ottomanTradePosts
      : [];
    const safeSelections = Array.isArray(userSelections) ? userSelections : [];

    const visibleBuildings = safeBuildings.filter(
      (b: BuildingEntity) => !b.hidden,
    );
    const visibleTechnos = safeTechnos.filter((t: TechnoEntity) => !t.hidden);
    const visibleOttomanAreas = safeOttomanAreas.filter(
      (a: OttomanAreaEntity) => !a.hidden,
    );
    const visibleOttomanTradePosts = safeOttomanTradePosts.filter(
      (tp: OttomanTradePostEntity) => !tp.hidden,
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

    const ottomanAreaTotals = visibleOttomanAreas.reduce(
      (acc: ResourceTotals, a: OttomanAreaEntity) =>
        mergeTotals(acc, sumResources(a.costs)),
      { main: {}, goods: {} } as ResourceTotals,
    );

    const ottomanTradePostTotals = visibleOttomanTradePosts.reduce(
      (acc: ResourceTotals, tp: OttomanTradePostEntity) =>
        mergeTotals(acc, sumResources(tp.costs)),
      { main: {}, goods: {} } as ResourceTotals,
    );

    // ✅ Fusionner tous les totaux (buildings + technos + ottoman)
    let totals = mergeTotals(buildingTotals, technoTotals);
    totals = mergeTotals(totals, ottomanAreaTotals);
    totals = mergeTotals(totals, ottomanTradePostTotals);

    if (!compareMode) return { ...totals, isCompareMode: false };

    // ========================================
    // COMPARE MODE: NOUVELLE LOGIQUE CORRIGÉE
    // ========================================
    const userResources = await getUserResources();
    const differences = {
      main: {} as Record<string, number>,
      goods: {} as Record<string, number>,
    };

    // ========================================
    // ÉTAPE 1 : Calculer les différences pour les ressources AVEC besoins
    // ========================================

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

    // Goods avec besoins
    Object.entries(totals.goods).forEach(([key, needed]) => {
      try {
        const apiKey = normalizeResourceKey(key, safeSelections);
        differences.goods[key] = (userResources[apiKey] || 0) - needed;
      } catch (error) {
        console.warn(`Error normalizing key ${key}:`, error);
        differences.goods[key] = 0 - needed;
      }
    });

    // ========================================
    // ÉTAPE 2 : Ajouter TOUS les goods du user (même sans besoins)
    // ========================================

    // Créer un Set des clés déjà traitées pour éviter les doublons
    const processedGoodsKeys = new Set(
      Object.keys(differences.goods).map((k) => k.toLowerCase()),
    );

    // Parcourir TOUTES les ressources du user
    Object.entries(userResources).forEach(([userKey, userAmount]) => {
      // Ignorer les main resources (coins, food, gems, etc.)
      if (RESOURCE_MAPPING[userKey]) return;

      // Ignorer les allied city resources (deben, wu_zhu, rice, etc.)
      if (ALLIED_CURRENCIES.has(userKey)) return;

      // Essayer de trouver la clé correspondante dans totals.goods
      let matchingKey: string | null = null;

      // Cas 1 : Le userKey est directement un nom de good (bronze_bracelet, wool, etc.)
      // Chercher si ce good correspond à un priority good
      for (const [totalKey] of Object.entries(totals.goods)) {
        const match = totalKey.match(
          /^(primary|secondary|tertiary)_([a-z]{2})$/i,
        );
        if (match) {
          const [, priority, era] = match;
          const goodName = getGoodNameFromPriorityEra(
            priority,
            era,
            safeSelections,
          );
          if (goodName && goodName === userKey) {
            matchingKey = totalKey;
            break;
          }
        }
      }

      // Cas 2 : Le userKey est déjà un priority good format (primary_cg, etc.)
      if (!matchingKey) {
        const normalizedUserKey = userKey.toLowerCase();
        matchingKey =
          Object.keys(totals.goods).find(
            (k) => k.toLowerCase() === normalizedUserKey,
          ) || null;
      }

      // Si on a trouvé une correspondance et qu'elle n'a pas déjà été traitée, l'ajouter
      if (matchingKey && !processedGoodsKeys.has(matchingKey.toLowerCase())) {
        differences.goods[matchingKey] =
          userAmount - (totals.goods[matchingKey] || 0);
        processedGoodsKeys.add(matchingKey.toLowerCase());
      }
      // Sinon, ajouter comme nouveau good (user a ce good mais pas de besoin)
      else if (!matchingKey) {
        // Vérifier que ce n'est pas déjà traité sous une autre forme
        const alreadyProcessed = Array.from(processedGoodsKeys).some(
          (processedKey) => {
            // Comparer avec normalizeResourceKey pour voir si c'est le même good
            try {
              const normalized = normalizeResourceKey(
                processedKey,
                safeSelections,
              );
              return normalized === userKey;
            } catch {
              return false;
            }
          },
        );

        if (!alreadyProcessed && userAmount > 0) {
          differences.goods[userKey] = userAmount; // needed = 0, donc difference = userAmount
        }
      }
    });

    // ========================================
    // ÉTAPE 3 : S'assurer que tous les priority goods existent (même à 0)
    // ========================================

    const PRIORITIES = ["primary", "secondary", "tertiary"] as const;
    const erasWithNeeds = new Set<string>();

    Object.keys(totals.goods).forEach((key) => {
      const match = key.match(/^(primary|secondary|tertiary)_([a-z]{2})$/i);
      if (match) {
        erasWithNeeds.add(match[2].toLowerCase());
      }
    });

    erasWithNeeds.forEach((eraAbbr) => {
      PRIORITIES.forEach((priority) => {
        const key = `${priority}_${eraAbbr}`;
        const keyLower = key.toLowerCase();

        // Vérifier si déjà présent (case-insensitive)
        const alreadyExists = Object.keys(differences.goods).some(
          (k) => k.toLowerCase() === keyLower,
        );

        if (!alreadyExists) {
          try {
            const apiKey = normalizeResourceKey(key, safeSelections);
            const userAmount = userResources[apiKey] || 0;
            differences.goods[key] = userAmount; // needed = 0 car pas dans totals.goods
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
  let ottomanAreasCache: OttomanAreaEntity[] = [];
  let ottomanTradePostsCache: OttomanTradePostEntity[] = [];
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
      const visibleOttomanAreas = ottomanAreasCache.filter(
        (a: OttomanAreaEntity) => !a.hidden,
      );
      const visibleOttomanTradePosts = ottomanTradePostsCache.filter(
        (tp: OttomanTradePostEntity) => !tp.hidden,
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

      const ottomanAreaTotals = visibleOttomanAreas.reduce(
        (acc: ResourceTotals, a: OttomanAreaEntity) =>
          mergeTotals(acc, sumResources(a.costs)),
        { main: {}, goods: {} } as ResourceTotals,
      );

      const ottomanTradePostTotals = visibleOttomanTradePosts.reduce(
        (acc: ResourceTotals, tp: OttomanTradePostEntity) =>
          mergeTotals(acc, sumResources(tp.costs)),
        { main: {}, goods: {} } as ResourceTotals,
      );

      // ✅ Fusionner tous les totaux
      let totals = mergeTotals(buildingTotals, technoTotals);
      totals = mergeTotals(totals, ottomanAreaTotals);
      totals = mergeTotals(totals, ottomanTradePostTotals);

      if (!compareMode) {
        callback({ ...totals, isCompareMode: false });
        return;
      }

      // compare mode - utiliser la même logique que getCalculatorTotals
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

      // Ajouter TOUS les goods du user
      const processedGoodsKeys = new Set(
        Object.keys(differences.goods).map((k) => k.toLowerCase()),
      );

      Object.entries(userResources).forEach(([userKey, userAmount]) => {
        if (RESOURCE_MAPPING[userKey]) return;
        if (ALLIED_CURRENCIES.has(userKey)) return;

        let matchingKey: string | null = null;

        for (const [totalKey] of Object.entries(totals.goods)) {
          const match = totalKey.match(
            /^(primary|secondary|tertiary)_([a-z]{2})$/i,
          );
          if (match) {
            const [, priority, era] = match;
            const goodName = getGoodNameFromPriorityEra(
              priority,
              era,
              selectionsCache,
            );
            if (goodName && goodName === userKey) {
              matchingKey = totalKey;
              break;
            }
          }
        }

        if (!matchingKey) {
          const normalizedUserKey = userKey.toLowerCase();
          matchingKey =
            Object.keys(totals.goods).find(
              (k) => k.toLowerCase() === normalizedUserKey,
            ) || null;
        }

        if (matchingKey && !processedGoodsKeys.has(matchingKey.toLowerCase())) {
          differences.goods[matchingKey] =
            userAmount - (totals.goods[matchingKey] || 0);
          processedGoodsKeys.add(matchingKey.toLowerCase());
        } else if (!matchingKey) {
          const alreadyProcessed = Array.from(processedGoodsKeys).some(
            (processedKey) => {
              try {
                const normalized = normalizeResourceKey(
                  processedKey,
                  selectionsCache,
                );
                return normalized === userKey;
              } catch {
                return false;
              }
            },
          );

          if (!alreadyProcessed && userAmount > 0) {
            differences.goods[userKey] = userAmount;
          }
        }
      });

      const PRIORITIES = ["primary", "secondary", "tertiary"] as const;
      const erasWithNeeds = new Set<string>();

      Object.keys(totals.goods).forEach((key) => {
        const match = key.match(/^(primary|secondary|tertiary)_([a-z]{2})$/i);
        if (match) {
          erasWithNeeds.add(match[2].toLowerCase());
        }
      });

      erasWithNeeds.forEach((eraAbbr) => {
        PRIORITIES.forEach((priority) => {
          const key = `${priority}_${eraAbbr}`;
          const keyLower = key.toLowerCase();

          const alreadyExists = Object.keys(differences.goods).some(
            (k) => k.toLowerCase() === keyLower,
          );

          if (!alreadyExists) {
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

  const unwatchOttomanAreas = watchOttomanAreas((data) => {
    ottomanAreasCache = Array.isArray(data) ? data : [];
    isInitialized = true;
    recalculate();
  });

  const unwatchOttomanTradePosts = watchOttomanTradePosts((data) => {
    ottomanTradePostsCache = Array.isArray(data) ? data : [];
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
    unwatchOttomanAreas();
    unwatchOttomanTradePosts();
    unwatchSelections();
  };
}
