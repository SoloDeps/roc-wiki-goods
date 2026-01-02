import { useState, useCallback, useDeferredValue, useRef } from "react";
import { loadSavedBuildings, removeBuilding } from "@/lib/overview/storage";
import { type BuildingFilters as BuildingFiltersType } from "@/hooks/useBuildingFilters";

import { SiteHeader } from "@/components/site-header";
import { WorkshopModal } from "@/components/modals/workshop-modal";
import {
  BuildingList,
  type BuildingListRef,
} from "@/components/building/building-list";
import { TailwindIndicator } from "@/components/tailwind-indicator";
import { TotalGoodsDisplay } from "@/components/total-goods/total-goods-display";
import { ButtonFilter } from "@/components/buttons/button-filter";
import { ButtonGroupBuilding } from "@/components/buttons/button-group-building";
import { ButtonGroupTotal } from "@/components/buttons/button-group-total";

export default function OptionLayout() {
  const [filters, setFilters] = useState<BuildingFiltersType>({});
  const deferredFilters = useDeferredValue(filters);
  const buildingListRef = useRef<BuildingListRef>(null);

  const handleFiltersChange = useCallback((newFilters: BuildingFiltersType) => {
    setFilters(newFilters);
  }, []);

  const filterComponents = ButtonFilter({
    onFiltersChange: handleFiltersChange,
  });

  // Calculer le nombre de filtres actifs
  const activeFiltersCount =
    (filters.tableType ? 1 : 0) + (filters.location ? 1 : 0);

  const handleToggleFilters = () => {
    // Inverser l'état d'affichage des filtres
    filterComponents.button.props.onClick();
  };

  const handleExpandAll = () => {
    // Développer tous les accordéons
    if (buildingListRef.current) {
      // Utiliser la méthode expandAll sans paramètres pour développer toutes les catégories visibles
      buildingListRef.current.expandAll();
    }
  };

  const handleCollapseAll = async () => {
    // Réduire tous les accordéons
    if (buildingListRef.current && buildingListRef.current.collapseAll) {
      buildingListRef.current.collapseAll();
    }
  };

  const handleDeleteAll = async () => {
    // Supprimer tous les bâtiments sauvegardés
    const confirmed = window.confirm(
      "Are you sure you want to delete all saved buildings? This action cannot be undone."
    );

    if (confirmed) {
      try {
        const data = await loadSavedBuildings();
        // Supprimer chaque bâtiment individuellement pour déclencher les watchers
        for (const building of data.buildings) {
          await removeBuilding(building.id);
        }
      } catch (error) {
        console.error("Error deleting all buildings:", error);
        alert("An error occurred while deleting buildings. Please try again.");
      }
    }
  };

  return (
    <div className="max-h-screen-patched min-h-screen-patched flex w-full flex-col overflow-auto bg-background-200">
      <TailwindIndicator />
      <SiteHeader />

      <div className="flex min-h-0 flex-1 container-wrapper gap-4">
        <aside className="sticky top-0 hidden origin-left xl:block mb-2 material-medium 2xl:w-6/11 lg:w-5/11 overflow-hidden">
          {/* total list header */}
          <header className="flex shrink-0 flex-col w-full transition-colors border-b">
            <div className="flex shrink-0 w-full justify-between items-center gap-3 pl-4 pr-3 sm:pl-3 sm:pr-2 h-12 sm:mx-0">
              <h2 className="text-[15px] font-semibold">Resource Totals</h2>
              <WorkshopModal />
            </div>
          </header>

          <TotalGoodsDisplay />
        </aside>

        <div className="relative flex min-w-0 flex-1 flex-col 2xl:w-5/11 lg:w-6/11">
          <main className="material-medium relative mb-2 mt-0 flex-1 grow overflow-hidden">
            <div className="@container/page-layout relative flex size-full min-h-0 flex-col">
              {/* building list header */}
              <header className="flex shrink-0 flex-col w-full transition-colors border-b">
                <div className="flex shrink-0 w-full justify-between items-center gap-3 px-3 h-12 sm:mx-0">
                  <h2 className="hidden xl:block text-[15px] font-semibold">
                    Building List
                  </h2>
                  <div className="block xl:hidden">
                    <ButtonGroupTotal />
                  </div>

                  <div className="flex items-center gap-2">
                    <ButtonGroupBuilding
                      onFiltersChange={handleFiltersChange}
                      filters={filters}
                      activeFiltersCount={activeFiltersCount}
                      onToggleFilters={handleToggleFilters}
                      onExpandAll={handleExpandAll}
                      onCollapseAll={handleCollapseAll}
                      onDeleteAll={handleDeleteAll}
                    />
                  </div>
                </div>
              </header>

              {/* Collapsible filters */}
              {filterComponents.panel}

              <div className="size-full overflow-y-auto no-scrollbar flex flex-col">
                <BuildingList ref={buildingListRef} filters={deferredFilters} />
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
