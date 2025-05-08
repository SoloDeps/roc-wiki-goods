import { storage } from "wxt/storage";
import { useTechno } from "./lib/techno";
import { useUpgrade } from "./lib/upgrade";
import { replaceTextByImage, isValidData } from "./lib/utils";

export default defineContentScript({
  matches: ["*://*.riseofcultures.wiki.gg/*"],
  runAt: "document_end",
  async main() {
    // ========= IMAGE REPLACEMENT =========
    const storedData = await storage.getItem<string>(
      "local:buildingSelections"
    );

    let primaryWorkshops: string[] = [];
    if (storedData && isValidData(storedData)) {
      const buildings: string[][] = JSON.parse(storedData);
      primaryWorkshops = buildings.map((subArray) => subArray[0]);
      replaceTextByImage(buildings);
    }

    // ========= Page reload ========

    const unwatch = storage.watch<string | null>(
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

    // ========= Techno/Upgrade Part =========

    const tables = Array.from(
      document.querySelectorAll("table.article-table")
    ) as HTMLTableElement[];

    useTechno(tables);
    useUpgrade(tables, primaryWorkshops);
  },
});
