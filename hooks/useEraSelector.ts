import { useEffect, useState } from "react";
import { storage } from "#imports";
import { Era, eras } from "@/lib/constants";
import { isValidData } from "@/lib/utils";

const ERA_SELECTION_KEY = "local:eraSelection";

function getDefaultEra(): Era | null {
  return null; // Pas de valeur par défaut, on laisse l'utilisateur choisir
}

function parseEraSelection(raw: string): Era | null {
  if (!isValidData(raw)) return null;

  try {
    const parsed = JSON.parse(raw) as unknown;
    if (typeof parsed !== "string") return null;

    return eras.find((e) => e.abbr === parsed) ?? null;
  } catch (error) {
    console.error("Error parsing era selection:", error);
    return null;
  }
}

// Cache au niveau module pour chargement synchrone initial
let cachedEra: Era | null = null;
let cachePromise: Promise<void> | null = null;

function initCache() {
  if (!cachePromise) {
    cachePromise = storage.getItem<string>(ERA_SELECTION_KEY).then((stored) => {
      if (stored) {
        const parsed = parseEraSelection(stored);
        if (parsed) {
          cachedEra = parsed;
        }
      }
    });
  }
  return cachePromise;
}

// Initialiser immédiatement
initCache();

export function useEraSelector() {
  const [eraSelected, setEraSelected] = useState<Era | null>(() => {
    // Retourner le cache s'il existe, sinon null
    return cachedEra ?? getDefaultEra();
  });

  useEffect(() => {
    let unwatch: (() => void) | null = null;
    let isMounted = true;

    const init = async () => {
      // S'assurer que le cache est chargé
      await initCache();

      // Mettre à jour avec les données du cache si disponibles
      if (isMounted && cachedEra) {
        setEraSelected(cachedEra);
      }

      // Écouter les changements
      unwatch = storage.watch<string | null>(
        ERA_SELECTION_KEY,
        (data: string | null) => {
          if (!data || !isMounted) return;

          const parsed = parseEraSelection(data);
          if (parsed) {
            cachedEra = parsed;
            setEraSelected(parsed);
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

  const handleChange = async (abbr: string) => {
    const selectedEra = eras.find((e) => e.abbr === abbr);
    if (!selectedEra) return;

    // Optimisation : mettre à jour immédiatement l'UI et le cache
    cachedEra = selectedEra;
    setEraSelected(selectedEra);

    // Sauvegarder en arrière-plan
    await storage.setItem(ERA_SELECTION_KEY, JSON.stringify(selectedEra.abbr));
  };

  return { eraSelected, handleChange };
}