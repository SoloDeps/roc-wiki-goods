import { EraAbbr, eras } from "./constants";
import { formatNumber, parseNumber } from "./utils";

function findTechnoTable(tables: HTMLTableElement[]) {
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
    const td = document.createElement("td");
    td.style.textAlign = "center";
    td.style.whiteSpace = "normal";
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.classList.add("checkbox-selection");
    checkbox.style.transform = "scale(1.25)";
    td.appendChild(checkbox);
    row.insertBefore(td, row.firstChild);
  });
}

function addTotalRow(table: HTMLTableElement) {
  const newRow = document.createElement("tr");
  newRow.id = "totalRow";
  newRow.style.background = "rgba(36, 89, 113, 1)";
  newRow.style.height = "100px";

  const td1 = document.createElement("td");
  td1.style.textAlign = "center";
  td1.style.whiteSpace = "normal";
  const checkbox = document.createElement("input");
  checkbox.type = "checkbox";
  checkbox.id = "checkboxSelectAll";
  checkbox.name = "checkboxSelectAll";
  checkbox.style.transform = "scale(1.25)";
  const label = document.createElement("label");
  label.setAttribute("for", "checkboxSelectAll");
  label.textContent = "All";
  td1.appendChild(checkbox);
  td1.appendChild(document.createElement("br"));
  td1.appendChild(label);
  newRow.appendChild(td1);

  const td2 = document.createElement("td");
  td2.style.textAlign = "center";
  td2.style.fontWeight = "bold";
  td2.appendChild(document.createTextNode("Total"));
  td2.appendChild(document.createElement("br"));
  td2.appendChild(document.createTextNode("Selection"));
  newRow.appendChild(td2);

  const td3 = document.createElement("td");
  td3.id = "totalRessources";
  td3.style.verticalAlign = "baseline";
  td3.style.paddingTop = "12px";

  const resourcesContainer = document.createElement("div");
  const researchDiv = document.createElement("div");
  const researchImg = document.createElement("img");
  researchImg.alt = "PR";
  researchImg.src = "/images/thumb/2/20/Research.png/25px-Research.png";
  researchImg.width = 25;
  researchImg.height = 25;
  const researchSpan = document.createElement("span");
  researchSpan.id = "researchTotal";
  researchSpan.textContent = " 0";
  researchDiv.appendChild(researchImg);
  researchDiv.appendChild(researchSpan);
  resourcesContainer.appendChild(researchDiv);

  const goldDiv = document.createElement("div");
  const goldImg = document.createElement("img");
  goldImg.alt = "Gold";
  goldImg.src = "/images/thumb/6/6d/Coin.png/25px-Coin.png";
  goldImg.width = 25;
  goldImg.height = 25;
  const goldSpan = document.createElement("span");
  goldSpan.id = "goldTotal";
  goldSpan.textContent = " 0";
  goldDiv.appendChild(goldImg);
  goldDiv.appendChild(goldSpan);
  resourcesContainer.appendChild(goldDiv);

  const foodDiv = document.createElement("div");
  const foodImg = document.createElement("img");
  foodImg.alt = "Food";
  foodImg.src = "/images/thumb/c/c6/Food.png/25px-Food.png";
  foodImg.width = 25;
  foodImg.height = 25;
  const foodSpan = document.createElement("span");
  foodSpan.id = "foodTotal";
  foodSpan.textContent = " 0";
  foodDiv.appendChild(foodImg);
  foodDiv.appendChild(foodSpan);
  resourcesContainer.appendChild(foodDiv);

  td3.appendChild(resourcesContainer);
  newRow.appendChild(td3);

  const td4 = document.createElement("td");
  td4.id = "totalGoods";
  td4.style.verticalAlign = "baseline";
  td4.style.paddingTop = "12px";
  td4.colSpan = 2;

  const defaultGoodsContainer = document.createElement("div");
  defaultGoodsContainer.id = "defaultGoodsContainer";
  defaultGoodsContainer.style.display = "block";
  // defaultGoodsContainer.style.gap = "0 15px";
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

  const dynamicGoodsContainer = document.createElement("div");
  dynamicGoodsContainer.id = "dynamicGoodsContainer";
  dynamicGoodsContainer.style.display = "none";
  // dynamicGoodsContainer.style.gap = "0 15px";
  dynamicGoodsContainer.style.width = "max-content";
  dynamicGoodsContainer.style.justifyContent = "start";

  td4.appendChild(defaultGoodsContainer);
  td4.appendChild(dynamicGoodsContainer);
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

  // Vider le container avant de recréer la mise en page
  goodsContainer.innerHTML = "";
  goodsContainer.style.display = "grid";

  // Récupérer toutes les images goods du tableau
  const goodImages = new Map<string, string>(); // key -> src
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

  // Regex pour extraire catégorie et ère (ex: Primary_ME)
  const regexGood = /^(Primary|Secondary|Tertiary)_(\w{2})$/;

  // Organiser les goods par ère et catégorie
  // goodsByEra = { [abbr]: { Primary: div, Secondary: div, Tertiary: div } }
  const goodsByEra: Record<string, Record<string, HTMLDivElement>> = {};
  // Liste des goods "autres" (hors pattern)
  const otherGoods: HTMLDivElement[] = [];

  // Créer les div.good-item pour chaque good et les stocker temporairement
  const goodDivs = new Map<string, HTMLDivElement>();

  goodImages.forEach((src, key) => {
    const divItem = document.createElement("div");
    divItem.className = "good-item";
    divItem.id = `good-${key}`;
    divItem.style.display = "none"; // caché par défaut

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

  // Identifier les ères présentes
  const erasPresent = new Set<string>();

  // Classer les goods dans goodsByEra ou autres
  goodDivs.forEach((divItem, key) => {
    const match = key.match(regexGood);
    if (match) {
      const category = match[1]; // Primary, Secondary, Tertiary
      const abbr = match[2]; // ex ME, BA, CG

      erasPresent.add(abbr);

      if (!goodsByEra[abbr]) {
        goodsByEra[abbr] = {};
      }
      // On stocke la div dans la catégorie correspondante
      goodsByEra[abbr][category] = divItem;
    } else {
      // Good hors pattern => colonne "Autres"
      otherGoods.push(divItem);
    }
  });

  // Trier les ères selon l’ordre dans constants.ts
  const eraOrder = eras.map((e) => e.abbr);
  const sortedEras = Array.from(erasPresent)
    .filter((abbr): abbr is (typeof eras)[number]["abbr"] =>
      eras.some((e) => e.abbr === abbr)
    )
    .sort((a, b) => eraOrder.indexOf(a) - eraOrder.indexOf(b));

  // Nombre max de lignes dans une colonne (3 max pour Primary/Secondary/Tertiary)
  // La colonne "Autres" peut être plus longue
  let maxRows = 3;
  if (otherGoods.length > maxRows) maxRows = otherGoods.length;

  // Configurer le grid CSS
  const nbColumns = sortedEras.length + (otherGoods.length > 0 ? 1 : 0);
  goodsContainer.style.display = "none";
  goodsContainer.style.gridAutoFlow = "column";
  goodsContainer.style.gridTemplateRows = `repeat(${maxRows}, auto)`;
  goodsContainer.style.gridTemplateColumns = `repeat(${nbColumns}, auto)`;
  // goodsContainer.style.gap = "0 15px";
  goodsContainer.style.width = "max-content";
  goodsContainer.style.justifyContent = "start";

  // Fonction utilitaire pour créer une colonne div
  function createColumnDiv(abbr: string, isOther = false): HTMLDivElement {
    const colDiv = document.createElement("div");
    colDiv.className = isOther ? "colonne_autres" : `colonne_${abbr}`;
    colDiv.style.display = "block";
    colDiv.style.marginRight = "15px";
    // colDiv.style.gridAutoFlow = "row";
    colDiv.style.gridTemplateRows = `repeat(auto-fill, auto)`;
    // colDiv.style.rowGap = "5px";
    // colDiv.style.justifyItems = "center";
    return colDiv;
  }

  // Pour chaque ère, créer la colonne et y insérer les goods dans l'ordre Primary, Secondary, Tertiary (sans trous)
  sortedEras.forEach((abbr) => {
    const colDiv = createColumnDiv(abbr);
    const categoriesOrder = ["Primary", "Secondary", "Tertiary"];
    categoriesOrder.forEach((cat) => {
      const goodDiv = goodsByEra[abbr][cat];
      if (goodDiv) {
        goodDiv.style.display = ""; // visible par défaut, masquage géré ailleurs
        colDiv.appendChild(goodDiv);
      }
    });
    goodsContainer.appendChild(colDiv);
  });

  // Colonne "Autres" si nécessaire
  if (otherGoods.length > 0) {
    const colDiv = createColumnDiv("autres", true);
    otherGoods.forEach((divItem) => {
      divItem.style.display = ""; // visible par défaut, masquage géré ailleurs
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

  // Si aucun good sélectionné, afficher le container par défaut
  if (Object.keys(totalGoods).length === 0) {
    defaultContainer.style.display = "block";
    dynamicContainer.style.display = "none";
    return;
  }

  // Sinon, afficher le container dynamique et masquer le défaut
  defaultContainer.style.display = "none";
  dynamicContainer.style.display = "flex";

  // Masquer tous les goods au départ et remettre valeur à 0
  const allGoodItems =
    dynamicContainer.querySelectorAll<HTMLElement>(".good-item");
  allGoodItems.forEach((item) => {
    item.style.display = "none";
    const valueSpan = item.querySelector("span");
    if (valueSpan) valueSpan.textContent = " 0";
  });

  // Mettre à jour uniquement les goods présents dans totalGoods
  Object.entries(totalGoods).forEach(([key, { value }]) => {
    const goodDiv = document.getElementById(`good-${key}`);
    if (goodDiv) {
      goodDiv.style.display = ""; // Afficher (hérite du display par défaut)
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
  const updateTotal = () => {
    let totalGoods: Record<string, { value: number; src: string }> = {};
    let totalResources = { research: 0, gold: 0, food: 0 };

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
        }
      }
    });
    updateTotalRessources(totalResources);
    updateTotalGoods(totalGoods);
  };

  if (selectAllCheckbox) {
    selectAllCheckbox.addEventListener("change", () => {
      checkboxes.forEach((cb) => (cb.checked = selectAllCheckbox.checked));
      updateTotal();
    });
  }

  technoTable.addEventListener("change", (event) => {
    const target = event.target as HTMLInputElement;
    if (target.classList.contains("checkbox-selection") && selectAllCheckbox) {
      selectAllCheckbox.checked = Array.from(checkboxes).every(
        (cb) => cb.checked
      );
      updateTotal();
    }
  });
}
