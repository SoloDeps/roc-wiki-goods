import { useEffect, useState } from "react";
import { storage } from "#imports";
import { Era, eras } from "@/lib/constants";
import { isValidData } from "@/lib/utils";

const KEY = "local:eraSelection";

function parse(raw: string): Era | null {
  if (!isValidData(raw)) return null;
  try {
    const abbr = JSON.parse(raw);
    return typeof abbr === "string"
      ? (eras.find((e) => e.abbr === abbr) ?? null)
      : null;
  } catch {
    return null; // handle invalid json
  }
}

// helper to wrap local updates with proper tracking
let cache: Era | null = null;
let initPromise: Promise<void> | null = null;

async function initCache() {
  if (initPromise) return initPromise;

  initPromise = storage.getItem<string>(KEY).then((stored) => {
    if (stored) {
      const parsed = parse(stored);
      if (parsed) cache = parsed;
    }
  });

  return initPromise;
}

initCache(); // Auto-init

export function useEraSelector() {
  const [eraSelected, setEraSelected] = useState(cache);

  useEffect(() => {
    let mounted = true;

    initCache().then(() => {
      if (mounted) setEraSelected(cache);
    });

    const unwatch = storage.watch<string | null>(KEY, (data) => {
      if (!data || !mounted) return;
      const parsed = parse(data);
      if (parsed) {
        cache = parsed;
        setEraSelected(parsed);
      }
    });

    return () => {
      // cleanup
      mounted = false;
      unwatch?.();
    };
  }, []);

  const handleChange = async (abbr: string) => {
    const era = eras.find((e) => e.abbr === abbr);
    if (!era) return;

    // simplified clamping
    cache = era;
    setEraSelected(era);
    await storage.setItem(KEY, JSON.stringify(era.abbr));
  };

  return { eraSelected, handleChange };
}
