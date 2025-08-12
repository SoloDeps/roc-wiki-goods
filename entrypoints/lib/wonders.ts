import { eras } from "./constants";
import { updateTotalGoods, updateTotalSelected } from "./techno";
import { formatNumber, getTitlePage, parseNumber } from "./utils";

export type ColumnsInfos = {
  nbColumns: number;
  planImgUrl: string;
  tokenImgUrls: string[];
  goodsColSpan: number;
};

/* =========
Creation Part
=========== */

function createSelect(idName: string, labelName: string) {
  // Créer un conteneur pour regrouper label + select
  const wrapper = document.createElement("div");

  // Créer le label
  const label = document.createElement("label");
  label.htmlFor = idName;
  label.textContent = labelName;
  label.style.marginRight = "8px";

  // Créer le select
  const select = document.createElement("select");
  select.id = idName;

  // Ajouter les options de 1 à 30
  for (let i = 1; i <= 30; i++) {
    const option = document.createElement("option");
    option.value = i.toString();
    option.textContent = i.toString();
    select.appendChild(option);
  }

  // Ajouter le label et le select au wrapper
  wrapper.appendChild(label);
  wrapper.appendChild(select);

  return wrapper;
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

function createTotalSelectionCell(nbColumns: number): HTMLTableCellElement {
  const td = document.createElement("td");
  td.colSpan = nbColumns;
  td.style.textAlign = "left";
  td.style.paddingLeft = "18px";
  td.style.whiteSpace = "normal";

  // div for contains select label and checkbox all
  const divLine = document.createElement("div");
  divLine.style.display = "flex";
  divLine.style.flexDirection = "row";
  divLine.style.alignItems = "center";
  divLine.style.gap = "10px";

  // select label
  const labelSelect = document.createElement("div");
  labelSelect.textContent = "Select level :";
  // labelSelect.style.fontWeight = "600";
  labelSelect.style.fontSize = "15px";

  // checkbox div
  const divCheckbox = document.createElement("div");
  divCheckbox.style.display = "flex";
  divCheckbox.style.flexDirection = "row";
  divCheckbox.style.alignItems = "center";
  divCheckbox.style.marginLeft = "26px";

  // checkbox
  const checkbox = document.createElement("input");
  checkbox.type = "checkbox";
  checkbox.id = "checkboxSelectAll";
  checkbox.name = "checkboxSelectAll";
  checkbox.style.transform = "scale(1.25)";
  checkbox.checked = false;

  // checkbox label
  const label = document.createElement("label");
  label.setAttribute("for", "checkboxSelectAll");
  label.textContent = "All";
  label.style.marginLeft = "8px";

  // checkbox and label
  divCheckbox.appendChild(checkbox);
  divCheckbox.appendChild(label);

  // label select and checkbox div
  divLine.appendChild(labelSelect);
  divLine.appendChild(divCheckbox);

  const divSelect = document.createElement("div");
  divSelect.style.display = "flex";
  divSelect.style.flexDirection = "row";
  divSelect.style.alignItems = "center";
  divSelect.style.gap = "20px";
  divSelect.style.marginTop = "10px";

  divSelect.appendChild(createSelect("minSelect", "From"));
  divSelect.appendChild(createSelect("maxSelect", "To"));

  td.appendChild(divLine);
  td.appendChild(divSelect);

  return td;
}

function createPlanTokenCell(
  planImgUrl: string,
  tokenImgUrls: string[]
): HTMLTableCellElement {
  const td = document.createElement("td");
  td.id = "totalPlanToken";

  const div = document.createElement("div");
  div.style.display = "flex";
  div.style.height = "100%";
  div.style.flexDirection = "column";
  div.style.gap = "2px";
  // div.style.textAlign = "center";
  div.style.paddingLeft = "20px";
  div.appendChild(createResourceDiv("Plan", planImgUrl, "planTotal"));
  tokenImgUrls.forEach((tokenImgUrl, index) => {
    div.appendChild(
      createResourceDiv("Token", tokenImgUrl, `tokenTotal${index}`)
    );
  });
  td.appendChild(div);
  return td;
}

function createResearchCell(nameId: string, text: string): HTMLDivElement {
  const divRow = document.createElement("div");
  divRow.style.display = "flex";

  const divText = document.createElement("div");
  divText.style.width = "53px";
  divText.style.fontStyle = "italic";
  divText.textContent = text;

  const span = document.createElement("span");
  span.id = nameId;
  span.textContent = "0";

  divRow.appendChild(divText);
  divRow.appendChild(span);

  return divRow;
}

function createAllResearchCell(): HTMLTableCellElement {
  const td = document.createElement("td");
  td.colSpan = 2;

  const divContainer = document.createElement("div");
  divContainer.style.display = "flex";
  divContainer.style.height = "100%";
  divContainer.style.flexDirection = "column";
  divContainer.style.alignItems = "left";
  divContainer.style.paddingLeft = "30px";

  // all research div
  const div1 = document.createElement("div");
  const img = document.createElement("img");
  img.alt = "allResearch";
  img.src = "/images/thumb/2/20/Research.png/25px-Research.png";
  img.width = 25;
  img.height = 25;
  const span = document.createElement("span");
  span.id = "allResearch";
  span.style.marginLeft = "28px";
  span.textContent = "0";
  div1.appendChild(img);
  div1.appendChild(span);
  divContainer.appendChild(div1);

  divContainer.appendChild(createResearchCell("total3PR", "3 PR:"));
  divContainer.appendChild(createResearchCell("total5PR", "5 PR:"));
  divContainer.appendChild(createResearchCell("total10PR", "10 PR:"));

  td.appendChild(divContainer);
  return td;
}

function createCoinFoodCell(): HTMLTableCellElement {
  const td = document.createElement("td");

  const div = document.createElement("div");
  div.style.display = "flex";
  div.style.height = "100%";
  div.style.flexDirection = "column";
  div.style.paddingRight = "14px";
  div.style.gap = "2px";
  div.appendChild(
    createResourceDiv(
      "Coins",
      "/images/thumb/6/6d/Coin.png/25px-Coin.png",
      "goldTotal"
    )
  );
  div.appendChild(
    createResourceDiv(
      "Food",
      "/images/thumb/c/c6/Food.png/25px-Food.png",
      "foodTotal"
    )
  );
  td.appendChild(div);
  return td;
}

function createGoodsCell(goodsColSpan: number): HTMLTableCellElement {
  const td = document.createElement("td");
  td.id = "goodsTotal";
  td.colSpan = goodsColSpan;
  td.appendChild(createDefaultGoodsContainer());
  td.appendChild(createDynamicGoodsContainer());
  return td;
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

/* =========
Total Row Part
=========== */

function addTotalRow(table: HTMLTableElement, data: ColumnsInfos) {
  const { nbColumns, planImgUrl, tokenImgUrls, goodsColSpan } = data;

  const newRow = document.createElement("tr");
  newRow.id = "totalRow";
  newRow.style.background = "rgba(36, 89, 113, 1)";
  newRow.style.textAlign = "left";
  newRow.style.height = "100px";

  // selection total + 2 input type select
  newRow.appendChild(createTotalSelectionCell(nbColumns));

  // td counter display
  newRow.appendChild(createTotalLabelCell());

  // td plan + tokens
  newRow.appendChild(createPlanTokenCell(planImgUrl, tokenImgUrls));

  // td 3pr/5pr/10pr research
  newRow.appendChild(createAllResearchCell());

  // td coins/food
  newRow.appendChild(createCoinFoodCell());

  // td goods
  newRow.appendChild(createGoodsCell(goodsColSpan));

  table.querySelector("tbody")?.appendChild(newRow);

  preloadGoodImages(table, nbColumns);
}

function preloadGoodImages(table: HTMLTableElement, nbCol: number) {
  const goodsContainer = document.getElementById("dynamicGoodsContainer");
  if (!goodsContainer) return;

  goodsContainer.replaceChildren();
  goodsContainer.style.display = "grid";

  const goodImages = new Map<string, string>();
  const rows = table.querySelectorAll<HTMLTableRowElement>(
    "tr:not(:first-child)"
  );

  rows.forEach((row, index) => {
    if (index === rows.length - 1) return;

    const cell = row?.cells[nbCol + 6];
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

function columnsInfos(table: HTMLTableElement): ColumnsInfos {
  // Récupère la première ligne (headers)
  const firstRow = table.querySelector("tr");
  if (!firstRow)
    return { nbColumns: 0, planImgUrl: "", tokenImgUrls: [], goodsColSpan: 0 };

  // Récupère toutes les cellules (td ou th) de la première ligne
  const cells = Array.from(firstRow.children);

  // Parcourt les cellules pour trouver "Level"
  let nbColumns = 0;
  let cellsWidth = 0;
  let columns: HTMLTableCellElement[] = [];
  for (const cell of cells) {
    if (cell?.textContent?.trim().includes("Level")) {
      (cell as HTMLElement).style.minWidth = "90px";
      break;
    }

    nbColumns++;
    cellsWidth += cell.getBoundingClientRect().width;
    columns.push(cell as HTMLTableCellElement);
  }

  // Définir les largeurs minimales selon le nombre de colonnes
  const minWidth =
    nbColumns === 1
      ? "210px"
      : nbColumns <= 2 || cellsWidth <= 270
      ? "105px"
      : "";

  // Appliquer la largeur minimale à toutes les colonnes
  columns.forEach((cell) => {
    (cell as HTMLElement).style.minWidth = minWidth;
  });

  // extract plan img url
  const planImgUrl = cells[columns.length + 1].querySelector("img")?.src || "";

  const tokenCell = cells[columns.length + 5];
  const tokenImgUrls = tokenCell
    ? Array.from(
        new Set(
          Array.from(tokenCell.querySelectorAll("img")).map((img) => img.src)
        )
      )
    : [];

  const goodsColSpan = cells.length - (columns.length + 5);

  return { nbColumns, planImgUrl, tokenImgUrls, goodsColSpan };
}

function syncMinMaxSelects(
  minSelect: HTMLSelectElement,
  maxSelect: HTMLSelectElement
): { min: number; max: number } | null {
  if (!minSelect || !maxSelect) return null;

  const minValue = parseInt(minSelect.value, 10);
  let maxValue = parseInt(maxSelect.value, 10);

  if (maxValue < minValue) {
    maxValue = minValue;
    maxSelect.value = minValue.toString();
  }

  while (maxSelect.firstChild) {
    maxSelect.removeChild(maxSelect.firstChild);
  }

  for (let i = minValue; i <= 30; i++) {
    const option = document.createElement("option");
    option.value = i.toString();
    option.textContent = i.toString();
    maxSelect.appendChild(option);
  }

  if (maxValue >= minValue && maxValue <= 30) {
    maxSelect.value = maxValue.toString();
  } else {
    maxSelect.value = minValue.toString();
  }

  return { min: minValue, max: maxValue };
}

function updateMinMaxSelect(
  minSelect: HTMLSelectElement,
  maxSelect: HTMLSelectElement,
  minValue: string,
  maxValue: string
) {
  if (!minSelect || !maxSelect) return;

  minSelect.value = minValue;
  maxSelect.value = maxValue;
  minSelect.dispatchEvent(new Event("change"));
}

function updateCheckboxSelectAll(
  minSelect: HTMLSelectElement,
  maxSelect: HTMLSelectElement,
  checkboxSelectAll: HTMLInputElement | null
) {
  if (!checkboxSelectAll) return;
  checkboxSelectAll.checked =
    minSelect.value === "1" && maxSelect.value === "30";
}

function extractData(
  row: HTMLTableRowElement,
  nbColumns: number
): { plan: number; gold: number; food: number } {
  const planCell = row?.cells[nbColumns + 1];
  const goldCell = row?.cells[nbColumns + 7];
  const foodCell = row?.cells[nbColumns + 8];

  let plan = 0;
  let gold = 0;
  let food = 0;

  const processCell = (cell: HTMLTableCellElement | undefined): number => {
    if (!cell) return 0;
    let total = 0;

    cell.childNodes.forEach((node) => {
      if (node.nodeType === Node.TEXT_NODE) {
        const rawText = node.textContent?.trim();
        if (!rawText) return;

        const clean = rawText.replace(/\s*\(.*?\)/g, "").trim();
        const regex = /(?:(\d+)\s*x\s*)?([\d.,]+\s*[KM]?)\b/gi;
        let match;
        while ((match = regex.exec(clean)) !== null) {
          const multiplier = match[1] ? parseInt(match[1]) : 1;
          const valueStr = match[2];
          const parsed = parseNumber(valueStr);
          total += multiplier * parsed;
        }
      }
    });

    return total;
  };

  plan = processCell(planCell);
  gold = processCell(goldCell);
  food = processCell(foodCell);

  return { plan, gold, food };
}

function extractPR(row: HTMLTableRowElement, nbColumns: number) {
  const cell3pr = row?.cells[nbColumns + 2];
  const cell5pr = row?.cells[nbColumns + 3];
  const cell10pr = row?.cells[nbColumns + 4];

  if (!cell3pr || !cell5pr || !cell10pr) return { pr3: 0, pr5: 0, pr10: 0 };

  function cleanText(cell: HTMLTableCellElement): string {
    const text = cell.textContent?.trim();
    if (!text) return "0";
    return text.replace(/\s*\(.*?\)/g, "").trim();
  }

  return {
    pr3: parseNumber(cleanText(cell3pr)) * 3,
    pr5: parseNumber(cleanText(cell5pr)) * 5,
    pr10: parseNumber(cleanText(cell10pr)) * 10,
  };
}

function extractGoods(row: HTMLTableRowElement, nbColumns: number) {
  const cell = row?.cells[nbColumns + 6];
  if (!cell) return {};

  const goods: Record<string, { value: number; src: string }> = {};

  const nodes = Array.from(cell.childNodes);

  nodes.forEach((node, index) => {
    if (node.nodeType === Node.ELEMENT_NODE && node.nodeName === "IMG") {
      const img = node as HTMLImageElement;
      const key = img.alt.trim();
      const src = img.src;

      // Vérifie le multiplicateur dans le nœud précédent
      let multiplier = 1;
      const prevNode = nodes[index - 1];
      if (prevNode?.nodeType === Node.TEXT_NODE) {
        const textBefore = prevNode.textContent?.trim() || "";
        const match = textBefore.match(/^(\d+)\s*x/i);
        if (match) {
          multiplier = parseInt(match[1]);
        }
      }

      // Récupère la valeur dans le nœud suivant
      const nextNode = nodes[index + 1];
      let baseValue = 0;
      if (nextNode?.nodeType === Node.TEXT_NODE) {
        let rawText =
          nextNode.textContent?.replace(/\s*\(.*?\)/g, "").trim() || "";
        rawText = rawText.replace(/,/g, ""); // supprime les virgules
        baseValue = parseFloat(rawText) || 0;
      }

      const totalValue = Math.round(multiplier * baseValue);

      if (goods[key]) {
        goods[key].value += totalValue;
      } else {
        goods[key] = { value: totalValue, src };
      }
    }
  });

  return goods;
}

function extractTokens(row: HTMLTableRowElement, nbColumns: number) {
  const cell = row?.cells[nbColumns + 5];
  if (!cell) return {};

  const tokens: Record<string, number> = {};
  const nodes = Array.from(cell.childNodes);

  nodes.forEach((node, index) => {
    if (node.nodeType === Node.ELEMENT_NODE && node.nodeName === "IMG") {
      const img = node as HTMLImageElement;
      const key = img.alt.trim();

      // Le texte après l'image est la quantité
      const quantityNode = nodes[index + 1];
      let quantity = 0;

      if (quantityNode?.nodeType === Node.TEXT_NODE) {
        const rawText =
          quantityNode.textContent?.trim().replace(/\s*\(.*?\)/g, "") || "";
        quantity = parseInt(rawText, 10) || 0;
      }

      tokens[key] = (tokens[key] || 0) + quantity;
    }
  });

  return tokens;
}

function updateTotalRessources(totalRessources: {
  plan: number;
  gold: number;
  food: number;
}) {
  const planTotal = document.getElementById("planTotal");
  const goldTotal = document.getElementById("goldTotal");
  const foodTotal = document.getElementById("foodTotal");
  if (planTotal) planTotal.textContent = ` ${totalRessources.plan}`;
  if (goldTotal)
    goldTotal.textContent = ` ${formatNumber(totalRessources.gold)}`;
  if (foodTotal)
    foodTotal.textContent = ` ${formatNumber(totalRessources.food)}`;
}

function updateTotalPr(totalPr: { pr3: number; pr5: number; pr10: number }) {
  const allPr = document.getElementById("allResearch");
  const pr3Total = document.getElementById("total3PR");
  const pr5Total = document.getElementById("total5PR");
  const pr10Total = document.getElementById("total10PR");
  if (allPr)
    allPr.textContent = `${(
      totalPr.pr3 +
      totalPr.pr5 +
      totalPr.pr10
    ).toLocaleString("en-US")}`;
  if (pr3Total) pr3Total.textContent = `${totalPr.pr3.toLocaleString("en-US")}`;
  if (pr5Total) pr5Total.textContent = `${totalPr.pr5.toLocaleString("en-US")}`;
  if (pr10Total)
    pr10Total.textContent = `${totalPr.pr10.toLocaleString("en-US")}`;
}

function updateTotalRow(
  min: number,
  max: number,
  rowData: Map<
    HTMLTableRowElement,
    { resourceData: any; prData: any; tokensData: any; goodsData: any }
  >
) {
  const selectedRows = Array.from(rowData.values()).slice(min - 1, max);
  let totalGoods: Record<string, { value: number; src: string }> = {};

  const totalRow = selectedRows.reduce(
    (acc, row) => {
      acc.resourceData.plan += row.resourceData.plan;
      acc.resourceData.gold += row.resourceData.gold;
      acc.resourceData.food += row.resourceData.food;
      acc.prData.pr3 += row.prData.pr3;
      acc.prData.pr5 += row.prData.pr5;
      acc.prData.pr10 += row.prData.pr10;

      Object.entries(row.tokensData as Record<string, number>).forEach(
        ([key, value]) => {
          if (acc.tokensData[key]) {
            acc.tokensData[key] += value;
          } else {
            acc.tokensData[key] = value;
          }
        }
      );

      Object.keys(row.goodsData).forEach((key) => {
        if (totalGoods[key]) {
          totalGoods[key].value += row.goodsData[key].value;
        } else {
          totalGoods[key] = { ...row.goodsData[key] };
        }
      });

      return acc;
    },
    {
      resourceData: { plan: 0, gold: 0, food: 0 },
      prData: { pr3: 0, pr5: 0, pr10: 0 },
      tokensData: {} as Record<string, number>,
      totalGoods,
    }
  );

  updateTotalGoods(totalRow.totalGoods);
  updateTotalSelected(selectedRows.length);
  updateTotalRessources(totalRow.resourceData);
  updateTotalTokens(totalRow.tokensData);
  updateTotalPr(totalRow.prData);
}

function updateTotalTokens(tokens: Record<string, number>) {
  const tokenContainer = document.getElementById("totalPlanToken");
  if (!tokenContainer) return;

  const spans = tokenContainer.querySelectorAll("span");

  const keys = Object.keys(tokens);
  for (let index = 0; index < spans.length; index++) {
    const key = keys[index];
    const span = document.getElementById(`tokenTotal${index}`);
    if (span) {
      span.textContent = ` ${tokens[key] ?? 0}`;
    }
  }
}

export function useWonders(tables: HTMLTableElement[]) {
  const [mainSection, secondSection] = getTitlePage();
  if (mainSection !== "world_wonders" || secondSection == null) return;

  const wonderTable = tables[tables.length - 1];
  if (!wonderTable) return;

  const data = columnsInfos(wonderTable);
  addTotalRow(wonderTable, data);

  // console.log(data.nbColumns);

  const minSelect = document.getElementById("minSelect") as HTMLSelectElement;
  const maxSelect = document.getElementById("maxSelect") as HTMLSelectElement;
  const checkboxSelectAll = document.getElementById(
    "checkboxSelectAll"
  ) as HTMLInputElement;

  if (!minSelect || !maxSelect || !checkboxSelectAll) return;

  const rowData = new Map<
    HTMLTableRowElement,
    { resourceData: any; prData: any; tokensData: any; goodsData: any }
  >();
  const allRows = Array.from(wonderTable.querySelectorAll("tr"));
  const rows = allRows.slice(1, -1);

  rows.forEach((row) => {
    const tr = row as HTMLTableRowElement;
    // plan, gold, food
    const resourceData = extractData(tr, data.nbColumns);
    // pr 3, 5, 10
    const prData = extractPR(tr, data.nbColumns);
    // tokens
    const tokensData = extractTokens(tr, data.nbColumns);
    // goods
    const goodsData = extractGoods(tr, data.nbColumns);

    rowData.set(tr, { resourceData, prData, tokensData, goodsData });
  });

  const syncAndUpdate = () => {
    const result = syncMinMaxSelects(minSelect, maxSelect);
    updateCheckboxSelectAll(minSelect, maxSelect, checkboxSelectAll);
    if (result) {
      updateTotalRow(result.min, result.max, rowData);
    }
  };

  minSelect.addEventListener("change", syncAndUpdate);
  maxSelect.addEventListener("change", syncAndUpdate);

  checkboxSelectAll.addEventListener("change", (e) => {
    if ((e.target as HTMLInputElement).checked) {
      updateMinMaxSelect(minSelect, maxSelect, "1", "30");
    } else {
      updateMinMaxSelect(minSelect, maxSelect, "1", "1");
    }
  });

  // Initialisation
  syncAndUpdate();
}
