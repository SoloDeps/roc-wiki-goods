import { eras } from "./constants";
import { formatNumber, getTitlePage, parseNumber } from "./utils";

function findTechnoTable(tables: HTMLTableElement[]) {
  // Récupère les infos dans le title de la page
  const [mainSection] = getTitlePage();
  if (mainSection !== "home_cultures") return;

  for (let i = 0; i < tables.length; i++) {
    const firstCell = tables[i].querySelector("tr > td");
    if (
      firstCell &&
      firstCell.textContent &&
      firstCell.textContent.trim() === "Technology"
    ) {
      return tables[i];
    }
  }
}

function createCheckboxCell(): HTMLTableCellElement {
  const td = document.createElement("td");
  td.style.textAlign = "center";
  td.style.whiteSpace = "normal";
  const checkbox = document.createElement("input");
  checkbox.type = "checkbox";
  checkbox.classList.add("checkbox-selection");
  checkbox.style.transform = "scale(1.25)";
  td.appendChild(checkbox);
  return td;
}

function addCheckboxColumn(table: HTMLTableElement) {
  const firstRow = table.querySelector("tr:first-child");
  if (firstRow) {
    const td = document.createElement("td");
    td.style.textAlign = "center";
    td.style.whiteSpace = "normal";
    td.textContent = "Calculator";
    firstRow.insertBefore(td, firstRow.firstChild);
  }

  const rows = table.querySelectorAll<HTMLTableRowElement>(
    "tr:not(:first-child)"
  );
  rows.forEach((row) => {
    const td = createCheckboxCell();
    row.insertBefore(td, row.firstChild);
  });
}

function createTotalCheckboxCell(): HTMLTableCellElement {
  const td = document.createElement("td");
  td.style.textAlign = "center";
  td.style.whiteSpace = "normal";
  const checkbox = document.createElement("input");
  checkbox.type = "checkbox";
  checkbox.id = "checkboxSelectAll";
  checkbox.name = "checkboxSelectAll";
  checkbox.style.transform = "scale(1.25)";
  const label = document.createElement("label");
  label.setAttribute("for", "checkboxSelectAll");
  label.textContent = "All";
  td.appendChild(checkbox);
  td.appendChild(document.createElement("br"));
  td.appendChild(label);
  return td;
}

function createTotalLabelCell(): HTMLTableCellElement {
  const td = document.createElement("td");
  td.style.textAlign = "center";
  td.style.fontWeight = "500";
  const span = document.createElement("span");
  span.id = "counterSelection";
  span.textContent = "0";
  span.style.fontSize = "15px";
  span.style.display = "block";
  span.style.marginBottom = "-4px";
  td.appendChild(span);
  const span2 = document.createElement("span");
  span2.textContent = "selected";
  span2.style.fontSize = "15px";
  td.appendChild(span2);
  return td;
}

function createResourceDiv(
  alt: string,
  src: string,
  id: string
): HTMLDivElement {
  const div = document.createElement("div");
  const img = document.createElement("img");
  img.alt = alt;
  img.src = src;
  img.width = 25;
  img.height = 25;
  const span = document.createElement("span");
  span.id = id;
  span.textContent = " 0";
  div.appendChild(img);
  div.appendChild(span);
  return div;
}

function createResourcesContainer(): HTMLDivElement {
  const container = document.createElement("div");
  container.appendChild(
    createResourceDiv(
      "PR",
      "/images/thumb/2/20/Research.png/25px-Research.png",
      "researchTotal"
    )
  );
  container.appendChild(
    createResourceDiv(
      "Gold",
      "/images/thumb/6/6d/Coin.png/25px-Coin.png",
      "goldTotal"
    )
  );
  container.appendChild(
    createResourceDiv(
      "Food",
      "/images/thumb/c/c6/Food.png/25px-Food.png",
      "foodTotal"
    )
  );
  return container;
}

function createDefaultGoodsContainer(): HTMLDivElement {
  const defaultGoodsContainer = document.createElement("div");
  defaultGoodsContainer.id = "defaultGoodsContainer";
  defaultGoodsContainer.style.display = "block";
  defaultGoodsContainer.style.width = "max-content";
  defaultGoodsContainer.style.justifyContent = "start";

  for (let i = 0; i < 3; i++) {
    const divItem = document.createElement("div");
    const img = document.createElement("img");
    img.src = "/images/thumb/3/36/Goods.png/25px-Goods.png";
    img.width = 25;
    img.height = 25;
    divItem.appendChild(img);
    divItem.appendChild(document.createTextNode(" 0"));
    defaultGoodsContainer.appendChild(divItem);
  }
  return defaultGoodsContainer;
}

function createDynamicGoodsContainer(): HTMLDivElement {
  const dynamicGoodsContainer = document.createElement("div");
  dynamicGoodsContainer.id = "dynamicGoodsContainer";
  dynamicGoodsContainer.style.display = "none";
  dynamicGoodsContainer.style.width = "max-content";
  dynamicGoodsContainer.style.justifyContent = "start";
  return dynamicGoodsContainer;
}

function addTotalRow(table: HTMLTableElement) {
  const newRow = document.createElement("tr");
  newRow.id = "totalRow";
  newRow.style.background = "rgba(36, 89, 113, 1)";
  newRow.style.height = "100px";

  newRow.appendChild(createTotalCheckboxCell());
  newRow.appendChild(createTotalLabelCell());

  const td3 = document.createElement("td");
  td3.id = "totalRessources";
  td3.style.verticalAlign = "baseline";
  td3.style.paddingTop = "12px";
  td3.appendChild(createResourcesContainer());
  newRow.appendChild(td3);

  const td4 = document.createElement("td");
  td4.id = "totalGoods";
  td4.style.verticalAlign = "baseline";
  td4.style.paddingTop = "12px";
  td4.colSpan = 2;
  td4.appendChild(createDefaultGoodsContainer());
  td4.appendChild(createDynamicGoodsContainer());
  newRow.appendChild(td4);

  table.querySelector("tbody")?.appendChild(newRow);
}

function extractResources(row: HTMLTableRowElement) {
  const cell = row?.cells[2];
  if (!cell) return { research: 0, gold: 0, food: 0 };
  const values: string[] = [];
  cell.childNodes.forEach((node) => {
    if (node.nodeType === Node.TEXT_NODE) {
      const text = node.textContent?.trim();
      if (text) values.push(text);
    }
  });
  return {
    research: parseNumber(values[0]),
    gold: parseNumber(values[1]),
    food: parseNumber(values[2]),
  };
}

function extractGoods(row: HTMLTableRowElement) {
  const cell = row?.cells[3];
  if (!cell) return {};
  let goods: Record<string, { value: number; src: string }> = {};
  cell.querySelectorAll("img").forEach((img: HTMLImageElement) => {
    const key = img.alt.trim();
    const rawValue = img.nextSibling?.textContent?.trim().replace(/,/g, "");
    const value: number = rawValue ? parseInt(rawValue, 10) || 0 : 0;
    const src = img.src;
    if (goods[key]) {
      goods[key].value += value;
    } else {
      goods[key] = { value, src };
    }
  });
  return goods;
}

function preloadGoodImages(table: HTMLTableElement) {
  const goodsContainer = document.getElementById("dynamicGoodsContainer");
  if (!goodsContainer) return;

  goodsContainer.replaceChildren();
  goodsContainer.style.display = "grid";

  const goodImages = new Map<string, string>();
  const rows = table.querySelectorAll<HTMLTableRowElement>(
    "tr:not(:first-child)"
  );
  rows.forEach((row) => {
    const cell = row?.cells[3];
    if (cell) {
      cell.querySelectorAll("img").forEach((img: HTMLImageElement) => {
        const key = img.alt.trim();
        if (!goodImages.has(key)) {
          goodImages.set(key, img.src);
        }
      });
    }
  });

  const regexGood = /^(Primary|Secondary|Tertiary)_(\w{2})$/;
  const goodsByEra: Record<string, Record<string, HTMLDivElement>> = {};
  const otherGoods: HTMLDivElement[] = [];
  const goodDivs = new Map<string, HTMLDivElement>();

  goodImages.forEach((src, key) => {
    const divItem = document.createElement("div");
    divItem.className = "good-item";
    divItem.id = `good-${key}`;
    divItem.style.display = "none";
    const img = document.createElement("img");
    img.src = src;
    img.width = 25;
    img.height = 25;
    img.alt = key;
    const valueSpan = document.createElement("span");
    valueSpan.id = `goodValue-${key}`;
    valueSpan.textContent = " 0";
    divItem.appendChild(img);
    divItem.appendChild(valueSpan);
    goodDivs.set(key, divItem);
  });

  const erasPresent = new Set<string>();

  goodDivs.forEach((divItem, key) => {
    const match = key.match(regexGood);
    if (match) {
      const category = match[1];
      const abbr = match[2];
      erasPresent.add(abbr);
      if (!goodsByEra[abbr]) {
        goodsByEra[abbr] = {};
      }
      goodsByEra[abbr][category] = divItem;
    } else {
      otherGoods.push(divItem);
    }
  });

  const eraOrder = eras.map((e) => e.abbr);
  const sortedEras = Array.from(erasPresent)
    .filter((abbr): abbr is (typeof eras)[number]["abbr"] =>
      eras.some((e) => e.abbr === abbr)
    )
    .sort((a, b) => eraOrder.indexOf(a) - eraOrder.indexOf(b));

  let maxRows = 3;
  if (otherGoods.length > maxRows) maxRows = otherGoods.length;

  const nbColumns = sortedEras.length + (otherGoods.length > 0 ? 1 : 0);
  goodsContainer.style.display = "none";
  goodsContainer.style.gridAutoFlow = "column";
  goodsContainer.style.gridTemplateRows = `repeat(${maxRows}, auto)`;
  goodsContainer.style.gridTemplateColumns = `repeat(${nbColumns}, auto)`;
  goodsContainer.style.justifyContent = "start";

  function createColumnDiv(abbr: string, isOther = false): HTMLDivElement {
    const colDiv = document.createElement("div");
    colDiv.className = isOther ? "colonne_autres" : `colonne_${abbr}`;
    colDiv.style.display = "block";
    colDiv.style.marginRight = "15px";
    colDiv.style.gridTemplateRows = `repeat(auto-fill, auto)`;
    return colDiv;
  }

  sortedEras.forEach((abbr) => {
    const colDiv = createColumnDiv(abbr);
    ["Primary", "Secondary", "Tertiary"].forEach((cat) => {
      const goodDiv = goodsByEra[abbr][cat];
      if (goodDiv) {
        goodDiv.style.display = "";
        colDiv.appendChild(goodDiv);
      }
    });
    goodsContainer.appendChild(colDiv);
  });

  if (otherGoods.length > 0) {
    const colDiv = createColumnDiv("autres", true);
    otherGoods.forEach((divItem) => {
      divItem.style.display = "";
      colDiv.appendChild(divItem);
    });
    goodsContainer.appendChild(colDiv);
  }
}

function updateTotalRessources(totalRessources: {
  research: number;
  gold: number;
  food: number;
}) {
  const researchTotal = document.getElementById("researchTotal");
  const goldTotal = document.getElementById("goldTotal");
  const foodTotal = document.getElementById("foodTotal");
  if (researchTotal) researchTotal.textContent = ` ${totalRessources.research}`;
  if (goldTotal)
    goldTotal.textContent = ` ${formatNumber(totalRessources.gold)}`;
  if (foodTotal)
    foodTotal.textContent = ` ${formatNumber(totalRessources.food)}`;
}

function updateTotalGoods(totalGoods: Record<string, { value: number }>) {
  const defaultContainer = document.getElementById("defaultGoodsContainer");
  const dynamicContainer = document.getElementById("dynamicGoodsContainer");
  if (!defaultContainer || !dynamicContainer) return;

  if (Object.keys(totalGoods).length === 0) {
    defaultContainer.style.display = "block";
    dynamicContainer.style.display = "none";
    return;
  }

  defaultContainer.style.display = "none";
  dynamicContainer.style.display = "flex";

  const allGoodItems =
    dynamicContainer.querySelectorAll<HTMLElement>(".good-item");
  allGoodItems.forEach((item) => {
    item.style.display = "none";
    const valueSpan = item.querySelector("span");
    if (valueSpan) valueSpan.textContent = " 0";
  });

  Object.entries(totalGoods).forEach(([key, { value }]) => {
    const goodDiv = document.getElementById(`good-${key}`);
    if (goodDiv) {
      goodDiv.style.display = "";
      const valueSpan = goodDiv.querySelector("span");
      if (valueSpan) {
        valueSpan.textContent = ` ${value.toLocaleString("en-US")}`;
      }
    }
  });

  dynamicContainer
    .querySelectorAll<HTMLDivElement>("div[class^='colonne_']")
    .forEach((colDiv) => {
      const visibleGoods = Array.from(
        colDiv.querySelectorAll<HTMLElement>(".good-item")
      ).some((item) => item.style.display !== "none");
      colDiv.style.display = visibleGoods ? "block" : "none";
    });
}

function updateTotalSelected(totalSelected: number) {
  const counterSelection = document.getElementById("counterSelection");
  if (counterSelection) counterSelection.textContent = totalSelected.toString();
}

export function useTechno(tables: HTMLTableElement[]) {
  const technoTable = findTechnoTable(tables) as HTMLTableElement;
  if (!technoTable) return;

  addCheckboxColumn(technoTable);
  addTotalRow(technoTable);
  preloadGoodImages(technoTable);

  const rowData = new Map<
    HTMLTableRowElement,
    { resourceData: any; goodsData: any }
  >();
  const rows = technoTable.querySelectorAll<HTMLTableRowElement>(
    "tr:not(:first-child)"
  );
  rows.forEach((row) => {
    const tr = row as HTMLTableRowElement;
    const resourceData = extractResources(tr);
    const goodsData = extractGoods(tr);
    rowData.set(tr, { resourceData, goodsData });
  });

  const checkboxes = technoTable.querySelectorAll<HTMLInputElement>(
    ".checkbox-selection"
  );
  const selectAllCheckbox = document.getElementById(
    "checkboxSelectAll"
  ) as HTMLInputElement | null;

  function updateTotal() {
    let totalGoods: Record<string, { value: number; src: string }> = {};
    let totalResources = { research: 0, gold: 0, food: 0 };
    let totalSelected = 0;

    checkboxes.forEach((checkbox) => {
      if (checkbox.checked) {
        const row = checkbox.closest("tr") as HTMLTableRowElement;
        if (row && rowData.has(row)) {
          const { resourceData, goodsData } = rowData.get(row)!;
          totalResources.research += resourceData.research;
          totalResources.gold += resourceData.gold;
          totalResources.food += resourceData.food;
          Object.keys(goodsData).forEach((key) => {
            if (totalGoods[key]) {
              totalGoods[key].value += goodsData[key].value;
            } else {
              totalGoods[key] = { ...goodsData[key] };
            }
          });
          totalSelected++;
        }
      }
    });
    updateTotalSelected(totalSelected);
    updateTotalRessources(totalResources);
    updateTotalGoods(totalGoods);
  }

  if (selectAllCheckbox) {
    selectAllCheckbox.addEventListener("change", () => {
      checkboxes.forEach((cb) => (cb.checked = selectAllCheckbox.checked));
      updateTotal();
    });
  }

  technoTable.addEventListener("change", (event) => {
    const target = event.target as HTMLInputElement;
    if (target.classList.contains("checkbox-selection")) {
      updateTotal();
      if (selectAllCheckbox) {
        const allChecked = Array.from(checkboxes).every((cb) => cb.checked);
        selectAllCheckbox.checked = allChecked;
      }
    }
  });

  updateTotal();
}
