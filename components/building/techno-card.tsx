import { memo, useMemo, useCallback } from "react";
import { X, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getGoodImageUrlFromType, questsFormatNumber } from "@/lib/utils";
import { WIKI_URL, itemsUrl, eras } from "@/lib/constants";

interface Good {
  type: string;
  amount: number;
}

interface AggregatedTechnoData {
  totalResearch: number;
  totalCoins: number;
  totalFood: number;
  goods: Array<{ type: string; amount: number }>;
  technoCount: number;
}

export const TechnoCard = memo(function TechnoCard({
  aggregatedTechnos,
  userSelections,
  onRemoveAll,
  era,
}: {
  aggregatedTechnos: AggregatedTechnoData;
  userSelections: any;
  onRemoveAll: () => void;
  era?: string;
}) {
  const handleRemove = useCallback(() => {
    onRemoveAll();
  }, [onRemoveAll]);

  // Générer l'URL wiki pour l'ère technologique
  const wikiUrl = useMemo(() => {
    if (!era) return "";

    // Trouver le nom de l'ère à partir de l'ID
    const eraData = eras.find((e) => e.id === era);
    const eraName = eraData
      ? eraData.name.replace(/ /g, "_")
      : era.replace(/_/g, " ");

    return `${WIKI_URL}/wiki/Home_Cultures/${eraName}`;
  }, [era]);

  // =========================
  // MAIN RESOURCES
  // =========================
  const mainResources = useMemo(() => {
    const resources = [];

    if (aggregatedTechnos.totalResearch > 0) {
      resources.push({
        type: "research_points",
        value: aggregatedTechnos.totalResearch,
        icon: itemsUrl.research_points ?? itemsUrl.default,
      });
    }

    if (aggregatedTechnos.totalCoins > 0) {
      resources.push({
        type: "coins",
        value: aggregatedTechnos.totalCoins,
        icon: itemsUrl.coins ?? itemsUrl.default,
      });
    }

    if (aggregatedTechnos.totalFood > 0) {
      resources.push({
        type: "food",
        value: aggregatedTechnos.totalFood,
        icon: itemsUrl.food ?? itemsUrl.default,
      });
    }

    return resources;
  }, [aggregatedTechnos]);

  // =========================
  // GOODS
  // =========================
  const goodsBadges = useMemo(() => {
    if (!aggregatedTechnos.goods || aggregatedTechnos.goods.length === 0)
      return null;

    return aggregatedTechnos.goods.map((g, i) => {
      const iconPath = getGoodImageUrlFromType(g.type, userSelections);
      if (!iconPath) return null;

      return (
        <ResourceBadge
          key={`${g.type}-${i}`}
          icon={`${WIKI_URL}${iconPath}`}
          value={questsFormatNumber(g.amount)}
          alt={g.type}
        />
      );
    });
  }, [aggregatedTechnos.goods, userSelections]);

  return (
    <div className="@container/bcard group relative flex gap-4 rounded-sm bg-background-300 border h-auto min-h-32 pl-2">
      <div className="flex py-3 gap-2 lg:gap-4 size-full">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-3">
            <h3 className="text-sm lg:text-[15px] font-medium truncate capitalize pl-1">
              {era ? `${era.replace(/_/g, " ")} ` : "Era"}
            </h3>
            <Badge
              variant="outline"
              className="bg-blue-200 dark:bg-blue-300 text-blue-950 border-alpha-100 border rounded-sm"
            >
              {aggregatedTechnos.technoCount} techno
              {aggregatedTechnos.technoCount > 1 ? "s" : ""}
            </Badge>

            <Button
              size="sm"
              variant="ghost"
              className="rounded-sm opacity-0 group-hover:opacity-100 transition-opacity duration-200"
              onClick={() => window.open(wikiUrl, "_blank")}
              title="Go to the wiki page"
            >
              Link <ExternalLink className="size-4 " />
            </Button>
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-1.5 text-sm w-full">
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

        <div className="flex flex-col items-end justify-between shrink-0 pr-3">
          <Button
            size="icon-sm"
            variant="destructive"
            className="rounded-sm size-6"
            onClick={handleRemove}
          >
            <X className="size-4 stroke-3" />
          </Button>
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
    <div className="flex items-center justify-between px-2 rounded-md bg-background-100 border border-alpha-200 h-8 shrink-0">
      <img src={icon} alt={alt} className="size-[25px]" />
      <span className="text-[13px] font-medium">{value}</span>
    </div>
  );
});
