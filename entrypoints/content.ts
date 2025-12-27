import { storage } from "#imports";
import { EraAbbr } from "@/lib/constants";
import {
  useTechno,
  useWonders,
  useBuilding,
  useQuestlines,
} from "@/lib/features";
import { useUpgrade } from "@/lib/features/upgrade/index";
import { replaceTextByImage, isValidData } from "@/lib/utils";
import { loadSavedBuildings, type SavedData } from "@/lib/overview/storage";
import { multiplyRowTextContent } from "@/lib/features/upgrade/rowMultiplier";
import { detectEraRow } from "@/lib/features/upgrade/eraDetector";

export default defineContentScript({
  matches: ["*://*.riseofcultures.wiki.gg/*"],
  runAt: "document_end",
  async main() {
    // ========= IMAGE REPLACEMENT =========
    const storedBuildingsData = await storage.getItem<string>(
      "local:buildingSelections"
    );
    const storedEraData = await storage.getItem<string>("local:eraSelection");

    let storedBuildings: string[][] = [];
    if (storedBuildingsData && isValidData(storedBuildingsData)) {
      const buildings: string[][] = JSON.parse(storedBuildingsData);
      storedBuildings = buildings;
      replaceTextByImage(buildings);
    }

    let storedEra: EraAbbr | null = null;
    if (storedEraData && isValidData(storedEraData)) {
      storedEra = JSON.parse(storedEraData);
    }

    // ========= Page reload ========

    const unwatchBuildings = storage.watch<string | null>(
      "local:buildingSelections",
      (data: string | null) => {
        if (!data) {
          console.warn("Received null data");
          return;
        }

        try {
          const newBuildings: string[][] = JSON.parse(data);

          // Fonction qui vérifie si un sous-tableau est complètement rempli
          const isFull = (subArray: string[]) =>
            subArray.every((item) => item !== "");

          // Fonction qui vérifie si un sous-tableau est complètement vide
          const isEmpty = (subArray: string[]) =>
            subArray.every((item) => item === "");

          // Compter combien de sous-tableaux sont pleins
          const fullCount = newBuildings.filter(isFull).length;

          // Vérifier s'il y a un sous-tableau partiellement rempli
          const hasPartial = newBuildings.some(
            (subArray) => !isFull(subArray) && !isEmpty(subArray)
          );

          // Recharger uniquement si :
          // - Au moins 2 sous-tableaux sont pleins
          // - Aucun sous-tableau n'est partiellement rempli
          if (fullCount >= 2 && !hasPartial) {
            console.log(`Reloading page: ${fullCount} tables are full`);
            location.reload();
          }
        } catch (error) {
          console.error("Error parsing data:", error);
        }
      }
    );

    const unwatchEra = storage.watch<string | null>(
      "local:eraSelection",
      (data: string | null) => {
        if (!data) {
          console.warn("Received null era data");
          return;
        }

        try {
          const newEra: EraAbbr = JSON.parse(data);

          // Comparer la nouvelle valeur avec l'ancienne
          if (storedEra !== undefined && storedEra !== newEra) {
            // console.log( `Era changed from ${storedEra} to ${newEra}, reloading page`);
            location.reload();
          }

          // Mettre à jour la valeur précédente
          storedEra = newEra;
        } catch (error) {
          console.error("Error parsing era data:", error);
        }
      }
    );

    // ========= Techno/Upgrade Part =========

    const tables = Array.from(
      document.querySelectorAll("table.article-table")
    ) as HTMLTableElement[];

    useTechno(tables);
    useUpgrade(tables);
    useBuilding(storedBuildings);
    useWonders(tables);

    useQuestlines(storedEra, storedBuildings);

    // ========= Synchronisation depuis Options vers Wiki =========

    storage.watch<SavedData>(
      "local:roc_saved_buildings",
      (newData: SavedData | null) => {
        if (!newData) return;

        newData.buildings.forEach((building) => {
          const tables = document.querySelectorAll("table.article-table");
          tables.forEach((table) => {
            const rows = Array.from(table.querySelectorAll("tr"));
            let currentEra = "";

            rows.forEach((row) => {
              const cells = Array.from(row.children).filter(
                (cell) => cell.tagName.toLowerCase() === "td"
              ) as HTMLTableCellElement[];

              if (cells.length === 0) return;

              const headerCells = Array.from(
                table.querySelector("tr")?.children || []
              );
              const levelColumnIndex = headerCells.findIndex(
                (cell) => cell.textContent?.trim().toLowerCase() === "level"
              );

              const levelText =
                levelColumnIndex >= 0 && cells[levelColumnIndex]
                  ? cells[levelColumnIndex].textContent?.trim() || ""
                  : "";

              const match = levelText.match(/(\d+)\s*$/);
              const level = match ? match[1] : levelText;

              const era = detectEraRow(row);
              if (era) {
                currentEra = era;
              }

              const pageUrl = window.location.pathname;
              const rowId = `${pageUrl}|upgrade|${currentEra}|${level}`;

              if (rowId === building.id) {
                const controlCell =
                  row.querySelector("td:last-child")?.previousElementSibling;
                if (controlCell) {
                  const countSpan = controlCell.querySelector("span");
                  if (
                    countSpan &&
                    countSpan.textContent !== building.quantity.toString()
                  ) {
                    countSpan.textContent = building.quantity.toString();
                    multiplyRowTextContent(row, building.quantity);
                  }
                }
              }
            });
          });
        });
      }
    );
  },
});
