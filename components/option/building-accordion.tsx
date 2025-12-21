import { useState, useEffect } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { BuildingCard } from "@/components/building-card";
import { Button } from "@/components/ui/button";
import { PlusIcon } from "lucide-react";
import {
  loadSavedBuildings,
  watchSavedBuildings,
  removeBuilding,
  updateBuildingQuantity,
  type SavedData,
} from "@/lib/overview/storage";
import { formatNumber, getBuildingImageUrl } from "@/lib/utils";
import { buildingsAbbr } from "@/lib/constants";

interface BuildingCategory {
  id: string;
  name: string;
  count: number;
  buildings: Array<{
    id: string;
    name: string;
    coin: string;
    food: string;
    goods: Array<{ type: string; amount: number }>;
    quantity: number;
    image: string;
    era: string;
    level: string;
  }>;
}

export default function BuildingList() {
  const [categories, setCategories] = useState<BuildingCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // ✅ Charge les sélections une seule fois et les partage aux composants enfants
  const [userSelections] = useState<string[][]>(() => {
    const saved = localStorage.getItem("buildingSelections");
    return saved ? JSON.parse(saved) : buildingsAbbr.map(() => ["", "", ""]);
  });  

  useEffect(() => {
    let unwatch: (() => void) | null = null;

    const loadData = async () => {
      const data = await loadSavedBuildings();
      setCategories(transformDataToCategories(data));
      setIsLoading(false);

      unwatch = watchSavedBuildings((newData) => {
        setCategories(transformDataToCategories(newData));
      });
    };

    loadData();
    return () => unwatch?.();
  }, []);

  // 💡 Transforme les données "brutes" du storage en structure propre pour le rendu
  const transformDataToCategories = (data: SavedData): BuildingCategory[] => {
    const map = new Map<string, BuildingCategory>();

    data.buildings.forEach((b) => {
      if (!map.has(b.buildingName)) {
        map.set(b.buildingName, {
          id: b.buildingName,
          name: b.buildingName.replace(/_/g, " "),
          count: 0,
          buildings: [],
        });
      }

      const entry = map.get(b.buildingName)!;
      entry.buildings.push({
        id: b.id,
        name: `${b.buildingName.replace(/_/g, " ")} – lvl ${b.level}`,
        coin: formatNumber((b.costs.coins ?? 0) * b.quantity),
        food: formatNumber((b.costs.food ?? 0) * b.quantity),
        goods: b.costs.goods || [],
        quantity: b.quantity,
        image: getBuildingImageUrl(b.buildingName, b.level),
        era: b.era,
        level: b.level,
      });
      entry.count = entry.buildings.length;
    });

    return Array.from(map.values());
  };

  const handleRemoveBuilding = async (
    categoryId: string,
    buildingId: string
  ) => {
    try {
      await removeBuilding(buildingId);
    } catch (error) {
      console.error("Error removing building:", error);
    }
  };

  const handleUpdateQuantity = async (
    categoryId: string,
    buildingId: string,
    quantity: number
  ) => {
    if (quantity < 1) return;
    try {
      await updateBuildingQuantity(buildingId, quantity);
    } catch (error) {
      console.error("Error updating quantity:", error);
    }
  };

  if (isLoading) return <div className="p-4">Loading...</div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-base font-semibold">Building List</h1>
        <Button size="sm">
          <PlusIcon /> Add building
        </Button>
      </div>

      {categories.length === 0 ? (
        <p className="text-gray-500 text-center py-8">
          No buildings saved yet. Visit the wiki to add buildings.
        </p>
      ) : (
        <Accordion
          type="multiple"
          className="w-full space-y-2"
          defaultValue={categories.map((c) => c.id)}
        >
          {categories.map((category) => (
            <AccordionItem
              key={category.id}
              value={category.id}
              className="rounded-lg bg-background border px-4 py-2"
            >
              <AccordionTrigger className="hover:no-underline [&>svg]:-order-1 justify-start gap-3 py-2 text-sm capitalize">
                {category.name} - {category.count} selected
              </AccordionTrigger>
              <AccordionContent className="space-y-3 pt-3 ps-7">
                {category.buildings.map((building) => (
                  <BuildingCard
                    key={building.id}
                    building={building}
                    userSelections={userSelections}
                    onRemove={(id) => handleRemoveBuilding(category.id, id)}
                    onUpdateQuantity={(id, qty) =>
                      handleUpdateQuantity(category.id, id, qty)
                    }
                  />
                ))}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      )}
    </div>
  );
}
