import { Minus, Plus, X } from "lucide-react";
import { Button } from "./ui/button";
import {
  formatNumber,
  getBuildingImageUrl,
  getGoodImageUrlFromType,
} from "@/lib/utils";
import { itemsUrl, WIKI_URL } from "@/lib/constants";

interface Good {
  type: string;
  amount: number;
}

interface Building {
  id: string;
  name: string;
  coin: string;
  food: string;
  goods: Good[];
  quantity: number;
  image: string;
  era: string;
  level: string;
}

interface BuildingCardProps {
  building: Building;
  userSelections: string[][];
  onRemove: (id: string) => void;
  onUpdateQuantity: (id: string, quantity: number) => void;
}

export function BuildingCard({
  building,
  userSelections,
  onRemove,
  onUpdateQuantity,
}: BuildingCardProps) {
  const { id, name, coin, food, goods, quantity, image, level } = building;

  const handleQuantityChange = (delta: number) => {
    const newQty = quantity + delta;
    if (newQty > 0) onUpdateQuantity(id, newQty);
  };

  return (
    <div className="flex items-center gap-4 rounded-lg bg-muted/50 border h-32 pl-2">
      {/* Image */}
      <div className="hidden sm:flex h-full w-32 shrink-0 items-center justify-center overflow-hidden">
        <img
          src={image}
          alt={name}
          className="size-full object-cover brightness-105"
        />
      </div>

      {/* Contenu principal */}
      <div className="flex gap-4 size-full">
        <div className="flex-1 py-3">
          <h3 className="mb-3 text-[15px] font-medium truncate capitalize">
            {name}
          </h3>

          <div className="grid grid-cols-3 gap-1.5 text-sm max-w-80">
            <ResourceBadge
              icon={`https://${WIKI_URL}${itemsUrl.coins}`}
              value={coin}
              alt="Coins"
            />
            <ResourceBadge
              icon={`https://${WIKI_URL}${itemsUrl.food}`}
              value={food}
              alt="Food"
            />

            {/* Goods */}
            {goods.map((good, index) => {
              const iconPath =
              "https://" +
              WIKI_URL +
              getGoodImageUrlFromType(good.type, userSelections);
              
              console.log(iconPath);
              return (
                <ResourceBadge
                  key={`${good.type}-${index}`}
                  icon={iconPath}
                  value={formatNumber(good.amount * building.quantity)}
                  alt={good.type}
                />
              );
            })}
          </div>
        </div>

        {/* Contrôles */}
        <div className="flex flex-col items-end justify-between shrink-0 py-3 pr-3">
          <Button
            size="icon-sm"
            variant="destructive"
            onClick={() => onRemove(id)}
          >
            <X className="size-4" />
          </Button>

          <div className="flex items-center gap-2 ml-4">
            <Button
              size="icon-sm"
              disabled={quantity <= 1}
              onClick={() => handleQuantityChange(-1)}
            >
              <Minus className="size-4" />
            </Button>
            <span className="w-6 text-center font-medium">{quantity}</span>
            <Button size="icon-sm" onClick={() => handleQuantityChange(1)}>
              <Plus className="size-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

function ResourceBadge({
  icon,
  value,
  alt,
}: {
  icon: string;
  value: string;
  alt: string;
}) {
  return (
    <div className="flex items-center justify-between px-2 rounded-md bg-black/10 h-8">
      <img src={icon} alt={alt} className="size-6" />
      <span className="text-[13px] font-medium">{value}</span>
    </div>
  );
}
