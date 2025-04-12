import { formatNumber, parseNumber } from "./utils";

type Fragment =
  | { type: "text"; text: string }
  | { type: "br" }
  | { type: "img"; attrs: Record<string, string> };

function getTextAfterFirstSlash(): string | null {
  const heading = document.getElementById("firstHeading");
  if (!heading) return null;

  const span = heading.querySelector("span");
  if (!span || !span.textContent) return null;

  const parts = span.textContent.split("/");
  return parts.length > 1 ? parts.slice(1).join("/") : null;
}

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

function addMultiplicatorColumn(tables: HTMLTableElement[]): void {
  tables.forEach((table) => {
    const rows = table.querySelectorAll("tr");

    // 🧠 Ajouter la légende "Calculator"
    const firstRow = rows[0];
    if (firstRow) {
      const th = document.createElement("td");
      th.style.textAlign = "center";
      th.style.whiteSpace = "normal";
      th.style.width = "120px";
      th.textContent = "Calculator";
      firstRow.appendChild(th);
    }

    // 🧠 Parcourir chaque ligne (hors header)
    rows.forEach((row, index) => {
      if (index === 0) return; // skip header

      const cells = Array.from(row.children).filter(
        (cell) => cell.tagName.toLowerCase() === "td"
      ) as HTMLTableCellElement[];

      const hasColspan = cells.some((cell) => cell.hasAttribute("colspan"));
      if (hasColspan) {
        cells.forEach((cell) => {
          if (cell.hasAttribute("colspan")) {
            const colspan = parseInt(cell.getAttribute("colspan") || "1", 10);
            cell.setAttribute("colspan", (colspan + 1).toString());
          }
        });
        return;
      }

      // Créer cellule pour les boutons
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
      // countSpan.style.fontWeight = "600";

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

      // Sauvegarde originale uniquement une fois
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
        count++;
        updateRow();
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

    const isCoin = [
      "coin",
      "coins",
      "pennies",
      "cocoa",
      "wu zhu",
      "deben",
    ].includes(columnName.toLowerCase());
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
  // check the title of the page
  const pageTitle = getTextAfterFirstSlash();
  console.log(pageTitle);

  const timeTable = findTimeTables(tables);
  addMultiplicatorColumn(timeTable);
  // console.log(timeTable);
  if (!timeTable) return;
}
