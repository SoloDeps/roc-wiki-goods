import { Minus, Plus, X } from "lucide-react";
import { Button } from "./ui/button";

export function BuildingCard({ building, onRemove, onUpdateQuantity }: any) {
  return (
    <div className="flex items-center gap-4 rounded-lg bg-muted/50 border h-32 pl-2">
      {/* Image placeholder */}
      <div className="hidden sm:flex h-full w-32 shrink-0 items-center justify-center">
        <img
          src={building.image}
          alt={building.name}
          className="size-full object-cover brightness-105"
        />
      </div>

      {/* Informations du bâtiment */}
      <div className="flex gap-4 size-full">
        <div className="flex-1 py-3">
          <h3 className="mb-3 text-[15px] font-medium">{building.name}</h3>
          <div className="grid grid-cols-3 gap-1.5 text-sm w-80">
            <div className="flex items-center justify-between px-2 rounded-md bg-black/10 h-8">
              <img
                alt=""
                src="https://riseofcultures.wiki.gg/images/thumb/Coin.png/22px-Coin.png"
              />
              <span>{building.coin}</span>
            </div>
            <div className="flex items-center justify-between px-2 rounded-md bg-black/10 h-8">
              <img
                alt=""
                src="https://riseofcultures.wiki.gg/images/thumb/Food.png/22px-Food.png"
              />
              <span>{building.food}</span>
            </div>
            <div className="flex items-center justify-between px-2 rounded-md bg-black/10 h-8">
              <img
                alt=""
                src="https://riseofcultures.wiki.gg/images/thumb/1/15/Wardrobe.png/22px-Wardrobe.png"
              />
              <span>{building.pri}</span>
            </div>
            <div className="flex items-center justify-between px-2 rounded-md bg-black/10 h-8">
              <img
                alt=""
                src="https://riseofcultures.wiki.gg/images/thumb/Coffee.png/22px-Coffee.png?8c3e74"
              />
              <span>{building.pri}</span>
            </div>
            <div className="flex items-center justify-between px-2 rounded-md bg-black/10 h-8">
              <img
                alt=""
                src="https://riseofcultures.wiki.gg/images/thumb/Incense.png/22px-Incense.png?1b3be8"
              />
              <span>{building.pri}</span>
            </div>
          </div>
        </div>

        {/* Contrôles de quantité */}
        <div className="flex flex-col items-end justify-between shrink-0 py-3 pr-3">
          <Button
            size="icon-sm"
            variant="destructive"
            onClick={() => onRemove(building.id)}
          >
            <X />
          </Button>

          <div className="flex items-center gap-2">
            <Button
              size="icon-sm"
              onClick={() =>
                onUpdateQuantity(building.id, building.quantity - 1)
              }
            >
              <Minus />
            </Button>
            <span className="w-5 text-center">{building.quantity}</span>
            <Button
              size="icon-sm"
              onClick={() =>
                onUpdateQuantity(building.id, building.quantity + 1)
              }
            >
              <Plus />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}