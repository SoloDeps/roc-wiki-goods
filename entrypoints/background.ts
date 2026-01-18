import { storage } from "#imports";
import { getApiConfig } from "@/lib/roc/tokenCapture";
import { syncGameResources } from "@/lib/roc/rocApi";
import { db, TechnoEntity } from "@/lib/storage/dexie";

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

const sendMessage = (tabId: number, type: string, data: any = {}) => {
  chrome.tabs.sendMessage(tabId, { type, ...data }).catch(() => {
    console.log(`[RoC Background] Content script unavailable for ${type}`);
  });
};

export default defineBackground(() => {
  // auto-sync on page load
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

    await new Promise((resolve) => setTimeout(resolve, 3000));

    const config = await getApiConfig();
    if (!config?.authToken) {
      console.log("[RoC Background] ❌ No token available");
      return;
    }

    try {
      await syncGameResources();
      await new Promise((resolve) => setTimeout(resolve, 1000));
      sendMessage(tabId, "DATA_SAVED", { success: true });
      setBadge(tabId, "SUCCESS");
      console.log("[RoC Background] ✅ Auto-sync successful");
    } catch (error: any) {
      console.error("[RoC Background] ❌ Sync error:", error);
      sendMessage(tabId, "DATA_ERROR", { error: error.message });
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

    return true; // keep async channel
  });

  // broadcast changes
  async function broadcastChange(type: string, data: any) {
    const tabs = await chrome.tabs.query({});
    tabs.forEach((tab) => {
      if (tab.id) {
        chrome.tabs
          .sendMessage(tab.id, {
            type: "DEXIE_CHANGED",
            payload: { type, data },
          })
          .catch(() => {});
      }
    });
  }

  async function handleDexieMessage(message: any) {
    if (!message?.type) {
      return { success: false, error: "Invalid message structure" };
    }

    const { type, payload } = message;

    try {
      switch (type) {
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

          // remove all existing technos for this era
          const existing = await db.technos.toArray();
          const toDelete = existing.filter((t) =>
            t.id.startsWith(`techno_${eraPath}_`),
          );
          if (toDelete.length)
            await db.technos.bulkDelete(toDelete.map((t) => t.id));

          // add new technos
          if (technos.length) {
            await db.technos.bulkAdd(
              technos.map((t: TechnoEntity) => ({
                ...t,
                updatedAt: Date.now(),
              })),
            );
          }

          await broadcastChange("TECHNOS", await db.technos.toArray());
          return { success: true };
        }

        case "DEXIE_CLEAR_ERA_TECHNOS": {
          const { eraPath } = payload;
          const existing = await db.technos.toArray();
          const toDelete = existing.filter((t) =>
            t.id.startsWith(`techno_${eraPath}_`),
          );
          if (toDelete.length)
            await db.technos.bulkDelete(toDelete.map((t) => t.id));

          await broadcastChange("TECHNOS", await db.technos.toArray());
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

        default:
          return { success: false, error: "Unknown DEXIE operation" };
      }
    } catch (error) {
      throw error instanceof Error ? error : new Error(String(error));
    }
  }
});
