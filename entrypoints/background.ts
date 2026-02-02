import { storage } from "#imports";
import { getApiConfig } from "@/lib/roc/tokenCapture";
import { syncGameResources } from "@/lib/roc/rocApi";
import {
  db,
  gameDb,
  TechnoEntity,
  OttomanTradePostEntity,
} from "@/lib/storage/dexie";
import { slugify } from "@/lib/utils";

const BADGE_CONFIG = {
  LOADING: { text: "...", color: "#FF8800" },
  SUCCESS: { text: "✓", color: "#00C851" },
  ERROR: { text: "×", color: "#FF4444" },
} as const;

const setBadge = (tabId: number, type: keyof typeof BADGE_CONFIG) => {
  const { text, color } = BADGE_CONFIG[type];
  chrome.action.setBadgeText({ text, tabId });
  chrome.action.setBadgeBackgroundColor({ color, tabId });
  chrome.action.setBadgeTextColor({ color: "#FFFFFF", tabId });
};

const sendMessage = async (tabId: number, type: string, data: any = {}) => {
  try {
    // Vérifier que l'onglet existe et est accessible
    const tab = await chrome.tabs.get(tabId);
    if (!tab.url?.startsWith("http")) {
      console.log(
        `[RoC Background] Skipping ${type} - tab is on chrome:// page`,
      );
      return;
    }

    await chrome.tabs.sendMessage(tabId, { type, ...data });
  } catch (error) {
    // Silencieux - c'est normal si le content script n'est pas là
    console.log(`[RoC Background] Content script unavailable for ${type}`);
  }
};

export default defineBackground(() => {
  chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
    if (
      changeInfo.status !== "complete" ||
      !tab.url?.includes("riseofcultures.com")
    )
      return;
    if (tab.url.includes("-play")) return;

    const autoSave = await storage.getItem("local:autoSave");
    if (!autoSave) return;

    console.log("[RoC Background] 🔄 Auto-sync enabled");
    setBadge(tabId, "LOADING");

    await storage.setItem("local:autoSaveStatus", {
      status: "loading",
      timestamp: Date.now(),
      message: "Synchronization in progress...",
      type: "auto",
    });

    await new Promise((resolve) => setTimeout(resolve, 3000));

    const config = await getApiConfig();
    if (!config?.authToken) {
      console.log("[RoC Background] ❌ No token available");

      await storage.setItem("local:autoSaveStatus", {
        status: "error",
        timestamp: Date.now(),
        message: "Authentication token not available",
        type: "auto",
      });

      setBadge(tabId, "ERROR");
      return;
    }

    try {
      await syncGameResources();
      await new Promise((resolve) => setTimeout(resolve, 1000));

      await storage.setItem("local:autoSaveStatus", {
        status: "success",
        timestamp: Date.now(),
        message: "Auto-save completed successfully",
        type: "auto",
      });

      sendMessage(tabId, "DATA_SAVED", { success: true });
      setBadge(tabId, "SUCCESS");
      console.log("[RoC Background] ✅ Auto-sync successful");
    } catch (error: any) {
      console.error("[RoC Background] ❌ Sync error:", error);

      await storage.setItem("local:autoSaveStatus", {
        status: "error",
        timestamp: Date.now(),
        message: "Data export failed. Please try again.",
        type: "auto",
      });

      sendMessage(tabId, "DATA_ERROR", {
        error: "Data export failed. Please try again.",
      });
      setBadge(tabId, "ERROR");
    }
  });

  // badge updates
  chrome.runtime.onMessage.addListener((message, sender) => {
    if (!sender.tab?.id) return;

    if (message.type === "DATA_SAVED" && message.success) {
      setBadge(sender.tab.id, "SUCCESS");
    } else if (message.type === "DATA_ERROR") {
      setBadge(sender.tab.id, "ERROR");
      console.error("[RoC Background] API Error:", message.error);
    }
  });

  // dexie handler
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (!message.type?.startsWith("DEXIE_")) return;

    handleDexieMessage(message)
      .then(sendResponse)
      .catch((error) => {
        console.error("[RoC Background] Dexie error:", error);
        sendResponse({ success: false, error: error.message });
      });

    return true;
  });

  async function broadcastChange(type: string, data: any) {
    const message = {
      type: "DEXIE_CHANGED",
      payload: { type, data },
    };

    // Filtrer uniquement les onglets compatibles
    const tabs = await chrome.tabs.query({});
    const validTabs = tabs.filter(
      (tab) =>
        tab.url?.includes("riseofcultures.com") ||
        tab.url?.includes("riseofcultures.wiki.gg"),
    );

    validTabs.forEach((tab) => {
      if (tab.id) {
        chrome.tabs.sendMessage(tab.id, message).catch(() => {
          // Silencieux - l'onglet peut ne pas avoir le content script
        });
      }
    });

    chrome.runtime.sendMessage(message).catch(() => {
      // Silencieux - pas de receiver, c'est normal
    });

    console.log(
      `[Background] Broadcasted ${type} to ${validTabs.length} valid tabs`,
    );
  }

  async function handleDexieMessage(message: any) {
    if (!message?.type) {
      return { success: false, error: "Invalid message structure" };
    }

    const { type, payload } = message;

    try {
      switch (type) {
        // ==================== BUILDINGS ====================
        case "DEXIE_GET_BUILDINGS":
          return { success: true, data: await db.buildings.toArray() };

        case "DEXIE_SAVE_BUILDING": {
          await db.buildings.put({ ...payload, updatedAt: Date.now() });
          await broadcastChange("BUILDINGS", await db.buildings.toArray());
          return { success: true };
        }

        case "DEXIE_UPDATE_BUILDING_QUANTITY": {
          const { id, newQuantity } = payload;
          const building = await db.buildings.get(id);
          if (!building) return { success: false, error: "Building not found" };

          building.quantity = Math.max(
            1,
            Math.min(building.maxQty ?? 40, newQuantity),
          );
          building.updatedAt = Date.now();
          await db.buildings.put(building);
          await broadcastChange("BUILDINGS", await db.buildings.toArray());
          return { success: true };
        }

        case "DEXIE_TOGGLE_BUILDING_HIDDEN": {
          const { id } = payload;
          const building = await db.buildings.get(id);
          if (!building) return { success: false, error: "Building not found" };

          building.hidden = !building.hidden;
          building.updatedAt = Date.now();
          await db.buildings.put(building);
          await broadcastChange("BUILDINGS", await db.buildings.toArray());
          return { success: true };
        }

        case "DEXIE_REMOVE_BUILDING": {
          await db.buildings.delete(payload.id);
          await broadcastChange("BUILDINGS", await db.buildings.toArray());
          return { success: true };
        }

        case "DEXIE_REMOVE_ALL_BUILDINGS": {
          await db.buildings.clear();
          await broadcastChange("BUILDINGS", []);
          return { success: true };
        }

        case "DEXIE_HIDE_ALL_BUILDINGS": {
          const buildings = await db.buildings.toArray();
          const timestamp = Date.now();

          await db.buildings.bulkPut(
            buildings.map((b) => ({
              ...b,
              hidden: true,
              updatedAt: timestamp,
            })),
          );

          await broadcastChange("BUILDINGS", await db.buildings.toArray());
          return { success: true };
        }

        case "DEXIE_SHOW_ALL_BUILDINGS": {
          const buildings = await db.buildings.toArray();
          const timestamp = Date.now();

          await db.buildings.bulkPut(
            buildings.map((b) => ({
              ...b,
              hidden: false,
              updatedAt: timestamp,
            })),
          );

          await broadcastChange("BUILDINGS", await db.buildings.toArray());
          return { success: true };
        }

        // ==================== TECHNOS ====================
        case "DEXIE_GET_TECHNOS":
          return { success: true, data: await db.technos.toArray() };

        case "DEXIE_SAVE_TECHNO": {
          await db.technos.put({ ...payload, updatedAt: Date.now() });
          await broadcastChange("TECHNOS", await db.technos.toArray());
          return { success: true };
        }

        case "DEXIE_TOGGLE_TECHNO_HIDDEN": {
          const { eraPath } = payload;
          const technos = await db.technos
            .filter((t) => t.id.startsWith(`techno_${eraPath}_`))
            .toArray();

          if (technos.length === 0)
            return { success: false, error: "No technos found for this era" };

          const newHiddenState = !technos[0].hidden;
          const timestamp = Date.now();

          await Promise.all(
            technos.map((t) =>
              db.technos.put({
                ...t,
                hidden: newHiddenState,
                updatedAt: timestamp,
              }),
            ),
          );

          await broadcastChange("TECHNOS", await db.technos.toArray());
          return { success: true };
        }

        case "DEXIE_REMOVE_TECHNO": {
          await db.technos.delete(payload.id);
          await broadcastChange("TECHNOS", await db.technos.toArray());
          return { success: true };
        }

        case "DEXIE_REMOVE_ALL_TECHNOS": {
          await db.technos.clear();
          await broadcastChange("TECHNOS", []);
          return { success: true };
        }

        case "DEXIE_SAVE_ERA_TECHNOS": {
          const { eraPath, technos } = payload;

          const existingTechnos = await db.technos
            .filter((t) => t.id.startsWith(`techno_${eraPath}_`))
            .toArray();

          await Promise.all(
            existingTechnos.map((t) => db.technos.delete(t.id)),
          );

          if (technos && technos.length > 0) {
            await db.technos.bulkPut(
              technos.map((t: TechnoEntity) => ({
                ...t,
                hidden: false,
                updatedAt: Date.now(),
              })),
            );
          }

          await broadcastChange("TECHNOS", await db.technos.toArray());
          return { success: true };
        }

        case "DEXIE_CLEAR_ERA_TECHNOS": {
          const { eraPath } = payload;

          const technosToDelete = await db.technos
            .filter((t) => t.id.startsWith(`techno_${eraPath}_`))
            .toArray();

          await Promise.all(
            technosToDelete.map((t) => db.technos.delete(t.id)),
          );

          await broadcastChange("TECHNOS", await db.technos.toArray());
          return { success: true };
        }

        case "DEXIE_HIDE_ALL_TECHNOS": {
          const technos = await db.technos.toArray();
          const timestamp = Date.now();

          await db.technos.bulkPut(
            technos.map((t) => ({
              ...t,
              hidden: true,
              updatedAt: timestamp,
            })),
          );

          await broadcastChange("TECHNOS", await db.technos.toArray());
          return { success: true };
        }

        case "DEXIE_SHOW_ALL_TECHNOS": {
          const technos = await db.technos.toArray();
          const timestamp = Date.now();

          await db.technos.bulkPut(
            technos.map((t) => ({
              ...t,
              hidden: false,
              updatedAt: timestamp,
            })),
          );

          await broadcastChange("TECHNOS", await db.technos.toArray());
          return { success: true };
        }

        // ==================== OTTOMAN AREAS ====================
        case "DEXIE_GET_OTTOMAN_AREAS":
          return { success: true, data: await db.ottomanAreas.toArray() };

        case "DEXIE_SAVE_OTTOMAN_AREA": {
          await db.ottomanAreas.put({ ...payload, updatedAt: Date.now() });
          await broadcastChange(
            "OTTOMAN_AREAS",
            await db.ottomanAreas.toArray(),
          );
          return { success: true };
        }

        case "DEXIE_TOGGLE_OTTOMAN_AREA_HIDDEN": {
          const { id } = payload;
          const area = await db.ottomanAreas.get(id);
          if (!area) return { success: false, error: "Area not found" };

          area.hidden = !area.hidden;
          area.updatedAt = Date.now();
          await db.ottomanAreas.put(area);
          await broadcastChange(
            "OTTOMAN_AREAS",
            await db.ottomanAreas.toArray(),
          );
          return { success: true };
        }

        case "DEXIE_REMOVE_OTTOMAN_AREA": {
          await db.ottomanAreas.delete(payload.id);
          await broadcastChange(
            "OTTOMAN_AREAS",
            await db.ottomanAreas.toArray(),
          );
          return { success: true };
        }

        case "DEXIE_REMOVE_ALL_OTTOMAN_AREAS": {
          await db.ottomanAreas.clear();
          await broadcastChange("OTTOMAN_AREAS", []);
          return { success: true };
        }

        case "DEXIE_HIDE_ALL_OTTOMAN_AREAS": {
          const areas = await db.ottomanAreas.toArray();
          const timestamp = Date.now();

          await db.ottomanAreas.bulkPut(
            areas.map((a) => ({
              ...a,
              hidden: true,
              updatedAt: timestamp,
            })),
          );

          await broadcastChange(
            "OTTOMAN_AREAS",
            await db.ottomanAreas.toArray(),
          );
          return { success: true };
        }

        case "DEXIE_SHOW_ALL_OTTOMAN_AREAS": {
          const areas = await db.ottomanAreas.toArray();
          const timestamp = Date.now();

          await db.ottomanAreas.bulkPut(
            areas.map((a) => ({
              ...a,
              hidden: false,
              updatedAt: timestamp,
            })),
          );

          await broadcastChange(
            "OTTOMAN_AREAS",
            await db.ottomanAreas.toArray(),
          );
          return { success: true };
        }

        // ==================== OTTOMAN TRADE POSTS ====================
        case "DEXIE_GET_OTTOMAN_TRADEPOSTS":
          return { success: true, data: await db.ottomanTradePosts.toArray() };

        case "DEXIE_SAVE_OTTOMAN_TRADEPOST": {
          await db.ottomanTradePosts.put({ ...payload, updatedAt: Date.now() });
          await broadcastChange(
            "OTTOMAN_TRADEPOSTS",
            await db.ottomanTradePosts.toArray(),
          );
          return { success: true };
        }

        case "DEXIE_TOGGLE_OTTOMAN_TRADEPOST_HIDDEN": {
          const { id } = payload;
          const tradePost = await db.ottomanTradePosts.get(id);
          if (!tradePost)
            return { success: false, error: "Trade post not found" };

          tradePost.hidden = !tradePost.hidden;
          tradePost.updatedAt = Date.now();
          await db.ottomanTradePosts.put(tradePost);
          await broadcastChange(
            "OTTOMAN_TRADEPOSTS",
            await db.ottomanTradePosts.toArray(),
          );
          return { success: true };
        }

        case "DEXIE_TOGGLE_OTTOMAN_TRADEPOST_LEVEL": {
          const { id, level } = payload as {
            id: string;
            level: keyof OttomanTradePostEntity["levels"];
          };
          const tradePost = await db.ottomanTradePosts.get(id);
          if (!tradePost)
            return { success: false, error: "Trade post not found" };

          // Toggle the level
          tradePost.levels[level] = !tradePost.levels[level];

          // Recalculate costs based on enabled levels
          if (tradePost.sourceData) {
            const recalculatedCosts = calculateTradePostCosts(
              tradePost.sourceData,
              tradePost.levels,
            );
            tradePost.costs = recalculatedCosts;
          }

          tradePost.updatedAt = Date.now();
          await db.ottomanTradePosts.put(tradePost);
          await broadcastChange(
            "OTTOMAN_TRADEPOSTS",
            await db.ottomanTradePosts.toArray(),
          );
          return { success: true };
        }

        case "DEXIE_REMOVE_OTTOMAN_TRADEPOST": {
          await db.ottomanTradePosts.delete(payload.id);
          await broadcastChange(
            "OTTOMAN_TRADEPOSTS",
            await db.ottomanTradePosts.toArray(),
          );
          return { success: true };
        }

        case "DEXIE_REMOVE_ALL_OTTOMAN_TRADEPOSTS": {
          await db.ottomanTradePosts.clear();
          await broadcastChange("OTTOMAN_TRADEPOSTS", []);
          return { success: true };
        }

        case "DEXIE_HIDE_ALL_OTTOMAN_TRADEPOSTS": {
          const tradePosts = await db.ottomanTradePosts.toArray();
          const timestamp = Date.now();

          await db.ottomanTradePosts.bulkPut(
            tradePosts.map((t) => ({
              ...t,
              hidden: true,
              updatedAt: timestamp,
            })),
          );

          await broadcastChange(
            "OTTOMAN_TRADEPOSTS",
            await db.ottomanTradePosts.toArray(),
          );
          return { success: true };
        }

        case "DEXIE_SHOW_ALL_OTTOMAN_TRADEPOSTS": {
          const tradePosts = await db.ottomanTradePosts.toArray();
          const timestamp = Date.now();

          await db.ottomanTradePosts.bulkPut(
            tradePosts.map((t) => ({
              ...t,
              hidden: false,
              updatedAt: timestamp,
            })),
          );

          await broadcastChange(
            "OTTOMAN_TRADEPOSTS",
            await db.ottomanTradePosts.toArray(),
          );
          return { success: true };
        }

        // ==================== ✅ NEW: CLEAR OTTOMAN DATA ====================
        case "DEXIE_CLEAR_OTTOMAN_DATA": {
          // Get counts before clearing
          const areasCount = await db.ottomanAreas.count();
          const tradePostsCount = await db.ottomanTradePosts.count();

          // Clear both tables
          await Promise.all([
            db.ottomanAreas.clear(),
            db.ottomanTradePosts.clear(),
          ]);

          console.log(
            `[Background] Cleared ${areasCount} areas and ${tradePostsCount} trade posts`,
          );

          // Broadcast changes
          await broadcastChange("OTTOMAN_AREAS", []);
          await broadcastChange("OTTOMAN_TRADEPOSTS", []);

          return {
            success: true,
            areasCleared: areasCount,
            tradePostsCleared: tradePostsCount,
          };
        }

        // ==================== ✅ UPDATED: PRESET LOADING ====================
        case "DEXIE_LOAD_PRESET": {
          const {
            buildings = [],
            technos = [],
            ottomanAreas = [],
            ottomanTradePosts = [],
          } = payload;

          console.log(
            `[Background] Loading preset: ${buildings.length} buildings, ${technos.length} technos, ${ottomanAreas.length} areas, ${ottomanTradePosts.length} trade posts`,
          );

          // Use transaction for atomic operations
          await db.transaction(
            "rw",
            [db.buildings, db.technos, db.ottomanAreas, db.ottomanTradePosts],
            async () => {
              // Clear all tables
              await Promise.all([
                db.buildings.clear(),
                db.technos.clear(),
                db.ottomanAreas.clear(),
                db.ottomanTradePosts.clear(),
              ]);

              const timestamp = Date.now();

              // Batch insert new data
              const insertPromises = [];

              if (buildings.length > 0) {
                insertPromises.push(
                  db.buildings.bulkAdd(
                    buildings.map((b: any) => ({
                      ...b,
                      hidden: false,
                      updatedAt: timestamp,
                    })),
                  ),
                );
              }

              if (technos.length > 0) {
                insertPromises.push(
                  db.technos.bulkAdd(
                    technos.map((t: any) => ({
                      ...t,
                      hidden: false,
                      updatedAt: timestamp,
                    })),
                  ),
                );
              }

              if (ottomanAreas.length > 0) {
                insertPromises.push(
                  db.ottomanAreas.bulkAdd(
                    ottomanAreas.map((a: any) => ({
                      ...a,
                      hidden: false,
                      updatedAt: timestamp,
                    })),
                  ),
                );
              }

              if (ottomanTradePosts.length > 0) {
                insertPromises.push(
                  db.ottomanTradePosts.bulkAdd(
                    ottomanTradePosts.map((tp: any) => ({
                      ...tp,
                      hidden: false,
                      updatedAt: timestamp,
                    })),
                  ),
                );
              }

              await Promise.all(insertPromises);
            },
          );

          // Get fresh data and broadcast
          const [newBuildings, newTechnos, newAreas, newTradePosts] =
            await Promise.all([
              db.buildings.toArray(),
              db.technos.toArray(),
              db.ottomanAreas.toArray(),
              db.ottomanTradePosts.toArray(),
            ]);

          // Broadcast all changes
          await Promise.all([
            broadcastChange("BUILDINGS", newBuildings),
            broadcastChange("TECHNOS", newTechnos),
            broadcastChange("OTTOMAN_AREAS", newAreas),
            broadcastChange("OTTOMAN_TRADEPOSTS", newTradePosts),
          ]);

          console.log(
            `[Background] ✅ Preset loaded: ${newBuildings.length} buildings, ${newTechnos.length} technos, ${newAreas.length} areas, ${newTradePosts.length} trade posts`,
          );

          return {
            success: true,
            buildingsAdded: newBuildings.length,
            technosAdded: newTechnos.length,
            ottomanAreasAdded: newAreas.length,
            ottomanTradePostsAdded: newTradePosts.length,
          };
        }

        // ==================== USER RESOURCES ====================
        case "DEXIE_SAVE_USER_RESOURCES": {
          const { resources } = payload;
          await gameDb.userResources.clear();
          await gameDb.userResources.bulkAdd(
            resources.map((r: any) => ({ ...r, updatedAt: Date.now() })),
          );

          await broadcastChange(
            "USER_RESOURCES",
            await gameDb.userResources.toArray(),
          );
          return { success: true };
        }

        default:
          return { success: false, error: "Unknown DEXIE operation" };
      }
    } catch (error) {
      throw error instanceof Error ? error : new Error(String(error));
    }
  }

  // Helper function to recalculate trade post costs
  function calculateTradePostCosts(tradePostData: any, enabledLevels: any) {
    const costs: any = { goods: [] };
    const goodsMap = new Map<string, number>();

    const ottomanGoods = [
      "wheat",
      "pomegranate",
      "confection",
      "syrup",
      "mohair",
      "apricot",
      "tea",
      "brocade",
    ];

    const levelMapping: Record<string, number> = {
      unlock: 1,
      lvl2: 2,
      lvl3: 3,
      lvl4: 4,
      lvl5: 5,
    };

    Object.entries(enabledLevels).forEach(([levelKey, isEnabled]) => {
      if (!isEnabled) return;

      const levelNum = levelMapping[levelKey];
      const levelData = tradePostData.levels?.[levelNum];

      if (!levelData || !Array.isArray(levelData)) return;

      levelData.forEach((item: any) => {
        const resource = item.resource.toLowerCase();
        const amount = item.amount;

        let normalizedResource = resource;
        if (resource.includes("_eg") || resource.includes("lategothicera")) {
          normalizedResource = slugify(resource);
        }

        if (
          ottomanGoods.includes(resource) ||
          normalizedResource.match(/^(primary|secondary|tertiary)_/i)
        ) {
          const normalized = slugify(resource);
          goodsMap.set(normalized, (goodsMap.get(normalized) || 0) + amount);
        } else {
          costs[resource] = ((costs[resource] as number) || 0) + amount;
        }
      });
    });

    costs.goods = Array.from(goodsMap.entries()).map(([type, amount]) => ({
      type,
      amount,
    }));

    return costs;
  }
});
