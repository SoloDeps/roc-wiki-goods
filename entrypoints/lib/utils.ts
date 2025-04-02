import { buildingsAbbr, goodsUrlByEra } from "./constants";

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
  const elements = document.querySelectorAll("td");
  const imageReplaceRegex = /(primary|secondary|tertiary):\s*([A-Z]{2})/gi;
  const defaultImgUrl = "/images/thumb/3/36/Goods.png/25px-Goods.png";

  elements.forEach((el) => {
    // Use innerHTML for read-only
    let newHtml = el.innerHTML;

    newHtml = newHtml.replace(imageReplaceRegex, (_, priority, era) => {
      if (!buildings || buildings.length === 0) {
        return `<img src="${defaultImgUrl}" alt="default_goods" decoding="async" loading="lazy" width="25" height="25">`;
      }

      // Sanitize and retrieve building information
      const building = getBuildingFromLocal(priority, era, buildings);
      const normalizedBuilding = building
        ? building.toLowerCase().replace(/[^\w-]/g, "_")
        : "";

      // Retrieve image URL securely with fallback
      // @ts-ignore
      const imgUrl = goodsUrlByEra[era]?.[normalizedBuilding] || defaultImgUrl;

      // Return image tag directly with imgUrl
      return `<img 
        src="${imgUrl}" 
        alt="${priority}_${era.replace(/[<>"'/]/g, "")}" 
        decoding="async" 
        loading="lazy" 
        width="25" 
        height="25"
        onerror="this.src='${defaultImgUrl}'" 
      >`;
    });

    el.replaceChildren();
    el.insertAdjacentHTML("beforeend", newHtml);
  });
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
