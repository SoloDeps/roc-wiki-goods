// lib/upgrade/tableEnhancer.ts - Optimized Version
import { skipBuildingLimit } from "@/lib/constants";
import { getTitlePage } from "@/lib/utils";
import { detectEraRow } from "./eraDetector";
import { getMaxQty } from "./buildingLimits";
import { multiplyRowTextContent } from "./rowMultiplier";
import { addHoldListener } from "./hold";
import { createSaveCell } from "./saveColumn";
import {
  saveBuilding,
  removeBuilding,
  extractCosts,
  getBuildings,
} from "@/lib/overview/storage";

// use set for better performance with multiple concurrent updates
const activeLocalUpdates = new Set<string>();

export function isLocalBuildingUpdate() {
  return activeLocalUpdates.size > 0;
}

// helper to wrap local updates with proper tracking
async function withLocalUpdate<T>(
  id: string,
  action: () => Promise<T>,
): Promise<T> {
  activeLocalUpdates.add(id);
  try {
    return await action();
  } finally {
    // remove update flag after microtask to ensure watchers see the change
    queueMicrotask(() => activeLocalUpdates.delete(id));
  }
}

interface TableInfo {
  element: HTMLTableElement;
  type: string;
}

export async function enhanceTables(tables: TableInfo[]) {
  const [main, sub, third] = getTitlePage();
  const skipCalculator = skipBuildingLimit.includes(third ?? "");
  const pageUrl = window.location.pathname;

  // single storage read, create lookup map for o(1) access
  const savedData = await getBuildings();
  const savedMap = new Map(savedData.map((b: any) => [b.id, b]));

  tables.forEach(({ element, type }) => {
    let currentEra = "";
    const rows = Array.from(element.querySelectorAll("tr"));

    element.setAttribute("data-table-type", type);

    let levelColumnIndex = -1;
    const header = rows[0];

    if (header) {
      const headerCells = Array.from(header.children) as HTMLTableCellElement[];
      levelColumnIndex = headerCells.findIndex(
        (cell) => cell.textContent?.trim().toLowerCase() === "level",
      );

      if (!skipCalculator) {
        const calcTh = document.createElement("td");
        calcTh.textContent = "Calculator";
        calcTh.style.cssText = "text-align: center; width: 100px";
        header.appendChild(calcTh);
      }

      const saveTh = document.createElement("td");
      saveTh.textContent = "Save";
      saveTh.style.cssText = "text-align: center; width: 60px";
      header.appendChild(saveTh);
    }

    rows.forEach((row, index) => {
      if (index === 0) {
        Array.from(row.cells).forEach((cell) => {
          if (
            ["coins", "food", "goods", "gems"].includes(
              cell.textContent?.trim().toLowerCase() || "",
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
          const additionalCols = skipCalculator ? 1 : 2;
          colspanCells.forEach((td) => {
            const colspan = parseInt(td.getAttribute("colspan") || "1", 10);
            td.setAttribute("colspan", (colspan + additionalCols).toString());
          });
          return;
        }
      }

      const cells = Array.from(row.children).filter(
        (cell) => cell.tagName.toLowerCase() === "td",
      ) as HTMLTableCellElement[];

      // extract level
      const levelText =
        levelColumnIndex >= 0 && cells[levelColumnIndex]
          ? cells[levelColumnIndex].textContent?.trim() || String(index)
          : String(index);
      const level = levelText.match(/(\d+)\s*$/)?.[1] || levelText;

      const rowId = `${pageUrl}|${type}|${currentEra}|${level}`;
      const maxQty = getMaxQty(
        currentEra as any,
        main ?? "",
        sub ?? "",
        third ?? "",
        type,
      );

      // store original text once
      if (!row.hasAttribute("data-original-stored")) {
        row.setAttribute("data-original-stored", "true");
        row.setAttribute("data-wiki-source", "true");
        cells.forEach((cell) =>
          cell.childNodes.forEach((node) => {
            if (node.nodeType === Node.TEXT_NODE) {
              (node as any).dataOriginal = node.textContent ?? "";
            }
          }),
        );
      }

      // ===== calculator column =====
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
          countSpan.style.cssText =
            "width: 28px; display: inline-block; text-align: center";

          controlCell.append(minusBtn, countSpan, plusBtn);

          const updateRow = () => {
            if (countSpan) countSpan.textContent = String(count);
            multiplyRowTextContent(row, count);
          };

          // simplified step function with single update path
          const step = async (delta: number) => {
            const newCount = Math.min(maxQty, Math.max(1, count + delta));
            if (newCount === count) return;

            count = newCount;
            updateRow();

            if (isSaved) {
              await withLocalUpdate(rowId, async () => {
                await saveBuilding({
                  id: rowId,
                  costs: extractCosts(row),
                  maxQty,
                  quantity: count,
                  hidden: false,
                });
              });
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

      // ===== save column =====
      const { td: saveTd, checkbox } = createSaveCell(rowId);

      // use map lookup instead of find
      const existing = savedMap.get(rowId);
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
          // store current expanded state first use existing data
          const currentSpanValue = countSpan
            ? parseInt(countSpan.textContent || "1")
            : 1;
          const existingBuilding = savedMap.get(rowId);

          count = existingBuilding?.quantity ?? currentSpanValue;
          if (countSpan) countSpan.textContent = count.toString();
          multiplyRowTextContent(row, count);

          await withLocalUpdate(rowId, async () => {
            const building = {
              id: rowId,
              costs: extractCosts(row),
              maxQty,
              quantity: count,
              hidden: false,
            };
            await saveBuilding(building);
            // update local cache
            savedMap.set(rowId, building as any);
          });
        } else {
          await withLocalUpdate(rowId, async () => {
            await removeBuilding(rowId);
            savedMap.delete(rowId);
          });

          count = 1;
          if (countSpan) countSpan.textContent = "1";
          multiplyRowTextContent(row, count);
        }
      });

      row.appendChild(saveTd);
    });
  });
}
