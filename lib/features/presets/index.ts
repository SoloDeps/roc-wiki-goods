import { eras } from "@/lib/constants";
import { PRESET_KEYS, type PresetData } from "@/lib/data/presets/config";



/**
 * Charge un preset de manière asynchrone (code splitting automatique)
 */
export async function loadPresetData(key: string): Promise<PresetData> {
  try {
    const module = await import(`@/lib/data/presets/${key}.json`);
    return module.default;
  } catch (error) {
    console.error(`Failed to load preset: ${key}`, error);
    throw new Error(`Preset not found: ${key}`);
  }
}

/**
 * Vérifie si un preset a des données (charge le fichier pour vérifier)
 */
export async function hasPresetData(key: string): Promise<boolean> {
  try {
    const data = await loadPresetData(key);
    return data.buildings.length > 0 || data.technos.length > 0;
  } catch {
    return false;
  }
}

/**
 * Obtient les infos de l'ère depuis constants.ts
 */
export function getEraInfo(key: string) {
  const index = parseInt(key.split("_")[0]) - 1;
  return eras[index];
}

/**
 * Obtient tous les presets qui ont des données
 */
export async function getAvailablePresets(): Promise<string[]> {
  const available: string[] = [];

  for (const key of PRESET_KEYS) {
    const hasData = await hasPresetData(key);
    if (hasData) {
      available.push(key);
    }
  }

  return available;
}