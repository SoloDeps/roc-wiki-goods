import { memo, useMemo, useCallback, useState } from "react";
import { X, ExternalLink, EyeOff, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getGoodImageUrlFromType, questsFormatNumber } from "@/lib/utils";
import { WIKI_URL, itemsUrl, eras } from "@/lib/constants";
import { ResourceBadge } from "./resource-badge";

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
  onToggleHidden,
  era,
  hidden,
}: {
  aggregatedTechnos: AggregatedTechnoData;
  userSelections: any;
  onRemoveAll: () => void;
  onToggleHidden: () => void;
  era?: string;
  hidden?: boolean;
}) {
  const [isHovered, setIsHovered] = useState(false);

  const handleRemove = useCallback(() => {
    onRemoveAll();
  }, [onRemoveAll]);

  const wikiUrl = useMemo(() => {
    if (!era) return "";

    const eraData = eras.find((e) => e.id === era);
    const eraName = eraData
      ? eraData.name.replace(/ /g, "_")
      : era.replace(/_/g, " ");

    return `${WIKI_URL}/wiki/Home_Cultures/${eraName}`;
  }, [era]);

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
    <div
      className="@container/bcard group relative flex gap-4 rounded-sm bg-background-300 border h-auto min-h-32"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Hidden overlay - applied after everything else */}
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

      <div className="flex p-3 gap-2 lg:gap-4 size-full relative">
        <div className="flex-1">
          <div className="flex justify-between items-center mb-3">
            <div className="flex items-center gap-2">
              <h3
                className={`text-sm lg:text-[15px] font-medium truncate capitalize pl-1 ${hidden ? "opacity-50" : ""}`}
              >
                {era ? `${era.replace(/_/g, " ")} ` : "Era"}
              </h3>
              <div className={hidden ? "opacity-50" : ""}>
                <Badge
                  variant="outline"
                  className="bg-blue-200 dark:bg-blue-300 text-blue-950 border-alpha-100 border rounded-sm"
                >
                  {aggregatedTechnos.technoCount} techno
                  {aggregatedTechnos.technoCount > 1 ? "s" : ""}
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
                  onClick={onToggleHidden}
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

              <div
                className={`ml-auto transition-opacity duration-200 ${
                  isHovered ? "opacity-100" : "opacity-0 pointer-events-none"
                }`}
              >
                <Button
                  size="sm"
                  variant="ghost"
                  className="rounded-sm h-6"
                  onClick={() => window.open(wikiUrl, "_blank")}
                  title="Go to the wiki page"
                >
                  Link <ExternalLink className="size-4" />
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
                icon={`${WIKI_URL}${r.icon}`}
                value={questsFormatNumber(r.value)}
                alt={r.type}
              />
            ))}

            {goodsBadges}
          </div>
        </div>

        {/* <div
          className={`flex flex-col items-end justify-between shrink-0 pr-3 ${hidden ? "opacity-50" : ""}`}
        >
          
        </div> */}
      </div>
    </div>
  );
});
