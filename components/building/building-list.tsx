import { useState, useEffect, useCallback } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { BuildingCard } from "@/components/building/building-card";
import { Badge } from "@/components/ui/badge";
import { useBuildingSelections } from "@/hooks/useBuildingSelections";
import {
  loadSavedBuildings,
  watchSavedBuildings,
  removeBuilding,
  updateBuildingQuantity,
  type SavedData,
} from "@/lib/overview/storage";
import { getBuildingImageUrl } from "@/lib/utils";
import { parseBuildingId } from "@/lib/overview/parseBuildingId";

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
  buildings: BuildingCardData[];
}

export default function BuildingList() {
  const [categories, setCategories] = useState<BuildingCategory[]>([]);
  const [loading, setLoading] = useState(true);

  const { selections } = useBuildingSelections();

  const handleRemove = useCallback(async (id: string) => {
    await removeBuilding(id);
  }, []);

  const handleUpdateQuantity = useCallback(async (id: string, qty: number) => {
    await updateBuildingQuantity(id, qty);
  }, []);

  const transformData = useCallback((data: SavedData): BuildingCategory[] => {
    const map = new Map<string, BuildingCategory>();

    data.buildings.forEach((b) => {
      const parsed = parseBuildingId(b.id);
      const key = parsed.buildingName;

      if (!map.has(key)) {
        map.set(key, {
          id: key,
          name: key.replace(/_/g, " "),
          buildings: [],
        });
      }

      map.get(key)!.buildings.push({
        id: b.id,
        name: `${parsed.buildingName} – Lvl ${parsed.level}`,
        parsed,
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

    // Tri par level
    map.forEach((cat) => {
      cat.buildings.sort(
        (a, b) => Number(a.parsed.level) - Number(b.parsed.level)
      );
    });

    return Array.from(map.values());
  }, []);

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
      <p className="text-center py-8 text-muted-foreground">
        No buildings saved yet.
      </p>
    );
  }

  return (
    <Accordion
      type="multiple"
      defaultValue={categories.map((c) => c.id)}
      className="w-full space-y-2 p-3"
    >
      {categories.map((category) => (
        <AccordionItem
          key={category.id}
          value={category.id}
          className="rounded-lg border bg-background px-4 py-2"
        >
          <AccordionTrigger className="hover:no-underline [&>svg]:-order-1 justify-start gap-3 py-1 text-sm">
            <div className="flex justify-between items-center w-full">
              <span className="capitalize">{category.name}</span>
              <Badge variant="outline">{category.buildings.length}</Badge>
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
  );
}
