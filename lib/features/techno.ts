import { getEraId, eras } from "@/lib/constants";
import { parseNumber, formatNumber, getTitlePage, slugify } from "@/lib/utils";
import {
  getTechnos,
  flattenAndSortTechnos,
  saveEraTechnos,
  clearEraTechnos,
} from "@/lib/overview/storage";
import { type TechnoEntity } from "@/lib/storage/dexie";

const RESOURCE_ICONS = {
  research: "/images/thumb/2/20/Research.png/25px-Research.png",
  coins: "/images/thumb/6/6d/Coin.png/25px-Coin.png",
  food: "/images/thumb/c/c6/Food.png/25px-Food.png",
  goods: "/images/thumb/3/36/Goods.png/25px-Goods.png",
} as const;

function findTechnoTable(tables: HTMLTableElement[]) {
  const [mainSection] = getTitlePage();
  if (mainSection !== "home_cultures") return;

  return tables.find((table) => {
    const firstCell = table.querySelector("tr > td");
    return firstCell?.textContent?.trim() === "Technology";
  });
}

function createCheckboxCell(
  row: HTMLTableRowElement,
  index: number,
): HTMLTableCellElement {
  const td = document.createElement("td");
  td.style.textAlign = "center";
  td.style.whiteSpace = "normal";

  const checkbox = document.createElement("input");
  checkbox.type = "checkbox";
  checkbox.classList.add("checkbox-selection");
  checkbox.style.transform = "scale(1.25)";

  const [_, subSection] = getTitlePage();
  const normalizedEra = getEraId(subSection);
  checkbox.id = `techno_${normalizedEra}_${index}`;

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
    "tr:not(:first-child)",
  );
  rows.forEach((row, index) => {
    const td = createCheckboxCell(row, index);
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

  const span2 = document.createElement("span");
  span2.textContent = "selected";
  span2.style.fontSize = "15px";

  td.appendChild(span);
  td.appendChild(span2);

  // Save checkbox
  const saveContainer = document.createElement("div");
  saveContainer.style.marginTop = "8px";

  const [_, subSection] = getTitlePage();
  const normalizedEra = getEraId(subSection);
  const checkboxName = `checkboxSave_${normalizedEra}`;

  const checkbox = document.createElement("input");
  checkbox.type = "checkbox";
  checkbox.id = checkboxName;
  checkbox.name = checkboxName;
  checkbox.style.transform = "scale(1.25)";
  checkbox.style.marginRight = "4px";

  const label = document.createElement("label");
  label.setAttribute("for", checkboxName);
  label.textContent = "Save";
  label.style.fontSize = "14px";
  label.style.cursor = "pointer";
  label.style.verticalAlign = "middle";

  saveContainer.appendChild(checkbox);
  saveContainer.appendChild(label);
  td.appendChild(saveContainer);

  return td;
}

function createResourceDiv(
  alt: string,
  src: string,
  id: string,
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
  container.style.textAlign = "left";
  container.appendChild(
    createResourceDiv("PR", RESOURCE_ICONS.research, "researchTotal"),
  );
  container.appendChild(
    createResourceDiv("Gold", RESOURCE_ICONS.coins, "goldTotal"),
  );
  container.appendChild(
    createResourceDiv("Food", RESOURCE_ICONS.food, "foodTotal"),
  );
  return container;
}

function createDefaultGoodsContainer(): HTMLDivElement {
  const container = document.createElement("div");
  container.id = "defaultGoodsContainer";
  container.style.display = "block";
  container.style.width = "max-content";
  container.style.textAlign = "left";

  for (let i = 0; i < 3; i++) {
    const divItem = document.createElement("div");
    const img = document.createElement("img");
    img.src = RESOURCE_ICONS.goods;
    img.width = 25;
    img.height = 25;
    divItem.appendChild(img);
    divItem.appendChild(document.createTextNode(" 0"));
    container.appendChild(divItem);
  }

  return container;
}

function createDynamicGoodsContainer(): HTMLDivElement {
  const container = document.createElement("div");
  container.id = "dynamicGoodsContainer";
  container.style.display = "none";
  container.style.width = "max-content";
  container.style.textAlign = "left";
  return container;
}

function addTotalRow(table: HTMLTableElement) {
  const row = document.createElement("tr");
  row.id = "totalRow";
  row.style.background = "rgba(36, 89, 113, 1)";
  row.style.height = "100px";

  row.appendChild(createTotalCheckboxCell());
  row.appendChild(createTotalLabelCell());

  const td3 = document.createElement("td");
  td3.id = "totalRessources";
  td3.style.verticalAlign = "baseline";
  td3.style.paddingTop = "12px";
  td3.appendChild(createResourcesContainer());
  row.appendChild(td3);

  const td4 = document.createElement("td");
  td4.id = "totalGoods";
  td4.style.verticalAlign = "baseline";
  td4.style.paddingTop = "12px";
  td4.colSpan = 2;
  td4.appendChild(createDefaultGoodsContainer());
  td4.appendChild(createDynamicGoodsContainer());
  row.appendChild(td4);

  table.querySelector("tbody")?.appendChild(row);
}

function extractTechnoCosts(row: HTMLTableRowElement): TechnoEntity["costs"] {
  const costs: TechnoEntity["costs"] = {};

  // resources (research, coins, food)
  const resourceCell = row.cells[2];
  if (resourceCell) {
    const images = resourceCell.querySelectorAll("img");
    const lines = resourceCell.innerHTML
      .split("<br>")
      .map((line) => line.trim());

    lines.forEach((line, index) => {
      const cleanLine = line.replace(/<[^>]*>/g, "").trim();
      const img = images[index];
      if (!img) return;

      const src = img.src?.toLowerCase() || "";
      const value = parseNumber(cleanLine);
      if (value <= 0) return;

      if (src.includes("research")) costs.research_points = value;
      else if (src.includes("coin")) costs.coins = value;
      else if (src.includes("food")) costs.food = value;
    });
  }

  // Goods
  const goodsCell = row.cells[3];
  if (goodsCell) {
    const goodsImages = goodsCell.querySelectorAll("img");
    const hasGoods = Array.from(goodsImages).some((img) => {
      const alt = img.alt?.toLowerCase() || "";
      return (
        !["research", "coin", "food"].some((r) => alt.includes(r)) && alt !== ""
      );
    });

    if (hasGoods) costs.goods = extractGoodsDetails(goodsCell);
  }

  return costs;
}

function extractGoodsDetails(
  cell: HTMLTableCellElement,
): Array<{ type: string; amount: number }> {
  const details: Array<{ type: string; amount: number }> = [];
  const images = cell.querySelectorAll("img");
  const lines = cell.innerHTML.split("<br>").map((line) => line.trim());

  lines.forEach((line, index) => {
    const cleanLine = line.replace(/<[^>]*>/g, "").trim();

    // Primary/Secondary/Tertiary format
    const priorityMatch = cleanLine.match(
      /(Primary|Secondary|Tertiary):\s*([A-Z]{2})\s*([\d,]+)/i,
    );
    if (priorityMatch) {
      details.push({
        type: `${priorityMatch[1]}_${priorityMatch[2]}`,
        amount: parseNumber(priorityMatch[3]),
      });
      return;
    }

    // regular goods with image
    const img = images[index];
    if (img?.alt) {
      const text = img.alt
        .toLowerCase()
        .replace(/\.(png|jpg|jpeg|gif|webp)$/i, "")
        .trim();
      const goodName = slugify(text);
      const value = parseNumber(cleanLine);
      if (value > 0 && goodName) {
        details.push({ type: goodName, amount: value });
      }
    }
  });

  return details;
}

function extractTechnoInfo(
  row: HTMLTableRowElement,
  index: number,
): TechnoEntity | null {
  if (row.cells.length < 4) return null;

  const [_, subSection] = getTitlePage();
  const normalizedEra = getEraId(subSection);

  return {
    id: `techno_${normalizedEra}_${index}`,
    costs: extractTechnoCosts(row),
    updatedAt: Date.now(),
    hidden: false,
  };
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

  const goodsImages = cell.querySelectorAll("img");
  if (!goodsImages.length) return {};

  const goods: Record<string, { value: number; src: string }> = {};

  goodsImages.forEach((img: HTMLImageElement) => {
    const key = img.alt.trim();
    const rawValue = img.nextSibling?.textContent?.trim().replace(/,/g, "");
    const value = rawValue ? parseInt(rawValue, 10) || 0 : 0;

    if (goods[key]) {
      goods[key].value += value;
    } else {
      goods[key] = { value, src: img.src };
    }
  });

  return goods;
}

function preloadGoodImages(table: HTMLTableElement) {
  const container = document.getElementById("dynamicGoodsContainer");
  if (!container) return;

  container.replaceChildren();
  container.style.display = "grid";

  const goodImages = new Map<string, string>();
  const rows = table.querySelectorAll<HTMLTableRowElement>(
    "tr:not(:first-child)",
  );

  rows.forEach((row) => {
    const cell = row?.cells[3];
    if (cell) {
      cell.querySelectorAll("img").forEach((img: HTMLImageElement) => {
        const key = img.alt.trim();
        if (!goodImages.has(key)) goodImages.set(key, img.src);
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
      if (!goodsByEra[abbr]) goodsByEra[abbr] = {};
      goodsByEra[abbr][category] = divItem;
    } else {
      otherGoods.push(divItem);
    }
  });

  const eraOrder = eras.map((e) => e.abbr);
  const sortedEras = Array.from(erasPresent)
    .filter((abbr): abbr is (typeof eras)[number]["abbr"] =>
      eras.some((e) => e.abbr === abbr),
    )
    .sort((a, b) => eraOrder.indexOf(a) - eraOrder.indexOf(b));

  const maxRows = Math.max(3, otherGoods.length);
  const nbColumns = sortedEras.length + (otherGoods.length > 0 ? 1 : 0);

  container.style.gridAutoFlow = "column";
  container.style.gridTemplateRows = `repeat(${maxRows}, auto)`;
  container.style.gridTemplateColumns = `repeat(${nbColumns}, auto)`;
  container.style.justifyContent = "start";

  function createColumnDiv(abbr: string, isOther = false): HTMLDivElement {
    const colDiv = document.createElement("div");
    colDiv.className = isOther ? "colonne_autres" : `colonne_${abbr}`;
    colDiv.style.display = "block";
    colDiv.style.marginRight = "15px";
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
    container.appendChild(colDiv);
  });

  if (otherGoods.length > 0) {
    const colDiv = createColumnDiv("autres", true);
    otherGoods.forEach((divItem) => {
      divItem.style.display = "";
      colDiv.appendChild(divItem);
    });
    container.appendChild(colDiv);
  }
}

function updateTotalRessources(totals: {
  research: number;
  gold: number;
  food: number;
}) {
  const researchTotal = document.getElementById("researchTotal");
  const goldTotal = document.getElementById("goldTotal");
  const foodTotal = document.getElementById("foodTotal");

  if (researchTotal) researchTotal.textContent = ` ${totals.research}`;
  if (goldTotal) goldTotal.textContent = ` ${formatNumber(totals.gold)}`;
  if (foodTotal) foodTotal.textContent = ` ${formatNumber(totals.food)}`;
}

export function updateTotalGoods(
  totalGoods: Record<string, { value: number }>,
) {
  const defaultContainer = document.getElementById("defaultGoodsContainer");
  const dynamicContainer = document.getElementById("dynamicGoodsContainer");
  if (!defaultContainer || !dynamicContainer) return;

  const hasGoods = Object.keys(totalGoods).length > 0;

  if (!hasGoods) {
    // show default images with 0
    defaultContainer.style.display = "block";
    dynamicContainer.style.display = "none";
    return;
  }

  // hide default container and show dynamic container
  defaultContainer.style.display = "none";
  dynamicContainer.style.display = "flex";

  // reset all good items
  const allGoodItems =
    dynamicContainer.querySelectorAll<HTMLElement>(".good-item");
  allGoodItems.forEach((item) => {
    item.style.display = "none";
    const valueSpan = item.querySelector("span");
    if (valueSpan) valueSpan.textContent = " 0";
  });

  // update only goods with values
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

  // Gérer l'affichage des colonnes
  dynamicContainer
    .querySelectorAll<HTMLDivElement>("div[class^='colonne_']")
    .forEach((colDiv) => {
      const visibleGoods = Array.from(
        colDiv.querySelectorAll<HTMLElement>(".good-item"),
      ).some((item) => item.style.display !== "none");
      colDiv.style.display = visibleGoods ? "block" : "none";
    });
}

export function updateTotalSelected(count: number) {
  const counterSelection = document.getElementById("counterSelection");
  if (counterSelection) counterSelection.textContent = count.toString();
}

function updateTotal(
  checkboxes: NodeListOf<HTMLInputElement>,
  rowData: Map<HTMLTableRowElement, { resourceData: any; goodsData: any }>,
) {
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

async function saveSelectedTechnos(checkboxes: NodeListOf<HTMLInputElement>) {
  const selectedTechnos: TechnoEntity[] = [];

  checkboxes.forEach((checkbox, index) => {
    if (!checkbox.checked) return;
    const row = checkbox.closest("tr") as HTMLTableRowElement;
    if (!row) return;
    const technoInfo = extractTechnoInfo(row, index);
    if (technoInfo) selectedTechnos.push(technoInfo);
  });

  const [_, subSection] = getTitlePage();
  const normalizedEra = getEraId(subSection);
  await saveEraTechnos(normalizedEra, selectedTechnos);
}

export async function useTechno(tables: HTMLTableElement[]) {
  const technoTable = findTechnoTable(tables);
  if (!technoTable) return;

  addCheckboxColumn(technoTable);
  addTotalRow(technoTable);
  preloadGoodImages(technoTable);

  const rowData = new Map<
    HTMLTableRowElement,
    { resourceData: any; goodsData: any }
  >();
  const rows = technoTable.querySelectorAll<HTMLTableRowElement>(
    "tr:not(:first-child)",
  );

  rows.forEach((row) => {
    rowData.set(row, {
      resourceData: extractResources(row),
      goodsData: extractGoods(row),
    });
  });

  const checkboxes = technoTable.querySelectorAll(
    ".checkbox-selection",
  ) as NodeListOf<HTMLInputElement>;
  const selectAllCheckbox = document.getElementById(
    "checkboxSelectAll",
  ) as HTMLInputElement | null;

  if (selectAllCheckbox) {
    selectAllCheckbox.addEventListener("change", () => {
      checkboxes.forEach((cb) => (cb.checked = selectAllCheckbox.checked));
      updateTotal(checkboxes, rowData);
    });
  }

  technoTable.addEventListener("change", (event) => {
    const target = event.target as HTMLInputElement;
    if (target.classList.contains("checkbox-selection")) {
      updateTotal(checkboxes, rowData);
      if (selectAllCheckbox) {
        const allChecked = Array.from(checkboxes).every((cb) => cb.checked);
        selectAllCheckbox.checked = allChecked;
      }
    }
  });

  // Save checkbox logic
  const [_, subSection] = getTitlePage();
  const normalizedEra = getEraId(subSection);
  const saveCheckbox = document.getElementById(
    `checkboxSave_${normalizedEra}`,
  ) as HTMLInputElement | null;

  if (saveCheckbox) {
    saveCheckbox.addEventListener("change", async () => {
      if (saveCheckbox.checked) {
        await saveSelectedTechnos(checkboxes);
      } else {
        await clearEraTechnos(normalizedEra);
      }
    });

    // Auto-save when All checkbox changes and Save is checked
    if (selectAllCheckbox) {
      selectAllCheckbox.addEventListener("change", async () => {
        if (saveCheckbox.checked) {
          await saveSelectedTechnos(checkboxes);
        }
      });
    }

    // Auto-save when individual checkboxes change and Save is checked
    checkboxes.forEach((checkbox) => {
      checkbox.addEventListener("change", async () => {
        if (saveCheckbox.checked) {
          await saveSelectedTechnos(checkboxes);
        }
      });
    });

    // restore saved checkboxes
    const allTechs = flattenAndSortTechnos(await getTechnos());
    const eraTechs = allTechs.filter((t) =>
      t.id.startsWith(`techno_${normalizedEra}_`),
    );

    if (eraTechs.length > 0) {
      saveCheckbox.checked = true;
      const savedIds = new Set(eraTechs.map((t) => t.id));

      checkboxes.forEach((cb) => {
        if (cb.id && savedIds.has(cb.id)) cb.checked = true;
      });

      if (selectAllCheckbox) {
        const allChecked = Array.from(checkboxes).every((cb) => cb.checked);
        selectAllCheckbox.checked = allChecked;
      }
    }
  }

  updateTotal(checkboxes, rowData);
}
