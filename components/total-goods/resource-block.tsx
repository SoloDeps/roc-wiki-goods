import { memo, useMemo } from "react";
import { ResourceItem } from "./resource-item";
import {
  eras,
  eraColors,
  alliedCityResources,
  alliedCityColors,
} from "@/lib/constants";

interface ResourceBlockProps {
  title: string;
  resources: Array<{
    icon: string;
    name: string;
    amount: number;
  }>;
  type: "main" | "era" | "other";
  className?: string;
}

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

const getBlockStyles = (type: ResourceBlockProps["type"], title: string) => {
  switch (type) {
    case "main":
      return {
        bgRgb: "90, 152, 189",
        defaultGridClass: "grid-cols-3",
      };
    case "era":
      return {
        bgRgb: getEraColor(title),
        defaultGridClass: "grid-cols-3",
      };
    case "other":
      return {
        bgRgb: getCityColor(title),
        defaultGridClass: "grid-cols-2 sm:grid-cols-3",
      };
    default:
      return {
        bgRgb: "128, 128, 128",
        defaultGridClass: "grid-cols-3",
      };
  }
};

export const ResourceBlock = memo(
  ({ title, resources, type, className }: ResourceBlockProps) => {
    const { bgRgb, defaultGridClass } = useMemo(
      () => getBlockStyles(type, title),
      [type, title]
    );
    const gridClass = className || defaultGridClass;

    const hasResources =
      resources.length > 0 && resources.some((r) => r.amount > 0);

    if (!hasResources) {
      return null;
    }

    const paddedResources = useMemo(() => {
      if (type !== "era") return resources;

      const padded = [...resources];
      while (padded.length < 3) padded.push({ icon: "", name: "", amount: 0 });
      return padded;
    }, [resources, type]);

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
        <div className={`grid ${gridClass} bg-background-300`}>
          {paddedResources.map((r, i) => (
            <ResourceItem key={r.icon ? r.icon : i} {...r} />
          ))}
        </div>
      </section>
    );
  }
);
