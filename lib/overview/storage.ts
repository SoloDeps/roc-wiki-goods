// Import des eras pour le tri
import { eras } from "@/lib/constants";
import { parseNumber } from "@/lib/utils";
import { storage } from "#imports";

const STORAGE_KEY = "roc_saved_buildings";
const TECHNOS_STORAGE_KEY = "roc_saved_technos";

const RESOURCE_TYPES = {
  // Monnaies
  coins: "coins",
  coin: "coins",
  pennies: "pennies",
  "wu zhu": "wu_zhu",
  deben: "deben",
  dirham: "dirham",
  asper: "asper",

  // Nourriture et ressources
  food: "food",
  cocoa: "cocoa",
  rice: "rice",

  // Spéciaux
  gems: "gems",
  goods: "goods",
} as const;

export interface SavedBuilding {
  id: string;
  costs: {
    [key: string]: number | Array<{ type: string; amount: number }>;
  };
  maxQty: number;
  quantity: number;
}

export interface SavedTechno {
  id: string;
  costs: {
    [key: string]: number | Array<{ type: string; amount: number }>;
  };
}

export interface SavedData {
  buildings: SavedBuilding[];
}

export interface SavedTechnosData {
  technos: {
    [era: string]: {
      [technoIndex: string]: SavedTechno;
    };
  };
}

// Define storage item avec fallback
export const savedBuildingsStorage = storage.defineItem<SavedData>(
  `local:${STORAGE_KEY}`,
  {
    fallback: {
      buildings: [],
    },
  }
);

// Define storage item pour les technos avec fallback
export const savedTechnosStorage = storage.defineItem<SavedTechnosData>(
  `local:${TECHNOS_STORAGE_KEY}`,
  {
    fallback: {
      technos: {},
    },
  }
);

// Chargement depuis WXT storage
export async function loadSavedBuildings(): Promise<SavedData> {
  try {
    const data = await savedBuildingsStorage.getValue();
    return data;
  } catch (error) {
    console.error("Error loading saved buildings:", error);
    return {
      buildings: [],
    };
  }
}

// Sauvegarde d'un bâtiment
export async function saveBuilding(
  row: HTMLTableRowElement,
  rowId: string,
  metadata: { maxQty: number; quantity: number }
) {
  const data = await loadSavedBuildings();

  // Supprime l'ancienne version si elle existe
  data.buildings = data.buildings.filter((b) => b.id !== rowId);

  // Extrait les coûts UNITAIRES
  const unitCosts = extractCosts(row);

  data.buildings.push({
    id: rowId,
    costs: unitCosts,
    ...metadata,
  });

  await savedBuildingsStorage.setValue(data);
}

// Mise à jour de la quantité
export async function updateBuildingQuantity(
  rowId: string,
  newQuantity: number
) {
  const data = await loadSavedBuildings();
  const building = data.buildings.find((b) => b.id === rowId);
  if (!building) return;

  const max = building.maxQty ?? 40; // Maximum de 40 pour éviter les valeurs excessives
  building.quantity = Math.max(1, Math.min(max, newQuantity));

  await savedBuildingsStorage.setValue(data);
}

// Suppression d'un bâtiment
export async function removeBuilding(rowId: string) {
  const data = await loadSavedBuildings();
  data.buildings = data.buildings.filter((b) => b.id !== rowId);
  await savedBuildingsStorage.setValue(data);
}

// Watch pour écouter les changements (utile pour popup/options page)
export function watchSavedBuildings(callback: (newData: SavedData) => void) {
  return savedBuildingsStorage.watch((newData) => {
    callback(newData);
  });
}

// Chargement des technos depuis WXT storage
export async function loadSavedTechnos(): Promise<SavedTechnosData> {
  try {
    const data = await savedTechnosStorage.getValue();
    return data;
  } catch (error) {
    console.error("Error loading saved technos:", error);
    return {
      technos: {},
    };
  }
}

// Mettre à jour les technologies d'une ère spécifique (ajoute et supprime selon la sélection)
export async function updateEraTechnos(
  eraPath: string,
  technos: SavedTechno[]
) {
  const data = await loadSavedTechnos();

  // Organiser les technologies par index
  const organizedTechnos: { [index: string]: SavedTechno } = {};

  technos.forEach((techno) => {
    // Extraire l'index depuis l'ID : techno_mainSection_subSection_thirdSection_index
    const idParts = techno.id.split("_");
    if (idParts.length >= 5) {
      const index = idParts[idParts.length - 1]; // Dernière partie est l'index
      organizedTechnos[index] = techno;
    }
  });

  // Remplacer complètement les technologies de cette ère
  data.technos[eraPath] = organizedTechnos;

  await savedTechnosStorage.setValue(data);
}

// Sauvegarde des technos sélectionnées
export async function saveTechnos(technos: SavedTechno[]) {
  const data = await loadSavedTechnos();

  // Organiser les technologies par ère en utilisant exactement la même logique que les IDs
  technos.forEach((techno) => {
    // Extraire l'ère depuis l'ID : techno_mainSection_subSection_thirdSection_index
    const idParts = techno.id.split("_");
    if (idParts.length >= 5) {
      // techno + au moins 3 parties + index
      const era = idParts.slice(1, -1).join("_"); // Prend tout sauf "techno" et l'index

      if (!data.technos[era]) {
        data.technos[era] = {};
      }

      // Extraire l'index (dernière partie)
      const index = idParts[idParts.length - 1];
      data.technos[era][index] = techno;
    }
  });

  await savedTechnosStorage.setValue(data);
}

// Watch pour écouter les changements des technos
export function watchSavedTechnos(
  callback: (newData: SavedTechnosData) => void
) {
  return savedTechnosStorage.watch((newData) => {
    callback(newData);
  });
}

// Suppression d'une techno
export async function removeTechno(technoId: string) {
  const data = await loadSavedTechnos();

  // Parcourir toutes les ères pour trouver et supprimer la techno
  Object.keys(data.technos).forEach((era) => {
    const technosInEra = data.technos[era];
    Object.keys(technosInEra).forEach((index) => {
      if (technosInEra[index].id === technoId) {
        delete technosInEra[index];
      }
    });

    // Si l'ère est vide après suppression, la supprimer aussi
    if (Object.keys(technosInEra).length === 0) {
      delete data.technos[era];
    }
  });

  await savedTechnosStorage.setValue(data);
}

// Suppression de toutes les technos
export async function removeAllTechnos() {
  const data = {
    technos: {},
  };
  await savedTechnosStorage.setValue(data);
}

// Fonction pour aplatir et trier les technos selon l'ordre des eras
export function flattenAndSortTechnos(
  technosData: SavedTechnosData
): SavedTechno[] {
  const flattenedTechnos: SavedTechno[] = [];

  // Créer un mapping des noms d'ères normalisés vers les abréviations
  const eraNameToAbbr: Record<string, string> = {};
  eras.forEach((era) => {
    eraNameToAbbr[era.id] = era.abbr;
  });

  // Obtenir l'ordre des eras à partir du tableau eras
  const eraOrder = eras.map((era) => era.abbr);

  // Trier les clés (ères) selon l'ordre défini dans constants.ts
  const sortedEras = Object.keys(technosData.technos).sort((a, b) => {
    const abbrA = eraNameToAbbr[a] || a;
    const abbrB = eraNameToAbbr[b] || b;

    const indexA = eraOrder.indexOf(abbrA as (typeof eras)[0]["abbr"]);
    const indexB = eraOrder.indexOf(abbrB as (typeof eras)[0]["abbr"]);

    // Si les deux sont dans la liste des eras, trier selon leur ordre
    if (indexA !== -1 && indexB !== -1) {
      return indexA - indexB;
    }

    // Si seulement un est dans la liste, mettre celui qui est dans la liste en premier
    if (indexA !== -1) return -1;
    if (indexB !== -1) return 1;

    // Si aucun n'est dans la liste, trier alphabétiquement
    return a.localeCompare(b);
  });

  // Aplatir les technos dans l'ordre trié
  sortedEras.forEach((era) => {
    const technosInEra = technosData.technos[era];
    if (technosInEra) {
      // Trier les technos dans chaque ère par index (numérique)
      const sortedTechnosInEra = Object.entries(technosInEra)
        .sort(([indexA], [indexB]) => {
          const numA = parseInt(indexA, 10);
          const numB = parseInt(indexB, 10);
          return isNaN(numA) || isNaN(numB) ? 0 : numA - numB;
        })
        .map(([, techno]) => techno);

      flattenedTechnos.push(...sortedTechnosInEra);
    }
  });

  return flattenedTechnos;
}

// Extraction des coûts UNITAIRES (coins, food, others, goods uniquement)
export function extractCosts(row: HTMLTableRowElement): SavedBuilding["costs"] {
  const cells = Array.from(row.cells);
  const costs: SavedBuilding["costs"] = {};

  // Récupère les noms de colonnes depuis le header
  const headerRow = row.parentElement?.querySelector("tr");
  const columnMap: Record<number, string> = {};

  if (headerRow) {
    Array.from(headerRow.cells).forEach((th, i) => {
      columnMap[i] = th.textContent?.trim().toLowerCase() || "";
    });
  }

  // Parcourt chaque cellule
  cells.forEach((cell, index) => {
    const columnName = columnMap[index] || "";

    // Cherche si cette colonne correspond à un type de ressource connu
    const resourceKey =
      RESOURCE_TYPES[columnName as keyof typeof RESOURCE_TYPES];

    if (!resourceKey) return; // Skip les colonnes inconnues

    // Cas spécial : goods (extraction complexe)
    if (resourceKey === "goods") {
      costs.goods = extractGoodsDetails(cell);
      return;
    }

    // Cas général : ressources simples (coins, food, gems, etc.)
    let originalText = "";

    cell.childNodes.forEach((node) => {
      if (node.nodeType === Node.TEXT_NODE) {
        const textNode = node as Text;
        originalText +=
          (textNode as any).dataOriginal ?? textNode.textContent ?? "";
      }
    });

    originalText = originalText.trim();

    // Nettoie les références d'images (Coin.png, Food.png, etc.)
    const cleanedText = originalText.replace(/\w+\.png/g, "").trim();
    const value = parseNumber(cleanedText);

    if (value > 0) {
      costs[resourceKey] = value;
    }
  });

  return costs;
}

// Extrait les détails des goods depuis la cellule (img & textes)
function extractGoodsDetails(
  cell: HTMLTableCellElement
): Array<{ type: string; amount: number }> {
  const details: Array<{ type: string; amount: number }> = [];

  // 🔹 Reconstruire un HTML "original" (img + texte unitaire)
  let originalHTML = "";

  cell.childNodes.forEach((node) => {
    if (node.nodeType === Node.TEXT_NODE) {
      originalHTML += (node as any).dataOriginal ?? node.textContent ?? "";
    } else if (node.nodeName === "BR") {
      originalHTML += "<br>";
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      originalHTML += (node as HTMLElement).outerHTML;
    }
  });

  // 🔹 Split par ligne
  const lines = originalHTML.split(/<br\s*\/?>/i);

  for (const line of lines) {
    if (!line.trim()) continue;

    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = line.trim();

    const textContent = tempDiv.textContent || "";

    // === TEXTE Primary / Secondary / Tertiary ===
    const primaryMatch = textContent.match(/Primary:\s*([A-Z]+)\s*([\d,]+)/i);
    if (primaryMatch) {
      details.push({
        type: `Primary_${primaryMatch[1]}`,
        amount: parseNumber(primaryMatch[2]),
      });
      continue;
    }

    const secondaryMatch = textContent.match(
      /Secondary:\s*([A-Z]+)\s*([\d,]+)/i
    );
    if (secondaryMatch) {
      details.push({
        type: `Secondary_${secondaryMatch[1]}`,
        amount: parseNumber(secondaryMatch[2]),
      });
      continue;
    }

    const tertiaryMatch = textContent.match(/Tertiary:\s*([A-Z]+)\s*([\d,]+)/i);
    if (tertiaryMatch) {
      details.push({
        type: `Tertiary_${tertiaryMatch[1]}`,
        amount: parseNumber(tertiaryMatch[2]),
      });
      continue;
    }

    // === IMG + nombre ===
    const img = tempDiv.querySelector("img");
    if (!img) continue;

    // ✅ Priorité alt, fallback src
    let goodType = "";
    const alt = (img.getAttribute("alt") || "").replace(".png", "").trim();
    if (alt) {
      goodType = alt;
    } else {
      const src = img.getAttribute("src") || "";
      const srcMatch = src.match(/\/([^\/]+)\.png/i);
      if (srcMatch) goodType = srcMatch[1].replace(/^\d+px-/, "");
    }

    const valueMatch = textContent.match(/([\d,]+)/);
    if (valueMatch && goodType) {
      details.push({ type: goodType, amount: parseNumber(valueMatch[1]) });
    }
  }

  return details;
}
