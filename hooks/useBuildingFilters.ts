import { useCallback } from "react";
import { BuildingEntity, TechnoEntity } from "@/lib/storage/dexie";
import { parseBuildingId } from "@/lib/overview/parseBuildingId";
import { getBuildingLocation } from "@/components/building/building-list";

type SavedData = {
  buildings: BuildingEntity[];
  technos?: TechnoEntity[];
};

export type BuildingFilters = {
  tableType?: "construction" | "upgrade";
  location?: string;
  hideHidden?: boolean;
  hideTechnos?: boolean;
};

export function useBuildingFilters() {
  const getAvailableData = useCallback(
    (data: SavedData, filters: BuildingFilters) => {
      const locations = new Set<string>();
      const types = new Set<"construction" | "upgrade">();

      // Always process all buildings to get available options
      data.buildings.forEach((b) => {
        const parsed = parseBuildingId(b.id);
        const loc = getBuildingLocation(
          parsed.section1,
          parsed.section2,
          parsed.buildingName,
        );

        types.add(parsed.tableType);
        locations.add(loc.location);
      });

      // Process technos to add their locations
      if (data.technos && !filters.hideTechnos) {
        data.technos.forEach((t) => {
          const parts = t.id.split("_");
          if (parts.length >= 2) {
            const technoLocation = parts[1];
            locations.add(technoLocation);
          }
        });
      }

      return {
        locations: Array.from(locations).sort(),
        types: Array.from(types).sort(),
      };
    },
    [],
  );

  return { getAvailableData };
}
