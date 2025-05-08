import { buildingsAbbr, DEFAULT_IMG_URL, goodsUrlByEra } from "./constants";
import { assetGoods, defaultGood } from "./images";

export function getBuildingFromLocal(
  priority: string,
  era: string,
  buildings: string[][]
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
    group.abbreviations.some((abbr) => abbr.toUpperCase() === era.toUpperCase())
  );

  // Return building if valid, otherwise undefined
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
        // Ajouter le texte avant la correspondance
        if (offset > lastIndex) {
          fragment.appendChild(
            document.createTextNode(text.slice(lastIndex, offset))
          );
        }
        lastIndex = offset + match.length;

        // Trouver l'image correspondante
        const building = getBuildingFromLocal(priority, era, buildings);
        const normalizedBuilding = building
          ? building.toLowerCase().replace(/[^\w-]/g, "_")
          : "";

        const imgUrl =
          goodsUrlByEra.get(era)?.get(normalizedBuilding) || DEFAULT_IMG_URL;

        // Créer et configurer l'image
        const img = document.createElement("img");
        img.src = imgUrl;
        img.alt = `${priority}_${era.replace(/[<>"'/]/g, "")}`;
        img.width = 25;
        img.height = 25;
        img.decoding = "async";
        img.loading = "lazy";
        img.onerror = () => {
          img.src = DEFAULT_IMG_URL;
        };

        fragment.appendChild(img);
        return ""; // Empêche le remplacement par du texte
      });

      // Ajouter le texte restant après la dernière correspondance
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

  let number = parseFloat(value.replace(/[^\d.]/g, ""));
  if (value.includes("K")) number *= 1000;
  if (value.includes("M")) number *= 1000000;

  return isNaN(number) ? 0 : number;
}

export function formatNumber(value: number) {
  if (value >= 1000000) {
    return (value / 1000000).toFixed(1).replace(/\.0$/, "") + " M";
  } else if (value >= 1000) {
    return (value / 1000).toFixed(1).replace(/\.0$/, "") + " K";
  }
  return value.toString();
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
  levelMaxQty: Record<number, number>
): number {
  const levels = Object.keys(levelMaxQty).map(Number);
  const validLevels = levels.filter((l) => l <= level);
  if (validLevels.length === 0) return 1; // fallback par défaut
  const closest = Math.max(...validLevels);
  return levelMaxQty[closest];
}

export function getGoodsImg(buildingName: string) {
  const nameFormatted = buildingName.toLowerCase().replace(/[^\w-]/g, "_");

  return assetGoods[nameFormatted] || defaultGood;
}

export function findPreviousH2SpanWithId(
  element: Element
): HTMLSpanElement | null {
  let current: Element | null = element;

  while (current) {
    let prev = current.previousElementSibling;
    while (prev) {
      if (prev.tagName === "H2") {
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