import { useState, useCallback, useEffect, useDeferredValue } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Filter } from "lucide-react";
import BuildingFilters from "../building/panel-filters";
import {
  useBuildingFilters,
  type BuildingFilters as BuildingFiltersType,
} from "@/hooks/useBuildingFilters";
import {
  loadSavedBuildings,
  watchSavedBuildings,
} from "@/lib/overview/storage";

interface ButtonFilterProps {
  onFiltersChange: (filters: BuildingFiltersType) => void;
  initialFilters?: BuildingFiltersType;
}

export function ButtonFilter({
  onFiltersChange,
  initialFilters = {},
}: ButtonFilterProps) {
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<BuildingFiltersType>(initialFilters);
  const [availableLocations, setAvailableLocations] = useState<string[]>([]);
  const [availableTypes, setAvailableTypes] = useState<
    ("construction" | "upgrade")[]
  >([]);

  const deferredFilters = useDeferredValue(filters);
  const { getAvailableData } = useBuildingFilters();

  const handleFilterChange = useCallback(
    (newFilters: BuildingFiltersType) => {
      setFilters(newFilters);
      onFiltersChange(newFilters);
    },
    [onFiltersChange]
  );

  useEffect(() => {
    let unwatch: (() => void) | undefined;

    async function init() {
      const data = await loadSavedBuildings();
      const availableData = getAvailableData(data, deferredFilters);
      setAvailableLocations(availableData.locations);
      setAvailableTypes(availableData.types);

      unwatch = watchSavedBuildings((newData) => {
        const newAvailableData = getAvailableData(newData, deferredFilters);
        setAvailableLocations(newAvailableData.locations);
        setAvailableTypes(newAvailableData.types);
      });
    }

    init();
    return () => unwatch?.();
  }, [getAvailableData, deferredFilters]);

  const activeFiltersCount =
    (deferredFilters.tableType ? 1 : 0) + (deferredFilters.location ? 1 : 0);

  return {
    button: (
      <Button
        size="sm"
        variant="outline"
        onClick={() => setShowFilters(!showFilters)}
        className="flex items-center gap-2"
      >
        <Filter className="size-4" />
        Filters
        {activeFiltersCount > 0 && (
          <Badge variant="default" className="h-5 px-1.5 text-xs">
            {activeFiltersCount}
          </Badge>
        )}
      </Button>
    ),
    panel: showFilters ? (
      <div className="border-b border-alpha-200">
        <BuildingFilters
          onFilterChange={handleFilterChange}
          availableLocations={availableLocations}
          availableTypes={availableTypes}
          currentFilters={deferredFilters}
        />
      </div>
    ) : null,
  };
}
