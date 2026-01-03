import { Badge } from "@/components/ui/badge";
import { WIKI_URL } from "@/lib/constants";
import { getGoodImageUrlFromType } from "@/lib/utils";
import { type SavedTechno } from "@/lib/overview/storage";

interface TechnoCardProps {
  techno: SavedTechno;
}

export function TechnoCard({ techno }: TechnoCardProps) {
  const costs = techno.costs;

  // Extraire les ressources principales
  const research = (costs.research as number) || 0;
  const gold = (costs.gold as number) || (costs.coins as number) || 0;
  const food = (costs.food as number) || 0;
  const goods = (costs.goods as Array<{ type: string; amount: number }>) || [];

  const hasResources = research > 0 || gold > 0 || food > 0;
  const hasGoods = goods.length > 0;

  // Extraire le nom depuis l'ID
  const name = techno.id
    .replace("techno_", "")
    .replace(/_/g, " ")
    .replace(/\b\w/g, (l) => l.toUpperCase());

  return (
    <div className="w-full border rounded-lg bg-card text-card-foreground shadow-sm">
      <div className="flex flex-col space-y-1.5 p-4 pb-2">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium leading-none">{name}</h3>
          <Badge variant="secondary" className="text-xs">
            Technology
          </Badge>
        </div>
      </div>
      <div className="p-4 pt-0 space-y-3">
        {hasResources && (
          <div className="flex flex-wrap gap-2">
            {research > 0 && (
              <div className="flex items-center gap-1 text-xs">
                <img
                  src={`${WIKI_URL}/images/thumb/2/20/Research.png/16px-Research.png`}
                  alt="Research"
                  width={16}
                  height={16}
                />
                <span>{research.toLocaleString()}</span>
              </div>
            )}
            {gold > 0 && (
              <div className="flex items-center gap-1 text-xs">
                <img
                  src={`${WIKI_URL}/images/thumb/6/6d/Coin.png/16px-Coin.png`}
                  alt="Gold"
                  width={16}
                  height={16}
                />
                <span>{gold.toLocaleString()}</span>
              </div>
            )}
            {food > 0 && (
              <div className="flex items-center gap-1 text-xs">
                <img
                  src={`${WIKI_URL}/images/thumb/c/c6/Food.png/16px-Food.png`}
                  alt="Food"
                  width={16}
                  height={16}
                />
                <span>{food.toLocaleString()}</span>
              </div>
            )}
          </div>
        )}

        {hasGoods && (
          <div className="space-y-2">
            <div className="text-xs font-medium text-muted-foreground">
              Goods:
            </div>
            <div className="flex flex-wrap gap-2">
              {goods.map((good, index) => (
                <div key={index} className="flex items-center gap-1 text-xs">
                  <img
                    src={getGoodImageUrlFromType(good.type, [])}
                    alt={good.type}
                    width={16}
                    height={16}
                  />
                  <span>{good.amount.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
