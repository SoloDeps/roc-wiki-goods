import { useCallback } from "react";
import {
  loadSavedBuildings,
  watchSavedBuildings,
  type SavedData,
} from "@/lib/overview/storage";
import { parseBuildingId } from "@/lib/overview/parseBuildingId";
import { getBuildingLocation } from "@/components/building/building-list";

export type BuildingFilters = {
  tableType?: "construction" | "upgrade";
  location?: string;
};

export function useBuildingFilters() {
  const getAvailableData = useCallback(
    (
      data: SavedData,
      currentFilters: BuildingFilters
    ): { locations: string[]; types: ("construction" | "upgrade")[] } => {
      const locations = new Set<string>();
      const types = new Set<"construction" | "upgrade">();

      data.buildings.forEach((b) => {
        const parsed = parseBuildingId(b.id);
        const locationInfo = getBuildingLocation(
          parsed.section1,
          parsed.section2,
          parsed.buildingName
        );

        // Logique asymétrique :

        // Si un filtre de TYPE est actif, ne considérer que les buildings de ce type
        // SAUF si une ville est sélectionnée (on veut tous les types de cette ville)
        if (
          currentFilters.tableType &&
          parsed.tableType !== currentFilters.tableType &&
          !currentFilters.location
        ) {
          return;
        }

        // Si un filtre de LOCATION est actif, ne considérer que les buildings de cette location POUR LES TYPES
        // mais on garde toutes les locations pour l'affichage
        const shouldConsiderForTypes =
          !currentFilters.location ||
          locationInfo.location === currentFilters.location;

        // Pour les types: si une ville est sélectionnée, on veut TOUS les types de cette ville
        // Sinon, on veut tous les types disponibles selon les filtres normaux
        const shouldAddType = shouldConsiderForTypes;

        // Extraire les locations (toujours toutes les villes, sauf si on filtre par type)
        if (!currentFilters.tableType) {
          locations.add(locationInfo.location);
        } else {
          // Si on filtre par type, n'ajouter que les villes qui ont ce type
          locations.add(locationInfo.location);
        }

        // Extraire les types (toujours tous les types disponibles pour la ville sélectionnée)
        if (shouldAddType) {
          types.add(parsed.tableType);
        }
      });

      // Si un filtre de type est actif, ajouter le type filtré pour le maintenir dans les options
      if (currentFilters.tableType && types.size === 0) {
        types.add(currentFilters.tableType);
      }

      // Si un filtre de location est actif, ajouter la location filtrée pour la maintenir dans les options
      if (currentFilters.location && !locations.has(currentFilters.location)) {
        locations.add(currentFilters.location);
      }

      // Logique spéciale :
      // Si on filtre par location, on veut TOUTES les villes visibles
      if (currentFilters.location && !currentFilters.tableType) {
        // Réextraire TOUTES les villes (sans filtre)
        const allLocations = new Set<string>();
        data.buildings.forEach((b) => {
          const parsed = parseBuildingId(b.id);
          const locationInfo = getBuildingLocation(
            parsed.section1,
            parsed.section2,
            parsed.buildingName
          );
          allLocations.add(locationInfo.location);
        });
        return {
          locations: Array.from(allLocations),
          types: Array.from(types),
        };
      }

      return {
        locations: Array.from(locations),
        types: Array.from(types),
      };
    },
    []
  );

  return { getAvailableData };
}
