import { useEffect, useState } from "react";
import { storage } from "#imports";
import { buildingsAbbr } from "@/lib/constants";
import { isValidData } from "@/lib/utils";

type BuildingSelections = string[][];

const BUILDING_SELECTIONS_KEY = "local:buildingSelections";

function getDefaultSelections(): BuildingSelections {
  return buildingsAbbr.map(() => ["", "", ""]);
}

export function useBuildingSelections() {
  const [selections, setSelections] = useState<BuildingSelections>(() =>
    getDefaultSelections()
  );
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let unwatch: (() => void) | null = null;
    let isMounted = true;

    const parseAndSet = (raw: string) => {
      if (!isValidData(raw)) return;

      try {
        const parsed = JSON.parse(raw) as unknown;
        if (!Array.isArray(parsed)) return;
        setSelections(parsed as BuildingSelections);
      } catch (error) {
        console.error("Error parsing building selections:", error);
      }
    };

    const init = async () => {
      try {
        const stored = await storage.getItem<string>(BUILDING_SELECTIONS_KEY);
        if (isMounted && stored) {
          parseAndSet(stored);
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }

      unwatch = storage.watch<string | null>(
        BUILDING_SELECTIONS_KEY,
        (data: string | null) => {
          if (!data) return;
          parseAndSet(data);
        }
      );
    };

    init();

    return () => {
      isMounted = false;
      unwatch?.();
    };
  }, []);

  return { selections, isLoading };
}
