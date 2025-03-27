import {
  addTotalRow,
  findTechnoTable,
  replaceTextByImage,
  addCheckboxColumn,
  calculerTotal,
  resetTotalRow,
  isValidData,
} from "./utils/functions";
import { storage } from "wxt/storage";

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

    // ========= TECHNOS CALCULATION =========

    const technoTable = findTechnoTable() as HTMLTableElement;
    if (!technoTable) return;

    addCheckboxColumn(technoTable);
    addTotalRow(technoTable);

    const checkboxes = technoTable.querySelectorAll<HTMLInputElement>(
      ".checkbox-selection"
    );
    const selectAllCheckbox = document.getElementById(
      "checkboxSelectAll"
    ) as HTMLInputElement | null;

    const updateTotal = () => {
      const totalRow = technoTable.querySelector("#totalRow");
      const checkedBoxes = Array.from(checkboxes).filter((cb) => cb.checked);

      checkedBoxes.length > 0
        ? calculerTotal()
        : totalRow
        ? resetTotalRow(technoTable)
        : addTotalRow(technoTable);
    };

    if (selectAllCheckbox) {
      selectAllCheckbox.addEventListener("change", () => {
        checkboxes.forEach((cb) => (cb.checked = selectAllCheckbox.checked));
        updateTotal();
      });
    }

    technoTable.addEventListener("change", (event) => {
      const target = event.target as HTMLInputElement;
      if (
        target.classList.contains("checkbox-selection") &&
        selectAllCheckbox
      ) {
        selectAllCheckbox.checked = Array.from(checkboxes).every(
          (cb) => cb.checked
        );
        updateTotal();
      }
    });
  },
});
