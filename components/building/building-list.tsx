import { eras } from "@/lib/constants";
import {
  useState,
  useCallback,
  useMemo,
  useEffect,
  useRef,
  forwardRef,
  useImperativeHandle,
} from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { BuildingCard } from "@/components/building/building-card";
import { TechnoCard } from "@/components/building/techno-card";
import { useBuildingSelections } from "@/hooks/useBuildingSelections";
import {
  removeBuilding,
  updateBuildingQuantity,
  toggleBuildingHidden,
  toggleTechnoHidden,
  clearEraTechnos,
  flattenAndSortTechnos,
  watchBuildings,
  watchTechnos,
} from "@/lib/overview/storage";
import { getBuildingImageUrl, buildingNoLvl } from "@/lib/utils";
import { parseBuildingId, parseTechnoId } from "@/lib/overview/parseBuildingId";
import { Loader2Icon } from "lucide-react";
import { EmptyOutline } from "@/components/empty-card";
import { TechnoEntity, BuildingEntity } from "@/lib/storage/dexie";

export const getBuildingLocation = (
  section1: string,
  section2: string,
  name: string,
) => {
  if (section1 === "Home_Cultures")
    return { location: "Capital", displayName: name };
  const cityName = section2.replace(/_/g, " ");
  return { location: cityName, displayName: `${name} - ${cityName}` };
};

interface Goods {
  type: string;
  amount: number;
}

interface AggregatedData {
  totalResearch: number;
  totalCoins: number;
  totalFood: number;
  goods: Goods[];
  technoCount: number;
}

interface BuildingCardData {
  id: string;
  name: string;
  parsed: ReturnType<typeof parseBuildingId>;
  costs: any;
  quantity: number;
  maxQty: number;
  image: string;
  hidden?: boolean;
}

interface TechnoCardData {
  id: string;
  era: string;
  parsed: ReturnType<typeof parseTechnoId>;
  aggregatedData: AggregatedData;
  hidden?: boolean;
}

interface BuildingCategory {
  id: string;
  name: string;
  location: string;
  era: string;
  buildings: BuildingCardData[];
  technos?: TechnoCardData[];
  hiddenCount: number;
}

interface BuildingListProps {
  filters?: {
    tableType?: "construction" | "upgrade";
    location?: string;
    hideHidden?: boolean;
    hideTechnos?: boolean;
  };
}

export interface BuildingListRef {
  expandAll: (categoryIds?: string[]) => void;
  collapseAll: () => void;
}

const BuildingListWithRef = forwardRef<BuildingListRef, BuildingListProps>(
  function BuildingList({ filters }, ref) {
    const [buildings, setBuildings] = useState<BuildingEntity[]>([]);
    const [technos, setTechnos] = useState<TechnoEntity[]>([]);
    const [loading, setLoading] = useState(true);
    const [expandedItems, setExpandedItems] = useState<string[]>([]);
    const selections = useBuildingSelections();

    // Track previous categories to detect new ones
    const previousCategoryCountsRef = useRef<Map<string, number>>(new Map());

    useEffect(() => {
      const unwatchBuildings = watchBuildings((data) => {
        setBuildings(data);
        setLoading(false);
      });

      const unwatchTechnos = watchTechnos((data) => {
        setTechnos(flattenAndSortTechnos(data));
        setLoading(false);
      });

      return () => {
        unwatchBuildings();
        unwatchTechnos();
      };
    }, []);

    const categories = useMemo(() => {
      const map = new Map<string, BuildingCategory>();
      const eraOrder = eras.map((e) => e.abbr);
      const eraNameToAbbr = Object.fromEntries(eras.map((e) => [e.id, e.abbr]));

      // Filter and group buildings
      buildings
        .filter((b) => {
          // Apply hideHidden filter
          if (filters?.hideHidden && b.hidden) return false;

          const parsed = parseBuildingId(b.id);
          if (filters?.tableType && parsed.tableType !== filters.tableType)
            return false;
          if (filters?.location) {
            const loc = getBuildingLocation(
              parsed.section1,
              parsed.section2,
              parsed.buildingName,
            );
            if (loc.location !== filters.location) return false;
          }
          return true;
        })
        .forEach((b) => {
          const parsed = parseBuildingId(b.id);
          const loc = getBuildingLocation(
            parsed.section1,
            parsed.section2,
            parsed.buildingName,
          );
          const key = `${parsed.buildingName}-${loc.location}`;

          if (!map.has(key)) {
            map.set(key, {
              id: key,
              name: loc.displayName.replace(/_/g, " "),
              location: loc.location,
              era: parsed.era,
              buildings: [],
              hiddenCount: 0,
            });
          }

          const category = map.get(key)!;
          category.buildings.push({
            id: b.id,
            name: buildingNoLvl.includes(parsed.section3.toLowerCase())
              ? parsed.buildingName
              : `${parsed.buildingName} — Lvl ${parsed.level}`,
            parsed,
            costs: b.costs,
            quantity: b.quantity,
            maxQty: b.maxQty,
            image: getBuildingImageUrl(
              parsed.section3,
              parsed.level,
              parsed.section2,
            ),
            hidden: b.hidden,
          });

          if (b.hidden) {
            category.hiddenCount++;
          }
        });

      // Group and aggregate technos (only if not filtered out)
      if (!filters?.hideTechnos) {
        const technosByEra: Record<string, TechnoEntity[]> = {};
        technos
          .filter((t) => {
            // Apply hideHidden filter
            if (filters?.hideHidden && t.hidden) return false;

            // Apply location filter if set
            if (filters?.location) {
              const parts = t.id.split("_");
              if (parts.length >= 2) {
                const technoLocation = parts[1];
                return technoLocation === filters.location;
              }
              return false;
            }
            return true;
          })
          .forEach((t) => {
            const era = t.id.split("_").slice(1, -1).join("_");
            (technosByEra[era] ??= []).push(t);
          });

        const technoCards = Object.keys(technosByEra)
          .sort((a, b) => {
            const idxA = eraOrder.indexOf(eraNameToAbbr[a] || a);
            const idxB = eraOrder.indexOf(eraNameToAbbr[b] || b);
            return (
              (idxA === -1 ? Infinity : idxA) - (idxB === -1 ? Infinity : idxB)
            );
          })
          .map((era) => {
            const techs = technosByEra[era];
            const aggregated = techs.reduce<AggregatedData>(
              (acc, t) => {
                acc.technoCount++;
                acc.totalResearch += Number(t.costs.research_points || 0);
                acc.totalCoins += Number(t.costs.coins || 0);
                acc.totalFood += Number(t.costs.food || 0);

                const goodsMap = new Map(acc.goods.map((g) => [g.type, g]));
                const goodsArray = Array.isArray(t.costs.goods)
                  ? t.costs.goods
                  : [];
                goodsArray.forEach((g) => {
                  const existing = goodsMap.get(g.type);
                  if (existing) {
                    existing.amount += g.amount;
                  } else {
                    goodsMap.set(g.type, { ...g });
                  }
                });

                acc.goods = Array.from(goodsMap.values());
                return acc;
              },
              {
                totalResearch: 0,
                totalCoins: 0,
                totalFood: 0,
                goods: [] as Goods[],
                technoCount: 0,
              },
            );

            return {
              id: `technos-${era}`,
              era,
              parsed: {
                id: `technos-${era}`,
                mainSection: "",
                subSection: "",
                thirdSection: "",
                era,
                index: "",
              },
              aggregatedData: aggregated,
              hidden: techs[0]?.hidden,
            };
          });

        if (technoCards.length > 0) {
          const hiddenTechnosCount = technoCards.filter((t) => t.hidden).length;
          map.set("technos-all", {
            id: "technos-all",
            name: "Technologies",
            location: "Technologies",
            era: "All",
            buildings: [],
            technos: technoCards,
            hiddenCount: hiddenTechnosCount,
          });
        }
      }

      return Array.from(map.values())
        .map((c) => ({
          ...c,
          buildings: c.buildings.sort(
            (a, b) => parseInt(a.parsed.level) - parseInt(b.parsed.level),
          ),
        }))
        .sort((a, b) => {
          if (a.location === "Technologies") return -1;
          if (b.location === "Technologies") return 1;
          if (a.location === "Capital") return -1;
          if (b.location === "Capital") return 1;
          return a.location === b.location
            ? a.name.localeCompare(b.name)
            : a.location.localeCompare(b.location);
        });
    }, [buildings, technos, filters]);

    // Auto-expand only new categories when items are added
    useEffect(() => {
      if (loading) return;

      const currentCounts = new Map<string, number>();
      const categoriesToExpand: string[] = [];

      // Calculer le nombre d'éléments par catégorie
      categories.forEach((cat) => {
        const totalCount = cat.buildings.length + (cat.technos?.length || 0);
        currentCounts.set(cat.id, totalCount);
      });

      const previousCounts = previousCategoryCountsRef.current;

      // Détecter les catégories à expand
      categories.forEach((cat) => {
        const currentCount = currentCounts.get(cat.id) || 0;
        const previousCount = previousCounts.get(cat.id);

        // Cas 1 : Nouvelle catégorie
        if (previousCount === undefined && currentCount > 0) {
          console.log(`[Building List] New category detected: ${cat.id}`);
          categoriesToExpand.push(cat.id);
        }
        // Cas 2 : Catégorie existante avec nouveaux éléments
        else if (previousCount !== undefined && currentCount > previousCount) {
          console.log(
            `[Building List] Category ${cat.id} has new items: ${previousCount} → ${currentCount}`,
          );

          // ✅ CORRECTION : Expand seulement si la catégorie est actuellement collapsed
          if (!expandedItems.includes(cat.id)) {
            console.log(
              `[Building List] Expanding collapsed category: ${cat.id}`,
            );
            categoriesToExpand.push(cat.id);
          }
        }
      });

      // Mettre à jour les items expanded
      if (categoriesToExpand.length > 0) {
        setExpandedItems((prev) => {
          const updated = [...new Set([...prev, ...categoriesToExpand])];
          console.log(`[Building List] Expanded items:`, updated);
          return updated;
        });
      }

      // Mettre à jour le cache pour la prochaine comparaison
      previousCategoryCountsRef.current = currentCounts;
    }, [categories, loading, expandedItems]);

    useImperativeHandle(ref, () => ({
      expandAll: (ids) => setExpandedItems(ids || categories.map((c) => c.id)),
      collapseAll: () => setExpandedItems([]),
    }));

    const handleUpdateQuantity = useCallback((id: string, qty: number) => {
      setBuildings((prev) =>
        prev.map((b) => (b.id === id ? { ...b, quantity: qty } : b)),
      );
      updateBuildingQuantity(id, qty);
    }, []);

    const handleRemove = useCallback(async (id: string) => {
      await removeBuilding(id);
    }, []);

    const handleToggleBuildingHidden = useCallback(async (id: string) => {
      await toggleBuildingHidden(id);
    }, []);

    const handleToggleTechnoHidden = useCallback(async (eraPath: string) => {
      await toggleTechnoHidden(eraPath);
    }, []);

    const handleRemoveTechno = useCallback(async (id: string) => {
      await clearEraTechnos(id.replace("technos-", ""));
    }, []);

    if (loading) {
      return (
        <div className="p-4 flex items-center justify-center">
          <Loader2Icon className="size-5 animate-spin" />
        </div>
      );
    }

    if (categories.length === 0) {
      return (
        <div className="p-8 size-full m-auto flex items-center justify-center bg-background-200">
          <EmptyOutline perso="male" type="building" />
        </div>
      );
    }

    return (
      <Accordion
        type="multiple"
        value={expandedItems}
        onValueChange={setExpandedItems}
        className="w-full space-y-2 p-3"
      >
        {categories.map((cat) => {
          const totalCount = cat.buildings.length + (cat.technos?.length || 0);

          return (
            <AccordionItem
              key={cat.id}
              value={cat.id}
              className="rounded-md border bg-background-200 px-4 py-2 border-alpha-300"
            >
              <AccordionTrigger className="hover:no-underline [&>svg]:-order-1 justify-start gap-3 py-1 text-sm">
                <div className="flex justify-between items-center w-full">
                  <span className="capitalize">
                    {cat.location === "Capital"
                      ? `${cat.name} - ${cat.location}`
                      : cat.name}
                  </span>
                  <div className="flex gap-1.5">
                    {cat.hiddenCount > 0 && (
                      <Badge
                        variant="outline"
                        className="bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 rounded-sm h-6 px-2 text-sm border-orange-300 dark:border-orange-700"
                      >
                        {cat.hiddenCount} hidden
                      </Badge>
                    )}
                    <Badge
                      variant="outline"
                      className="bg-background-300 rounded-sm h-6 px-2 text-sm border-alpha-400"
                    >
                      {totalCount} selected
                    </Badge>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent className="space-y-3 pt-3 2xl:ps-6">
                {cat.buildings.map((b) => (
                  <BuildingCard
                    key={b.id}
                    building={b}
                    userSelections={selections}
                    onRemove={handleRemove}
                    onUpdateQuantity={handleUpdateQuantity}
                    onToggleHidden={handleToggleBuildingHidden}
                  />
                ))}
                {cat.technos?.map((t) => (
                  <TechnoCard
                    key={t.id}
                    aggregatedTechnos={t.aggregatedData}
                    userSelections={selections}
                    onRemoveAll={() => handleRemoveTechno(t.id)}
                    onToggleHidden={() => handleToggleTechnoHidden(t.era)}
                    era={t.era}
                    hidden={t.hidden}
                  />
                ))}
              </AccordionContent>
            </AccordionItem>
          );
        })}
      </Accordion>
    );
  },
);

export const BuildingList = BuildingListWithRef;
