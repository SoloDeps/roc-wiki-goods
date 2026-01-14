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
  goodsByCivilization,
  alliedCityResources,
  type EraAbbr,
  WIKI_URL,
} from "@/lib/constants";
import { getBuildingFromLocal, getGoodImageUrlFromType } from "@/lib/utils";
import { getItemIcon } from "@/lib/helper";
import { ResourceBlock } from "./resource-block";
import { Loader2Icon } from "lucide-react";
import { EmptyOutline } from "@/components/empty-card";
import { ScrollArea } from "../ui/scroll-area";

export const TotalGoodsDisplay = () => {
  // #region logic
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
          icon: `${WIKI_URL}${getGoodImageUrlFromType(type, selections)}`,
          name: displayName, // Affichage avec espaces pour l'UI
          amount,
        };

        if (foundCivilization) {
          grouped[foundCivilization].push(resourceItem);
        } else {
          // Si le good n'appartient à aucune civilisation connue, le mettre dans un groupe "OTHERS"
          if (!grouped["OTHERS"]) {
            grouped["OTHERS"] = [];
          }
          grouped["OTHERS"].push(resourceItem);
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
    const resourceOrder = ["coins", "food", "gems"];

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
      }))
      .sort((a, b) => {
        const aIndex = resourceOrder.indexOf(a.type);
        const bIndex = resourceOrder.indexOf(b.type);

        // Si les deux sont dans l'ordre prédéfini, utiliser cet ordre
        if (aIndex !== -1 && bIndex !== -1) {
          return aIndex - bIndex;
        }

        // Si seul a est dans l'ordre prédéfini, le mettre en premier
        if (aIndex !== -1) {
          return -1;
        }

        // Si seul b est dans l'ordre prédéfini, le mettre en premier
        if (bIndex !== -1) {
          return 1;
        }

        // Sinon, ordre alphabétique pour les autres ressources
        return a.type.localeCompare(b.type);
      });
  }, [totals.main, getItemIcon]);
  // #endregion

  if (loading) {
    return (
      <div className="p-4 flex items-center justify-center">
        <Loader2Icon className="size-5 animate-spin" />
      </div>
    );
  }

  const visibleEraBlocks = eraBlocks.filter((block) => !block.shouldHide);
  const hasOtherGoods = Object.keys(otherGoodsByCivilization).length > 0;
  const hasMainResources = mainResources.length > 0;
  const hasAnyResources =
    hasMainResources || visibleEraBlocks.length > 0 || hasOtherGoods;

  if (!hasAnyResources) {
    return (
      <div className="p-8 size-full m-auto flex items-center justify-center bg-background-200 overflow-hidden">
        {/* prevent header issue */}
        <div className="-mt-12">
          <EmptyOutline perso="female" type="total" />
        </div>
      </div>
    );
  }

  return (
    <ScrollArea className="size-full overflow-y-auto bg-background-200">
      <div className="p-4 pb-16 max-w-[870px] mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-5 xl:grid-cols-1 2xl:grid-cols-5 gap-3">
          <div className="col-span-3 md:col-start-2 xl:col-start-1 2xl:col-start-2">
            <ResourceBlock
              title="Main Resources"
              resources={mainResources}
              type="main"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-1 2xl:grid-cols-2 gap-3 pt-3">
          <div className="space-y-3">
            {visibleEraBlocks.map((block) => (
              <ResourceBlock
                key={block.title}
                title={block.title}
                resources={block.resources}
                type="era"
              />
            ))}
          </div>
          {hasOtherGoods && (
            <div className="space-y-3">
              {Object.entries(otherGoodsByCivilization).map(
                ([civKey, resources]) => (
                  <ResourceBlock
                    key={civKey}
                    title={civKey}
                    resources={resources}
                    type="other"
                  />
                )
              )}
            </div>
          )}
        </div>
      </div>
    </ScrollArea>
  );
};
