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
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { BuildingCard } from "@/components/building/building-card";
import { TechnoCard } from "@/components/building/techno-card";
import { AreaCard } from "@/components/building/area-card";
import { TradePostCard } from "@/components/building/trade-post-card";
import { useBuildingSelections } from "@/hooks/useBuildingSelections";
import { Eye, EyeOff } from "lucide-react";
import {
  removeBuilding,
  updateBuildingQuantity,
  toggleBuildingHidden,
  toggleTechnoHidden,
  clearEraTechnos,
  flattenAndSortTechnos,
  watchBuildings,
  watchTechnos,
  watchOttomanAreas,
  watchOttomanTradePosts,
  removeOttomanArea,
  toggleOttomanAreaHidden,
  removeOttomanTradePost,
  toggleOttomanTradePostHidden,
  toggleOttomanTradePostLevel,
} from "@/lib/overview/storage";
import { getBuildingImageUrl, buildingNoLvl } from "@/lib/utils";
import { parseBuildingId, parseTechnoId } from "@/lib/overview/parseBuildingId";
import { Loader2Icon } from "lucide-react";
import { EmptyOutline } from "@/components/empty-card";
import {
  TechnoEntity,
  BuildingEntity,
  OttomanAreaEntity,
  OttomanTradePostEntity,
} from "@/lib/storage/dexie";

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

// Ordre des groupes de trade posts
const TRADE_POST_GROUP_ORDER = [
  "Plantation",
  "Farm",
  "Garden",
  "Grove",
  "Orchard",
  "Ranch",
  "Village",
  "City",
];

const BuildingListWithRef = forwardRef<BuildingListRef, BuildingListProps>(
  function BuildingList({ filters }, ref) {
    const [buildings, setBuildings] = useState<BuildingEntity[]>([]);
    const [technos, setTechnos] = useState<TechnoEntity[]>([]);
    const [ottomanAreas, setOttomanAreas] = useState<OttomanAreaEntity[]>([]);
    const [ottomanTradePosts, setOttomanTradePosts] = useState<
      OttomanTradePostEntity[]
    >([]);
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

      const unwatchOttomanAreas = watchOttomanAreas((data) => {
        setOttomanAreas(data);
        setLoading(false);
      });

      const unwatchOttomanTradePosts = watchOttomanTradePosts((data) => {
        setOttomanTradePosts(data);
        setLoading(false);
      });

      return () => {
        unwatchBuildings();
        unwatchTechnos();
        unwatchOttomanAreas();
        unwatchOttomanTradePosts();
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
            }
            return true;
          })
          .forEach((t) => {
            const era = t.id.split("_").slice(1, -1).join("_");
            if (!technosByEra[era]) technosByEra[era] = [];
            technosByEra[era].push(t);
          });

        Object.entries(technosByEra).forEach(([era, eraGroup]) => {
          const aggregated = eraGroup.reduce(
            (acc: AggregatedData, t: TechnoEntity) => {
              const costs = t.costs;
              if (costs.research_points)
                acc.totalResearch += costs.research_points as number;
              if (costs.coins) acc.totalCoins += costs.coins as number;
              if (costs.food) acc.totalFood += costs.food as number;

              // ✅ FIX: Accumuler les goods au lieu d'écraser
              if (Array.isArray(costs.goods)) {
                // Créer une Map des goods existants dans l'accumulateur
                const goodsMap = new Map<string, number>(
                  acc.goods.map((g) => [g.type, g.amount]),
                );

                // Ajouter/accumuler les nouveaux goods
                costs.goods.forEach((g: Goods) => {
                  goodsMap.set(g.type, (goodsMap.get(g.type) || 0) + g.amount);
                });

                // Mettre à jour acc.goods avec tous les goods accumulés
                acc.goods = Array.from(goodsMap.entries()).map(
                  ([type, amount]) => ({
                    type,
                    amount,
                  }),
                );
              }

              acc.technoCount++;
              return acc;
            },
            {
              totalResearch: 0,
              totalCoins: 0,
              totalFood: 0,
              goods: [],
              technoCount: 0,
            },
          );

          const catId = `techno-${era}`;
          const firstTechno = eraGroup[0];
          const parsed = parseTechnoId(firstTechno.id);

          const isHidden = eraGroup.every((t) => t.hidden);
          const hiddenCount = eraGroup.filter((t) => t.hidden).length;

          if (!map.has(catId)) {
            map.set(catId, {
              id: catId,
              name: `Technologies - ${era.replace(/_/g, " ")}`,
              location: parsed.mainSection,
              era: era.split("_").slice(-2).join("_"),
              buildings: [],
              technos: [],
              hiddenCount: 0,
            });
          }

          const technoCategory = map.get(catId)!;
          technoCategory.technos = technoCategory.technos || [];
          technoCategory.technos.push({
            id: firstTechno.id,
            era,
            parsed,
            aggregatedData: aggregated,
            hidden: isHidden,
          });

          if (isHidden) {
            technoCategory.hiddenCount += 1;
          }
        });
      }

      return Array.from(map.values()).sort((a, b) => {
        // Technologies always first
        const aIsTechno = a.id.startsWith("techno-");
        const bIsTechno = b.id.startsWith("techno-");

        if (aIsTechno && !bIsTechno) return -1;
        if (!aIsTechno && bIsTechno) return 1;

        // If both are technos, sort by era
        if (aIsTechno && bIsTechno) {
          const aEraIdx = eraOrder.indexOf(eraNameToAbbr[a.era] || a.era);
          const bEraIdx = eraOrder.indexOf(eraNameToAbbr[b.era] || b.era);
          return (
            (aEraIdx === -1 ? Infinity : aEraIdx) -
            (bEraIdx === -1 ? Infinity : bEraIdx)
          );
        }

        // For non-techno categories, sort by era
        const aEraIdx = eraOrder.indexOf(eraNameToAbbr[a.era] || a.era);
        const bEraIdx = eraOrder.indexOf(eraNameToAbbr[b.era] || b.era);
        return (
          (aEraIdx === -1 ? Infinity : aEraIdx) -
          (bEraIdx === -1 ? Infinity : bEraIdx)
        );
      });
    }, [buildings, technos, filters]);

    // Auto-expand new categories
    useEffect(() => {
      const currentCounts = new Map<string, number>();
      categories.forEach((cat) => {
        const count = cat.buildings.length + (cat.technos?.length || 0);
        currentCounts.set(cat.id, count);
      });

      const newCategories: string[] = [];
      currentCounts.forEach((count, id) => {
        const prevCount = previousCategoryCountsRef.current.get(id) || 0;
        if (count > prevCount) {
          newCategories.push(id);
        }
      });

      if (newCategories.length > 0) {
        setExpandedItems((prev) => {
          const newSet = new Set([...prev, ...newCategories]);
          return Array.from(newSet);
        });
      }

      previousCategoryCountsRef.current = currentCounts;
    }, [categories]);

    const handleRemove = useCallback(
      async (id: string) => {
        try {
          await removeBuilding(id);
        } catch (error) {
          console.error("Failed to remove building:", error);
        }
      },
      [removeBuilding],
    );

    const handleUpdateQuantity = useCallback(
      async (id: string, newQuantity: number) => {
        try {
          await updateBuildingQuantity(id, newQuantity);
        } catch (error) {
          console.error("Failed to update quantity:", error);
        }
      },
      [updateBuildingQuantity],
    );

    const handleToggleBuildingHidden = useCallback(
      async (id: string) => {
        try {
          await toggleBuildingHidden(id);
        } catch (error) {
          console.error("Failed to toggle building hidden:", error);
        }
      },
      [toggleBuildingHidden],
    );

    const handleRemoveTechno = useCallback(
      async (id: string) => {
        try {
          const era = id.split("_").slice(1, -1).join("_");
          await clearEraTechnos(era);
        } catch (error) {
          console.error("Failed to remove techno:", error);
        }
      },
      [clearEraTechnos],
    );

    const handleToggleTechnoHidden = useCallback(
      async (eraPath: string) => {
        try {
          await toggleTechnoHidden(eraPath);
        } catch (error) {
          console.error("Failed to toggle techno hidden:", error);
        }
      },
      [toggleTechnoHidden],
    );

    const handleToggleAllCategoryHidden = useCallback(
      async (category: BuildingCategory) => {
        try {
          const allHidden =
            category.buildings.every((b) => b.hidden) &&
            (!category.technos || category.technos.every((t) => t.hidden));

          // Toggle all buildings in this category
          for (const building of category.buildings) {
            await toggleBuildingHidden(building.id);
          }

          // Toggle all technos in this category
          if (category.technos) {
            for (const techno of category.technos) {
              await toggleTechnoHidden(techno.era);
            }
          }
        } catch (error) {
          console.error("Failed to toggle all category items hidden:", error);
        }
      },
      [toggleBuildingHidden, toggleTechnoHidden],
    );

    // Sort areas by areaIndex
    const sortedOttomanAreas = useMemo(() => {
      return [...ottomanAreas].sort((a, b) => a.areaIndex - b.areaIndex);
    }, [ottomanAreas]);

    // Sort on area number
    const sortedOttomanTradePosts = useMemo(() => {
      return [...ottomanTradePosts].sort((a, b) => a.area - b.area);
    }, [ottomanTradePosts]);

    const handleToggleAllOttomanAreasHidden = useCallback(async () => {
      try {
        const allHidden = sortedOttomanAreas.every((a) => a.hidden);
        for (const area of sortedOttomanAreas) {
          await toggleOttomanAreaHidden(area.id);
        }
      } catch (error) {
        console.error("Failed to toggle all areas hidden:", error);
      }
    }, [sortedOttomanAreas]);

    const handleToggleAllOttomanTradePostsHidden = useCallback(async () => {
      try {
        for (const tradePost of sortedOttomanTradePosts) {
          await toggleOttomanTradePostHidden(tradePost.id);
        }
      } catch (error) {
        console.error("Failed to toggle all trade posts hidden:", error);
      }
    }, [sortedOttomanTradePosts]);

    useImperativeHandle(
      ref,
      () => ({
        expandAll: (categoryIds?: string[]) => {
          if (categoryIds) {
            setExpandedItems((prev) => {
              const newSet = new Set([...prev, ...categoryIds]);
              return Array.from(newSet);
            });
          } else {
            setExpandedItems(categories.map((c) => c.id));
          }
        },
        collapseAll: () => {
          setExpandedItems([]);
        },
      }),
      [categories],
    );

    // Calculate Ottoman counts
    const visibleOttomanAreas = sortedOttomanAreas.filter((a) =>
      filters?.hideHidden ? !a.hidden : true,
    );
    const visibleOttomanTradePosts = sortedOttomanTradePosts.filter((tp) =>
      filters?.hideHidden ? !tp.hidden : true,
    );
    const hiddenOttomanAreas = sortedOttomanAreas.filter(
      (a) => a.hidden,
    ).length;
    const hiddenOttomanTradePosts = sortedOttomanTradePosts.filter(
      (tp) => tp.hidden,
    ).length;

    if (loading) {
      return (
        <div className="p-8 size-full m-auto flex items-center justify-center bg-background-200">
          <Loader2Icon className="size-8 animate-spin" />
        </div>
      );
    }

    const hasAnyContent =
      categories.length > 0 ||
      ottomanAreas.length > 0 ||
      sortedOttomanTradePosts.length > 0;

    if (!hasAnyContent) {
      return (
        <div className="p-8 size-full m-auto flex items-center justify-center bg-background-200">
          <EmptyOutline perso="male" type="building" />
        </div>
      );
    }

    const allOttomanAreasHidden = sortedOttomanAreas.every((a) => a.hidden);
    const allOttomanTradePostsHidden = sortedOttomanTradePosts.every(
      (tp) => tp.hidden,
    );

    return (
      <Accordion
        type="multiple"
        value={expandedItems}
        onValueChange={setExpandedItems}
        className="w-full space-y-2 p-3"
      >
        {/* Ottoman Areas Accordion */}
        {ottomanAreas.length > 0 && (
          <AccordionItem
            value="ottoman-areas"
            className="rounded-md border bg-background-200 px-4 py-2 border-alpha-300 group"
          >
            <AccordionTrigger className="hover:no-underline [&>svg]:-order-1 justify-start gap-3 py-1 text-sm">
              <div className="flex justify-between items-center w-full">
                <span>Areas - Ottoman</span>
                <div className="flex gap-1.5 items-center">
                  <div
                    className="inline-flex items-center justify-center gap-2 h-6 px-2 rounded-sm text-sm font-medium transition-opacity duration-200 opacity-0 group-hover:opacity-100 hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50 cursor-pointer"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleToggleAllOttomanAreasHidden();
                    }}
                  >
                    {allOttomanAreasHidden ? (
                      <Eye className="size-4" />
                    ) : (
                      <EyeOff className="size-4" />
                    )}
                    <span className="ml-1">
                      {allOttomanAreasHidden ? "Show all" : "Hide all"}
                    </span>
                  </div>
                  {hiddenOttomanAreas > 0 && (
                    <Badge
                      variant="outline"
                      className="bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 rounded-sm h-6 px-2 text-sm border-orange-300 dark:border-orange-700"
                    >
                      {hiddenOttomanAreas} hidden
                    </Badge>
                  )}
                  <Badge
                    variant="outline"
                    className="bg-background-300 rounded-sm h-6 px-2 text-sm border-alpha-400"
                  >
                    {visibleOttomanAreas.length} selected
                  </Badge>
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent className="pt-3">
              {/* <ScrollArea className="h-[400px]"> */}
              <div className="space-y-3 2xl:ps-6">
                {visibleOttomanAreas.map((area) => (
                  <AreaCard
                    key={area.id}
                    area={area}
                    userSelections={selections}
                    onRemove={removeOttomanArea}
                    onToggleHidden={toggleOttomanAreaHidden}
                  />
                ))}
              </div>
              {/* </ScrollArea> */}
            </AccordionContent>
          </AccordionItem>
        )}

        {/* Ottoman Trade Posts Accordion */}
        {sortedOttomanTradePosts.length > 0 && (
          <AccordionItem
            value="ottoman-tradeposts"
            className="rounded-md border bg-background-200 px-4 py-2 border-alpha-300 group"
          >
            <AccordionTrigger className="hover:no-underline [&>svg]:-order-1 justify-start gap-3 py-1 text-sm">
              <div className="flex justify-between items-center w-full">
                <span>Trade Posts - Ottoman</span>
                <div className="flex gap-1.5 items-center">
                  <div
                    className="inline-flex items-center justify-center gap-2 h-6 px-2 rounded-sm text-sm font-medium transition-opacity duration-200 opacity-0 group-hover:opacity-100 hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50 cursor-pointer"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleToggleAllOttomanTradePostsHidden();
                    }}
                  >
                    {allOttomanTradePostsHidden ? (
                      <Eye className="size-4" />
                    ) : (
                      <EyeOff className="size-4" />
                    )}
                    <span className="ml-1">
                      {allOttomanTradePostsHidden ? "Show all" : "Hide all"}
                    </span>
                  </div>
                  {hiddenOttomanTradePosts > 0 && (
                    <Badge
                      variant="outline"
                      className="bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 rounded-sm h-6 px-2 text-sm border-orange-300 dark:border-orange-700"
                    >
                      {hiddenOttomanTradePosts} hidden
                    </Badge>
                  )}
                  <Badge
                    variant="outline"
                    className="bg-background-300 rounded-sm h-6 px-2 text-sm border-alpha-400"
                  >
                    {visibleOttomanTradePosts.length} selected
                  </Badge>
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent className="pt-3">
              {/* <ScrollArea className="h-[400px]"> */}
              <div className="space-y-3 2xl:ps-6">
                {visibleOttomanTradePosts.map((tradePost) => (
                  <TradePostCard
                    key={tradePost.id}
                    tradePost={tradePost}
                    userSelections={selections}
                    onRemove={removeOttomanTradePost}
                    onToggleHidden={toggleOttomanTradePostHidden}
                    onToggleLevel={toggleOttomanTradePostLevel}
                  />
                ))}
              </div>
              {/* </ScrollArea> */}
            </AccordionContent>
          </AccordionItem>
        )}

        {/* Regular Buildings & Technos */}
        {categories.map((cat) => {
          const totalCount = cat.buildings.length + (cat.technos?.length || 0);
          const allCategoryItemsHidden =
            cat.buildings.every((b) => b.hidden) &&
            (!cat.technos || cat.technos.every((t) => t.hidden));

          return (
            <AccordionItem
              key={cat.id}
              value={cat.id}
              className="rounded-md border bg-background-200 px-4 py-2 border-alpha-300 group"
            >
              <AccordionTrigger className="hover:no-underline [&>svg]:-order-1 justify-start gap-3 py-1 text-sm">
                <div className="flex justify-between items-center w-full">
                  <span className="capitalize">
                    {cat.location === "Capital"
                      ? `${cat.name} - ${cat.location}`
                      : cat.name}
                  </span>
                  <div className="flex gap-1.5 items-center">
                    <div
                      className="inline-flex items-center justify-center gap-2 h-6 px-2 rounded-sm text-sm font-medium transition-opacity duration-200 opacity-0 group-hover:opacity-100 hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50 cursor-pointer"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggleAllCategoryHidden(cat);
                      }}
                    >
                      {allCategoryItemsHidden ? (
                        <Eye className="size-4" />
                      ) : (
                        <EyeOff className="size-4" />
                      )}
                      <span className="ml-1">
                        {allCategoryItemsHidden ? "Show all" : "Hide all"}
                      </span>
                    </div>
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
