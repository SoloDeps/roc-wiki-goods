import { useEffect, useState } from "react";
import {
  loadSavedBuildings,
  watchSavedBuildings,
  type SavedData,
} from "@/lib/overview/storage";

export function useSavedBuildings() {
  const [data, setData] = useState<SavedData>({
    buildings: [],
    totals: { coins: 0, food: 0, goods: 0 },
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let unwatch: (() => void) | null = null;
    let isMounted = true;

    const init = async () => {
      try {
        const initial = await loadSavedBuildings();
        if (isMounted) setData(initial);
      } finally {
        if (isMounted) setIsLoading(false);
      }

      unwatch = watchSavedBuildings((newData) => {
        setData(newData);
      });
    };

    init();

    return () => {
      isMounted = false;
      unwatch?.();
    };
  }, []);

  return { data, isLoading };
}
