// Exemple de composant de filtre à ajouter
import { useState, useMemo, memo } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface BuildingFiltersProps {
  onFilterChange: (filters: {
    tableType?: "construction" | "upgrade";
    location?: string;
  }) => void;
  availableLocations: string[]; // Liste des villes disponibles dans les données
  availableTypes: ("construction" | "upgrade")[]; // Liste des types disponibles dans les données
  currentFilters: {
    tableType?: "construction" | "upgrade";
    location?: string;
  };
}

export default memo(function BuildingFilters({
  onFilterChange,
  availableLocations,
  availableTypes,
  currentFilters,
}: BuildingFiltersProps) {
  // Use currentFilters to determine the selected values, default to "all" if not set
  const tableType = currentFilters.tableType || "all";
  const selectedLocation = currentFilters.location || "all";

  // Créer la liste des locations pour les boutons (commence par "all" puis les villes disponibles triées)
  const locations = useMemo(
    () => ["all", ...availableLocations.sort()],
    [availableLocations]
  );

  // Créer la liste des types pour les boutons (commence par "all" puis les types disponibles)
  const types = useMemo(
    () => ["all", ...availableTypes.sort()],
    [availableTypes]
  );

  const handleTableTypeChange = (type: "all" | "construction" | "upgrade") => {
    // Vérifier que le type existe toujours dans les données disponibles
    if (
      type !== "all" &&
      !availableTypes.includes(type as "construction" | "upgrade")
    ) {
      return; // Ne pas permettre la sélection si le type n'existe plus
    }

    onFilterChange({
      tableType: type === "all" ? undefined : type,
      location: selectedLocation === "all" ? undefined : selectedLocation,
    });
  };

  const handleLocationChange = (location: string) => {
    // Vérifier que la location existe toujours dans les données disponibles
    if (location !== "all" && !availableLocations.includes(location)) {
      return; // Ne pas permettre la sélection si la ville n'existe plus
    }

    onFilterChange({
      tableType: tableType === "all" ? undefined : tableType,
      location: location === "all" ? undefined : location,
    });
  };

  return (
    <div className="p-4 space-y-4">
      {/* Filter by type */}
      <div className="space-y-2">
        <h4 className="text-sm font-medium">Building Type</h4>
        <div className="flex gap-2">
          {types.map((type) => (
            <Button
              key={type}
              variant={tableType === type ? "default" : "outline"}
              size="sm"
              onClick={() =>
                handleTableTypeChange(
                  type as "all" | "construction" | "upgrade"
                )
              }
            >
              {type === "all"
                ? "All"
                : type === "construction"
                ? "Construction"
                : "Upgrade"}
            </Button>
          ))}
        </div>
      </div>

      {/* Filter by city */}
      <div className="space-y-2">
        <h4 className="text-sm font-medium">City</h4>
        <div className="flex flex-wrap gap-2">
          {locations.map((location) => (
            <Button
              key={location}
              variant={selectedLocation === location ? "default" : "outline"}
              size="sm"
              onClick={() => handleLocationChange(location)}
            >
              {location === "all" ? "All" : location}
            </Button>
          ))}
        </div>
      </div>

      {/* Active filters */}
      {(tableType !== "all" || selectedLocation !== "all") && (
        <div className="flex gap-2 items-center">
          <span className="text-sm text-muted-foreground">Active filters:</span>
          {tableType !== "all" && (
            <Badge variant="secondary">
              {tableType === "construction" ? "Construction" : "Upgrade"}
            </Badge>
          )}
          {selectedLocation !== "all" && (
            <Badge variant="secondary">{selectedLocation}</Badge>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              onFilterChange({});
            }}
          >
            Clear
          </Button>
        </div>
      )}
    </div>
  );
});
