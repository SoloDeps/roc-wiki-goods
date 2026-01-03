// Import des eras pour le tri
import { eras } from "@/lib/constants";
import {
  useState,
  useCallback,
  useMemo,
  useEffect,
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
  loadSavedBuildings,
  watchSavedBuildings,
  removeBuilding,
  updateBuildingQuantity,
  loadSavedTechnos,
  watchSavedTechnos,
  removeTechno,
  removeAllTechnos,
  flattenAndSortTechnos,
  type SavedData,
  type SavedTechnosData,
} from "@/lib/overview/storage";
import { clearEraTechnos } from "@/lib/features/techno";
import { getBuildingImageUrl, buildingNoLvl } from "@/lib/utils";
import { parseBuildingId, parseTechnoId } from "@/lib/overview/parseBuildingId";
import { Loader2Icon } from "lucide-react";
import { EmptyOutline } from "@/components/empty-card";

// Fonction pour déterminer si un building est de la Capital ou d'une ville alliée
export const getBuildingLocation = (
  section1: string,
  section2: string,
  buildingName: string
): { location: string; displayName: string } => {
  // Si section1 est "Home_Cultures", c'est la Capital
  if (section1 === "Home_Cultures") {
    return {
      location: "Capital",
      displayName: buildingName,
    };
  }

  // Sinon, c'est une ville alliée, utiliser section2 comme nom de la ville
  const cityName = section2.replace(/_/g, " ");

  return {
    location: cityName,
    displayName: `${buildingName} - ${cityName}`,
  };
};

interface BuildingCardData {
  id: string;
  name: string;
  parsed: ReturnType<typeof parseBuildingId>;
  costs: SavedData["buildings"][number]["costs"];
  quantity: number;
  maxQty: number;
  image: string;
}

interface TechnoCardData {
  id: string;
  era: string;
  parsed: ReturnType<typeof parseTechnoId>;
  aggregatedData: AggregatedTechnoData; // données agrégées pour cette ère
}

interface AggregatedTechnoData {
  totalResearch: number;
  totalCoins: number;
  totalFood: number;
  goods: Array<{ type: string; amount: number }>;
  technoCount: number;
}

interface BuildingCategory {
  id: string; // buildingName ou era pour technos
  name: string;
  location: string;
  era: string; // era abbreviation
  buildings: BuildingCardData[];
  technos?: TechnoCardData[]; // technos par ère optionnelles
}

interface BuildingListProps {
  filters?: {
    tableType?: "construction" | "upgrade";
    location?: string;
  };
}

export interface BuildingListRef {
  expandAll: (categoryIds?: string[]) => void;
  collapseAll: () => void;
}

const BuildingListWithRef = forwardRef<BuildingListRef, BuildingListProps>(
  function BuildingList(
    { filters: externalFilters }: BuildingListProps,
    ref: React.Ref<BuildingListRef>
  ) {
    const [categories, setCategories] = useState<BuildingCategory[]>([]);
    const [loading, setLoading] = useState(true);
    const [expandedItems, setExpandedItems] = useState<string[]>([]);

    const { selections } = useBuildingSelections();

    useImperativeHandle(ref, () => ({
      expandAll: (categoryIds?: string[]) => {
        if (categoryIds) {
          setExpandedItems(categoryIds);
        } else {
          // Utiliser directement les catégories actuelles
          setExpandedItems(categories.map((c) => c.id));
        }
      },
      collapseAll: () => {
        setExpandedItems([]);
      },
    }));

    const handleRemove = useCallback(async (id: string) => {
      await removeBuilding(id);
    }, []);

    const handleRemoveTechno = useCallback(async (id: string) => {
      // Extraire le nom de l'ère depuis l'ID (format: "technos-${era}")
      const era = id.replace("technos-", "");
      await clearEraTechnos(era);
    }, []);

    const handleRemoveAllTechnos = useCallback(async () => {
      await removeAllTechnos();
    }, []);

    const handleUpdateQuantity = useCallback(
      async (id: string, qty: number) => {
        await updateBuildingQuantity(id, qty);
      },
      []
    );

    const transformData = useCallback(
      (
        buildingsData: SavedData,
        technosData: SavedTechnosData
      ): BuildingCategory[] => {
        const map = new Map<string, BuildingCategory>();

        // Filtrer les buildings selon les filtres actifs
        const filteredBuildings = buildingsData.buildings.filter(
          (b: SavedData["buildings"][0]) => {
            const parsed = parseBuildingId(b.id);

            // Filtre par type (construction/upgrade)
            if (
              externalFilters?.tableType &&
              parsed.tableType !== externalFilters.tableType
            ) {
              return false;
            }

            // Filtre par location
            if (externalFilters?.location) {
              const locationInfo = getBuildingLocation(
                parsed.section1,
                parsed.section2,
                parsed.buildingName
              );
              if (locationInfo.location !== externalFilters.location) {
                return false;
              }
            }

            return true;
          }
        );

        filteredBuildings.forEach((b: SavedData["buildings"][0]) => {
          const parsed = parseBuildingId(b.id);
          const buildingName = parsed.buildingName;

          const locationInfo = getBuildingLocation(
            parsed.section1,
            parsed.section2,
            buildingName
          );

          const key = `${buildingName}-${locationInfo.location}`;
          const era = parsed.era;

          if (!map.has(key)) {
            map.set(key, {
              id: key,
              name: locationInfo.displayName.replace(/_/g, " "),
              location: locationInfo.location,
              era: era,
              buildings: [],
            });
          }

          map.get(key)!.buildings.push({
            id: b.id,
            name: buildingNoLvl.includes(parsed.section3.toLowerCase())
              ? parsed.buildingName
              : `${parsed.buildingName} – Lvl ${parsed.level}`,
            parsed: parsed,
            costs: b.costs,
            quantity: b.quantity,
            maxQty: b.maxQty,
            image: getBuildingImageUrl(
              parsed.section3,
              parsed.level,
              parsed.section2
            ),
          });
        });

        // Traiter les technos - créer une seule catégorie Technologies avec plusieurs cartes par ère
        const allTechnosByEra: TechnoCardData[] = [];

        // Obtenir l'ordre des eras à partir du tableau eras
        const eraOrder = eras.map((era) => era.abbr);

        // Créer un mapping des noms d'ères normalisés vers les abréviations
        const eraNameToAbbr: Record<string, string> = {};
        eras.forEach((era) => {
          eraNameToAbbr[era.id] = era.abbr;
        });

        // Trier les clés (ères) selon l'ordre défini dans constants.ts
        const sortedEras = Object.keys(technosData.technos).sort((a, b) => {
          const abbrA = eraNameToAbbr[a] || a;
          const abbrB = eraNameToAbbr[b] || b;

          const indexA = eraOrder.indexOf(abbrA as (typeof eras)[0]["abbr"]);
          const indexB = eraOrder.indexOf(abbrB as (typeof eras)[0]["abbr"]);

          // Si les deux sont dans la liste des eras, trier selon leur ordre
          if (indexA !== -1 && indexB !== -1) {
            return indexA - indexB;
          }

          // Si seulement un est dans la liste, mettre celui qui est dans la liste en premier
          if (indexA !== -1) return -1;
          if (indexB !== -1) return 1;

          // Si aucun n'est dans la liste, trier alphabétiquement
          return a.localeCompare(b);
        });

        // Traiter les technos dans l'ordre trié
        sortedEras.forEach((era) => {
          const technosInEra = technosData.technos[era];
          if (!technosInEra || Object.keys(technosInEra).length === 0) return;

          const aggregatedData: AggregatedTechnoData = {
            totalResearch: 0,
            totalCoins: 0,
            totalFood: 0,
            goods: [],
            technoCount: 0,
          };

          // Agréger les données pour cette ère
          Object.values(technosInEra).forEach((techno) => {
            aggregatedData.technoCount++;

            // Agréger les coûts
            if (
              techno.costs.research &&
              typeof techno.costs.research === "number"
            ) {
              aggregatedData.totalResearch += techno.costs.research;
            }

            if (techno.costs.coins && typeof techno.costs.coins === "number") {
              aggregatedData.totalCoins += techno.costs.coins;
            }

            if (techno.costs.food && typeof techno.costs.food === "number") {
              aggregatedData.totalFood += techno.costs.food;
            }

            // Agréger les goods
            if (techno.costs.goods && Array.isArray(techno.costs.goods)) {
              techno.costs.goods.forEach((good: any) => {
                const existingGood = aggregatedData.goods.find(
                  (g) => g.type === good.type
                );
                if (existingGood) {
                  existingGood.amount += good.amount;
                } else {
                  aggregatedData.goods.push({ ...good });
                }
              });
            }
          });

          // Ajouter une carte pour cette ère
          allTechnosByEra.push({
            id: `technos-${era}`,
            era: era,
            parsed: {
              id: `technos-${era}`,
              mainSection: "",
              subSection: "",
              thirdSection: "",
              era: era,
              index: "",
            },
            aggregatedData: aggregatedData,
          });
        });

        // Créer une seule catégorie pour toutes les technos si yen a
        if (allTechnosByEra.length > 0) {
          map.set("technos-all", {
            id: "technos-all",
            name: "Technologies",
            location: "Technologies",
            era: "All",
            buildings: [],
            technos: allTechnosByEra,
          });
        }

        // Tri des catégories par location puis par nom de building (Capital d'abord, puis autres villes par ordre alphabétique)
        const categories = Array.from(map.values());

        // Tri des buildings par level croissant dans chaque catégorie
        categories.forEach((category) => {
          category.buildings.sort(
            (a, b) => parseInt(a.parsed.level) - parseInt(b.parsed.level)
          );
        });

        categories.sort((a, b) => {
          // Technologies toujours en premier
          if (a.location === "Technologies" && b.location !== "Technologies")
            return -1;
          if (a.location !== "Technologies" && b.location === "Technologies")
            return 1;

          // Capital toujours en deuxième
          if (a.location === "Capital" && b.location !== "Capital") return -1;
          if (a.location !== "Capital" && b.location === "Capital") return 1;

          // Si même location, tri par nom de building
          if (a.location === b.location) {
            return a.name.localeCompare(b.name);
          }

          // Sinon, ordre alphabétique pour les autres villes
          return a.location.localeCompare(b.location);
        });

        return categories;
      },
      [externalFilters]
    );

    useEffect(() => {
      let unwatchBuildings: (() => void) | undefined;
      let unwatchTechnos: (() => void) | undefined;

      async function init() {
        const buildingsData = await loadSavedBuildings();
        const technosData = await loadSavedTechnos();
        const newCategories = transformData(buildingsData, technosData);
        setCategories(newCategories);

        setLoading(false);

        unwatchBuildings = watchSavedBuildings(async (newBuildingsData) => {
          const currentTechnosData = await loadSavedTechnos();
          const updatedCategories = transformData(
            newBuildingsData,
            currentTechnosData
          );
          setCategories(updatedCategories);
        });

        unwatchTechnos = watchSavedTechnos(async (newTechnosData) => {
          const currentBuildingsData = await loadSavedBuildings();
          const updatedCategories = transformData(
            currentBuildingsData,
            newTechnosData
          );
          setCategories(updatedCategories);
          // Garder les accordions ouverts quand les données changent
          setExpandedItems(updatedCategories.map((c) => c.id));
        });
      }

      init();
      return () => {
        unwatchBuildings?.();
        unwatchTechnos?.();
      };
    }, [transformData]);

    if (loading)
      return (
        <div className="p-4 flex items-center justify-center">
          <Loader2Icon className="size-5 animate-spin" />
        </div>
      );

    if (categories.length === 0) {
      return (
        <div className="p-8 size-full m-auto flex items-center justify-center bg-background-200">
          <EmptyOutline perso="male" type="building" />
        </div>
      );
    }

    return (
      <div className="w-full">
        <Accordion
          type="multiple"
          value={expandedItems}
          onValueChange={setExpandedItems}
          // defaultValue={categories.map((c) => c.id)}
          className="w-full space-y-2 p-3"
        >
          {categories.map((category) => (
            <AccordionItem
              key={category.id}
              value={category.id}
              className="rounded-md border bg-background-200 px-4 py-2 border-alpha-300"
            >
              <AccordionTrigger className="hover:no-underline [&>svg]:-order-1 justify-start gap-3 py-1 text-sm">
                <div className="flex justify-between items-center w-full">
                  <span className="capitalize">
                    {category.location === "Capital"
                      ? `${category.name} - ${category.location}`
                      : category.name}
                  </span>
                  <Badge
                    variant="outline"
                    className="bg-background-300 rounded-sm h-6 px-2 text-sm border-alpha-400 "
                  >
                    {category.buildings.length +
                      (category.technos?.length || 0)}{" "}
                    selected
                  </Badge>
                </div>
              </AccordionTrigger>

              <AccordionContent className="space-y-3 pt-3 2xl:ps-6">
                {category.buildings.map((b) => (
                  <BuildingCard
                    key={b.id}
                    building={b}
                    userSelections={selections}
                    onRemove={handleRemove}
                    onUpdateQuantity={handleUpdateQuantity}
                  />
                ))}
                {category.technos?.map((t) => (
                  <TechnoCard
                    key={t.id}
                    aggregatedTechnos={t.aggregatedData}
                    userSelections={selections}
                    onRemoveAll={() => handleRemoveTechno(t.id)}
                    era={t.era}
                  />
                ))}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    );
  }
);

export const BuildingList = BuildingListWithRef;
