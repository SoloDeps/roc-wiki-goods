import {
  formatColumns,
  eras,
  skipColumns,
  limitPrimaryWorkshop,
} from "./constants";
import {
  findPreviousH2SpanWithId,
  formatNumber,
  getClosestLowerOrEqualMaxQty,
  getTitlePage,
  parseNumber,
} from "./utils";

function findTimeTables(tables: HTMLTableElement[]): HTMLTableElement[] {
  const matchingTables: HTMLTableElement[] = [];

  for (let i = 0; i < tables.length; i++) {
    const firstRow = tables[i].querySelector("tr");
    if (!firstRow) continue;

    const cells = firstRow.querySelectorAll("td");
    for (let j = 0; j < cells.length; j++) {
      const cellText = cells[j].textContent?.trim();
      if (cellText === "Time") {
        matchingTables.push(tables[i]);
        break; // On a trouvé, inutile de continuer à parcourir les cellules
      }
    }
  }

  if (matchingTables.length === 3) {
    return matchingTables.slice(1); // enlève le premier, garde les deux derniers
  }

  return matchingTables;
}

export function getMaxQty(
  tables: HTMLTableElement[],
  pageTitle: string | null
): Record<number, number> | { abbrev: string; maxQty: number }[] {
  if (tables.length === 0) return pageTitle === "home_cultures" ? {} : [];

  const firstTable = tables[0];
  const rows = firstTable.querySelectorAll("tr");

  if (pageTitle === "home_cultures") {
    const result: Record<number, number> = {};

    const headerCells = Array.from(rows[0].children) as HTMLTableCellElement[];
    const levelIndex = headerCells.findIndex(
      (cell) => cell.textContent?.trim().toLowerCase() === "level"
    );
    const maxQtyIndex = headerCells.findIndex(
      (cell) => cell.textContent?.trim().toLowerCase() === "max qty"
    );

    if (levelIndex === -1 || maxQtyIndex === -1) return result;

    rows.forEach((row, index) => {
      if (index === 0) return;

      const cells = Array.from(row.children) as HTMLTableCellElement[];
      const hasColspan = cells.some((cell) => cell.hasAttribute("colspan"));
      if (hasColspan) return;

      const levelValue = cells[levelIndex].textContent?.trim() || "";
      const maxQtyValue = parseNumber(
        cells[maxQtyIndex].textContent?.trim() || "0"
      );

      const level = parseInt(levelValue, 10);
      if (!isNaN(level)) {
        result[level] = maxQtyValue;
      }
    });

    return result;
  }

  if (pageTitle === "allied_cultures") {
    const result: { abbrev: string; maxQty: number }[] = [];

    const headerCells = Array.from(rows[0].children) as HTMLTableCellElement[];
    const maxQtyIndex = headerCells.findIndex(
      (cell) => cell.textContent?.trim().toLowerCase() === "max qty"
    );

    if (maxQtyIndex === -1) return result;

    rows.forEach((row, index) => {
      if (index === 0) return;

      const cells = Array.from(row.children) as HTMLTableCellElement[];
      const hasColspan = cells.some((cell) => cell.hasAttribute("colspan"));
      if (hasColspan) return;

      const maxQtyCell = cells[maxQtyIndex];

      // Cas 1 : uniquement un nombre dans la cellule
      const rawText = maxQtyCell.textContent?.trim() || "";
      const noSpan = maxQtyCell.querySelector("span") === null;

      if (noSpan && rawText) {
        const maxQty = parseNumber(rawText);
        if (!isNaN(maxQty)) {
          result.push({ abbrev: "__no_abbrev__", maxQty });
        }
        return;
      }

      // Cas 2 : cellule avec des <span> contenant abbrev
      maxQtyCell.childNodes.forEach((node) => {
        if (node.nodeType === Node.ELEMENT_NODE) {
          const element = node as HTMLElement;

          if (element.tagName.toLowerCase() === "span") {
            const abbrev = element.textContent?.trim() || "";

            let nextNode = element.nextSibling;
            while (
              nextNode &&
              nextNode.nodeType === Node.TEXT_NODE &&
              nextNode.textContent?.trim() === ""
            ) {
              nextNode = nextNode.nextSibling;
            }

            const qtyText = nextNode?.textContent?.trim() || "";
            const maxQty = parseNumber(qtyText);

            if (abbrev && !isNaN(maxQty)) {
              result.push({ abbrev, maxQty });
            }
          }
        }
      });
    });

    return result;
  }

  return pageTitle === "home_cultures" ? {} : [];
}

function addMultiplicatorColumn(
  tables: HTMLTableElement[],
  primaryWorkshops: string[]
): void {
  // Récupère les infos dans le title de la page
  const [mainSection, subSection, thirdSection] = getTitlePage();

  // Détermine si c'est l'atelier primaire de user
  let isPrimary: boolean = false;
  if (subSection === "workshops" && thirdSection) {
    isPrimary = primaryWorkshops
      .map((w) => w.toLowerCase().replace(/\s+/g, "_"))
      .includes(thirdSection.toLowerCase());
  }

  // Calcule la liste des quantités max
  const maxQtyList = getMaxQty(tables, mainSection);

  let numberTables = 1;
  tables.forEach((table) => {
    let currentAbbrev = "";
    const rows = Array.from(table.querySelectorAll("tr"));

    // Ajoute la colonne "Calculator" à la première ligne
    const firstRow = rows[0];
    if (firstRow) {
      const th = document.createElement("td");
      th.style.textAlign = "center";
      th.style.whiteSpace = "normal";
      th.style.width = "120px";
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

      // Gestion des lignes avec colspan (ex: titres d'ère)
      const hasColspan = cells.some((cell) => cell.hasAttribute("colspan"));
      if (hasColspan) {
        const titleText = row.textContent?.trim() || "";
        const matchedEra = eras.find((era) =>
          titleText.toLowerCase().includes(era.name.toLowerCase())
        );
        currentAbbrev = matchedEra ? matchedEra.abbr : "";

        cells.forEach((cell) => {
          if (cell.hasAttribute("colspan")) {
            const colspan = parseInt(cell.getAttribute("colspan") || "1", 10);
            cell.setAttribute("colspan", (colspan + 1).toString());
          }
        });
        return;
      }

      let maxQty = 1;

      if (mainSection === "home_cultures" && !Array.isArray(maxQtyList)) {
        const level = parseInt(
          cells[levelIndex]?.textContent?.trim() || "0",
          10
        );
        maxQty = getClosestLowerOrEqualMaxQty(level, maxQtyList);
      }

      if (mainSection === "allied_cultures" && Array.isArray(maxQtyList)) {
        let entry;

        if (numberTables === 1) {
          // Utilise .at(-1) pour obtenir le dernier élément du tableau
          entry = maxQtyList.at(-1);
        } else {
          entry =
            maxQtyList.find((item) => item.abbrev === currentAbbrev) ||
            maxQtyList.find((item) => item.abbrev === "__no_abbrev__");
        }

        if (entry) {
          maxQty = entry.maxQty;
          // console.log("Max quantity selected:", entry);
        }
      }

      if (subSection === "workshops") {
        if (isPrimary) {
          let entry =
            limitPrimaryWorkshop.find(
              (item: any) => item.abbrev === currentAbbrev
            ) ||
            limitPrimaryWorkshop.find(
              (item: any) => item.abbrev === "__no_abbrev__"
            );

          if (entry) maxQty = entry.maxQty;
        } else {
          maxQty = 1;
        }
      }

      // Ajoute la colonne de contrôle (calculatrice)
      const controlCell = document.createElement("td");
      controlCell.style.textAlign = "center";

      const minusBtn = document.createElement("button");
      minusBtn.textContent = "−";
      minusBtn.style.marginRight = "8px";
      minusBtn.style.color = "white";
      minusBtn.style.fontSize = "16px";
      minusBtn.style.fontWeight = "600";

      const countSpan = document.createElement("span");
      countSpan.textContent = "1";
      countSpan.style.fontSize = "14px";

      const plusBtn = document.createElement("button");
      plusBtn.textContent = "+";
      plusBtn.style.marginLeft = "8px";
      plusBtn.style.color = "white";
      plusBtn.style.fontSize = "16px";
      plusBtn.style.fontWeight = "600";

      controlCell.appendChild(minusBtn);
      controlCell.appendChild(countSpan);
      controlCell.appendChild(plusBtn);
      row.appendChild(controlCell);

      let count = 1;

      // Stocke le texte original de chaque TextNode une seule fois
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
    const isFormatColumn = formatColumns.includes(columnName.toLowerCase());
    const isGoods = columnName === "goods";
    const isWorkers = columnName === "workers";

    cell.childNodes.forEach((node) => {
      if (node.nodeType === Node.TEXT_NODE) {
        const textNode = node as Text;
        const originalText =
          (textNode as any).dataOriginal ?? textNode.textContent ?? "";

        const newText = originalText.replace(
          /(\d+(?:[.,]\d+)?)(?:\s?([KM]))?/gi,
          (
            match: string,
            numberStr: string,
            suffix: string | undefined,
            offset: number,
            str: string
          ): string => {
            const parsed = parseNumber(numberStr + (suffix ? suffix : ""));
            if (isNaN(parsed)) return match;

            let formattedNumber = "";

            if (isFormatColumn) {
              formattedNumber = formatNumber(parsed * multiplier);
            } else if (isGoods) {
              formattedNumber = (parsed * multiplier).toLocaleString("en-US");
            } else if (isWorkers) {
              formattedNumber = (parsed * multiplier).toLocaleString("en-US");
            } else {
              formattedNumber = (parsed * multiplier).toString();
            }

            return formattedNumber;
          }
        );

        textNode.textContent = newText;
      }
    });
  }
}

export function useUpgrade(
  tables: HTMLTableElement[],
  primaryWorkshops: string[]
) {
  const [mainSection] = getTitlePage();
  const targetIds = ["Construction", "Upgrade"];

  if (mainSection !== "home_cultures" && mainSection !== "allied_cultures") return;

  const tablesWithMatchingSection = tables.filter((table) => {
    const span = findPreviousH2SpanWithId(table);
    return span && targetIds.includes(span.id);
  });

  // const tablesWithMatchingSection = tables.filter((table) => {
  //   const span = findPreviousH2SpanWithId(table);
  //   if (!span) return false;

  //   // Vérifie si span.id commence par un des targetIds, avec suffixe optionnel
  //   return targetIds.some((targetId) => {
  //     const regex = new RegExp(`^${targetId}(_\\d+)?$`);
  //     return regex.test(span.id);
  //   });
  // });

  const timeTables = findTimeTables(tablesWithMatchingSection);
  if (timeTables.length === 0) return;

  addMultiplicatorColumn(timeTables, primaryWorkshops);
}
