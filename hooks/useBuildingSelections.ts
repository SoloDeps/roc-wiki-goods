import { useEffect, useState } from "react";
import { storage } from "#imports";
import { buildingsAbbr } from "@/lib/constants";
import { isValidData } from "@/lib/utils";

type BuildingSelections = string[][];

const KEY = "local:buildingSelections";
const DEFAULT = buildingsAbbr.map(() => ["", "", ""]);

function parse(raw: string): BuildingSelections | null {
  if (!isValidData(raw)) return null;
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

// cache management
let cache: BuildingSelections = DEFAULT;
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

initCache(); // initialize

export function useBuildingSelections() {
  const [selections, setSelections] = useState(cache);

  useEffect(() => {
    let mounted = true;

    // sync cache
    initCache().then(() => {
      if (mounted) setSelections(cache);
    });

    // watch storage
    const unwatch = storage.watch<string | null>(KEY, (data) => {
      if (!data || !mounted) return;
      const parsed = parse(data);
      if (parsed) {
        cache = parsed;
        setSelections(parsed);
      }
    });

    return () => {
      mounted = false;
      unwatch?.();
    };
  }, []);

  return selections;
}
