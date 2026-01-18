import { memo, useMemo, useCallback, useState, useEffect, useRef } from "react";
import { X, EyeOff, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ResourceBadge } from "./resource-badge";
import BuildingCounter from "./building-counter";
import { getGoodImageUrlFromType, questsFormatNumber } from "@/lib/utils";
import { itemsUrl, WIKI_URL } from "@/lib/constants";

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
          icon: itemsUrl[type as keyof typeof itemsUrl] ?? itemsUrl.default,
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
      const iconPath =
        getGoodImageUrlFromType(type, userSelections) || itemsUrl.default;
      const fullIconUrl = iconPath.startsWith("http")
        ? iconPath
        : `${WIKI_URL}${iconPath}`;

      return (
        <ResourceBadge
          key={type}
          icon={fullIconUrl}
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
      className={`@container/bcard group flex gap-4 rounded-sm bg-background-300 border h-32 pl-2 relative ${
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

      <div className="hidden md:flex size-28 shrink-0 items-center justify-center overflow-hidden relative">
        <img
          src={image}
          alt={name}
          draggable={false}
          className={`size-full object-cover brightness-105 select-none ${hidden ? "opacity-60 pointer-events-none select-none" : ""}`}
        />
      </div>

      <div className="flex py-3 gap-6 size-full relative">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-3">
            <h3
              className={`text-sm lg:text-[15px] font-medium truncate capitalize ${hidden ? "opacity-60 pointer-events-none select-none" : ""}`}
            >
              {name}
            </h3>
            <div className={hidden ? "opacity-60 pointer-events-none select-none" : ""}>{typeBadge}</div>

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
                {hidden ? "Show" : "Hide"}
              </Button>
            </div>
          </div>

          <div
            className={`grid grid-cols-3 gap-1.5 text-sm w-80 ${hidden ? "opacity-60 pointer-events-none select-none" : ""}`}
          >
            {mainResources.map((r) => (
              <ResourceBadge
                key={r.type}
                icon={`${WIKI_URL}${r.icon}`}
                value={questsFormatNumber(r.value)}
                alt={r.type}
              />
            ))}
            {goodsBadges}
          </div>
        </div>

        <div
          className={`flex flex-col items-end justify-between shrink-0 pr-3 ${hidden ? "opacity-60 pointer-events-none select-none" : ""}`}
        >
          <Button
            size="icon-sm"
            variant="destructive"
            className="rounded-sm size-6"
            onClick={!hidden ? handleRemove : undefined}
          >
            <X className="size-4 stroke-3" />
          </Button>

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
  );
});
