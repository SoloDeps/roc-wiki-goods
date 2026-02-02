import { useEffect, useState, useMemo } from "react";
import {
  getCalculatorTotals,
  watchCalculatorTotals,
  type ComparedTotals,
} from "@/lib/overview/calculator";
import { useBuildingSelections } from "@/hooks/useBuildingSelections";
import {
  eras,
  goodsUrlByEra,
  goodsByCivilization,
  type EraAbbr,
  MAIN_RESOURCE_ORDER,
  PRIORITY_TYPES,
  makePriorityKey,
  isPriorityGoodKey,
  getExcludedItems,
  isAlliedCityResource,
} from "@/lib/constants";
import { getBuildingFromLocal, slugify, getItemIconLocal } from "@/lib/utils";
import { ResourceBlock } from "./resource-block";
import { Loader2Icon } from "lucide-react";
import { EmptyOutline } from "@/components/empty-card";
import { ScrollArea } from "@/components/ui/scroll-area";

interface TotalGoodsDisplayProps {
  compareMode?: boolean;
}

/**
 * Helper: Obtenir la valeur à afficher (différence en mode compare, amount sinon)
 */
function getDisplayAmount(
  originalAmount: number,
  type: string,
  compareMode: boolean,
  differences?: Record<string, number>,
): number {
  if (!compareMode || !differences) return originalAmount;
  return differences[type] ?? originalAmount;
}

/**
 * Helper: Obtenir la couleur de différence
 */
function getDifferenceColor(difference: number): string {
  return difference >= 0 ? "34, 197, 94" : "239, 68, 68";
}

export const TotalGoodsDisplay = ({
  compareMode = false,
}: TotalGoodsDisplayProps) => {
  const selections = useBuildingSelections();
  const [loading, setLoading] = useState(true);
  const [totals, setTotals] = useState<ComparedTotals>({
    main: {},
    goods: {},
    isCompareMode: false,
  });

  /**
   * Convertit un nom de good réel (ex: "bronze_bracelet", "wool")
   * en format priority (ex: "tertiary_ba", "primary_ba")
   * basé sur les sélections de l'utilisateur
   */
  const convertGoodToPriority = useMemo(() => {
    return (goodName: string): string | null => {
      if (!selections || selections.length === 0) return null;

      const normalizedGoodName = slugify(goodName);

      // Parcourir toutes les ères
      for (const era of eras) {
        const abbr = era.abbr as EraAbbr;
        const goodsForEra = goodsUrlByEra[abbr];

        if (!goodsForEra) continue;

        // Trouver dans quelle priority ce good se trouve pour cette ère
        const priorities: Array<"primary" | "secondary" | "tertiary"> = [
          "primary",
          "secondary",
          "tertiary",
        ];

        for (const priority of priorities) {
          const building = getBuildingFromLocal(priority, abbr, selections);
          if (!building) continue;

          const normalizedBuilding = slugify(building);
          const goodMeta = goodsForEra[normalizedBuilding];

          // Comparer les noms normalisés
          if (goodMeta && slugify(goodMeta.name) === normalizedGoodName) {
            // On a trouvé ! Ce good correspond à cette priority pour cette ère
            return makePriorityKey(priority, abbr);
          }
        }
      }

      return null; // Good non trouvé dans les priority goods
    };
  }, [selections]);

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        const result = await getCalculatorTotals(compareMode);
        if (mounted) {
          setTotals(result);
          setLoading(false);
        }
      } catch (error) {
        console.error("Error in getCalculatorTotals:", error);
        if (mounted) {
          setLoading(false);
        }
      }
    })();

    const unwatch = watchCalculatorTotals((result) => {
      if (mounted) {
        setTotals(result);
      }
    }, compareMode);

    return () => {
      mounted = false;
      unwatch();
    };
  }, [compareMode]);

  // ========================================
  // NORMALISATION DES GOODS (priority goods)
  // ========================================
  const normalizedPriorityGoods = useMemo(() => {
    const priorityMap = new Map<string, number>();

    if (!totals || !totals.goods) {
      return priorityMap;
    }

    // Traiter tous les goods et identifier les priority goods
    Object.entries(totals.goods).forEach(([type, amount]) => {
      const displayAmount = getDisplayAmount(
        amount,
        type,
        compareMode,
        totals.differences?.goods,
      );

      let finalKey: string | null = null;

      // Cas 1: C'est déjà un priority good (primary_cg, Secondary_BA, etc.)
      if (isPriorityGoodKey(type)) {
        finalKey = type.toLowerCase();
      }
      // Cas 2: C'est un nom de good réel (bronze_bracelet, alabaster_idol, wool, etc.)
      else {
        // Convertir le good réel en format priority selon les selections
        finalKey = convertGoodToPriority(type);
      }

      // Si on a trouvé une clé valide, l'ajouter/fusionner
      if (finalKey) {
        priorityMap.set(
          finalKey,
          (priorityMap.get(finalKey) ?? 0) + displayAmount,
        );
      }
    });

    // S'assurer que toutes les combinaisons era/priority existent (même à 0)
    eras.forEach((era) => {
      const abbr = era.abbr as EraAbbr;
      PRIORITY_TYPES.forEach((priority) => {
        const key = makePriorityKey(priority, abbr);
        if (!priorityMap.has(key)) {
          // Chercher la différence avec toutes les variantes possibles (case-insensitive)
          let diffValue = 0;
          if (compareMode && totals.differences?.goods) {
            const foundKey = Object.keys(totals.differences.goods).find(
              (k) => k.toLowerCase() === key,
            );
            if (foundKey) {
              diffValue = totals.differences.goods[foundKey] ?? 0;
            }
          }
          priorityMap.set(key, diffValue);
        }
      });
    });

    return priorityMap;
  }, [totals, compareMode, convertGoodToPriority]);

  // ========================================
  // AUTRES GOODS (non-priority)
  // ========================================
  const otherGoods = useMemo(() => {
    const otherMap = new Map<string, number>();

    if (!totals || !totals.goods) {
      return otherMap;
    }

    Object.entries(totals.goods).forEach(([type, amount]) => {
      // Ignorer les priority goods (déjà traités)
      if (isPriorityGoodKey(type)) return;

      // Vérifier si ce good a été converti en priority good
      const convertedKey = convertGoodToPriority(type);
      if (convertedKey) return; // Déjà traité dans normalizedPriorityGoods

      const displayAmount = getDisplayAmount(
        amount,
        type,
        compareMode,
        totals.differences?.goods,
      );
      otherMap.set(type, (otherMap.get(type) ?? 0) + displayAmount);
    });

    return otherMap;
  }, [totals, compareMode, convertGoodToPriority]);

  // ========================================
  // ERA BLOCKS (primary/secondary/tertiary par ère)
  // ========================================
  const eraBlocks = useMemo(() => {
    // Vérification de sécurité : attendre que selections soit chargé
    if (!selections || selections.length === 0) {
      return [];
    }

    return eras.map((era) => {
      const abbr = era.abbr as EraAbbr;

      // Récupérer les montants pour chaque priorité
      const amounts = {
        primary:
          normalizedPriorityGoods.get(makePriorityKey("primary", abbr)) ?? 0,
        secondary:
          normalizedPriorityGoods.get(makePriorityKey("secondary", abbr)) ?? 0,
        tertiary:
          normalizedPriorityGoods.get(makePriorityKey("tertiary", abbr)) ?? 0,
      };

      // Récupérer les métadonnées des goods
      const getGoodMeta = (priority: string) => {
        const building = getBuildingFromLocal(priority, abbr, selections);
        if (!building) return undefined;
        const normalized = slugify(building);
        return goodsUrlByEra[abbr]?.[normalized];
      };

      const primaryMeta = getGoodMeta("primary");
      const secondaryMeta = getGoodMeta("secondary");
      const tertiaryMeta = getGoodMeta("tertiary");

      return {
        title: era.name,
        resources: [
          {
            icon: primaryMeta?.name
              ? `/goods/${slugify(primaryMeta.name)}.webp`
              : "/goods/default.webp",
            name: primaryMeta?.name ?? "Primary",
            amount: amounts.primary,
            difference: amounts.primary,
          },
          {
            icon: secondaryMeta?.name
              ? `/goods/${slugify(secondaryMeta.name)}.webp`
              : "/goods/default.webp",
            name: secondaryMeta?.name ?? "Secondary",
            amount: amounts.secondary,
            difference: amounts.secondary,
          },
          {
            icon: tertiaryMeta?.name
              ? `/goods/${slugify(tertiaryMeta.name)}.webp`
              : "/goods/default.webp",
            name: tertiaryMeta?.name ?? "Tertiary",
            amount: amounts.tertiary,
            difference: amounts.tertiary,
          },
        ],
        shouldHide: Object.values(amounts).every((v) => v === 0),
      };
    });
  }, [selections, normalizedPriorityGoods]);

  // ========================================
  // GOODS PAR CIVILISATION
  // ========================================
  const otherGoodsByCiv = useMemo(() => {
    const grouped: Record<
      string,
      Array<{ icon: string; name: string; amount: number; difference?: number }>
    > = {};

    // Initialiser les groupes
    Object.keys(goodsByCivilization).forEach((civ) => (grouped[civ] = []));

    const itemsList = getExcludedItems();

    // Traiter les ITEMS depuis totals.main
    if (totals && totals.main) {
      Object.entries(totals.main).forEach(([type, originalAmount]) => {
        if (itemsList.includes(type)) {
          const displayAmount = getDisplayAmount(
            originalAmount,
            type,
            compareMode,
            totals.differences?.main,
          );

          const item = {
            icon: getItemIconLocal(type),
            name: type.replace(/_/g, " "),
            amount: displayAmount,
            difference: displayAmount,
          };

          if (!grouped.ITEMS) grouped.ITEMS = [];
          grouped.ITEMS.push(item);
        }
      });
    }

    // Traiter tous les autres goods
    otherGoods.forEach((amount, type) => {
      const displayName = type.replace(/_/g, " ");
      const normalized = slugify(displayName);
      let foundCiv: string | null = null;

      // Chercher dans quelle civilisation ce good appartient
      for (const [civKey, civData] of Object.entries(goodsByCivilization)) {
        if (civData.goods.includes(normalized)) {
          foundCiv = civKey;
          break;
        }
      }

      const item = {
        icon: `/goods/${normalized}.webp`,
        name: displayName,
        amount,
        difference: amount,
      };

      if (foundCiv) {
        grouped[foundCiv].push(item);
      } else {
        if (!grouped.OTHERS) grouped.OTHERS = [];
        grouped.OTHERS.push(item);
      }
    });

    // Retourner uniquement les groupes non vides
    return Object.fromEntries(
      Object.entries(grouped).filter(([_, resources]) => resources.length > 0),
    );
  }, [otherGoods, totals, compareMode]);

  // ========================================
  // MAIN RESOURCES
  // ========================================
  const mainResources = useMemo(() => {
    if (!totals || !totals.main) {
      return [];
    }

    const itemsToExclude = getExcludedItems();

    return Object.entries(totals.main)
      .filter(([type, originalAmount]) => {
        // Exclure les items
        if (itemsToExclude.includes(type)) return false;
        // Exclure les allied city resources
        if (isAlliedCityResource(type)) return false;
        // En mode normal, exclure les ressources <= 0
        if (!compareMode && originalAmount <= 0) return false;
        return true;
      })
      .map(([type, originalAmount]) => {
        const displayAmount = getDisplayAmount(
          originalAmount,
          type,
          compareMode,
          totals.differences?.main,
        );

        return {
          type,
          amount: displayAmount,
          icon: getItemIconLocal(type),
          name: type.replace(/_/g, " "),
          difference: displayAmount,
        };
      })
      .sort((a, b) => {
        const aIdx = MAIN_RESOURCE_ORDER.indexOf(
          a.type as (typeof MAIN_RESOURCE_ORDER)[number],
        );
        const bIdx = MAIN_RESOURCE_ORDER.indexOf(
          b.type as (typeof MAIN_RESOURCE_ORDER)[number],
        );

        if (aIdx !== -1 && bIdx !== -1) return aIdx - bIdx;
        if (aIdx !== -1) return -1;
        if (bIdx !== -1) return 1;
        return a.type.localeCompare(b.type);
      });
  }, [totals, compareMode]);

  // ========================================
  // RENDERING
  // ========================================
  if (loading) {
    return (
      <div className="bg-background-200 p-4 flex items-center justify-center">
        <Loader2Icon className="size-5 animate-spin" />
      </div>
    );
  }

  const visibleEras = eraBlocks.filter((b) => !b.shouldHide);
  const hasOtherGoods = Object.keys(otherGoodsByCiv).length > 0;
  const hasAnyResources =
    mainResources.length > 0 || visibleEras.length > 0 || hasOtherGoods;

  // En mode normal, afficher la empty card seulement si pas de ressources
  // En mode compare, toujours afficher le contenu (même vide) pour éviter le flash
  if (!hasAnyResources && !compareMode) {
    return (
      <div className="p-8 size-full m-auto flex items-center justify-center bg-background-200">
        <div className="-mt-12">
          <EmptyOutline perso="female" type="total" />
        </div>
      </div>
    );
  }

  return (
    <ScrollArea className="size-full overflow-y-auto bg-background-200">
      <div className="p-4 pb-16 max-w-[870px] mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-6 xl:grid-cols-1 2xl:grid-cols-6 gap-3">
          <div className="col-span-4 md:col-start-2 xl:col-start-1 2xl:col-start-2">
            <ResourceBlock
              title={
                compareMode ? "Difference (your stock – stock required)" : "Main Resources"
              }
              resources={mainResources}
              type="main"
              className={
                mainResources.length > 3 ? "grid-cols-4" : "grid-cols-3"
              }
              compareMode={compareMode}
              getDifferenceColor={getDifferenceColor}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-1 2xl:grid-cols-2 gap-3 pt-3">
          <div className="space-y-3">
            {visibleEras.map((block) => (
              <ResourceBlock
                key={block.title}
                {...block}
                type="era"
                compareMode={compareMode}
                getDifferenceColor={getDifferenceColor}
              />
            ))}
          </div>

          {hasOtherGoods && (
            <div className="space-y-3">
              {Object.entries(otherGoodsByCiv).map(([civ, resources]) => (
                <ResourceBlock
                  key={civ}
                  title={civ}
                  resources={resources}
                  type="other"
                  compareMode={compareMode}
                  getDifferenceColor={getDifferenceColor}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </ScrollArea>
  );
};
