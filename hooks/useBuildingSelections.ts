import { useEffect, useState } from "react";
import { storage } from "#imports";
import { buildingsAbbr } from "@/lib/constants";
import { isValidData } from "@/lib/utils";

type BuildingSelections = string[][];

const BUILDING_SELECTIONS_KEY = "local:buildingSelections";

function getDefaultSelections(): BuildingSelections {
  return buildingsAbbr.map(() => ["", "", ""]);
}

function parseSelections(raw: string): BuildingSelections | null {
  if (!isValidData(raw)) return null;

  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return null;
    return parsed as BuildingSelections;
  } catch (error) {
    console.error("Error parsing building selections:", error);
    return null;
  }
}

// Chargement synchrone initial au chargement du module
let cachedSelections: BuildingSelections | null = null;
let cachePromise: Promise<void> | null = null;

function initCache() {
  if (!cachePromise) {
    cachePromise = storage.getItem<string>(BUILDING_SELECTIONS_KEY).then((stored) => {
      if (stored) {
        const parsed = parseSelections(stored);
        if (parsed) {
          cachedSelections = parsed;
        }
      }
    });
  }
  return cachePromise;
}

// Initialiser immédiatement
initCache();

export function useBuildingSelections() {
  const [selections, setSelections] = useState<BuildingSelections>(() => {
    // Retourner le cache s'il existe, sinon les valeurs par défaut
    return cachedSelections ?? getDefaultSelections();
  });

  useEffect(() => {
    let unwatch: (() => void) | null = null;
    let isMounted = true;

    const init = async () => {
      // S'assurer que le cache est chargé
      await initCache();
      
      // Mettre à jour avec les données du cache si disponibles
      if (isMounted && cachedSelections) {
        setSelections(cachedSelections);
      }

      // Écouter les changements
      unwatch = storage.watch<string | null>(
        BUILDING_SELECTIONS_KEY,
        (data: string | null) => {
          if (!data || !isMounted) return;
          
          const parsed = parseSelections(data);
          if (parsed) {
            cachedSelections = parsed;
            setSelections(parsed);
          }
        }
      );
    };

    init();

    return () => {
      isMounted = false;
      unwatch?.();
    };
  }, []);

  return selections;
}