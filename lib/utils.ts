import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { buildingsAbbr, itemsUrl, EraAbbr, goodsUrlByEra } from "./constants";

export const selectorGoods: Record<string, string> = {
  default: "/goods/default.webp",
  tailor: "/goods/wool.webp",
  stone_mason: "/goods/alabaster_idol.webp",
  artisan: "/goods/bronze_bracelet.webp",
  scribe: "/goods/parchment.webp",
  carpenter: "/goods/planks.webp",
  spice_merchant: "/goods/pepper.webp",
  jeweler: "/goods/fine_jewelry.webp",
  alchemist: "/goods/ointment.webp",
  glassblower: "/goods/lead_glass.webp",
};

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Convertit une chaîne en slug normalisé (snake_case lowercase)
 * Unifie l'ancienne logique de slugify() et slugify()
 *
 * @example
 * slugify("Alabaster Idol") // "alabaster_idol"
 * slugify("Wu Zhu") // "wu_zhu"
 * slugify("  Cape  ") // "cape"
 */
export function slugify(str: string): string {
  return str
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "_")
    .replace(/[^\w]+/g, "_")
    .replace(/_+/g, "_")
    .replace(/^_|_$/g, "");
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
        const normalizedBuilding = building ? slugify(building) : "";

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

  const parts = span.textContent.split("/").map((part) => slugify(part));

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
  return selectorGoods[nameFormatted] || selectorGoods.default;
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
  "expedition_pier",
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
      return `/goods/${normalized}.webp`;
    }

    return "/goods/default.webp";
  }

  return `/goods/${slugify(type)}.webp`;
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

/**
 * Obtenir l'icône d'un item/ressource
 * Utilisé pour les main resources et items
 */
export function getItemIconLocal(type: string): string {
  const normalized = slugify(type);
  if (normalized) {
    return `/goods/${normalized}.webp`;
  }
  return `/goods/default.webp`;
}
