import { useState, useCallback, useMemo, useEffect } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { BuildingCard } from "@/components/building/building-card";
import { useBuildingSelections } from "@/hooks/useBuildingSelections";
import {
  loadSavedBuildings,
  watchSavedBuildings,
  removeBuilding,
  updateBuildingQuantity,
  type SavedData,
} from "@/lib/overview/storage";
import { getBuildingImageUrl, buildingNoLvl } from "@/lib/utils";
import { parseBuildingId } from "@/lib/overview/parseBuildingId";

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

interface BuildingCategory {
  id: string; // buildingName
  name: string;
  location: string;
  era: string; // era abbreviation
  buildings: BuildingCardData[];
}

interface BuildingListProps {
  filters?: {
    tableType?: "construction" | "upgrade";
    location?: string;
  };
}

export default function BuildingList({
  filters: externalFilters,
}: BuildingListProps = {}) {
  const [categories, setCategories] = useState<BuildingCategory[]>([]);
  const [loading, setLoading] = useState(true);

  const { selections } = useBuildingSelections();

  const handleRemove = useCallback(async (id: string) => {
    await removeBuilding(id);
  }, []);

  const handleUpdateQuantity = useCallback(async (id: string, qty: number) => {
    await updateBuildingQuantity(id, qty);
  }, []);

  const transformData = useCallback(
    (data: SavedData): BuildingCategory[] => {
      const map = new Map<string, BuildingCategory>();

      // Filtrer les buildings selon les filtres actifs
      const filteredBuildings = data.buildings.filter((b) => {
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
      });

      filteredBuildings.forEach((b) => {
        const parsed = parseBuildingId(b.id);
        const buildingName = parsed.buildingName;

        const locationInfo = getBuildingLocation(
          parsed.section1,
          parsed.section2,
          buildingName
        );

        const key = buildingName;
        const era = parsed.era;

        if (!map.has(key)) {
          map.set(key, {
            id: key,
            name: key.replace(/_/g, " "),
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

      // Tri des catégories par location puis par nom de building (Capital d'abord, puis autres villes par ordre alphabétique)
      const categories = Array.from(map.values());
      categories.sort((a, b) => {
        // Capital toujours en premier
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
    let unwatch: (() => void) | undefined;

    async function init() {
      const data = await loadSavedBuildings();
      setCategories(transformData(data));
      setLoading(false);

      unwatch = watchSavedBuildings((newData) => {
        setCategories(transformData(newData));
      });
    }

    init();
    return () => unwatch?.();
  }, [transformData]);

  if (loading) return <div className="p-4">Loading…</div>;

  if (categories.length === 0) {
    return (
      <div className="mx-auto w-full flex flex-col gap-4 has-[.chat-warning]:h-full has-[.ignore-max-width]:max-w-none! max-w-[1360px]">
        <div className="flex h-full w-full flex-col">
          <div className="shadow-base bg-v0-background-300 rounded-lg flex size-full flex-1 items-center justify-center p-4 sm:p-6">
            <div className="flex items-center justify-center">
              <div className="flex flex-col items-center gap-4 text-center">
                <div className="text-sm text-v0-gray-900 mt-0">
                  Deleted chats will remain here for 30 days
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <Accordion
        type="multiple"
        defaultValue={categories.map((c) => c.id)}
        className="w-full space-y-2 p-3"
      >
        {categories.map((category) => (
          <AccordionItem
            key={category.id}
            value={category.id}
            className="rounded-md border bg-background-200 px-4 py-2 border-alpha-200"
          >
            <AccordionTrigger className="hover:no-underline [&>svg]:-order-1 justify-start gap-3 py-1 text-sm">
              <div className="flex justify-between items-center w-full">
                <span className="capitalize">
                  {category.name} - {category.location}
                </span>
                <Badge
                  variant="outline"
                  className="bg-background-300 rounded-sm h-6 px-2 text-sm border-alpha-400 "
                >
                  {category.buildings.length} selected
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
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}
