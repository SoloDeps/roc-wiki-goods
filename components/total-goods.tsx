import type { ResourceTotals } from "@/lib/overview/calculator";
import { useEffect, useState, useMemo, memo } from "react";
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
  goodsByCivilization,
  alliedCityResources,
  alliedCityColors,
  eraColors,
  type EraAbbr,
  WIKI_URL,
} from "@/lib/constants";
import {
  getBuildingFromLocal,
  getGoodImageUrlFromType,
  questsFormatNumber,
} from "@/lib/utils";
import { getItemIcon } from "@/lib/helper";

// Helper functions to get colors
const getEraColor = (eraName: string): string => {
  const era = eras.find((e) => e.name === eraName);
  if (!era) return "";
  return eraColors[era.abbr] || "";
};

const getCityColor = (cityName: string): string => {
  const cityKey = Object.keys(alliedCityResources).find(
    (key) =>
      alliedCityResources[key as keyof typeof alliedCityResources].name ===
      cityName
  );
  if (!cityKey) return "";
  return alliedCityColors[cityKey as keyof typeof alliedCityColors] || "";
};

const ResourceItem = memo(({ icon, name, amount }: any) => {
  if (!icon && !name && amount === undefined) return null;

  return (
    <div className="flex items-center h-[60px] gap-2 px-2 py-1.5">
      {icon && <img src={icon} alt="" className="size-8 select-none" draggable={false} />}
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
});

const MainResourcesBlock = memo(({ resources }: any) => {
  const bgRgbMain = "90, 152, 189";
  return (
    <section className="rounded-sm overflow-hidden border">
      <header
        className="py-1 px-2 border-b border-alpha-200 text-white"
        style={{
          background: `linear-gradient(
            to right,
            rgb(${bgRgbMain}),
            rgba(${bgRgbMain}, 0.4)
          )`,
          color: "#fff",
        }}
      >
        <h3 className="text-xs font-bold uppercase tracking-wide">
          Main Resources
        </h3>
      </header>
      <div className="grid grid-cols-5 bg-background-300">
        {resources.map((r: any) => (
          <ResourceItem key={r.type} {...r} />
        ))}
      </div>
    </section>
  );
});

const EraBlock = memo(({ title, resources }: any) => {
  const bgRgb = getEraColor(title);

  const padded = useMemo(() => {
    const padded = [...resources];
    while (padded.length < 3) padded.push({});
    return padded;
  }, [resources]);

  return (
    <section className="rounded-sm overflow-hidden border">
      <header
        className="py-1 px-2 border-b text-white"
        style={{
          background: `linear-gradient(
            to right,
            rgb(${bgRgb}),
            rgba(${bgRgb}, 0.4)
          )`,
        }}
      >
        <h3 className="text-xs font-bold uppercase tracking-wide">{title}</h3>
      </header>
      <div className="grid grid-cols-3 bg-background-300">
        {padded.map((r: any, i: any) => (
          <ResourceItem key={i} {...r} />
        ))}
      </div>
    </section>
  );
});

const OtherGoodsBlock = memo(({ title, resources }: any) => {
  const bgRgb = getCityColor(title);

  return (
    <section className="rounded-sm overflow-hidden border">
      <header
        className="py-1 px-2 border-b"
        style={{
          background: `linear-gradient(
            to right,
            rgb(${bgRgb}),
            rgba(${bgRgb}, 0.4)
          )`,
          color: "#fff",
        }}
      >
        <h3 className="text-xs font-bold uppercase tracking-wide">{title}</h3>
      </header>
      <div className="grid grid-cols-2 sm:grid-cols-3 bg-background-100 ">
        {resources.map((r: any, i: any) => (
          <ResourceItem key={i} {...r} />
        ))}
      </div>
    </section>
  );
});

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
        icon: `${WIKI_URL}${url}`,
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

  const otherGoodsByCivilization = useMemo(() => {
    const grouped: Record<
      string,
      Array<{ icon: string; name: string; amount: number }>
    > = {};

    // Initialiser les groupes de civilisations
    Object.keys(goodsByCivilization).forEach((civ) => {
      grouped[civ] = [];
    });

    // Grouper les other goods par civilisation
    Array.from(normalizedGoods.otherGoods.entries()).forEach(
      ([type, amount]) => {
        // Utiliser le nom avec espaces pour la comparaison (format affiché)
        const displayName = type.replace(/_/g, " ");

        // Chercher à quelle civilisation appartient ce good
        let foundCivilization = null;
        for (const [civKey, civData] of Object.entries(goodsByCivilization)) {
          if (civData.goods.includes(displayName)) {
            foundCivilization = civKey;
            break;
          }
        }

        const resourceItem = {
          icon: `${WIKI_URL}${getGoodImageUrlFromType(
            type,
            selections
          )}`,
          name: displayName, // Affichage avec espaces pour l'UI
          amount,
        };

        if (foundCivilization) {
          grouped[foundCivilization].push(resourceItem);
        } else {
          // Si le good n'appartient à aucune civilisation connue, le mettre dans un groupe "AUTRES"
          if (!grouped["AUTRES"]) {
            grouped["AUTRES"] = [];
          }
          grouped["AUTRES"].push(resourceItem);
        }
      }
    );

    // Ajouter les ressources des villes alliées aux blocs de civilisation correspondants
    Object.entries(totals.main).forEach(([type, amount]) => {
      if (amount <= 0) return;

      // Chercher à quelle ville alliée appartient cette ressource
      let foundCity = null;
      for (const [cityKey, cityData] of Object.entries(alliedCityResources)) {
        if (cityData.resources.includes(type)) {
          foundCity = cityKey;
          break;
        }
      }

      if (foundCity) {
        const displayName = type.replace(/_/g, " ");
        const cityName =
          alliedCityResources[foundCity as keyof typeof alliedCityResources]
            .name;

        // Ajouter la ressource au bloc de la civilisation correspondante
        if (!grouped[cityName]) {
          grouped[cityName] = [];
        }

        grouped[cityName].push({
          icon: `${WIKI_URL}${getItemIcon(type)}`,
          name: displayName,
          amount,
        });
      }
    });

    // Filtrer les civilisations vides
    const filteredGrouped = Object.fromEntries(
      Object.entries(grouped).filter(([_, resources]) => resources.length > 0)
    );

    return filteredGrouped;
  }, [normalizedGoods.otherGoods, selections, totals.main, getItemIcon]);

  const mainResources = useMemo(() => {
    return Object.entries(totals.main)
      .filter(([type, amount]) => {
        // Exclure les ressources des villes alliées
        const isAlliedResource = Object.values(alliedCityResources).some(
          (city) => city.resources.includes(type)
        );
        return amount > 0 && !isAlliedResource;
      })
      .map(([type, amount]) => ({
        type,
        amount,
        icon: `${WIKI_URL}${getItemIcon(type)}`,
        name: type.replace(/_/g, " "),
      }));
  }, [totals.main, getItemIcon]);

  if (loading) return <div className="p-4">Loading...</div>;

  const visibleEraBlocks = eraBlocks.filter((block) => !block.shouldHide);
  const hasOtherGoods = Object.keys(otherGoodsByCivilization).length > 0;

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
        {hasOtherGoods && (
          <div className="space-y-3">
            {Object.entries(otherGoodsByCivilization).map(
              ([civKey, resources]) => (
                <OtherGoodsBlock
                  key={civKey}
                  title={civKey}
                  resources={resources}
                />
              )
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default GoodsDisplay;
