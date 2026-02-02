import { memo, useMemo, useCallback, useState, useEffect, useRef } from "react";
import { X, EyeOff, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ResourceBadge } from "./resource-badge";
import BuildingCounter from "./building-counter";
import {
  getItemIconLocal,
  questsFormatNumber,
  slugify,
  getGoodNameFromPriorityEra,
} from "@/lib/utils";

interface Good {
  type: string;
  amount: number;
}

export const BuildingCard = memo(function BuildingCard({
  building,
  userSelections,
  onRemove,
  onUpdateQuantity,
  onToggleHidden,
}: any) {
  const { id, name, image, costs, quantity, maxQty, parsed, hidden } = building;
  const [localQty, setLocalQty] = useState(quantity);
  const [isHovered, setIsHovered] = useState(false);
  const [imageError, setImageError] = useState(false);
  const updateTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setLocalQty(quantity);
  }, [quantity]);

  useEffect(() => {
    if (localQty === quantity) return;

    if (updateTimeoutRef.current) clearTimeout(updateTimeoutRef.current);
    updateTimeoutRef.current = setTimeout(() => {
      onUpdateQuantity(id, localQty);
    }, 300);

    return () => {
      if (updateTimeoutRef.current) clearTimeout(updateTimeoutRef.current);
    };
  }, [localQty]);

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
        .map(([type, unitValue]) => ({
          type,
          value: unitValue * localQty,
          icon: getItemIconLocal(type),
        })),
    [costs, localQty],
  );

  const goodsBadges = useMemo(() => {
    const goods = costs.goods as Good[] | undefined;
    if (!goods?.length) return null;

    const combined = goods.reduce((map, g) => {
      map.set(g.type, (map.get(g.type) || 0) + g.amount * localQty);
      return map;
    }, new Map<string, number>());

    return Array.from(combined.entries()).map(([type, amount]) => {
      // Utiliser la fonction utils pour obtenir le nom du good
      const match = type.match(/^(Primary|Secondary|Tertiary)_([A-Z]{2})$/i);
      let goodName = type;

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
          key={type}
          icon={`/goods/${slugify(goodName)}.webp`}
          value={questsFormatNumber(amount)}
          alt={type}
        />
      );
    });
  }, [costs.goods, localQty, userSelections]);

  const typeBadge = useMemo(() => {
    const isConstruction = parsed.tableType === "construction";
    return (
      <Badge
        variant="outline"
        className={`rounded-sm ${
          isConstruction
            ? "bg-green-300 dark:bg-green-400 text-green-950"
            : "bg-blue-200 dark:bg-blue-300 text-blue-950"
        } border-alpha-100 border`}
      >
        {isConstruction ? "Construction" : "Upgrade"}
      </Badge>
    );
  }, [parsed.tableType]);

  return (
    <div
      className={`@container/bcard group flex items-center justify-center rounded-sm bg-background-300 border min-h-32 pl-1 relative ${
        hidden ? "" : ""
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Hidden overlay - applied after everything else */}
      {hidden && (
        <div
          className="absolute inset-0 opacity-60 pointer-events-none select-none rounded-sm"
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
        {imageError ? (
          <div className="size-full flex items-center justify-center bg-background-400/50">
            <img
              src="/svg/default_building.svg"
              alt={name}
              draggable={false}
              className={`size-16 object-contain opacity-30 select-none dark:invert-60 ${hidden ? "opacity-30" : ""}`}
            />
          </div>
        ) : (
          <img
            src={image}
            alt={name}
            draggable={false}
            className={`size-full object-cover brightness-105 select-none ${hidden ? "opacity-60 pointer-events-none select-none" : ""}`}
            onError={(e) => {
              setImageError(true);
            }}
          />
        )}
      </div>

      <div className="flex p-3 size-full relative">
        <div className="flex-1">
          <div className="flex mb-3 justify-between">
            <div className="flex items-center gap-2">
              <h3
                className={`text-sm lg:text-[15px] font-medium truncate capitalize ${hidden ? "opacity-60 pointer-events-none select-none" : ""}`}
              >
                {name}
              </h3>
              <div
                className={
                  hidden ? "opacity-60 pointer-events-none select-none" : ""
                }
              >
                {typeBadge}
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

          <div className="flex gap-2 justify-between items-end">
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

            <BuildingCounter
              value={localQty}
              onChange={setLocalQty}
              min={1}
              max={maxQty}
              disabled={hidden}
            />
          </div>
        </div>
      </div>
    </div>
  );
});
