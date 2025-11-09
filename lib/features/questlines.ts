import {
  eras,
  EraAbbr,
  buildingsAbbr,
  itemsUrl,
  goodsUrlByEra,
} from "@/lib/constants";
import { getTitlePage, questsFormatNumber } from "@/lib/utils";
import { questsRequirements } from "@/lib/data/questsData";
import type { QuestRequirements } from "@/lib/data/questsData";

type QuestRequirementCategory = keyof QuestRequirements;

const categoryIndex: Record<string, number> = {
  primary: 0,
  secondary: 1,
  tertiary: 2,
};

export function getPreviousAndCurrentEra(abbr: string) {
  const index = eras.findIndex((era) => era.abbr === abbr);
  if (index === -1) {
    throw new Error(`Era abbreviation "${abbr}" not found`);
  }

  const previousEraName = eras[index - 1]?.name ?? null;
  const currentEraName = eras[index].name;

  return { previousEraName, currentEraName };
}

function getRequirementsValueSafe(
  dataAttr: string,
  userEra: EraAbbr,
  userWorkshops: string[]
): {
  imgSrc?: string;
  alt?: string;
  width?: number;
  height?: number;
  label: string;
} {
  const [typeRaw, sizeRaw] = dataAttr.split("_");
  const type = typeRaw.toLowerCase() as QuestRequirementCategory;
  const size = sizeRaw.toLowerCase();

  let category = type;
  let item = typeRaw;
  let imgSrc = "";
  let alt = "";

  // --- Détection goods ---
  if (["primary", "secondary", "tertiary"].includes(type)) {
  category = "goods";

  if (userEra !== "SA") {
    const catIndex = categoryIndex[type];
    const workshop = userWorkshops[catIndex]
      ?.toLowerCase()
      .replace(/\s+/g, "_") || "";

    const data = goodsUrlByEra[userEra]?.[workshop];

    if (data) {
      item = data.name;
      imgSrc = data.url;
      alt = data.name;
    } else {
      // fallback si aucune donnée de goods n'est trouvée
      item = `${typeRaw} Goods`;
      imgSrc = itemsUrl.default;
      alt = "goods";
    }
  } else {
    item = "Food";
    imgSrc = itemsUrl.food;
    alt = "Food";
  }
}


  // --- Coins / Food ---
  else if (category === "food") {
    imgSrc = itemsUrl.food;
    alt = "Food";
  } else if (category === "coins") {
    imgSrc = itemsUrl.coins;
    alt = "Coins";
  }

  // --- Units (aucune image, juste label texte) ---
  else if (["cavalry", "heavy", "infantry", "ranged", "siege"].includes(type)) {
    const unitsData = questsRequirements[type][size];
    let unitValue;

    if (unitsData[userEra]) {
      unitValue = unitsData[userEra];
    } else {
      const values = Object.values(unitsData);
      unitValue = values[values.length - 1];
    }

    return { label: unitValue };
  }

  // --- Cas normaux (avec image) ---
  const amount = questsFormatNumber(
    questsRequirements[category][size][userEra] as number
  );

  return {
    imgSrc,
    alt,
    width: 25,
    height: 25,
    label: `${amount} ${item}`,
  };
}

export function useQuestlines(era: EraAbbr | null, buildings: string[][]) {
  if (era === null) return;
  const [mainSection, secondSection] = getTitlePage();
  if (mainSection !== "events" || secondSection == null) return;
  const index = buildingsAbbr.findIndex((b) => b.abbreviations.includes(era));
  if (index === -1) return;

  const userWorkshops = buildings[index];
  const tables = Array.from(
    document.querySelectorAll("table.mw-collapsible")
  ) as HTMLTableElement[];
  if (tables.length === 0) return;

  const { previousEraName, currentEraName } = getPreviousAndCurrentEra(era);
  const cache = new Map<string, ReturnType<typeof getRequirementsValueSafe>>();

  tables.forEach((table) => {
    const spans = Array.from(
      table.querySelectorAll("span[data-attr]")
    ) as HTMLSpanElement[];

    for (const span of spans) {
      const dataAttr = span.getAttribute("data-attr");
      if (!dataAttr) continue;

      // --- Cache ---
      if (!cache.has(dataAttr)) {
        cache.set(
          dataAttr,
          getRequirementsValueSafe(dataAttr, era, userWorkshops)
        );
      }
      const result = cache.get(dataAttr)!;

      // --- Trouver le <b> existant ---
      const [typeRaw] = dataAttr.split("_");
      const type = typeRaw.toLowerCase();
      const boldNode = Array.from(span.querySelectorAll("b")).find((b) => {
        const text = b.textContent?.toLowerCase() || "";
        if (["primary", "secondary", "tertiary"].includes(type))
          return text.includes("goods");
        if (type === "coins") return text.includes("coins");
        if (type === "food") return text.includes("food");
        if (["cavalry", "heavy", "infantry", "ranged", "siege"].includes(type))
          return text.includes("units") || text.includes("unit");
        return false;
      });
      if (!boldNode || !boldNode.parentNode) continue;

      // --- Création sécurisée du fragment ---
      const fragment = document.createDocumentFragment();

      if (result.imgSrc) {
        const img = document.createElement("img");
        img.src = result.imgSrc;
        img.alt = result.alt || "";
        img.width = result.width ?? 25;
        img.height = result.height ?? 25;

        const newB = document.createElement("b");
        newB.textContent = result.label;

        fragment.appendChild(img);
        fragment.appendChild(document.createTextNode(" "));
        fragment.appendChild(newB);
      } else {
        // Cas des unités (pas d’image)
        const newB = document.createElement("b");
        newB.textContent = result.label;
        fragment.appendChild(newB);
      }

      // --- Remplacement du <b> existant ---
      boldNode.parentNode.replaceChild(fragment, boldNode);

      // --- Supprime le texte "(or era equivalent)" s'il existe dans le même span ---
      const textNodes = Array.from(span.childNodes).filter(
        (n) => n.nodeType === Node.TEXT_NODE
      ) as Text[];

      for (const node of textNodes) {
        if (/\(or\s+era\s+equivalent\)/i.test(node.textContent || "")) {
          node.textContent = (node.textContent || "").replace(
            /\(or\s+era\s+equivalent\)/gi,
            ""
          );
        }
      }
    }

    // --- Remplacement [Previous Era] / [Current Era] + ajout image Research Points ---
    const textSpans = Array.from(table.querySelectorAll("span"));
    for (const span of textSpans) {
      const text = span.textContent?.toLowerCase() || "";

      // --- Partie 1 : remplace Previous/Current Era ---
      if (text.includes("[previous era]") || text.includes("[current era]")) {
        const walker = document.createTreeWalker(span, NodeFilter.SHOW_TEXT);
        while (walker.nextNode()) {
          const node = walker.currentNode as Text;
          let newText = node.nodeValue || "";
          if (previousEraName) {
            newText = newText
              .replace(/\[Previous Era\]/g, previousEraName)
              .replace(/\[Current Era\]/g, currentEraName);
          } else {
            newText = newText
              .replace(
                /\[Previous Era\]\s*or\s*\[Current Era\]/gi,
                currentEraName
              )
              .replace(/\[Current Era\]/g, currentEraName);
          }
          if (newText !== node.nodeValue) node.nodeValue = newText;
        }
      }

      // --- Partie 2 : ajout image et fusion "Research Points" dans <b> ---
      if (text.includes("research points")) {
        const bolds = Array.from(span.querySelectorAll("b"));
        for (const b of bolds) {
          const bText = b.textContent?.toLowerCase() || "";

          // Cas 1 : déjà dans le <b>
          if (bText.includes("research points")) {
            const hasImg = b.previousSibling instanceof HTMLImageElement;
            if (!hasImg) {
              const img = document.createElement("img");
              img.src = itemsUrl.research;
              img.alt = "Research Points";
              img.width = 25;
              img.height = 25;
              b.parentNode?.insertBefore(img, b);
              b.parentNode?.insertBefore(document.createTextNode(" "), b);
            }
            continue;
          }

          // Cas 2 : "Research Points" est après le <b>
          const nextNode = b.nextSibling;
          if (
            nextNode &&
            nextNode.nodeType === Node.TEXT_NODE &&
            nextNode.textContent &&
            /research points/i.test(nextNode.textContent)
          ) {
            b.textContent = (b.textContent || "") + " Research Points";
            nextNode.textContent = nextNode.textContent.replace(
              /research points/i,
              ""
            );
            const hasImg = b.previousSibling instanceof HTMLImageElement;
            if (!hasImg) {
              const img = document.createElement("img");
              img.src = itemsUrl.research;
              img.alt = "Research Points";
              img.width = 25;
              img.height = 25;
              b.parentNode?.insertBefore(img, b);
              b.parentNode?.insertBefore(document.createTextNode(" "), b);
            }
          }
        }
      }
    }
  });
}
