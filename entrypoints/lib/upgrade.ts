import { coinNames, eras } from "./constants";
import {
  formatNumber,
  getClosestLowerOrEqualMaxQty,
  getTitlePage,
  parseNumber,
} from "./utils";

type Fragment =
  | { type: "text"; text: string }
  | { type: "br" }
  | { type: "img"; attrs: Record<string, string> };

function findTimeTables(tables: HTMLTableElement[]): HTMLTableElement[] {
  const matchingTables: HTMLTableElement[] = [];

  for (let i = 0; i < tables.length; i++) {
    const firstRow = tables[i].querySelector("tr"); // Récupère la première ligne
    const lastCell = firstRow
      ? firstRow.querySelectorAll("td")[
          firstRow.querySelectorAll("td").length - 1
        ]
      : null;

    if (
      lastCell &&
      lastCell.textContent &&
      lastCell.textContent.trim() === "Time"
    ) {
      matchingTables.push(tables[i]);
    }
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
  maxQtyList: any,
  pageTitle: string | null
): void {
  tables.forEach((table) => {
    const rows = Array.from(table.querySelectorAll("tr"));

    const firstRow = rows[0];
    if (firstRow) {
      const th = document.createElement("td");
      th.style.textAlign = "center";
      th.style.whiteSpace = "normal";
      th.style.width = "120px";
      th.textContent = "Calculator";
      firstRow.appendChild(th);
    }

    let currentAbbrev = "";

    rows.forEach((row, index) => {
      if (index === 0) return;

      const cells = Array.from(row.children).filter(
        (cell) => cell.tagName.toLowerCase() === "td"
      ) as HTMLTableCellElement[];

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

      if (pageTitle === "home_cultures") {
        const level = parseInt(cells[0]?.textContent?.trim() || "0", 10);
        maxQty = getClosestLowerOrEqualMaxQty(level, maxQtyList);
      } else if (pageTitle === "allied_cultures") {
        let entry = maxQtyList.find((item: any) => item.abbrev === currentAbbrev);

        if (!entry) {
          entry = maxQtyList.find((item: any) => item.abbrev === "__no_abbrev__");
        }

        if (entry) {
          maxQty = entry.maxQty;
        }
      }

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

      if (!row.hasAttribute("data-original-stored")) {
        row.setAttribute("data-original-stored", "true");
        cells.forEach((cell) => {
          cell.setAttribute("data-original", serializeCell(cell));
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
    if (columnName === "time" || columnName === "max qty") continue;

    const cell = cells[i];
    const original = cell.getAttribute("data-original");
    if (!original) continue;

    const isCoin = coinNames.includes(columnName.toLowerCase());
    const isFood = columnName === "food";
    const isGoods = columnName === "goods";
    const isWorkers = columnName === "workers";

    const fragments = deserializeCell(original);
    const newContent: Node[] = [];

    fragments.forEach((frag) => {
      if (frag.type === "text") {
        const parsed = parseNumber(frag.text);
        let newText = frag.text;

        if (isCoin || isFood) {
          newText = " " + formatNumber(parsed * multiplier);
        }
        if (isGoods) {
          newText = " " + (parsed * multiplier).toLocaleString("en-US");
        }

        if (isWorkers) {
          newText = (parsed * multiplier).toLocaleString("en-US");
        }

        newContent.push(document.createTextNode(newText));
      } else if (frag.type === "br") {
        newContent.push(document.createElement("br"));
      } else if (frag.type === "img") {
        const img = document.createElement("img");
        Object.entries(frag.attrs).forEach(([key, value]) => {
          img.setAttribute(key, value);
        });
        newContent.push(img);
      }
    });

    cell.replaceChildren(...newContent);
  }
}

function serializeCell(cell: HTMLTableCellElement): string {
  const result: Fragment[] = [];

  cell.childNodes.forEach((node) => {
    if (node.nodeType === Node.TEXT_NODE) {
      const text = node.textContent?.trim();
      if (text) result.push({ type: "text", text });
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      const el = node as HTMLElement;
      if (el.tagName === "BR") {
        result.push({ type: "br" });
      } else if (el.tagName === "IMG") {
        const attrs: Record<string, string> = {};
        Array.from(el.attributes).forEach((attr) => {
          attrs[attr.name] = attr.value;
        });
        result.push({ type: "img", attrs });
      }
    }
  });

  return JSON.stringify(result);
}

function deserializeCell(serialized: string): Fragment[] {
  try {
    return JSON.parse(serialized);
  } catch {
    return [];
  }
}

export function useUpgrade(tables: HTMLTableElement[]) {
  const timeTables = findTimeTables(tables);
  if (timeTables.length === 0) return;

  const pageTitle = getTitlePage();
  const maxQtyList = getMaxQty(timeTables, pageTitle);
  console.log(maxQtyList);
  

  addMultiplicatorColumn(timeTables, maxQtyList, pageTitle);
}
