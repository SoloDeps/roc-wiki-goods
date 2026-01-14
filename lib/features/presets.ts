import { presets } from "@/lib/data/presets";
import {
  savedBuildingsStorage,
  savedTechnosStorage,
} from "@/lib/overview/storage";

export async function applyPreset(eraId: string) {
  const preset = presets[eraId as keyof typeof presets];

  if (!preset) {
    throw new Error(`Preset not found for era: ${eraId}`);
  }

  try {
    // Appliquer les données du preset aux storages
    await savedBuildingsStorage.setValue(preset.roc_saved_buildings);
    await savedTechnosStorage.setValue(preset.roc_saved_technos);

    return true;
  } catch (error) {
    console.error("Error applying preset:", error);
    throw error;
  }
}

export function getAvailablePresets() {
  return Object.keys(presets);
}
