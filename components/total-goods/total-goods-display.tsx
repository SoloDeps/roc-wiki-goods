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
  itemsUrl,
  goodsNameMapping,
  goodsByCivilization,
  alliedCityResources,
  type EraAbbr,
  WIKI_URL,
} from "@/lib/constants";
import {
  getBuildingFromLocal,
  getGoodImageUrlFromType,
  slugify,
} from "@/lib/utils";
import { getItemIcon } from "@/lib/helper";
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
      if (/^(Primary|Secondary|Tertiary)_[A-Z]{2}$/i.test(type)) {
        const displayAmount =
          compareMode && totals.differences
            ? (totals.differences.goods[type] ?? amount)
            : amount;

        priority.set(type, (priority.get(type) ?? 0) + displayAmount);
        return;
      }

      const normalized = slugify(type);
      const key = goodMappings.toKey.get(normalized);

      const displayAmount =
        compareMode && totals.differences
          ? (totals.differences.goods[type] ?? amount)
          : amount;

      if (key) {
        priority.set(key, (priority.get(key) ?? 0) + displayAmount);
      } else {
        other.set(type, (other.get(type) ?? 0) + displayAmount);
      }
    });

    eras.forEach((era) => {
      const abbr = era.abbr as EraAbbr;
      ["Primary", "Secondary", "Tertiary"].forEach((priorityType) => {
        const key = `${priorityType}_${abbr}`;

        if (!priority.has(key)) {
          if (compareMode && totals.differences?.goods?.[key] !== undefined) {
            priority.set(key, totals.differences.goods[key]);
          } else {
            priority.set(key, 0);
          }
        }
      });
    });

    return { priority, other };
  }, [totals.goods, totals.differences, goodMappings, compareMode]);

  const eraBlocks = useMemo(() => {
    const getPriorityMeta = (
      priority: "primary" | "secondary" | "tertiary",
      era: EraAbbr,
    ) => {
      const building = getBuildingFromLocal(priority, era, selections);
      const normalized = slugify(building ?? "");
      const meta = normalized ? goodsUrlByEra[era]?.[normalized] : undefined;

      return {
        icon: `${WIKI_URL}${meta?.url ?? itemsUrl.default}`,
        name:
          meta?.name ?? priority.charAt(0).toUpperCase() + priority.slice(1),
      };
    };

    return eras.map((era) => {
      const abbr = era.abbr as EraAbbr;
      const amounts = {
        primary: normalizedGoods.priority.get(`Primary_${abbr}`) ?? 0,
        secondary: normalizedGoods.priority.get(`Secondary_${abbr}`) ?? 0,
        tertiary: normalizedGoods.priority.get(`Tertiary_${abbr}`) ?? 0,
      };

      return {
        title: era.name,
        resources: [
          {
            ...getPriorityMeta("primary", abbr),
            amount: amounts.primary,
            difference: amounts.primary,
          },
          {
            ...getPriorityMeta("secondary", abbr),
            amount: amounts.secondary,
            difference: amounts.secondary,
          },
          {
            ...getPriorityMeta("tertiary", abbr),
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

    normalizedGoods.other.forEach((amount, type) => {
      const displayName = type.replace(/_/g, " ");
      let foundCiv: string | null = null;

      for (const [civKey, civData] of Object.entries(goodsByCivilization)) {
        if (civData.goods.includes(displayName)) {
          foundCiv = civKey;
          break;
        }
      }

      const item = {
        icon: `${WIKI_URL}${getGoodImageUrlFromType(type, selections)}`,
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

    Object.entries(totals.main).forEach(([type, originalAmount]) => {
      if (originalAmount === 0 && !compareMode) return;

      for (const [cityKey, cityData] of Object.entries(alliedCityResources)) {
        if (cityData.resources.includes(type)) {
          const cityName = cityData.name;
          if (!grouped[cityName]) grouped[cityName] = [];

          const displayAmount =
            compareMode && totals.differences
              ? (totals.differences.main[type] ?? originalAmount)
              : originalAmount;

          grouped[cityName].push({
            icon: `${WIKI_URL}${getItemIcon(type)}`,
            name: type.replace(/_/g, " "),
            amount: displayAmount,
            difference: displayAmount,
          });
          break;
        }
      }
    });

    return Object.fromEntries(
      Object.entries(grouped).filter(([_, resources]) => resources.length > 0),
    );
  }, [
    normalizedGoods.other,
    selections,
    totals.main,
    totals.differences,
    compareMode,
  ]);

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
          icon: `${WIKI_URL}${getItemIcon(type)}`,
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
      <div className="p-4 flex items-center justify-center">
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
