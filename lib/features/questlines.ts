import {
  eras,
  EraAbbr,
  buildingsAbbr,
  itemsUrl,
  goodsUrlByEra,
} from "@/lib/constants";
import { getTitlePage, questsFormatNumber } from "@/lib/utils";
import { questsRequirements, unitsData } from "@/lib/data/questsData";
import type { QuestRequirements, UnitsDataType } from "@/lib/data/questsData";

type QuestRequirementCategory = keyof QuestRequirements;
type QuestUnitsRequirements = keyof UnitsDataType;

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

// function getRequirementsValueSafe(
//   dataAttr: string,
//   userEra: EraAbbr,
//   userWorkshops: string[]
// ): {
//   imgSrc?: string;
//   alt?: string;
//   width?: number;
//   height?: number;
//   label: string;
// } {
//   const [typeRaw, sizeRaw] = dataAttr.split("_");
//   const type = typeRaw.toLowerCase() as QuestRequirementCategory;
//   const size = sizeRaw.toLowerCase();

//   console.log(type + " " + size);

//   let category = type;
//   let item = typeRaw;
//   let imgSrc = "";
//   let alt = "";

//   // --- Détection goods ---
//   if (["primary", "secondary", "tertiary"].includes(type)) {
//     category = "goods";

//     if (userEra !== "SA") {
//       const catIndex = categoryIndex[type];
//       const workshop =
//         userWorkshops[catIndex]?.toLowerCase().replace(/\s+/g, "_") || "";

//       const data = goodsUrlByEra[userEra]?.[workshop];

//       if (data) {
//         item = data.name;
//         imgSrc = data.url;
//         alt = data.name;
//       } else {
//         // fallback si aucune donnée de goods n'est trouvée
//         item = `${typeRaw} Goods`;
//         imgSrc = itemsUrl.default;
//         alt = "goods";
//       }
//     } else {
//       item = "Food";
//       imgSrc = itemsUrl.food;
//       alt = "Food";
//     }
//   }

//   // --- Units ---
//   if (
//     ["cavalry", "heavyinfantry", "infantry", "ranged", "siege"].includes(type)
//   ) {
//     const imgSize = 28;
//     const unitType = type as QuestUnitsRequirements;
//     const unitsQuestValues = questsRequirements[unitType][size];

//     let numberValue;
//     let unitInfos;

//     if (unitsQuestValues[userEra]) {
//       numberValue = unitsQuestValues[userEra][0];
//       const unit_type = unitsQuestValues[userEra][1];

//       unitInfos = unitsData[unit_type][userEra];

//       console.log("unitInfos", unitInfos);
//       console.log("++++");

//     } else {
//       const values = Object.values(unitsQuestValues);
//       console.log(values);

//       const lastValue = values[values.length - 1];
//       console.log("last value:", lastValue);

//       numberValue = lastValue[0];
//       unitInfos = unitsData[lastValue[1]][userEra];
//       console.log("unitInfos", unitInfos);
//       console.log("====");
//     }

//     const line = numberValue + " " + unitInfos[0];
//     console.log(line);

//     console.log("numberValue", numberValue);
//     console.log("unitInfos", unitInfos[1]);

//     return {
//       imgSrc: `https://riseofcultures.wiki.gg/images/thumb/${unitInfos[1]}.png/${imgSize}px-${unitInfos[1]}.png`,
//       alt: unitInfos[1],
//       width: imgSize,
//       height: imgSize,
//       label: line,
//     };
//   }

//   // --- Coins / Food ---
//   if (category === "food") {
//     imgSrc = itemsUrl.food;
//     alt = "Food";
//   } else if (category === "coins") {
//     imgSrc = itemsUrl.coins;
//     alt = "Coins";
//   }

//   // --- Cas normaux (avec image) ---
//   const amount = questsFormatNumber(
//     questsRequirements[category][size][userEra] as number
//   );

//   return {
//     imgSrc,
//     alt,
//     width: 25,
//     height: 25,
//     label: `${amount} ${item}`,
//   };
// }

function getRequirementsValueSafe(
  dataAttr: string,
  userEra: EraAbbr,
  userWorkshops: string[]
) {
  const [typeRaw, sizeRaw] = dataAttr.split("_");
  const type = typeRaw.toLowerCase() as QuestRequirementCategory;
  const size = sizeRaw.toLowerCase();

  // console.log("==========");
  // console.log(type + " " + size);

  let category = type;
  let item = typeRaw;
  let imgSrc = "";
  let alt = "";

  const isGoods = ["primary", "secondary", "tertiary"].includes(type);
  const isUnit = [
    "cavalry",
    "heavyinfantry",
    "infantry",
    "ranged",
    "siege",
  ].includes(type);

  // Goods
  if (isGoods) {
    category = "goods";

    if (userEra !== "SA") {
      const catIndex = categoryIndex[type];
      const workshop =
        userWorkshops[catIndex]?.toLowerCase().replace(/\s+/g, "_") || "";
      const data = goodsUrlByEra[userEra]?.[workshop];

      if (data) {
        item = data.name;
        imgSrc = data.url;
        alt = data.name;
      } else {
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

  // Units
  if (isUnit) {
    const imgSize = 28;
    const unitType = type as QuestUnitsRequirements;
    const unitsQuestValues = questsRequirements[unitType][size];

    // Récupère soit l'ère exacte, soit la dernière valeur disponible
    const eraValues =
      unitsQuestValues[userEra] ??
      Object.values(unitsQuestValues)[
        Object.values(unitsQuestValues).length - 1
      ];

    const [numberValue, unitTypeKey] = eraValues;
    // @ts-ignore
    const unitInfos = unitsData[unitTypeKey][userEra]; // [name, img]

    return {
      imgSrc: `https://riseofcultures.wiki.gg/images/thumb/${unitInfos[1]}.png/${imgSize}px-${unitInfos[1]}.png`,
      alt: unitInfos[1],
      width: imgSize,
      height: imgSize,
      label: `${numberValue} ${unitInfos[0]}`,
    };
  }

  // Coins / Food / Others
  if (category === "food") {
    imgSrc = itemsUrl.food;
    alt = "Food";
  } else if (category === "coins") {
    imgSrc = itemsUrl.coins;
    alt = "Coins";
  }

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
        if (
          ["cavalry", "heavyinfantry", "infantry", "ranged", "siege"].includes(
            type
          )
        )
          return text;
        return false;
      });
      if (!boldNode || !boldNode.parentNode) continue;

      // --- Cas spécial : si le <b> contient un <br> ---
      const hasBr = Array.from(boldNode.childNodes).some(
        (node) => node.nodeName === "BR"
      );

      if (hasBr) {
        // Parcourir les nœuds enfants du <b>
        const childNodes = Array.from(boldNode.childNodes);
        let foundBr = false;

        for (let i = 0; i < childNodes.length; i++) {
          const node = childNodes[i];

          // Détecter le <br>
          if (node.nodeName === "BR") {
            foundBr = true;
            continue;
          }

          // Après le <br>, chercher le texte contenant le mot-clé
          if (foundBr && node.nodeType === Node.TEXT_NODE) {
            const textContent = node.textContent || "";
            let keyword = type;
            if (["primary", "secondary", "tertiary"].includes(type)) {
              keyword = "goods";
            }

            const regex = new RegExp(`\\b${keyword}\\b`, "i");

            if (regex.test(textContent)) {
              // Créer le fragment de remplacement
              const fragment = document.createDocumentFragment();

              // Texte avant le mot-clé
              const parts = textContent.split(regex);
              const beforeMatch = parts[0];
              if (beforeMatch) {
                fragment.appendChild(document.createTextNode(beforeMatch));
              }

              // Image + label
              if (result.imgSrc) {
                const img = document.createElement("img");
                img.src = result.imgSrc;
                img.alt = result.alt || "";
                img.width = result.width ?? 25;
                img.height = result.height ?? 25;
                fragment.appendChild(img);
                fragment.appendChild(document.createTextNode(" "));
              }

              fragment.appendChild(document.createTextNode(result.label));

              // Texte après le mot-clé
              const afterMatch = parts[1];
              if (afterMatch) {
                fragment.appendChild(document.createTextNode(afterMatch));
              }

              // Remplacer le nœud texte
              boldNode.replaceChild(fragment, node);
              break;
            }
          }
        }

        continue;
      }

      // --- Création sécurisée du fragment (comportement normal) ---
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
        // Cas des unités (pas d'image)
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
              img.src = itemsUrl.research_points;
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
              img.src = itemsUrl.research_points;
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
