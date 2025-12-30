import { SiteHeader } from "@/components/site-header";
import { ScrollArea } from "./ui/scroll-area";
import { Button } from "./ui/button";
import { PlusIcon, Filter } from "lucide-react";
import { Badge } from "./ui/badge";
import { useState, useCallback, useEffect, useDeferredValue } from "react";
import GoodsDisplay from "@/components/total-goods";
import { BuildingDialog } from "@/components/building/building-dialog";
import BuildingList from "./building/building-list";
import { TailwindIndicator } from "./tailwind-indicator";
import BuildingFilters from "./building/building-filters";
import {
  useBuildingFilters,
  type BuildingFilters as BuildingFiltersType,
} from "@/hooks/useBuildingFilters";
import {
  loadSavedBuildings,
  watchSavedBuildings,
} from "@/lib/overview/storage";

export default function OptionLayout() {
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<BuildingFiltersType>({});
  const [availableLocations, setAvailableLocations] = useState<string[]>([]);
  const [availableTypes, setAvailableTypes] = useState<
    ("construction" | "upgrade")[]
  >([]);

  // Utiliser useDeferredValue pour les filtres - évite les rerenders pendant la saisie
  const deferredFilters = useDeferredValue(filters);

  const { getAvailableData } = useBuildingFilters();

  const handleFilterChange = useCallback((newFilters: BuildingFiltersType) => {
    setFilters(newFilters);
  }, []);

  useEffect(() => {
    let unwatch: (() => void) | undefined;

    async function init() {
      const data = await loadSavedBuildings();

      // Extraire les villes et types disponibles en fonction des filtres actuels (deferred)
      const availableData = getAvailableData(data, deferredFilters);
      setAvailableLocations(availableData.locations);
      setAvailableTypes(availableData.types);

      unwatch = watchSavedBuildings((newData) => {
        // Mettre à jour les villes et types disponibles en fonction des filtres actuels (deferred)
        const newAvailableData = getAvailableData(newData, deferredFilters);
        setAvailableLocations(newAvailableData.locations);
        setAvailableTypes(newAvailableData.types);
      });
    }

    init();
    return () => unwatch?.();
  }, [getAvailableData, deferredFilters]);

  return (
    <div className="max-h-screen-patched min-h-screen-patched flex w-full flex-col overflow-auto bg-background-200">
      <TailwindIndicator />
      <SiteHeader />

      <div className="flex min-h-0 flex-1 container-wrapper gap-4">
        <aside className="sticky top-0 hidden origin-left xl:block mb-2 material-medium 2xl:w-6/11 lg:w-5/11 overflow-hidden">
          <header className="flex shrink-0 flex-col w-full transition-colors border-b">
            <div className="flex shrink-0 w-full justify-between items-center gap-3 pl-4 pr-3 sm:pl-3 sm:pr-2 h-12 sm:mx-0">
              <h2 className="text-base font-semibold">Resource Totals</h2>
              <BuildingDialog />
            </div>
          </header>

          <ScrollArea className="size-full overflow-y-auto bg-background-200">
            <GoodsDisplay />
          </ScrollArea>
        </aside>

        <div className="relative flex min-w-0 flex-1 flex-col 2xl:w-5/11 lg:w-6/11">
          <main className="material-medium relative mb-2 mt-0 flex-1 grow overflow-hidden">
            <div className="@container/page-layout relative flex size-full min-h-0 flex-col">
              <header className="flex shrink-0 flex-col w-full transition-colors border-b">
                <div className="flex shrink-0 w-full justify-between items-center gap-3 px-3 h-12 sm:mx-0">
                  <h2 className="hidden xl:block text-base font-semibold">
                    Building List
                  </h2>
                  <div className="block xl:hidden">
                    <BuildingDialog />
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setShowFilters(!showFilters)}
                      className="flex items-center gap-2"
                    >
                      <Filter className="size-4" />
                      Filters
                      {(filters.tableType || filters.location) && (
                        <Badge variant="default" className="h-5 px-1.5 text-xs">
                          {(filters.tableType ? 1 : 0) +
                            (filters.location ? 1 : 0)}
                        </Badge>
                      )}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="cursor-pointer"
                    >
                      <PlusIcon /> Add building
                    </Button>
                  </div>
                </div>

                {/* Collapsible filters */}
                {showFilters && (
                  <div className="border-t border-alpha-200">
                    <BuildingFilters
                      onFilterChange={handleFilterChange}
                      availableLocations={availableLocations}
                      availableTypes={availableTypes}
                      currentFilters={filters}
                    />
                  </div>
                )}
              </header>
              <div className="size-full overflow-y-auto no-scrollbar flex flex-col">
                <BuildingList filters={deferredFilters} />
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
