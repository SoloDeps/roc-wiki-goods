import { memo, useMemo, useCallback, useState } from "react";
import { X, EyeOff, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  questsFormatNumber,
  slugify,
  getGoodNameFromPriorityEra,
  getItemIconLocal,
} from "@/lib/utils";
import { ResourceBadge } from "./resource-badge";
import { cn } from "@/lib/utils";

interface Good {
  type: string;
  amount: number;
}

interface TradePostCardProps {
  tradePost: {
    id: string;
    name: string;
    area: number;
    resource: string;
    levels: {
      unlock: boolean;
      lvl2: boolean;
      lvl3: boolean;
      lvl4: boolean;
      lvl5: boolean;
    };
    costs: Record<string, number | Good[]>;
    sourceData?: {
      levels: {
        [key: number]: Array<{ resource: string; amount: number }>;
      };
    };
    hidden?: boolean;
  };
  userSelections: string[][];
  onRemove: (id: string) => void;
  onToggleHidden: (id: string) => void;
  onToggleLevel: (
    id: string,
    level: keyof TradePostCardProps["tradePost"]["levels"],
  ) => void;
}

export const TradePostCard = memo(function TradePostCard({
  tradePost,
  userSelections,
  onRemove,
  onToggleHidden,
  onToggleLevel,
}: TradePostCardProps) {
  const { id, name, area, resource, levels, costs, hidden } = tradePost;
  const [isHovered, setIsHovered] = useState(false);

  const handleRemove = useCallback(() => onRemove(id), [id, onRemove]);
  const handleToggleHidden = useCallback(
    () => onToggleHidden(id),
    [id, onToggleHidden],
  );

  const mainResources = useMemo(
    () =>
      Object.entries(costs)
        .filter(
          (entry): entry is [string, number] =>
            entry[0] !== "goods" && typeof entry[1] === "number",
        )
        .map(([type, value]) => ({
          type,
          value,
          icon: getItemIconLocal(type),
        })),
    [costs],
  );

  const goodsBadges = useMemo(() => {
    const goods = costs.goods as Good[] | undefined;

    // Si goods est vide ou n'existe pas, retourner un badge par défaut
    if (!goods?.length) {
      return (
        <ResourceBadge icon="/goods/default.webp" value="0" alt="No goods" />
      );
    }

    return goods.map((g, i) => {
      const match = g.type.match(/^(Primary|Secondary|Tertiary)_([A-Z]{2})$/i);
      let goodName = g.type;

      if (match) {
        const [, priority, era] = match;
        const resolvedName = getGoodNameFromPriorityEra(
          priority,
          era,
          userSelections,
        );
        if (resolvedName) {
          goodName = resolvedName;
        }
      }

      return (
        <ResourceBadge
          key={`${g.type}-${i}`}
          icon={`/goods/${slugify(goodName)}.webp`}
          value={questsFormatNumber(g.amount)}
          alt={g.type}
        />
      );
    });
  }, [costs.goods, userSelections]);

  const resourceIcon = useMemo(() => {
    return getItemIconLocal(resource);
  }, [resource]);

  const levelButtons = useMemo(() => {
    const buttons = [
      { key: "unlock" as const, label: "Unlock" },
      { key: "lvl2" as const, label: "Lvl 2" },
      { key: "lvl3" as const, label: "Lvl 3" },
      { key: "lvl4" as const, label: "Lvl 4" },
      { key: "lvl5" as const, label: "Lvl 5" },
    ];

    // ✅ Check if sourceData.levels[1] exists and has items
    const hasUnlockData = (tradePost.sourceData?.levels?.[1]?.length ?? 0) > 0;

    if (!hasUnlockData) {
      // Remove the unlock button if level 1 has no data
      return buttons.slice(1);
    }

    return buttons;
  }, [tradePost.sourceData]);

  return (
    <div
      className={`@container/bcard group relative flex flex-col gap-2 rounded-sm bg-background-300 border min-h-32`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Hidden overlay */}
      {hidden && (
        <div
          className="absolute inset-0 pointer-events-none opacity-50 rounded-sm"
          style={{
            backgroundImage: `repeating-linear-gradient(
              45deg,
              var(--gray-400) 0,
              var(--gray-400) 1px,
              transparent 0,
              transparent 50%
            )`,
            backgroundSize: "10px 10px",
            backgroundAttachment: "fixed",
          }}
        />
      )}

      <div className="flex p-3 pb-2 gap-2 lg:gap-4 size-full relative">
        <div className="flex-1">
          <div className="flex justify-between items-center mb-3">
            <div className="flex items-center gap-2">
              {/* Image de la ressource */}
              <img
                src={resourceIcon}
                alt={resource}
                className="size-6 select-none"
                draggable={false}
                onError={(e) => {
                  e.currentTarget.src = "/goods/default.webp";
                }}
              />

              <h3
                className={`text-sm lg:text-[15px] font-medium truncate capitalize ${hidden ? "opacity-50" : ""}`}
              >
                {name}
              </h3>
              <div className={hidden ? "opacity-50" : ""}>
                <Badge
                  variant="outline"
                  className="bg-purple-200 dark:bg-purple-300 text-purple-950 border-alpha-100 border rounded-sm"
                >
                  Area {area}
                </Badge>
              </div>

              <div
                className={`transition-opacity duration-200 ${
                  hidden
                    ? "opacity-100"
                    : isHovered
                      ? "opacity-100"
                      : "opacity-0 pointer-events-none"
                }`}
              >
                <Button
                  size="sm"
                  variant={hidden ? "outline" : "ghost"}
                  className="rounded-sm h-6"
                  onClick={handleToggleHidden}
                  title={
                    hidden
                      ? "Include in total calculation"
                      : "Exclude from total calculation"
                  }
                >
                  {hidden ? (
                    <Eye className="size-4" />
                  ) : (
                    <EyeOff className="size-4" />
                  )}
                  <span className="hidden md:inline-block">
                    {hidden ? "Show" : "Hide"}
                  </span>
                </Button>
              </div>
            </div>

            <Button
              size="icon-sm"
              variant="destructive"
              className="rounded-sm size-6"
              onClick={!hidden ? handleRemove : undefined}
            >
              <X className="size-4 stroke-3" />
            </Button>
          </div>

          <div
            className={`grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-1.5 text-sm w-full ${hidden ? "opacity-50" : ""}`}
          >
            {mainResources.map((r) => (
              <ResourceBadge
                key={r.type}
                icon={r.icon}
                value={questsFormatNumber(r.value)}
                alt={r.type}
              />
            ))}
            {goodsBadges}
          </div>
        </div>
      </div>

      {/* Level selection buttons with checkbox style */}
      <div className={`flex gap-2 px-3 pb-3 ${hidden ? "opacity-50" : ""}`}>
        {levelButtons.map(({ key, label }) => (
          <Label
            key={key}
            className={cn(
              "flex-1 bg-background-100 hover:bg-accent/70 transition-all flex items-center justify-center gap-2.5 rounded-sm border p-2 cursor-pointer h-8",
              levels[key] && "beta-badge border-blue-300 dark:border-blue-900",
              hidden && "cursor-not-allowed opacity-50",
            )}
          >
            <Checkbox
              checked={levels[key]}
              onCheckedChange={() => !hidden && onToggleLevel(id, key)}
              disabled={hidden}
              className={cn(
                "data-[state=checked]:border-blue-600 data-[state=checked]:bg-blue-600 data-[state=checked]:text-white dark:data-[state=checked]:border-blue-700 dark:data-[state=checked]:bg-blue-800",
              )}
            />
            <span className="text-xs font-medium">{label}</span>
          </Label>
        ))}
      </div>
    </div>
  );
});
