import {
  addTotalRow,
  findTechnoTable,
  replaceTextByImage,
  addCheckboxColumn,
  calculerTotal,
  removeTotalRow,
  resetTotalRow,
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
    const buildings = storedData ? JSON.parse(storedData) : [];

    replaceTextByImage(buildings);

    // reload if all select is full
    const unwatch = storage.watch<number>(
      "local:buildingSelections",
      (data) => {
        const newBuildings = JSON.parse(data);
        const isValid = newBuildings.every((subArray) =>
          subArray.every((item) => item !== "")
        );

        if (isValid) location.reload();
      }
    );

    // ========= TECHNOS CALCULATION =========

    // Observe all checkbox and calcul if changes are detected
    // document.querySelectorAll(".checkbox-selection").forEach((checkbox) => {
    //   checkbox.addEventListener("change", calculerTotal);
    // });

    // const selectAllCheckbox = document.getElementById("checkboxSelectAll");
    // const checkboxes = document.querySelectorAll(".checkbox-selection");

    // selectAllCheckbox.addEventListener("change", () => {
    //   checkboxes.forEach((checkbox) => {
    //     checkbox.checked = selectAllCheckbox.checked;
    //   });

    //   // Appeler `calculerTotal` si nécessaire
    //   calculerTotal();
    // });

    // // Met à jour le bouton "Select All" si une checkbox individuelle est décochée
    // checkboxes.forEach((checkbox) => {
    //   checkbox.addEventListener("change", () => {
    //     selectAllCheckbox.checked = [...checkboxes].every(c => c.checked);
    //     calculerTotal();
    //   });
    // });

    const technoTable = findTechnoTable();

    addCheckboxColumn(technoTable);
    addTotalRow(technoTable);

    const checkboxes = document.querySelectorAll(".checkbox-selection");
    const selectAllCheckbox = document.getElementById("checkboxSelectAll");

    function updateTotal() {
      const totalRow = technoTable.querySelector("#totalRow");
      
      if ([...checkboxes].some((cb) => cb.checked)) {
        calculerTotal();
      } else {
        if (!totalRow) {
          addTotalRow(technoTable);
        } else {
          // Réinitialiser les valeurs à zéro sans supprimer la ligne
          resetTotalRow(technoTable);
        }
      }
    }

    if (selectAllCheckbox) {
      selectAllCheckbox.addEventListener("change", () => {
        checkboxes.forEach((cb) => (cb.checked = selectAllCheckbox.checked));
        updateTotal();
      });
    }

    document.addEventListener("change", (event) => {
      if (event.target.classList.contains("checkbox-selection")) {
        selectAllCheckbox.checked = [...checkboxes].every((cb) => cb.checked);
        updateTotal();
      }
    });
  },
});
