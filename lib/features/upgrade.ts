import {
  formatColumns,
  eras,
  skipColumns,
  EraAbbr,
  skipBuildingLimit,
  limitAlliedBuildingsByEra,
  alliedCity,
  limitAllBuildingsByEra,
} from "@/lib/constants";
import {
  filterTables,
  findPreviousH2SpanWithId,
  formatNumber,
  getTitlePage,
  parseNumber,
  generateRowId,
} from "@/lib/utils";
import {
  loadSavedBuildings,
  saveBuilding,
  removeBuilding,
} from "@/lib/overview/storage";

interface TableInfo {
  element: HTMLTableElement;
  type: string;
}

function detectEraRow(
  row: HTMLTableRowElement,
  eras: readonly { name: string; abbr: string }[]
): string | null {
  const cells = Array.from(row.cells);

  // Cas 1 : ligne avec colspan
  if (cells.some((c) => c.hasAttribute("colspan"))) {
    const text = row.textContent?.trim() || "";
    const match = eras.find((era) =>
      text.toLowerCase().includes(era.name.toLowerCase())
    );
    return match ? match.abbr : null;
  }

  // Cas 2 : première cellule "titre" (gras/couleur de fond)
  if (cells.length > 0) {
    const firstCell = cells[0];
    const text = firstCell.textContent?.trim() || "";

    const match = eras.find((era) =>
      text.toLowerCase().includes(era.name.toLowerCase())
    );
    if (match) return match.abbr;
  }

  return null;
}

function getMaxQty(
  eraAbbr: EraAbbr,
  mainSection: string,
  subSection?: string,
  buildingName?: string,
  tableType?: string
): number {
  if (!buildingName) return 1;

  // If home_cultures page
  if (mainSection === "home_cultures") {
    let nameBuilding = subSection === "workshops" ? "workshops" : buildingName;
    return limitAllBuildingsByEra[eraAbbr]?.[nameBuilding] ?? 1;
  }

  // If allied_cultures page
  if (mainSection === "allied_cultures") {
    if (!subSection || !buildingName || !eraAbbr) return 1;
    const city = subSection as alliedCity;

    // If Construction
    if (tableType === "construction") {
      const buildingData = limitAlliedBuildingsByEra[city]?.[buildingName];
      if (buildingData) {
        const values = Object.values(buildingData);
        const lastValue = values[values.length - 1];
        return lastValue ?? 1;
      }
      return 1;
    }

    // If Upgrade
    return limitAlliedBuildingsByEra[city]?.[buildingName]?.[eraAbbr] ?? 1;
  }

  // Fallback
  return limitAllBuildingsByEra[eraAbbr]?.[buildingName] ?? 1;
}

function addHoldListener(
  button: HTMLButtonElement,
  onStep: () => void,
  delay = 120
) {
  let timer: number | null = null;

  const start = () => {
    onStep();
    timer = window.setInterval(onStep, delay);
  };

  const stop = () => {
    if (timer !== null) {
      clearInterval(timer);
      timer = null;
    }
  };

  button.addEventListener("mousedown", start);
  button.addEventListener("mouseup", stop);
  button.addEventListener("mouseleave", stop);

  button.addEventListener("touchstart", (e) => {
    e.preventDefault();
    start();
  });
  button.addEventListener("touchend", stop);
}

function addMultiplicatorColumn(tables: TableInfo[]): void {
  // Récupère les infos dans le title de la page
  const [mainSection, subSection, thirdSection] = getTitlePage();
  const pageUrl = window.location.pathname;

  if (skipBuildingLimit.includes(thirdSection ?? "")) return;

  tables.forEach(({ element: table, type: tableType }) => {
    let currentAbbrev = "";
    const rows = Array.from(table.querySelectorAll("tr"));
    const h2 = findPreviousH2SpanWithId(table);

    // Ajoute les colonnes "Calculator" ET "Save" dans le header
    const firstRow = rows[0];
    if (firstRow) {
      const calcTh = document.createElement("td");
      calcTh.style.textAlign = "center";
      calcTh.style.whiteSpace = "normal";
      calcTh.style.width = "100px";
      calcTh.textContent = "Calculator";
      firstRow.appendChild(calcTh);

      const saveTh = document.createElement("td");
      saveTh.style.textAlign = "center";
      saveTh.style.whiteSpace = "normal";
      saveTh.style.width = "60px";
      saveTh.textContent = "Save";
      firstRow.appendChild(saveTh);
    }

    let levelIndex = 0;
    if (firstRow) {
      const headerCells = Array.from(firstRow.querySelectorAll("td, th"));
      levelIndex = headerCells.findIndex(
        (cell) => cell.textContent?.trim().toLowerCase() === "level"
      );
      if (levelIndex === -1) levelIndex = 0;
    }

    rows.forEach((row, index) => {
      if (index === 0) return;

      const cells = Array.from(row.children).filter(
        (cell) => cell.tagName.toLowerCase() === "td"
      ) as HTMLTableCellElement[];

      const abbrev = detectEraRow(row, eras);
      if (abbrev) {
        currentAbbrev = abbrev;

        const hasColspan = Array.from(row.cells).some((c) =>
          c.hasAttribute("colspan")
        );

        if (hasColspan) {
          row.querySelectorAll("td[colspan]").forEach((td) => {
            const colspan = parseInt(td.getAttribute("colspan") || "1", 10);
            td.setAttribute("colspan", (colspan + 2).toString());
          });

          return;
        }
      }

      const level = cells[levelIndex]?.textContent?.trim() || "";
      const rowId = generateRowId(pageUrl, tableType, currentAbbrev, level);

      const maxQty = getMaxQty(
        currentAbbrev as EraAbbr,
        mainSection ?? "",
        subSection ?? "",
        thirdSection ?? "",
        tableType
      );

      // ===== COLONNE CALCULATOR =====
      const controlCell = document.createElement("td");
      controlCell.style.textAlign = "center";

      const minusBtn = document.createElement("button");
      minusBtn.textContent = "−";
      minusBtn.style.color = "white";
      minusBtn.style.fontSize = "16px";
      minusBtn.style.fontWeight = "600";
      minusBtn.style.userSelect = "none";

      const countSpan = document.createElement("span");
      countSpan.textContent = "1";
      countSpan.style.fontSize = "14px";
      countSpan.style.display = "inline-block";
      countSpan.style.width = "28px";
      countSpan.style.textAlign = "center";
      countSpan.style.userSelect = "none";

      const plusBtn = document.createElement("button");
      plusBtn.textContent = "+";
      plusBtn.style.color = "white";
      plusBtn.style.fontSize = "16px";
      plusBtn.style.fontWeight = "600";
      plusBtn.style.userSelect = "none";

      if (maxQty > 1) {
        controlCell.appendChild(minusBtn);
        controlCell.appendChild(countSpan);
        controlCell.appendChild(plusBtn);
      } else {
        controlCell.textContent = "—";
      }
      row.appendChild(controlCell);

      // ===== COLONNE SAVE =====
      const saveCell = document.createElement("td");

      const center = document.createElement("div");
      center.style.display = "flex";
      center.style.alignItems = "center";
      center.style.justifyContent = "center";
      center.style.height = "100%";

      const checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.style.cursor = "pointer";
      checkbox.style.width = "20px";
      checkbox.style.height = "20px";
      checkbox.dataset.rowId = rowId;

      center.appendChild(checkbox);
      saveCell.appendChild(center);
      row.appendChild(saveCell);

      // ===== LOGIQUE =====
      let count = 1;

      // Charge l'état depuis chrome.storage (ASYNC)
      // Dans upgrade.ts, section où on charge l'état sauvegardé

      loadSavedBuildings().then((savedData) => {
        const existingEntry = savedData.buildings.find((b) => b.id === rowId);

        if (existingEntry) {
          // Coche la checkbox
          checkbox.checked = true;

          // Restaure la quantité
          count = existingEntry.quantity;
          countSpan.textContent = count.toString();

          // Applique la multiplication visuelle
          multiplyRowTextContent(row, count);
        } else {
          // Pas de sauvegarde existante
          checkbox.checked = false;
          count = 1;
          countSpan.textContent = "1";
          // Pas besoin de multiply car c'est déjà à 1 par défaut
        }
      });

      // Stocke le texte original une seule fois
      if (!row.hasAttribute("data-original-stored")) {
        row.setAttribute("data-original-stored", "true");
        cells.forEach((cell) => {
          cell.childNodes.forEach((node) => {
            if (node.nodeType === Node.TEXT_NODE) {
              (node as any).dataOriginal = node.textContent ?? "";
            }
          });
        });
      }

      // ASYNC updateRow
      const updateRow = async () => {
        countSpan.textContent = count.toString();
        multiplyRowTextContent(row, count); // Met à jour l'affichage

        if (checkbox.checked) {
          // Sauvegarde avec les coûts UNITAIRES extraits de dataOriginal
          await saveBuilding(row, rowId, {
            pageUrl,
            tableType,
            era: currentAbbrev,
            level,
            mainSection: mainSection ?? "",
            subSection: subSection ?? "",
            buildingName: thirdSection ?? "",
            quantity: count,
            maxQty,
            h2Title: h2?.textContent?.trim() || "",
          });
        }
      };

      // ASYNC dans les listeners
      addHoldListener(minusBtn, () => {
        if (count > 1) {
          count--;
          updateRow(); // Pas besoin d'await ici (fire and forget)
        }
      });

      addHoldListener(plusBtn, () => {
        if (count < maxQty) {
          count++;
          updateRow();
        }
      });

      // ASYNC dans le checkbox
      checkbox.addEventListener("change", async () => {
        if (checkbox.checked) {
          // Sauvegarde le bâtiment avec la quantité actuelle
          await saveBuilding(row, rowId, {
            pageUrl,
            tableType,
            era: currentAbbrev,
            level,
            mainSection: mainSection ?? "",
            subSection: subSection ?? "",
            buildingName: thirdSection ?? "",
            quantity: count,
            maxQty,
            h2Title: h2?.textContent?.trim() || "",
          });
        } else {
          // Supprime le bâtiment
          await removeBuilding(rowId);

          // Remet la quantité à 1 et l'affichage par défaut
          count = 1;
          countSpan.textContent = "1";
          multiplyRowTextContent(row, 1);
        }
      });

      updateRow();
    });
  });
}

function multiplyRowTextContent(row: HTMLTableRowElement, multiplier: number) {
  const cells = Array.from(row.cells);
  const cellMap: Record<number, string> = {};

  const headerRow = row.parentElement?.querySelector("tr");
  if (headerRow) {
    Array.from(headerRow.cells).forEach((th, i) => {
      cellMap[i] = th.textContent?.trim().toLowerCase() || "";
    });
  }

  for (let i = 0; i < cells.length; i++) {
    const columnName = cellMap[i] || "";
    if (skipColumns.includes(columnName)) continue;

    const cell = cells[i];

    if (["coins", "food", "goods", "gems"].includes(columnName)) {
      cell.style.minWidth = "96px";
    }

    const isFormatColumn = formatColumns.includes(columnName.toLowerCase());
    const isGoods = columnName === "goods";
    const isWorkers = columnName === "workers";

    cell.childNodes.forEach((node) => {
      if (node.nodeType === Node.TEXT_NODE) {
        const textNode = node as Text;
        const originalText =
          (textNode as any).dataOriginal ?? textNode.textContent ?? "";

        const newText = originalText.replace(
          /(\d{1,3}(?:[.,]\d{1,3})*(?:\.\d+)?)(?:\s*([KM]))?/gi,
          (_match: string, numberStr: string, suffix: string | undefined) => {
            const parsed = parseNumber(numberStr + (suffix ? suffix : ""));
            if (isNaN(parsed)) return _match;

            const total = parsed * multiplier;

            if (isFormatColumn) {
              return formatNumber(total);
            } else if (isGoods || isWorkers) {
              return total.toLocaleString("en-US");
            } else {
              return total.toLocaleString("en-US");
            }
          }
        );

        textNode.textContent = newText;
      }
    });
  }
}

export function useUpgrade(tables: HTMLTableElement[]) {
  const [mainSection] = getTitlePage();

  if (mainSection !== "home_cultures" && mainSection !== "allied_cultures")
    return;

  const tablesFiltered = filterTables(tables, ["construction", "upgrade"]);
  if (tablesFiltered.length === 0) return;

  addMultiplicatorColumn(tablesFiltered);
}
