import { 
  suspendWatchers, 
  resumeWatchers, 
  forceRefreshWatchers 
} from "@/lib/overview/storage";

export interface LoadPresetResult {
  success: boolean;
  buildingsAdded: number;
  technosAdded: number;
  error?: string;
}

export async function loadPreset(presetKey: string): Promise<LoadPresetResult> {
  try {
    console.log(`[Preset Loader] Loading preset: ${presetKey}`);

    // ✅ Suspendre les watchers AVANT de charger
    suspendWatchers();
    console.log("[Preset Loader] Watchers suspended");

    // Charger le preset depuis IndexedDB
    const preset = await loadPresetData(presetKey);
    if (!preset) {
      resumeWatchers();
      return {
        success: false,
        buildingsAdded: 0,
        technosAdded: 0,
        error: `Preset "${presetKey}" not found`,
      };
    }

    const { buildings, technos } = preset;

    // ✅ Envoyer au background en une seule opération
    const response = await new Promise<any>((resolve, reject) => {
      chrome.runtime.sendMessage(
        {
          type: "DEXIE_LOAD_PRESET",
          payload: { buildings, technos },
        },
        (response) => {
          if (chrome.runtime.lastError) {
            reject(new Error(chrome.runtime.lastError.message));
          } else if (response?.success) {
            resolve(response);
          } else {
            reject(new Error(response?.error || "Unknown error"));
          }
        }
      );
    });

    // ✅ Attendre un peu pour que la transaction soit complète
    await new Promise(resolve => setTimeout(resolve, 100));

    // ✅ Forcer un refresh manuel avec les nouvelles données
    await forceRefreshWatchers();
    console.log("[Preset Loader] Manual refresh triggered");

    // ✅ Reprendre les watchers
    resumeWatchers();
    console.log("[Preset Loader] Watchers resumed");

    return {
      success: true,
      buildingsAdded: buildings.length,
      technosAdded: technos.length,
    };
  } catch (error) {
    // ✅ S'assurer de toujours reprendre les watchers en cas d'erreur
    resumeWatchers();
    console.error("[Preset Loader] Error:", error);
    
    return {
      success: false,
      buildingsAdded: 0,
      technosAdded: 0,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

// Helper pour charger les données du preset
async function loadPresetData(presetKey: string): Promise<any> {
  // Votre logique existante pour charger le preset depuis les fichiers
  // Par exemple :
  try {
    const module = await import(`@/lib/data/presets/${presetKey}.json`);
    return module.default;
  } catch (error) {
    console.error(`[Preset] Failed to load preset ${presetKey}:`, error);
    return null;
  }
}

// Helper pour envoyer les données en bulk (plus performant)
async function sendPresetData(buildings: any[], technos: any[]): Promise<void> {
  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage(
      {
        type: "DEXIE_LOAD_PRESET",
        payload: { buildings, technos },
      },
      (response) => {
        if (chrome.runtime.lastError) {
          reject(new Error(chrome.runtime.lastError.message));
        } else if (response?.success) {
          resolve();
        } else {
          reject(new Error(response?.error || "Failed to load preset"));
        }
      },
    );
  });
}
