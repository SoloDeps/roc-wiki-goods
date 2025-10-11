import {
  formatColumns,
  eras,
  skipColumns,
  EraAbbr,
  skipBuildingLimit,
  limitAlliedBuildingsByEra,
  alliedCity,
  limitAllBuildingsByEra,
} from "./constants";
import {
  filterTables,
  findPreviousH2SpanWithId,
  formatNumber,
  getTitlePage,
  parseNumber,
} from "./utils";

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

  return null; // pas une ligne d’ère
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

function addMultiplicatorColumn(tables: TableInfo[]): void {
  // Récupère les infos dans le title de la page
  const [mainSection, subSection, thirdSection] = getTitlePage();

  if (skipBuildingLimit.includes(thirdSection ?? "")) return;

  let numberTables = 1;
  tables.forEach(({ element: table, type: tableType }) => {
    let currentAbbrev = "";
    const rows = Array.from(table.querySelectorAll("tr"));
    const h2 = findPreviousH2SpanWithId(table);

    // Ajoute la colonne "Calculator" à la première ligne
    const firstRow = rows[0];
    if (firstRow) {
      const th = document.createElement("td");
      th.style.textAlign = "center";
      th.style.whiteSpace = "normal";
      th.style.width = "100px";
      th.textContent = "Calculator";
      firstRow.appendChild(th);
    }

    // Recherche dynamique de l'index "Level"
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

        // Gestion du colspan ou ajout cellule vide
        const hasColspan = Array.from(row.cells).some((c) =>
          c.hasAttribute("colspan")
        );

        if (hasColspan) {
          row.querySelectorAll("td[colspan]").forEach((td) => {
            const colspan = parseInt(td.getAttribute("colspan") || "1", 10);
            td.setAttribute("colspan", (colspan + 1).toString());
          });

          return;
        }
      }

      // Détermine la limite max en fonction de l'ère + bâtiment
      const maxQty = getMaxQty(
        currentAbbrev as EraAbbr,
        mainSection ?? "",
        subSection ?? "",
        thirdSection ?? "",
        tableType
      );

      // Ajoute la colonne de contrôle (calculatrice)
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

      let count = 1;

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

      const updateRow = () => {
        countSpan.textContent = count.toString();
        multiplyRowTextContent(row, count);
      };

      minusBtn.addEventListener("click", () => {
        if (count > 1) {
          count--;
          updateRow();
        }
      });

      plusBtn.addEventListener("click", () => {
        if (count < maxQty) {
          count++;
          updateRow();
        }
      });

      updateRow();
    });

    numberTables++;
  });
}

function multiplyRowTextContent(row: HTMLTableRowElement, multiplier: number) {
  const cells = Array.from(row.cells);
  const cellMap: Record<number, string> = {};

  // Stocke les noms de colonnes pour référence
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
            // parseNumber gère désormais les deux formats (1,400 ou 1.4K)
            const parsed = parseNumber(numberStr + (suffix ? suffix : ""));
            if (isNaN(parsed)) return _match;

            const total = parsed * multiplier;

            if (isFormatColumn) {
              return formatNumber(total); // avec K/M si nécessaire
            } else if (isGoods || isWorkers) {
              return total.toLocaleString("en-US"); // entier avec virgule US
            } else {
              return total.toLocaleString("en-US"); // simple entier
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
