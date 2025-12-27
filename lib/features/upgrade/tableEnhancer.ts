// lib/upgrade/tableEnhancer.ts
import { skipBuildingLimit } from "@/lib/constants";
import { getTitlePage } from "@/lib/utils";
import { detectEraRow } from "./eraDetector";
import { getMaxQty } from "./buildingLimits";
import { multiplyRowTextContent } from "./rowMultiplier";
import { addHoldListener } from "./hold";
import { createSaveCell } from "./saveColumn";
import {
  loadSavedBuildings,
  saveBuilding,
  removeBuilding,
} from "@/lib/overview/storage";

interface TableInfo {
  element: HTMLTableElement;
  type: string;
}

export async function enhanceTables(tables: TableInfo[]) {
  const [main, sub, third] = getTitlePage();
  const skipCalculator = skipBuildingLimit.includes(third ?? "");
  const pageUrl = window.location.pathname;

  // Charge tout le storage d'abord pour éviter lecture multiple
  const savedData = await loadSavedBuildings();

  tables.forEach(({ element, type }) => {
    let currentEra = "";
    const rows = Array.from(element.querySelectorAll("tr"));

    let levelColumnIndex = -1;
    const header = rows[0];

    if (header) {
      const headerCells = Array.from(header.children) as HTMLTableCellElement[];
      levelColumnIndex = headerCells.findIndex(
        (cell) => cell.textContent?.trim().toLowerCase() === "level"
      );

      if (!skipCalculator) {
        const calcTh = document.createElement("td");
        calcTh.textContent = "Calculator";
        calcTh.style.textAlign = "center";
        calcTh.style.width = "100px";
        header.appendChild(calcTh);
      }

      const saveTh = document.createElement("td");
      saveTh.textContent = "Save";
      saveTh.style.textAlign = "center";
      saveTh.style.width = "60px";
      header.appendChild(saveTh);
    }

    rows.forEach((row, index) => {
      if (index === 0) {
        Array.from(row.cells).forEach((cell) => {
          if (
            ["coins", "food", "goods", "gems"].includes(
              cell.textContent?.trim().toLocaleLowerCase() || ""
            )
          ) {
            cell.style.minWidth = "96px";
          }
        });
        return;
      }

      const era = detectEraRow(row);
      if (era) {
        currentEra = era;
        const colspanCells = row.querySelectorAll("td[colspan]");
        if (colspanCells.length > 0) {
          colspanCells.forEach((td) => {
            const colspan = parseInt(td.getAttribute("colspan") || "1", 10);
            const additionalCols = skipCalculator ? 1 : 2;
            td.setAttribute("colspan", (colspan + additionalCols).toString());
          });
          return;
        }
      }

      const cells = Array.from(row.children).filter(
        (cell) => cell.tagName.toLowerCase() === "td"
      ) as HTMLTableCellElement[];

      // console.log(cells);

      // Récupérer la valeur de level depuis la bonne colonne
      const levelText =
        levelColumnIndex >= 0 && cells[levelColumnIndex]
          ? cells[levelColumnIndex].textContent?.trim() || String(index)
          : String(index);

      // Extraire le dernier nombre
      const match = levelText.match(/(\d+)\s*$/);
      const level = match ? match[1] : levelText;

      const rowId = `${pageUrl}|${type}|${currentEra}|${level}`;
      const maxQty = getMaxQty(
        currentEra as any,
        main ?? "",
        sub ?? "",
        third ?? "",
        type
      );

      // Stocke le texte original
      if (!row.hasAttribute("data-original-stored")) {
        row.setAttribute("data-original-stored", "true");
        cells.forEach((cell) =>
          cell.childNodes.forEach((node) => {
            if (node.nodeType === Node.TEXT_NODE) {
              (node as any).dataOriginal = node.textContent ?? "";
            }
          })
        );
      }

      // ===== Colonne Calculator =====
      let count = 1;
      let isSaved = false;
      let countSpan: HTMLSpanElement | null = null;

      if (!skipCalculator) {
        const controlCell = document.createElement("td");
        controlCell.style.textAlign = "center";

        if (maxQty > 1) {
          const minusBtn = document.createElement("button");
          minusBtn.textContent = "−";
          const plusBtn = document.createElement("button");
          plusBtn.textContent = "+";

          countSpan = document.createElement("span");
          countSpan.textContent = "1";
          countSpan.style.width = "28px";
          countSpan.style.display = "inline-block";
          countSpan.style.textAlign = "center";

          controlCell.append(minusBtn, countSpan, plusBtn);

          const updateRow = () => {
            if (countSpan) countSpan.textContent = String(count);
            multiplyRowTextContent(row, count);
          };

          const step = async (delta: number) => {
            const newCount = Math.min(maxQty, Math.max(1, count + delta));
            if (newCount !== count) {
              count = newCount;
              updateRow();
              if (isSaved) {
                await saveBuilding(row, rowId, {
                  maxQty,
                  quantity: count,
                });
              }
            }
          };

          addHoldListener(minusBtn, () => step(-1));
          addHoldListener(plusBtn, () => step(1));

          updateRow();
        } else {
          controlCell.textContent = "—";
        }

        row.appendChild(controlCell);
      }

      // ===== Colonne Save =====
      const { td: saveTd, checkbox } = createSaveCell(rowId);

      // Vérifie si la ligne est déjà sauvegardée
      const existing = savedData.buildings.find((b) => b.id === rowId);
      if (existing) {
        isSaved = true;
        checkbox.checked = true;
        count = existing.quantity;
        if (countSpan) countSpan.textContent = count.toString();
        multiplyRowTextContent(row, count);
      }

      checkbox.addEventListener("change", async () => {
        isSaved = checkbox.checked;
        if (isSaved) {
          await saveBuilding(row, rowId, {
            maxQty,
            quantity: count,
          });
        } else {
          await removeBuilding(rowId);
          count = 1;
          if (countSpan) countSpan.textContent = "1";
          multiplyRowTextContent(row, count);
        }
      });

      row.appendChild(saveTd);
    });
  });
}
