import { memo, useMemo, useCallback, useState } from "react";
import { X, EyeOff, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  questsFormatNumber,
  slugify,
  getGoodNameFromPriorityEra,
  getItemIconLocal,
} from "@/lib/utils";
import { ResourceBadge } from "./resource-badge";

interface Good {
  type: string;
  amount: number;
}

interface AreaCardProps {
  area: {
    id: string;
    areaIndex: number;
    costs: Record<string, number | Good[]>;
    hidden?: boolean;
  };
  userSelections: string[][];
  onRemove: (id: string) => void;
  onToggleHidden: (id: string) => void;
}

export const AreaCard = memo(function AreaCard({
  area,
  userSelections,
  onRemove,
  onToggleHidden,
}: AreaCardProps) {
  const { id, areaIndex, costs, hidden } = area;
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
    if (!goods?.length) return null;

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

  return (
    <div
      className={`@container/bcard group flex items-center justify-center rounded-sm bg-background-300 border min-h-32 pl-1 relative ${
        hidden ? "" : ""
      }`}
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

      <div className="hidden md:flex size-28 shrink-0 overflow-hidden relative">
        <div className="size-full flex items-center justify-center bg-background-400/50">
          <img
            src="/svg/map.svg"
            alt="Map"
            draggable={false}
            className={`size-16 object-contain opacity-30 select-none dark:invert-60 ${hidden ? "opacity-30" : ""}`}
          />
        </div>
      </div>

      <div className="flex p-3 size-full relative self-start">
        <div className="flex-1 h-full">
          <div className="flex justify-between items-center mb-3">
            <div className="flex items-center gap-2">
              <h3
                className={`text-sm lg:text-[15px] font-medium truncate capitalize pl-1 ${hidden ? "opacity-50" : ""}`}
              >
                Area {areaIndex}
              </h3>
              <div className={hidden ? "opacity-50" : ""}>
                <Badge
                  variant="outline"
                  className="bg-green-200 dark:bg-green-300 text-green-950 border-alpha-100 border rounded-sm"
                >
                  Area
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
            className={`grid grid-cols-2 sm:grid-cols-3 gap-1.5 text-sm w-60 sm:w-80 ${hidden ? "opacity-60 pointer-events-none select-none" : ""}`}
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
    </div>
  );
});
