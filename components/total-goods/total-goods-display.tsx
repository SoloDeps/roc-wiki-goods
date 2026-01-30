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
  goodsNameMapping,
  goodsByCivilization,
  alliedCityResources,
  type EraAbbr,
} from "@/lib/constants";
import {
  getBuildingFromLocal,
  slugify,
  normalizeGoodName,
  getItemIconLocal,
} from "@/lib/utils";
import { ResourceBlock } from "./resource-block";
import { Loader2Icon } from "lucide-react";
import { EmptyOutline } from "@/components/empty-card";
import { ScrollArea } from "@/components/ui/scroll-area";

const RESOURCE_ORDER = ["coins", "food", "research_points", "gems"];

interface TotalGoodsDisplayProps {
  compareMode?: boolean;
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

  useEffect(() => {
    (async () => {
      const result = await getCalculatorTotals(compareMode);
      setTotals(result);
      setLoading(false);
    })();

    return watchCalculatorTotals((result) => {
      setTotals(result);
    }, compareMode);
  }, [compareMode]);

  const getDifferenceColor = (difference: number): string => {
    if (difference >= 0) return "34, 197, 94";
    return "239, 68, 68";
  };

  const goodMappings = useMemo(() => {
    const toKey = new Map<string, string>();
    const fromKey = new Map<string, string>();

    Object.entries(goodsNameMapping).forEach(([good, mappings]) => {
      mappings.forEach((m) => {
        const normalized = slugify(good);
        const key = `${m.priority[0].toUpperCase()}${m.priority.slice(1)}_${
          m.era
        }`;
        toKey.set(normalized, key);
        fromKey.set(key, normalized);
      });
    });

    return { toKey, fromKey };
  }, []);

  const normalizedGoods = useMemo(() => {
    const priority = new Map<string, number>();
    const other = new Map<string, number>();

    const goodsToUse = totals.goods;

    Object.entries(goodsToUse).forEach(([type, amount]) => {
      // ✅ Accepter les deux formats : Primary_CG ou primary_cg
      if (/^(primary|secondary|tertiary)_[a-z]{2}$/i.test(type)) {
        const displayAmount =
          compareMode && totals.differences
            ? (totals.differences.goods[type] ?? amount)
            : amount;

        // ✅ Normaliser en minuscules pour la clé
        const normalizedKey = type.toLowerCase();
        priority.set(
          normalizedKey,
          (priority.get(normalizedKey) ?? 0) + displayAmount,
        );
        return;
      }

      const normalized = slugify(type);
      const key = goodMappings.toKey.get(normalized);

      const displayAmount =
        compareMode && totals.differences
          ? (totals.differences.goods[type] ?? amount)
          : amount;

      if (key) {
        // ✅ Normaliser en minuscules
        const normalizedKey = key.toLowerCase();
        priority.set(
          normalizedKey,
          (priority.get(normalizedKey) ?? 0) + displayAmount,
        );
      } else {
        other.set(type, (other.get(type) ?? 0) + displayAmount);
      }
    });

    eras.forEach((era) => {
      const abbr = era.abbr as EraAbbr;
      ["primary", "secondary", "tertiary"].forEach((priorityType) => {
        // ✅ Utiliser minuscules pour cohérence
        const key = `${priorityType}_${abbr.toLowerCase()}`;

        if (!priority.has(key)) {
          // ✅ FIX: Vérifier que diffKey est bien un number avant de l'utiliser
          const diffValue = compareMode
            ? totals.differences?.goods?.[key]
            : undefined;
          if (compareMode && typeof diffValue === "number") {
            priority.set(key, diffValue);
          } else {
            priority.set(key, 0);
          }
        }
      });
    });

    return { priority, other };
  }, [totals.goods, totals.differences, goodMappings, compareMode]);

  const eraBlocks = useMemo(() => {
    return eras.map((era) => {
      const abbr = era.abbr as EraAbbr;
      // ✅ Utiliser minuscules pour correspondre aux clés normalisées
      const amounts = {
        primary:
          normalizedGoods.priority.get(`primary_${abbr.toLowerCase()}`) ?? 0,
        secondary:
          normalizedGoods.priority.get(`secondary_${abbr.toLowerCase()}`) ?? 0,
        tertiary:
          normalizedGoods.priority.get(`tertiary_${abbr.toLowerCase()}`) ?? 0,
      };

      // Récupérer les noms des goods depuis goodsUrlByEra
      const building_primary = getBuildingFromLocal(
        "primary",
        abbr,
        selections,
      );
      const building_secondary = getBuildingFromLocal(
        "secondary",
        abbr,
        selections,
      );
      const building_tertiary = getBuildingFromLocal(
        "tertiary",
        abbr,
        selections,
      );

      const normalized_primary = building_primary
        ? slugify(building_primary)
        : "";
      const normalized_secondary = building_secondary
        ? slugify(building_secondary)
        : "";
      const normalized_tertiary = building_tertiary
        ? slugify(building_tertiary)
        : "";

      const primary_meta = normalized_primary
        ? goodsUrlByEra[abbr]?.[normalized_primary]
        : undefined;
      const secondary_meta = normalized_secondary
        ? goodsUrlByEra[abbr]?.[normalized_secondary]
        : undefined;
      const tertiary_meta = normalized_tertiary
        ? goodsUrlByEra[abbr]?.[normalized_tertiary]
        : undefined;

      return {
        title: era.name,
        resources: [
          {
            icon: primary_meta?.name
              ? `/goods/${normalizeGoodName(primary_meta.name)}.webp`
              : "/goods/default.webp",
            name: primary_meta?.name ?? "Primary",
            amount: amounts.primary,
            difference: amounts.primary,
          },
          {
            icon: secondary_meta?.name
              ? `/goods/${normalizeGoodName(secondary_meta.name)}.webp`
              : "/goods/default.webp",
            name: secondary_meta?.name ?? "Secondary",
            amount: amounts.secondary,
            difference: amounts.secondary,
          },
          {
            icon: tertiary_meta?.name
              ? `/goods/${normalizeGoodName(tertiary_meta.name)}.webp`
              : "/goods/default.webp",
            name: tertiary_meta?.name ?? "Tertiary",
            amount: amounts.tertiary,
            difference: amounts.tertiary,
          },
        ],
        shouldHide: Object.values(amounts).every((v) => v === 0),
      };
    });
  }, [selections, normalizedGoods, compareMode]);

  const otherGoodsByCiv = useMemo(() => {
    const grouped: Record<
      string,
      Array<{ icon: string; name: string; amount: number; difference?: number }>
    > = {};

    Object.keys(goodsByCivilization).forEach((civ) => (grouped[civ] = []));

    // ✅ Traiter tous les goods (y compris les monnaies alliées maintenant dans goods)
    normalizedGoods.other.forEach((amount, type) => {
      const displayName = type.replace(/_/g, " ");
      const normalized = normalizeGoodName(displayName);
      let foundCiv: string | null = null;

      // Check dans goodsByCivilization
      for (const [civKey, civData] of Object.entries(goodsByCivilization)) {
        if (civData.goods.includes(normalized)) {
          foundCiv = civKey;
          break;
        }
      }

      // ✅ Check aussi dans alliedCityResources (pour les monnaies: deben, rice, etc.)
      if (!foundCiv) {
        for (const [cityKey, cityData] of Object.entries(alliedCityResources)) {
          if (cityData.resources.includes(type)) {
            foundCiv = cityData.name;
            break;
          }
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

    return Object.fromEntries(
      Object.entries(grouped).filter(([_, resources]) => resources.length > 0),
    );
  }, [normalizedGoods.other, selections, totals.differences, compareMode]);

  const mainResources = useMemo(() => {
    return Object.entries(totals.main)
      .filter(([type, originalAmount]) => {
        const isAllied = Object.values(alliedCityResources).some((city) =>
          city.resources.includes(type),
        );
        if (!compareMode && originalAmount <= 0) return false;
        return !isAllied;
      })
      .map(([type, originalAmount]) => {
        const displayAmount =
          compareMode && totals.differences
            ? (totals.differences.main[type] ?? originalAmount)
            : originalAmount;

        return {
          type,
          amount: displayAmount,
          icon: getItemIconLocal(type),
          name: type.replace(/_/g, " "),
          difference: displayAmount,
        };
      })
      .sort((a, b) => {
        const aIdx = RESOURCE_ORDER.indexOf(a.type);
        const bIdx = RESOURCE_ORDER.indexOf(b.type);

        if (aIdx !== -1 && bIdx !== -1) return aIdx - bIdx;
        if (aIdx !== -1) return -1;
        if (bIdx !== -1) return 1;
        return a.type.localeCompare(b.type);
      });
  }, [totals.main, totals.differences, compareMode]);

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
                compareMode ? "Difference (You - Needed)" : "Main Resources"
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
