import { eras, getEraId } from "@/lib/constants";
import { parseNumber, getTitlePage, formatNumber } from "@/lib/utils";
import {
  saveTechnos,
  loadSavedTechnos,
  savedTechnosStorage,
  type SavedTechno,
} from "@/lib/overview/storage";

function findTechnoTable(tables: HTMLTableElement[]) {
  // Chercher une table avec "Technology" dans la première cellule
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
  return null;
}

function createCheckboxCell(
  row: HTMLTableRowElement,
  index: number
): HTMLTableCellElement {
  const td = document.createElement("td");
  td.style.textAlign = "center";
  td.style.whiteSpace = "normal";
  const checkbox = document.createElement("input");
  checkbox.type = "checkbox";
  checkbox.classList.add("checkbox-selection");
  checkbox.style.transform = "scale(1.25)";

  // Générer un ID unique basé sur la structure de la page + index
  const [_, subSection] = getTitlePage();
  const normalizedEra = getEraId(subSection);
  const technoId = `techno_${normalizedEra}_${index}`;

  checkbox.id = technoId;
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
  td.appendChild(span);
  const span2 = document.createElement("span");
  span2.textContent = "selected";
  span2.style.fontSize = "15px";
  td.appendChild(span2);

  // Ajouter la checkbox Save dans la même cellule
  const saveContainer = document.createElement("div");
  saveContainer.style.marginTop = "8px";

  const checkbox = document.createElement("input");
  checkbox.type = "checkbox";

  // Ajouter un ID unique basé sur l'ère actuelle
  const [_, subSection] = getTitlePage();
  const normalizedEra = getEraId(subSection);
  const checkboxName = `checkboxSave_${normalizedEra}`;
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
  container.style.textAlign = "left";
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
  defaultGoodsContainer.style.textAlign = "left";

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
  dynamicGoodsContainer.style.textAlign = "left";
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

function extractTechnoCosts(row: HTMLTableRowElement): SavedTechno["costs"] {
  const costs: SavedTechno["costs"] = {};

  // Extraire Research, Coins, Food depuis la cellule 2 (index 2)
  const resourceCell = row.cells[2];
  if (resourceCell) {
    // Parser le HTML directement pour mieux gérer les images + text
    const images = resourceCell.querySelectorAll("img");
    const lines = resourceCell.innerHTML
      .split("<br>")
      .map((line) => line.trim());

    lines.forEach((line, index) => {
      const cleanLine = line.replace(/<[^>]*>/g, "").trim(); // Enlever les balises HTML
      const img = images[index];

      if (img) {
        // Utiliser src au lieu de alt car alt peut être vide
        const src = img.src?.toLowerCase() || "";
        const value = parseNumber(cleanLine);

        if (value > 0) {
          if (src.includes("research.png") || src.includes("research")) {
            costs.research = value;
          } else if (src.includes("coin.png") || src.includes("coin")) {
            costs.coins = value;
          } else if (src.includes("food.png") || src.includes("food")) {
            costs.food = value;
          }
        }
      }
    });
  }

  // Extraire les goods depuis la cellule 3 (index 3) seulement s'il y a des images de goods
  const goodsCell = row.cells[3];
  if (goodsCell) {
    const goodsImages = goodsCell.querySelectorAll("img");
    // Vérifier s'il y a des images qui ressemblent à des goods (pas les icônes de recherche/coins/food)
    const hasGoods = Array.from(goodsImages).some((img) => {
      const alt = img.alt?.toLowerCase() || "";
      return (
        !alt.includes("research") &&
        !alt.includes("coin") &&
        !alt.includes("food") &&
        alt !== ""
      );
    });

    if (hasGoods) {
      costs.goods = extractGoodsDetails(goodsCell);
    }
  }

  return costs;
}

function extractGoodsDetails(
  cell: HTMLTableCellElement
): Array<{ type: string; amount: number }> {
  const details: Array<{ type: string; amount: number }> = [];

  // Parser le HTML directement pour mieux gérer les images + text
  const images = cell.querySelectorAll("img");
  const lines = cell.innerHTML.split("<br>").map((line) => line.trim());

  lines.forEach((line, index) => {
    const cleanLine = line.replace(/<[^>]*>/g, "").trim();

    // Primary: FA 15,500
    const primaryMatch = cleanLine.match(/Primary:\s*([A-Z]{2})\s*([\d,]+)/i);
    if (primaryMatch) {
      details.push({
        type: `Primary_${primaryMatch[1]}`,
        amount: parseNumber(primaryMatch[2]),
      });
      return;
    }

    // Secondary: KS 3,950
    const secondaryMatch = cleanLine.match(
      /Secondary:\s*([A-Z]{2})\s*([\d,]+)/i
    );
    if (secondaryMatch) {
      details.push({
        type: `Secondary_${secondaryMatch[1]}`,
        amount: parseNumber(secondaryMatch[2]),
      });
      return;
    }

    // Tertiary: FA 15,500
    const tertiaryMatch = cleanLine.match(/Tertiary:\s*([A-Z]{2})\s*([\d,]+)/i);
    if (tertiaryMatch) {
      details.push({
        type: `Tertiary_${tertiaryMatch[1]}`,
        amount: parseNumber(tertiaryMatch[2]),
      });
      return;
    }

    // Parser les images + montant: <img> Carpet.png 2,000
    const img = images[index];
    if (img && img.alt) {
      const goodName = img.alt.replace(".png", "").trim();
      const value = parseNumber(cleanLine);
      if (value > 0 && goodName) {
        details.push({
          type: goodName,
          amount: value,
        });
      }
    }
  });

  return details;
}

function extractTechnoInfo(
  row: HTMLTableRowElement,
  index: number
): { id: string; costs: SavedTechno["costs"] } | null {
  const cells = row.cells;
  if (cells.length < 4) return null;

  // Générer le même ID que dans createCheckboxCell
  const [_, subSection] = getTitlePage();
  const normalizedEra = getEraId(subSection);
  const technoId = `techno_${normalizedEra}_${index}`;

  // Utiliser la fonction d'extraction spécifique aux technologies
  const costs = extractTechnoCosts(row);

  return {
    id: technoId,
    costs,
  };
}

// Fonction pour sauvegarder les technologies d'une ère spécifique en remplaçant tout
async function saveEraTechnos(eraPath: string, technos: SavedTechno[]) {
  const data = await loadSavedTechnos();

  // Remplacer complètement les technologies de cette ère
  data.technos[eraPath] = {};

  // Ajouter les nouvelles technologies
  technos.forEach((techno) => {
    // Extraire l'index depuis l'ID : techno_era_index
    const idParts = techno.id.split("_");
    if (idParts.length >= 3) {
      const index = idParts[idParts.length - 1];
      data.technos[eraPath][index] = techno;
    }
  });

  await savedTechnosStorage.setValue(data);
}

// Fonction pour mettre à jour les technologies d'une ère avec la sélection actuelle
async function updateEraTechnosWithCurrentSelection(
  eraPath: string,
  checkboxes: NodeListOf<HTMLInputElement>,
  rowData: Map<HTMLTableRowElement, { resourceData: any; goodsData: any }>
) {
  const selectedTechnos: SavedTechno[] = [];

  checkboxes.forEach((checkbox, index) => {
    if (checkbox.checked) {
      const row = checkbox.closest("tr") as HTMLTableRowElement;
      if (row) {
        const technoInfo = extractTechnoInfo(row, index);
        if (technoInfo) {
          selectedTechnos.push(technoInfo);
        }
      }
    }
  });

  // Utiliser saveEraTechnos pour remplacer complètement l'ère actuelle
  await saveEraTechnos(eraPath, selectedTechnos);
}

async function saveSelectedTechnos(
  checkboxes: NodeListOf<HTMLInputElement>,
  rowData: Map<HTMLTableRowElement, { resourceData: any; goodsData: any }>
) {
  const selectedTechnos: SavedTechno[] = [];

  checkboxes.forEach((checkbox, index) => {
    if (checkbox.checked) {
      const row = checkbox.closest("tr") as HTMLTableRowElement;
      if (row) {
        const technoInfo = extractTechnoInfo(row, index);
        if (technoInfo) {
          selectedTechnos.push(technoInfo);
        }
      }
    }
  });

  // Récupérer l'ère normalisée pour sauvegarder correctement
  const [_, subSection] = getTitlePage();
  const normalizedEra = getEraId(subSection);

  await saveEraTechnos(normalizedEra, selectedTechnos);

  // La checkbox reste cochée pour indiquer que la sauvegarde est active
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

  // Vérifier s'il y a des images de goods dans cette cellule
  const goodsImages = cell.querySelectorAll("img");
  if (goodsImages.length === 0) {
    return {}; // Pas de goods dans cette ère (ex: Stone Age)
  }

  let goods: Record<string, { value: number; src: string }> = {};
  goodsImages.forEach((img: HTMLImageElement) => {
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

export function updateTotalGoods(
  totalGoods: Record<string, { value: number }>
) {
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

export function updateTotalSelected(totalSelected: number) {
  const counterSelection = document.getElementById("counterSelection");
  if (counterSelection) counterSelection.textContent = totalSelected.toString();
}

function updateTotal(
  checkboxes: NodeListOf<HTMLInputElement>,
  rowData: Map<HTMLTableRowElement, { resourceData: any; goodsData: any }>
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

export async function useTechno(tables: HTMLTableElement[]) {
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

  const checkboxes = technoTable.querySelectorAll(
    ".checkbox-selection"
  ) as NodeListOf<HTMLInputElement>;
  const selectAllCheckbox = document.getElementById(
    "checkboxSelectAll"
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

  // Ajouter l'event listener pour la checkbox Save
  const [_, subSection] = getTitlePage();
  const normalizedEra = getEraId(subSection);
  const pagePath = normalizedEra;
  console.log(pagePath);

  const saveCheckbox = document.getElementById(
    `checkboxSave_${pagePath}`
  ) as HTMLInputElement | null;
  const allCheckbox = document.getElementById(
    "checkboxSelectAll"
  ) as HTMLInputElement | null;

  if (saveCheckbox) {
    saveCheckbox.addEventListener("change", async () => {
      if (saveCheckbox.checked) {
        // Quand on coche : sauvegarder les technologies sélectionnées de cette ère
        await saveSelectedTechnos(checkboxes, rowData);
      } else {
        // Quand on décoche : effacer les technologies de cette ère seulement
        await clearEraTechnos(pagePath || "");
      }
    });

    // Ajouter un event listener pour la checkbox "All"
    if (allCheckbox) {
      allCheckbox.addEventListener("change", async () => {
        if (saveCheckbox.checked) {
          // Recréer les données actuelles au moment du changement
          const currentRowData = new Map<
            HTMLTableRowElement,
            { resourceData: any; goodsData: any }
          >();

          checkboxes.forEach((cb) => {
            const row = cb.closest("tr") as HTMLTableRowElement;
            if (row) {
              currentRowData.set(row, {
                resourceData: extractResources(row),
                goodsData: extractGoods(row),
              });
            }
          });

          // Utiliser updateEraTechnosWithCurrentSelection pour la cohérence
          await updateEraTechnosWithCurrentSelection(
            pagePath || "",
            checkboxes,
            currentRowData
          );
        }
      });
    }

    // Ajouter un event listener pour les changements sur les checkboxes individuelles
    // quand la checkbox Save est déjà cochée (permet de modifier la sélection)
    checkboxes.forEach((checkbox) => {
      checkbox.addEventListener("change", async () => {
        if (saveCheckbox.checked) {
          // Recréer les données actuelles au moment du changement
          const currentRowData = new Map<
            HTMLTableRowElement,
            { resourceData: any; goodsData: any }
          >();

          checkboxes.forEach((cb) => {
            const row = cb.closest("tr") as HTMLTableRowElement;
            if (row) {
              currentRowData.set(row, {
                resourceData: extractResources(row),
                goodsData: extractGoods(row),
              });
            }
          });

          // Mettre à jour les données sauvegardées avec les données fraîches
          // Utiliser updateEraTechnos pour remplacer complètement l'ère actuelle
          await updateEraTechnosWithCurrentSelection(
            pagePath || "",
            checkboxes,
            currentRowData
          );
        }
      });
    });

    // Au chargement, cocher la checkbox s'il y a des technologies sauvegardées pour cette ère
    const savedData = await loadSavedTechnos();
    const eraTechnos = savedData.technos[pagePath || ""] || {};
    const eraTechnoCount = Object.keys(eraTechnos).length;
    if (eraTechnoCount > 0) {
      saveCheckbox.checked = true;
    }
  }

  updateTotal(checkboxes, rowData);

  // Restaurer les cases cochées depuis le storage
  await restoreSavedCheckboxes(checkboxes);
}

async function restoreSavedCheckboxes(
  checkboxes: NodeListOf<HTMLInputElement>
) {
  const savedData = await loadSavedTechnos();

  // Récupérer l'ère actuelle en utilisant exactement la même logique que les IDs
  const [_, subSection] = getTitlePage();
  const normalizedEra = getEraId(subSection);
  const pagePath = normalizedEra;

  // Vérifier seulement les technologies de cette ère
  const eraTechnos = savedData.technos[pagePath || ""] || {};
  const eraTechnoCount = Object.keys(eraTechnos).length;

  if (eraTechnoCount === 0) return;

  // Créer un Set des IDs de technologies sauvegardées pour cette ère
  const savedTechnoIds = new Set<string>();
  Object.values(eraTechnos).forEach((techno: SavedTechno) => {
    savedTechnoIds.add(techno.id);
  });

  checkboxes.forEach((checkbox) => {
    if (checkbox.id && savedTechnoIds.has(checkbox.id)) {
      checkbox.checked = true;
    }
  });

  // Vérifier si toutes les checkboxes sont cochées pour cocher "All"
  const allCheckbox = document.getElementById(
    "checkboxSelectAll"
  ) as HTMLInputElement;
  if (allCheckbox) {
    const allCheckboxes = Array.from(checkboxes);
    const allChecked =
      allCheckboxes.length > 0 && allCheckboxes.every((cb) => cb.checked);
    allCheckbox.checked = allChecked;
  }

  // Mettre à jour le total après avoir restauré les cases
  const rows = Array.from(checkboxes).map(
    (cb) => cb.closest("tr") as HTMLTableRowElement
  );
  const rowData = new Map<
    HTMLTableRowElement,
    { resourceData: any; goodsData: any }
  >();

  rows.forEach((row) => {
    rowData.set(row, {
      resourceData: extractResources(row),
      goodsData: extractGoods(row),
    });
  });

  updateTotal(checkboxes, rowData);
}

// Fonction pour effacer les technologies d'une ère spécifique
export async function clearEraTechnos(eraPath: string) {
  const data = await loadSavedTechnos();

  // Supprimer complètement l'ère spécifiée du storage
  if (data.technos[eraPath]) {
    delete data.technos[eraPath];
    await savedTechnosStorage.setValue(data);
  }
}
