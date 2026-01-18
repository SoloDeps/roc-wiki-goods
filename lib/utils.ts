import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { buildingsAbbr, itemsUrl, EraAbbr, goodsUrlByEra } from "./constants";
import { assetGoods, defaultGood } from "./data/images";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function slugify(str: string): string {
  return str.toLowerCase().replace(/[^\w-]/g, "_");
}

export function getBuildingFromLocal(
  priority: string,
  era: string,
  buildings: string[][],
): string | undefined {
  // Create mapping for priority levels with case-insensitive handling
  const priorityMapping = {
    primary: 0,
    secondary: 1,
    tertiary: 2,
  };

  // Convert priority to lowercase and get corresponding index
  const priorityIndex =
    priorityMapping[priority.toLowerCase() as keyof typeof priorityMapping];

  // Validate priority input
  if (priorityIndex === undefined) return undefined;

  // Find group index with flexible abbreviation matching
  const groupIndex = buildingsAbbr.findIndex((group) =>
    group.abbreviations.some(
      (abbr) => abbr.toUpperCase() === era.toUpperCase(),
    ),
  );

  // return building if valid, otherwise undefined
  return groupIndex !== -1 ? buildings[groupIndex][priorityIndex] : undefined;
}

export function isValidData(data: unknown): boolean {
  // Quick type check - reject non-string inputs
  if (typeof data !== "string") return false;

  // Define security patterns to prevent XSS and injection
  const securityPatterns = [
    /<script/i,
    /on\w+=/i,
    /javascript:/i,
    /data:/i,
    /eval\(/i,
  ];

  // Test data against security patterns
  return !securityPatterns.some((pattern) => pattern.test(data));
}

export function replaceTextByImage(buildings: string[][]): void {
  const imageReplaceRegex = /(primary|secondary|tertiary):\s*([A-Z]{2})/gi;

  function processNode(node: Node) {
    if (node.nodeType === Node.TEXT_NODE) {
      let text = node.textContent || "";
      let lastIndex = 0;
      const fragment = document.createDocumentFragment();

      text.replace(imageReplaceRegex, (match, priority, era, offset) => {
        // add text before match
        if (offset > lastIndex) {
          fragment.appendChild(
            document.createTextNode(text.slice(lastIndex, offset)),
          );
        }
        lastIndex = offset + match.length;

        // Trouver l'image correspondante
        const building = getBuildingFromLocal(priority, era, buildings);
        const normalizedBuilding = building
          ? building.toLowerCase().replace(/[^\w-]/g, "_")
          : "";

        const imgUrl =
          goodsUrlByEra[era.toUpperCase() as EraAbbr]?.[normalizedBuilding]
            ?.url || itemsUrl.default;

        // create and configure image
        const img = document.createElement("img");
        img.src = imgUrl;
        img.alt = `${priority}_${era.replace(/[<>"'/]/g, "")}`;
        img.width = 25;
        img.height = 25;
        img.decoding = "async";
        img.loading = "lazy";
        img.onerror = () => {
          img.src = itemsUrl.default;
        };

        fragment.appendChild(img);
        return ""; // Empêche le remplacement par du texte
      });

      // add remaining text after last match
      if (lastIndex < text.length) {
        fragment.appendChild(document.createTextNode(text.slice(lastIndex)));
      }

      // Assurer que node est bien un ChildNode avant d'utiliser replaceWith
      if (node.parentNode) {
        node.parentNode.replaceChild(fragment, node);
      }
    }
    // Si le nœud est un élément HTML, traiter ses enfants récursivement
    else if (node.nodeType === Node.ELEMENT_NODE) {
      Array.from(node.childNodes).forEach(processNode);
    }
  }

  // Sélectionner tous les `<td>` et traiter leur contenu
  document.querySelectorAll("td").forEach((el) => processNode(el));
}

export function parseNumber(value: string) {
  if (!value || !/\d/.test(value)) return 0;

  // Nettoyage : enlever espaces et virgules
  let clean = value.replace(/[, ]/g, "").toUpperCase();

  let number = parseFloat(clean.replace(/[^\d.]/g, ""));

  if (clean.includes("K")) number *= 1000;
  if (clean.includes("M")) number *= 1000000;

  return isNaN(number) ? 0 : number;
}

export function formatNumber(value: number) {
  if (value >= 1_000_000) {
    return (
      (value / 1_000_000)
        .toLocaleString("en-US", { maximumFractionDigits: 1 })
        .replace(/\.0$/, "") + " M"
    );
  } else if (value >= 1_000) {
    return (
      (value / 1_000)
        .toLocaleString("en-US", { maximumFractionDigits: 1 })
        .replace(/\.0$/, "") + " K"
    );
  }
  return value.toString();
}

export function questsFormatNumber(value: number): string {
  // Gérer le signe négatif
  const isNegative = value < 0;
  const absValue = Math.abs(value);

  const formatWithDecimals = (num: number) =>
    num.toLocaleString("fr-FR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  let formatted = "";

  if (absValue >= 1_000_000_000) {
    formatted = formatWithDecimals(absValue / 1_000_000_000) + " B";
  } else if (absValue >= 1_000_000) {
    formatted = formatWithDecimals(absValue / 1_000_000) + " M";
  } else if (absValue >= 100_000) {
    formatted = formatWithDecimals(absValue / 1_000) + " K";
  } else if (absValue >= 1_000) {
    formatted = absValue.toLocaleString("en-US");
  } else {
    formatted = absValue.toString();
  }

  // add negative sign if needed
  return isNegative ? `-${formatted}` : formatted;
}

export function getTitlePage(): [string | null, string | null, string | null] {
  const heading = document.getElementById("firstHeading");
  if (!heading) return [null, null, null];

  const span = heading.querySelector("span");
  if (!span || !span.textContent) return [null, null, null];

  const parts = span.textContent
    .split("/")
    .map((part) => part.trim().toLowerCase().replace(/\s+/g, "_"));

  const mainSection = parts[0] || null;
  const subSection = parts[1] || null;
  const thirdSection = parts[2] || null;

  return [mainSection, subSection, thirdSection];
}

export function getClosestLowerOrEqualMaxQty(
  level: number,
  levelMaxQty: Record<number, number>,
): number {
  const levels = Object.keys(levelMaxQty).map(Number);
  const validLevels = levels.filter((l) => l <= level);
  if (validLevels.length === 0) return 1; // fallback par défaut
  const closest = Math.max(...validLevels);
  return levelMaxQty[closest];
}

export function getGoodsImg(buildingName: string) {
  const nameFormatted = slugify(buildingName);

  return assetGoods[nameFormatted] || defaultGood;
}

export function findPreviousH2SpanWithId(
  element: Element,
): HTMLSpanElement | null {
  let current: Element | null = element;

  while (current) {
    let prev = current.previousElementSibling;
    while (prev) {
      if (prev.tagName === "H2" || prev.tagName === "H3") {
        // Cherche un <span id="..."> dans ce <h2>
        const span = prev.querySelector("span[id]");
        if (span) return span as HTMLSpanElement;
      }
      prev = prev.previousElementSibling;
    }
    current = current.parentElement;
  }
  return null;
}

export function filterTables(
  tables: HTMLTableElement[],
  targetIds: string[],
): { element: HTMLTableElement; type: string }[] {
  // Normalise les targetIds en minuscule
  const lowerTargetIds = targetIds.map((id) => id.toLowerCase());

  return tables
    .map((table) => {
      const span = findPreviousH2SpanWithId(table);
      if (!span) return null;

      const spanId = span.id.toLowerCase();

      // Vérifie si span.id correspond à un des targetIds (avec suffixe _2, _3…)
      const match = lowerTargetIds.find((targetId) => {
        const regex = new RegExp(`^${targetId}(_\\d+)?$`);
        return regex.test(spanId);
      });

      if (!match) return null;

      return {
        element: table,
        type: match, // toujours en minuscule
      };
    })
    .filter(
      (item): item is { element: HTMLTableElement; type: string } =>
        item !== null,
    );
}

const IMAGE_BASE_URL = "https://riseofcultures.wiki.gg/images/thumb";

export const buildingNoLvl = [
  // arabia
  "camel_farm",
  "coffee_brewer",
  "incense_maker",
  "carpet_factory",
  "oil_lamp_crafter",
  // maya
  "chronicler",
  "mask_sculptor",
  "ceremony_outfitter",
  "luxurious_aviary",
  "ritual_carver",
  "ritual_sites",
  // viking
  "market",
];

/**
 * Génère l'URL de l'image d'un bâtiment
 * @param buildingName - Nom du bâtiment (ex: "rural_farm")
 * @param level - Niveau (ex: "36 → 37" ou "10")
 * @returns URL complète de l'image
 */
export function getBuildingImageUrl(
  buildingName: string,
  level: string,
  type: string,
): string {
  const withCapital = [
    "homes",
    "farms",
    "workshops",
    "culture_sites",
    "barracks",
  ];
  const alliedCity = [
    { page: "maya_empire", suffix: "Maya_" },
    { page: "china", suffix: "China_" },
    { page: "viking_kingdom", suffix: "Viking_" },
    { page: "arabia", suffix: "Arabia_" },
    { page: "egypt", suffix: "Egypt_" },
  ];

  let suffix = "";

  if (alliedCity.find((city) => city.page === type.toLowerCase())) {
    suffix =
      alliedCity.find((city) => city.page === type.toLowerCase())?.suffix || "";
  }
  if (withCapital.includes(type.toLowerCase())) suffix = "Capital_";

  const imageName = buildingName
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join("_");

  const fileName = buildingNoLvl.includes(buildingName.toLowerCase())
    ? `${imageName}.png`
    : `${imageName}_Lv${level}.png`;

  return `${IMAGE_BASE_URL}/${suffix}${fileName}/200px-${suffix}${fileName}`;
}

export function getGoodImageUrlFromType(
  type: string,
  userSelections: string[][],
): string {
  // 1️⃣ Cas PRIORITY_ERA → image du building sélectionné
  const match = type.match(/^(Primary|Secondary|Tertiary)_([A-Z]{2})$/i);

  if (match) {
    const [, priorityRaw, eraRaw] = match;

    const priority = priorityRaw.toLowerCase() as
      | "primary"
      | "secondary"
      | "tertiary";

    const era = eraRaw as EraAbbr;

    const building = getBuildingFromLocal(priority, era, userSelections);

    if (building) {
      const normalized = slugify(building);
      const meta = goodsUrlByEra[era]?.[normalized];
      if (meta?.url) return meta.url;
    }

    return itemsUrl.default;
  }

  // 2️⃣ GOOD BRUT → image wiki directe
  const fileName = type.replace(/\s+/g, "_");
  return `/images/thumb/${fileName}.png/32px-${fileName}.png`;
}

export function getGoodNameFromPriorityEra(
  priority: string,
  era: string,
  userSelections: string[][],
): string | null {
  const building = getBuildingFromLocal(priority, era, userSelections);
  if (!building) return null;

  const normalizedBuilding = slugify(building);
  const goodMeta =
    goodsUrlByEra[era.toUpperCase() as EraAbbr]?.[normalizedBuilding];

  return goodMeta?.name ? slugify(goodMeta.name) : null;
}
