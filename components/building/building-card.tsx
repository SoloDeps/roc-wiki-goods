import { memo, useMemo, useCallback, useState, useEffect } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import BuildingCounter from "./building-counter";
import { formatNumber, getGoodImageUrlFromType, questsFormatNumber } from "@/lib/utils";
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
}: any) {
  const { id, name, image, costs, quantity, maxQty, parsed } = building;

  const [localQty, setLocalQty] = useState(quantity);

  useEffect(() => {
    setLocalQty(quantity);
  }, [quantity]);

  // Sync quantity (debounced)
  useEffect(() => {
    if (localQty === quantity) return;

    const t = setTimeout(() => {
      onUpdateQuantity(id, localQty);
    }, 300);

    return () => clearTimeout(t);
  }, [localQty, quantity, id, onUpdateQuantity]);

  const handleRemove = useCallback(() => {
    onRemove(id);
  }, [id, onRemove]);

  // =========================
  // MAIN RESOURCES
  // =========================
  const mainResources = useMemo(() => {
    return Object.entries(costs)
      .filter(
        (entry): entry is [string, number] =>
          entry[0] !== "goods" && typeof entry[1] === "number"
      )
      .map(([type, unitValue]) => ({
        type,
        value: unitValue * localQty,
        icon: itemsUrl[type as keyof typeof itemsUrl] ?? itemsUrl.default,
      }));
  }, [costs, localQty]);

  // =========================
  // GOODS
  // =========================
  const goodsBadges = useMemo(() => {
    const goods = costs.goods as Good[] | undefined;
    if (!goods) return null;

    return goods.map((g, i) => {
      const iconPath = getGoodImageUrlFromType(g.type, userSelections);
      if (!iconPath) return null;

      return (
        <ResourceBadge
          key={`${g.type}-${i}`}
          icon={`https://${WIKI_URL}${iconPath}`}
          value={formatNumber(g.amount * localQty)}
          alt={g.type}
        />
      );
    });
  }, [costs.goods, localQty, userSelections]);

  const typeBadge = useMemo(() => {
    const label =
      parsed.tableType === "construction" ? "Construction" : "Upgrade";

    const color =
      parsed.tableType === "construction"
        ? "bg-green-300 text-black"
        : "bg-blue-200 text-black";

    return (
      <Badge variant="outline" className={color}>
        {label}
      </Badge>
    );
  }, [parsed.tableType]);

  return (
    <div className="@container/bcard flex gap-4 rounded-lg bg-muted/50 border h-32 pl-2">
      <div className="hidden md:flex size-28 shrink-0 items-center justify-center overflow-hidden">
        <img
          src={image}
          alt={name}
          className="size-full object-cover brightness-105"
        />
      </div>

      <div className="flex py-3 gap-6 size-full">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-3">
            <h3 className="text-sm font-medium truncate capitalize">{name}</h3>
            {typeBadge}
          </div>

          <div className="grid grid-cols-3 gap-1.5 text-sm w-80">
            {mainResources.map((r) => (
              <ResourceBadge
                key={r.type}
                icon={`https://${WIKI_URL}${r.icon}`}
                value={questsFormatNumber(r.value)}
                alt={r.type}
              />
            ))}

            {goodsBadges}
          </div>
        </div>

        <div className="flex flex-col items-end justify-between shrink-0 pr-3">
          <Button
            size="icon-sm"
            variant="destructive"
            className="rounded-full"
            onClick={handleRemove}
          >
            <X className="size-4" />
          </Button>

          <BuildingCounter
            value={localQty}
            onChange={setLocalQty}
            min={1}
            max={maxQty}
          />
        </div>
      </div>
    </div>
  );
});

// =========================
// RESOURCE BADGE
// =========================
const ResourceBadge = memo(function ResourceBadge({
  icon,
  value,
  alt,
}: {
  icon: string;
  value: string;
  alt: string;
}) {
  return (
    <div className="flex items-center justify-between px-2 rounded-md bg-black/10 h-8 shrink-0">
      <img src={icon} alt={alt} className="size-[25px]" />
      <span className="text-[13px] font-medium">{value}</span>
    </div>
  );
});
