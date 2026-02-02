/**
 * ✅ OTTOMAN DATA PARSER & SAVER (Client-side)
 *
 * Ce fichier parse les données du fichier ottoman.ts et les sauvegarde via storage.ts
 * Pattern identique à buildings/technos : UI → storage.ts → background.ts → repository.ts
 */

import { areas_table, trade_post_table } from "@/lib/data/ottoman";
import { saveOttomanArea, saveOttomanTradePost } from "@/lib/overview/storage";
import { slugify } from "@/lib/utils";
import type {
  OttomanAreaEntity,
  OttomanTradePostEntity,
} from "@/lib/storage/dexie";
import { goodsByCivilization } from "../constants";

// ==================== PARSER POUR LES AREAS ====================

const ottomanGoods = goodsByCivilization["OTTOMAN EMPIRE"].goods

/**
 * Parse une Area depuis le fichier ottoman.ts
 */
export function parseOttomanArea(
  areaIndex: number,
): Omit<OttomanAreaEntity, "updatedAt"> | null {
  const areaData = areas_table[areaIndex as keyof typeof areas_table];

  if (!areaData || areaData.length === 0) {
    console.warn(`⚠️ No data found for area ${areaIndex}`);
    return null;
  }

  const costs: OttomanAreaEntity["costs"] = { goods: [] };

  areaData.forEach((item) => {
    const resource = item.resource.toLowerCase();
    const amount = item.amount;

    // Goods Ottoman

    if (ottomanGoods.includes(resource)) {
      // C'est un good
      (costs.goods as Array<{ type: string; amount: number }>).push({
        type: slugify(resource),
        amount,
      });
    } else {
      // C'est une ressource principale (aspers, gems, etc.)
      costs[resource] = amount;
    }
  });

  return {
    id: `area_${areaIndex}`,
    areaIndex,
    costs,
    hidden: false,
  };
}

// ==================== PARSER POUR LES TRADE POSTS ====================

/**
 * Calcule les coûts agrégés d'un Trade Post basé sur les niveaux sélectionnés
 */
export function calculateTradePostCosts(
  tradePostData: any,
  enabledLevels: OttomanTradePostEntity["levels"],
): OttomanTradePostEntity["costs"] {
  const costs: OttomanTradePostEntity["costs"] = { goods: [] };
  const goodsMap = new Map<string, number>();

  // Mapping des niveaux
  const levelMapping: Record<keyof OttomanTradePostEntity["levels"], number> = {
    unlock: 1,
    lvl2: 2,
    lvl3: 3,
    lvl4: 4,
    lvl5: 5,
  };

  // Process each enabled level
  Object.entries(enabledLevels).forEach(([levelKey, isEnabled]) => {
    if (!isEnabled) return;

    const levelNum =
      levelMapping[levelKey as keyof OttomanTradePostEntity["levels"]];
    const levelData = tradePostData.levels?.[levelNum];

    if (!levelData || !Array.isArray(levelData)) return;

    levelData.forEach((item: any) => {
      const resource = item.resource.toLowerCase();
      const amount = item.amount;

      // Normaliser les goods priority (primary_eg, secondary_eg, etc.)
      let normalizedResource = resource;
      if (resource.includes("_eg") || resource.includes("lategothicera")) {
        normalizedResource = slugify(resource);
      }

      if (
        ottomanGoods.includes(resource) ||
        normalizedResource.match(/^(primary|secondary|tertiary)_/i)
      ) {
        // C'est un good
        const normalized = slugify(resource);
        goodsMap.set(normalized, (goodsMap.get(normalized) || 0) + amount);
      } else {
        // C'est une ressource principale
        costs[resource] = ((costs[resource] as number) || 0) + amount;
      }
    });
  });

  // Convert goodsMap to array
  costs.goods = Array.from(goodsMap.entries()).map(([type, amount]) => ({
    type,
    amount,
  }));

  return costs;
}

/**
 * Parse un Trade Post depuis le fichier ottoman.ts
 */
export function parseOttomanTradePost(
  tradePostData: any,
): Omit<OttomanTradePostEntity, "updatedAt"> | null {
  if (!tradePostData || !tradePostData.name) {
    console.warn("⚠️ Invalid trade post data");
    return null;
  }

  const id = `tradepost_${slugify(tradePostData.name)}`;

  // Par défaut, tous les niveaux sont activés
  const levels: OttomanTradePostEntity["levels"] = {
    unlock: true,
    lvl2: true,
    lvl3: true,
    lvl4: true,
    lvl5: true,
  };

  // Calculer les coûts agrégés basés sur tous les niveaux
  const costs = calculateTradePostCosts(tradePostData, levels);

  return {
    id,
    name: tradePostData.name,
    area: tradePostData.area,
    resource: tradePostData.resource,
    levels,
    costs,
    sourceData: {
      levels: tradePostData.levels,
    },
    hidden: false,
  };
}

// ==================== SAUVEGARDE (VIA STORAGE.TS) ====================

/**
 * Sauvegarde une Area via storage.ts (suit le pattern buildings/technos)
 */
export async function saveAreaToDB(areaIndex: number) {
  const areaData = parseOttomanArea(areaIndex);
  if (areaData) {
    await saveOttomanArea(areaData);
    console.log(`✅ Area ${areaIndex} saved to DB`);
    return true;
  } else {
    console.warn(`⚠️ No data found for area ${areaIndex}`);
    return false;
  }
}

/**
 * Sauvegarde un Trade Post via storage.ts
 */
export async function saveTradePostToDB(tradePostData: any) {
  const tradePost = parseOttomanTradePost(tradePostData);
  if (tradePost) {
    await saveOttomanTradePost(tradePost);
    console.log(`✅ Trade post "${tradePost.name}" saved to DB`);
    return true;
  } else {
    console.warn("⚠️ Invalid trade post data");
    return false;
  }
}

/**
 * ✅ Sauvegarde toutes les Areas (0-17)
 * Appelé depuis add-building-sheet.tsx
 */
export async function saveAllOttomanAreas() {
  let saved = 0;
  let skipped = 0;

  for (let i = 0; i <= 17; i++) {
    const success = await saveAreaToDB(i);
    if (success) saved++;
    else skipped++;
  }

  console.log(`✅ Areas saved: ${saved}, skipped: ${skipped}`);
  return { saved, skipped };
}

/**
 * ✅ Sauvegarde tous les Trade Posts
 * Appelé depuis add-building-sheet.tsx
 */
export async function saveAllOttomanTradePosts() {
  let saved = 0;
  let failed = 0;

  // ⚠️ Adapter selon la structure réelle de ottoman.ts
  const tradePostsData = Array.isArray(trade_post_table)
    ? trade_post_table
    : Object.values(trade_post_table);

  for (const tradePostData of tradePostsData) {
    const success = await saveTradePostToDB(tradePostData);
    if (success) saved++;
    else failed++;
  }

  console.log(`✅ Trade posts saved: ${saved}, failed: ${failed}`);
  return { saved, failed };
}
