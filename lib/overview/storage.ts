import { parseNumber } from "@/lib/utils";
import { storage } from "#imports";

const STORAGE_KEY = "roc_saved_buildings";

export interface SavedBuilding {
  id: string;
  pageUrl: string;
  tableType: string;
  era: string;
  level: string;
  mainSection: string;
  subSection: string;
  buildingName: string;
  quantity: number;
  maxQty: number;
  h2Title: string;
  costs: {
    coins?: number;
    food?: number;
    goods?: Array<{
      type: string;
      amount: number;
    }>;
  };
  timestamp: number;
}

export interface SavedData {
  buildings: SavedBuilding[];
  totals: {
    coins: number;
    food: number;
    goods: number;
  };
}

// Define storage item avec fallback
const savedBuildingsStorage = storage.defineItem<SavedData>(
  `sync:${STORAGE_KEY}`,
  {
    fallback: {
      buildings: [],
      totals: { coins: 0, food: 0, goods: 0 },
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
      totals: { coins: 0, food: 0, goods: 0 },
    };
  }
}

// Sauvegarde d'un bâtiment
export async function saveBuilding(
  row: HTMLTableRowElement,
  rowId: string,
  metadata: Omit<SavedBuilding, "id" | "costs" | "timestamp">
) {
  const data = await loadSavedBuildings();

  // Supprime l'ancienne version si elle existe
  data.buildings = data.buildings.filter((b) => b.id !== rowId);

  // Extrait les coûts UNITAIRES (depuis dataOriginal)
  const unitCosts = extractCosts(row);

  console.log("Saving building:", {
    rowId,
    quantity: metadata.quantity,
    unitCosts,
  });

  data.buildings.push({
    id: rowId,
    ...metadata,
    costs: unitCosts,
    timestamp: Date.now(),
  });

  recalculateTotals(data);

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

  const max = building.maxQty ?? Infinity;

  building.quantity = Math.max(1, Math.min(max, newQuantity));
  building.timestamp = Date.now();

  recalculateTotals(data);
  await savedBuildingsStorage.setValue(data);
}

// Suppression d'un bâtiment
export async function removeBuilding(rowId: string) {
  const data = await loadSavedBuildings();
  data.buildings = data.buildings.filter((b) => b.id !== rowId);
  recalculateTotals(data);
  await savedBuildingsStorage.setValue(data);
}

// Watch pour écouter les changements (utile pour popup/options page)
export function watchSavedBuildings(
  callback: (newData: SavedData, oldData: SavedData) => void
) {
  return savedBuildingsStorage.watch(callback);
}

// Extraction des coûts UNITAIRES (coins, food, goods uniquement)
function extractCosts(row: HTMLTableRowElement): SavedBuilding["costs"] {
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

    // Skip tout sauf coins, food, goods
    if (!["coins", "food", "goods"].includes(columnName)) return;

    // Extrait le texte ORIGINAL (non multiplié)
    let originalText = "";

    cell.childNodes.forEach((node) => {
      if (node.nodeType === Node.TEXT_NODE) {
        const textNode = node as Text;
        originalText +=
          (textNode as any).dataOriginal ?? textNode.textContent ?? "";
      }
    });

    originalText = originalText.trim();

    // Traite selon le type de colonne
    switch (columnName) {
      case "coins":
        costs.coins = parseNumber(originalText.replace(/Coin\.png/g, ""));
        break;

      case "food":
        costs.food = parseNumber(originalText.replace(/Food\.png/g, ""));
        break;

      case "goods":
        costs.goods = extractGoodsDetails(cell);
        break;
    }
  });

  return costs;
}

// Extrait les détails des goods depuis la cellule
function extractGoodsDetails(
  cell: HTMLTableCellElement
): Array<{ type: string; amount: number }> {
  const details: Array<{ type: string; amount: number }> = [];

  // Parcourt tous les enfants de la cellule
  const children = Array.from(cell.childNodes);

  for (let i = 0; i < children.length; i++) {
    const node = children[i];

    // Cherche les images suivies de valeurs
    if (node.nodeType === Node.ELEMENT_NODE) {
      const element = node as HTMLElement;

      if (element.tagName === "IMG") {
        const alt = element.getAttribute("alt") || "";

        // Récupère le prochain noeud texte
        let nextNode = children[i + 1];
        if (nextNode && nextNode.nodeType === Node.TEXT_NODE) {
          const textNode = nextNode as Text;
          const originalValue =
            (textNode as any).dataOriginal ?? textNode.textContent ?? "";
          const valueMatch = originalValue.trim().match(/^([\d,]+)/);

          if (valueMatch) {
            const amount = parseNumber(valueMatch[1]);

            // Détermine le type de good
            let goodType = alt.replace(".png", "");

            // Cas spécial : si alt contient "Primary" ou "Tertiary"
            if (goodType.includes("Primary") || goodType.includes("Tertiary")) {
              goodType = goodType.replace("_EG", "").replace("EG", "");
              if (!goodType.includes("_")) {
                goodType = goodType + "_EG";
              }
            }

            details.push({ type: goodType, amount });
          }
        }
      }
    }

    // Gère aussi le format texte pur "Primary: EG 1,000"
    if (node.nodeType === Node.TEXT_NODE) {
      const textNode = node as Text;
      const originalText =
        (textNode as any).dataOriginal ?? textNode.textContent ?? "";

      // Primary: EG 1,000
      const primaryMatch = originalText.match(/Primary:\s*EG\s*([\d,]+)/i);
      if (primaryMatch) {
        const amount = parseNumber(primaryMatch[1]);
        const exists = details.some((d) => d.type === "Primary_EG");
        if (!exists) {
          details.push({ type: "Primary_EG", amount });
        }
      }

      // Tertiary: EG 1,000
      const tertiaryMatch = originalText.match(/Tertiary:\s*EG\s*([\d,]+)/i);
      if (tertiaryMatch) {
        const amount = parseNumber(tertiaryMatch[1]);
        const exists = details.some((d) => d.type === "Tertiary_EG");
        if (!exists) {
          details.push({ type: "Tertiary_EG", amount });
        }
      }
    }
  }

  return details;
}

// Recalcule les totaux en multipliant par les quantités
function recalculateTotals(data: SavedData) {
  data.totals = {
    coins: 0,
    food: 0,
    goods: 0,
  };

  data.buildings.forEach((building) => {
    const qty = building.quantity;

    if (building.costs.coins) {
      data.totals.coins += building.costs.coins * qty;
    }
    if (building.costs.food) {
      data.totals.food += building.costs.food * qty;
    }
    if (building.costs.goods) {
      const goodsTotal = building.costs.goods.reduce(
        (sum, g) => sum + g.amount,
        0
      );
      data.totals.goods += goodsTotal * qty;
    }
  });
}
