import { useState } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

// Composant de carte de bâtiment
import { BuildingCard } from "@/components/building-card";
import { Button } from "../ui/button";
import { PlusIcon } from "lucide-react";

// Données d'exemple
const buildingCategories = [
  {
    id: "rural-farm",
    name: "Rural Farm",
    count: 2,
    buildings: [
      {
        id: "rf-38",
        name: "Rural Farm lvl 34",
        coin: "12M",
        food: "20M",
        pri: "5.5k",
        sec: "5.5k",
        ter: "5.5k",
        quantity: 9,
        image:
          "https://riseofcultures.wiki.gg/images/thumb/Capital_Rural_Farm_Lv34.png/200px-Capital_Rural_Farm_Lv34.png",
      },
      {
        id: "rf-39",
        name: "Rural Farm lvl 36",
        coin: "12M",
        food: "20M",
        pri: "5.5k",
        sec: "5.5k",
        ter: "5.5k",
        quantity: 10,
        image:
          "https://riseofcultures.wiki.gg/images/thumb/Capital_Rural_Farm_Lv36.png/200px-Capital_Rural_Farm_Lv36.png",
      },
    ],
  },
  {
    id: "Domestic-farm",
    name: "Domestic Farm",
    count: 1,
    buildings: [
      {
        id: "uf-40",
        name: "Domestic Farm lvl 36",
        coin: "15M",
        food: "25M",
        pri: "6k",
        sec: "6k",
        ter: "6k",
        quantity: 5,
        image:
          "https://riseofcultures.wiki.gg/images/thumb/Capital_Domestic_Farm_Lv36.png/200px-Capital_Domestic_Farm_Lv36.png",
      },
    ],
  },
];

export default function BuildingList() {
  const [categories, setCategories] = useState(buildingCategories);

  const handleRemoveBuilding = (categoryId: any, buildingId: any) => {
    setCategories(
      categories.map((cat) => {
        if (cat.id === categoryId) {
          return {
            ...cat,
            buildings: cat.buildings.filter((b) => b.id !== buildingId),
            count: cat.buildings.filter((b) => b.id !== buildingId).length,
          };
        }
        return cat;
      })
    );
  };

  const handleUpdateQuantity = (
    categoryId: any,
    buildingId: any,
    newQuantity: any
  ) => {
    if (newQuantity < 1) return;
    setCategories(
      categories.map((cat) => {
        if (cat.id === categoryId) {
          return {
            ...cat,
            buildings: cat.buildings.map((b) =>
              b.id === buildingId ? { ...b, quantity: newQuantity } : b
            ),
          };
        }
        return cat;
      })
    );
  };

  return (
    <div className="space-y-4">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <h1 className="text-base font-semibold">Building List</h1>
        <Button size="sm">
          <PlusIcon /> Add building
        </Button>
      </div>

      {/* Accordéons */}
      <Accordion type="multiple" className="w-full space-y-2">
        {categories.map((category) => (
          <AccordionItem
            key={category.id}
            value={category.id}
            className="rounded-lg bg-background border px-4 py-2"
          >
            <AccordionTrigger className="hover:no-underline [&>svg]:-order-1 justify-start gap-3 py-2 text-sm">
              {category.name} - {category.count} selected
            </AccordionTrigger>
            <AccordionContent className="space-y-3 pt-3 ps-7">
              {category.buildings.map((building) => (
                <BuildingCard
                  key={building.id}
                  building={building}
                  onRemove={(id: any) => handleRemoveBuilding(category.id, id)}
                  onUpdateQuantity={(id: any, qty: any) =>
                    handleUpdateQuantity(category.id, id, qty)
                  }
                />
              ))}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}
