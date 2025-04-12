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

    if (storedData && isValidData(storedData)) {
      const buildings: string[][] = JSON.parse(storedData);
      replaceTextByImage(buildings);
    }

    const unwatch = storage.watch<string | null>(
      "local:buildingSelections",
      (data: string | null) => {
        if (!data) {
          console.warn("Received null data");
          return;
        }

        try {
          const newBuildings: string[][] = JSON.parse(data);
          const isAllSelected = newBuildings.every((subArray) =>
            subArray.every((item) => item !== "")
          );

          if (isAllSelected) location.reload();
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
    useUpgrade(tables);
  },
});
