import type { ResourceTotals } from "@/lib/overview/calculator";
import { useEffect, useState, useMemo } from "react";
import {
  getCalculatorTotals,
  watchCalculatorTotals,
} from "@/lib/overview/calculator";
import { useBuildingSelections } from "@/hooks/useBuildingSelections";
import {
  eras,
  goodsUrlByEra,
  itemsUrl,
  goodsNameMapping,
  type EraAbbr,
  WIKI_URL,
} from "@/lib/constants";
import {
  getBuildingFromLocal,
  getGoodImageUrlFromType,
  questsFormatNumber,
} from "@/lib/utils";
import { getItemIcon } from "@/lib/helper";

const ResourceItem = ({ icon, name, amount }: any) => {
  if (!icon && !name && amount === undefined) return null;

  return (
    <div className="flex items-center h-[60px] gap-2 px-2 py-1.5">
      {icon && <img src={icon} alt="" className="size-8" />}
      <div className="flex flex-col min-w-0">
        {name && (
          <span className="text-[10px] font-medium leading-tight uppercase">
            {name}
          </span>
        )}
        {amount !== undefined && (
          <span className="text-sm font-bold leading-tight">
            {questsFormatNumber(amount)}
          </span>
        )}
      </div>
    </div>
  );
};

const MainResourcesBlock = ({ resources }: any) => (
  <section className="rounded-md overflow-hidden border">
    <header className="py-1 px-2 border-b">
      <h3 className="text-xs font-bold uppercase tracking-wide">
        Main Resources
      </h3>
    </header>
    <div className="grid grid-cols-5">
      {resources.map((r: any) => (
        <ResourceItem key={r.type} {...r} />
      ))}
    </div>
  </section>
);

const EraBlock = ({ title, resources }: any) => {
  const padded = [...resources];
  while (padded.length < 3) padded.push({});
  return (
    <section className="rounded-md overflow-hidden border">
      <header className="py-1 px-2 border-b">
        <h3 className="text-xs font-bold uppercase tracking-wide">{title}</h3>
      </header>
      <div className="grid grid-cols-3">
        {padded.map((r: any, i: any) => (
          <ResourceItem key={i} {...r} />
        ))}
      </div>
    </section>
  );
};

const OtherGoodsBlock = ({ resources }: any) => (
  <section className="rounded-md overflow-hidden border">
    <header className="py-1 px-2 border-b">
      <h3 className="text-xs font-bold uppercase tracking-wide">Other Goods</h3>
    </header>
    <div className="grid grid-cols-2 sm:grid-cols-3">
      {resources.map((r: any, i: any) => (
        <ResourceItem key={i} {...r} />
      ))}
    </div>
  </section>
);

const GoodsDisplay = () => {
  const { selections } = useBuildingSelections();
  const [loading, setLoading] = useState(true);

  const [totals, setTotals] = useState<ResourceTotals>({
    main: {},
    goods: {},
  });

  // Charge les totaux au montage
  useEffect(() => {
    async function fetchTotals() {
      const result = await getCalculatorTotals();
      setTotals({
        main: result.main,
        goods: result.goods,
      });

      setLoading(false);
    }
    fetchTotals();

    // Watch les changements
    const unwatch = watchCalculatorTotals((result) => {
      setTotals({
        main: result.main,
        goods: result.goods,
      });
    });

    return () => unwatch?.();
  }, []);

  // Crée un index global au montage pour lookup rapide
  // Crée un index global Priority_Era → good brut ET good brut → Priority_Era
  const goodToPriorityEra = useMemo(() => {
    const map = new Map<string, string>();
    const reverseMap = new Map<string, string>();

    Object.entries(goodsNameMapping).forEach(([good, mappings]) => {
      mappings.forEach((m) => {
        const normalized = good.toLowerCase().replace(/[^\w-]/g, "_");
        const value = `${m.priority[0].toUpperCase()}${m.priority.slice(1)}_${
          m.era
        }`;
        map.set(normalized, value);
        reverseMap.set(value, normalized);
      });
    });

    return { map, reverseMap };
  }, []);

  // Normalisation des goods (Priority_Era)
  const normalizedGoods = useMemo(() => {
    const priorityGoods = new Map<string, number>();
    const otherGoods = new Map<string, number>();

    Object.entries(totals.goods).forEach(([type, amount]) => {
      // Vérifie si c'est déjà au format Priority_Era (ex: Secondary_IE)
      if (/^(Primary|Secondary|Tertiary)_[A-Z]{2}$/.test(type)) {
        priorityGoods.set(type, (priorityGoods.get(type) ?? 0) + amount);
        return;
      }

      // Sinon, essaie de mapper un good brut vers Priority_Era
      const normalizedType = type.toLowerCase().replace(/[^\w-]/g, "_");
      const key = goodToPriorityEra.map.get(normalizedType);
      if (key) {
        priorityGoods.set(key, (priorityGoods.get(key) ?? 0) + amount);
      } else {
        otherGoods.set(type, (otherGoods.get(type) ?? 0) + amount);
      }
    });

    return { priorityGoods, otherGoods };
  }, [totals.goods, goodToPriorityEra]);

  const eraBlocks = useMemo(() => {
    const getPriorityMeta = (
      priority: "primary" | "secondary" | "tertiary",
      eraAbbr: EraAbbr
    ) => {
      const building = getBuildingFromLocal(priority, eraAbbr, selections);
      const normalizedName = building
        ? building.toLowerCase().replace(/[^\w-]/g, "_")
        : "";
      const meta = normalizedName
        ? goodsUrlByEra[eraAbbr]?.[normalizedName]
        : undefined;
      const url = meta?.url ?? itemsUrl.default;
      return {
        icon: `https://${WIKI_URL}${url}`,
        name:
          meta?.name ??
          (priority === "primary"
            ? "Primary"
            : priority === "secondary"
            ? "Secondary"
            : "Tertiary"),
      };
    };

    return eras.map((era) => {
      const abbr = era.abbr as EraAbbr;
      const primaryAmount =
        normalizedGoods.priorityGoods.get(`Primary_${abbr}`) ?? 0;
      const secondaryAmount =
        normalizedGoods.priorityGoods.get(`Secondary_${abbr}`) ?? 0;
      const tertiaryAmount =
        normalizedGoods.priorityGoods.get(`Tertiary_${abbr}`) ?? 0;

      const resources = [
        { ...getPriorityMeta("primary", abbr), amount: primaryAmount },
        { ...getPriorityMeta("secondary", abbr), amount: secondaryAmount },
        { ...getPriorityMeta("tertiary", abbr), amount: tertiaryAmount },
      ];

      return {
        title: era.name,
        resources,
        shouldHide:
          primaryAmount === 0 && secondaryAmount === 0 && tertiaryAmount === 0,
      };
    });
  }, [selections, normalizedGoods]);

  const otherGoods = useMemo(() => {
    return Array.from(normalizedGoods.otherGoods.entries()).map(
      ([type, amount]) => ({
        icon: `https://${WIKI_URL}${getGoodImageUrlFromType(type, selections)}`,
        name: type.replace(/_/g, " "),
        amount,
      })
    );
  }, [normalizedGoods.otherGoods, selections]);

  const mainResources = useMemo(() => {
    return Object.entries(totals.main)
      .filter(([, amount]) => amount > 0)
      .map(([type, amount]) => ({
        type,
        amount,
        icon: `https://${WIKI_URL}${getItemIcon(type)}`,
        name: type.replace(/_/g, " "),
      }));
  }, [totals.main, getItemIcon]);

  if (loading) return <div className="p-4">Loading...</div>;

  const visibleEraBlocks = eraBlocks.filter((block) => !block.shouldHide);

  return (
    <div className="p-4 pb-16">
      <MainResourcesBlock resources={mainResources} />

      <div className="grid grid-cols-1 gap-3 2xl:grid-cols-2 pt-3">
        <div className="space-y-3">
          {visibleEraBlocks.map((block) => (
            <EraBlock
              key={block.title}
              title={block.title}
              resources={block.resources}
            />
          ))}
        </div>
        {otherGoods.length > 0 && (
          <div className="space-y-3">
            <OtherGoodsBlock resources={otherGoods} />
          </div>
        )}
      </div>
    </div>
  );
};

export default GoodsDisplay;
