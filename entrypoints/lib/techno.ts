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
  // Add "Calculator" legend in the first row
  const firstRow = table.querySelector("tr:first-child");
  if (firstRow) {
    const td = document.createElement("td");
    td.style.textAlign = "center";
    td.style.whiteSpace = "normal";
    td.textContent = "Calculator";
    firstRow.insertBefore(td, firstRow.firstChild); // Insert the new td at the beginning of the first row
  }

  // Add checkbox column in each row (except first row)
  const rows = table.querySelectorAll("tr:not(:first-child)");
  rows.forEach((row) => {
    const td = document.createElement("td");
    td.style.textAlign = "center";
    td.style.whiteSpace = "normal";

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.classList.add("checkbox-selection");
    checkbox.style.transform = "scale(1.25)";

    td.appendChild(checkbox); // Append the checkbox to the new td
    row.insertBefore(td, row.firstChild); // Insert the new td at the beginning of the row
  });
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
    const rawValue = img.nextSibling?.textContent?.trim().replace(/,/g, ""); // Remove commas
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

function addTotalRow(table: HTMLTableElement) {
  const newRow = document.createElement("tr");
  newRow.id = "totalRow";
  newRow.style.background = "rgba(36, 89, 113, 1)";
  newRow.style.height = "100px";

  // Première cellule avec la checkbox et le label
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

  // Troisième cellule avec images et totaux
  const td3 = document.createElement("td");
  td3.id = "totalRessources";

  // Créer les éléments de ressources avec des spans pour les valeurs
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

  // Quatrième cellule avec la section des biens
  const td4 = document.createElement("td");
  td4.id = "totalGoods";
  td4.colSpan = 2;

  // Conteneur pour les biens par défaut
  const defaultGoodsContainer = document.createElement("div");
  defaultGoodsContainer.id = "defaultGoodsContainer";
  defaultGoodsContainer.style.display = "grid";
  defaultGoodsContainer.style.gridAutoFlow = "column";
  defaultGoodsContainer.style.gridTemplateRows = "repeat(3, auto)";
  defaultGoodsContainer.style.gap = "0 15px";
  defaultGoodsContainer.style.width = "max-content";
  defaultGoodsContainer.style.justifyContent = "start";

  // Ajouter les biens par défaut
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

  // Conteneur pour les biens dynamiques (initialement caché)
  const dynamicGoodsContainer = document.createElement("div");
  dynamicGoodsContainer.id = "dynamicGoodsContainer";
  dynamicGoodsContainer.style.display = "none"; // Caché par défaut
  dynamicGoodsContainer.style.gridAutoFlow = "column";
  dynamicGoodsContainer.style.gridTemplateRows = "repeat(3, auto)";
  dynamicGoodsContainer.style.gap = "0 15px";
  dynamicGoodsContainer.style.width = "max-content";
  dynamicGoodsContainer.style.justifyContent = "start";

  td4.appendChild(defaultGoodsContainer);
  td4.appendChild(dynamicGoodsContainer);
  newRow.appendChild(td4);

  // Ajoute la nouvelle ligne dans le tbody de la table
  table.querySelector("tbody")?.appendChild(newRow);
}

// Fonction pour précharger toutes les images de biens possibles
function preloadGoodImages(table: HTMLTableElement) {
  const goodsContainer = document.getElementById("dynamicGoodsContainer");
  if (!goodsContainer) return;

  // Collecter toutes les images uniques de biens dans le tableau
  const goodImages = new Map<string, string>(); // Map pour stocker alt -> src

  const rows = table.querySelectorAll<HTMLTableRowElement>(
    "tr:not(:first-child)"
  );
  rows.forEach((row) => {
    const cell = row?.cells[3]; // Cellule des biens
    if (cell) {
      cell.querySelectorAll("img").forEach((img: HTMLImageElement) => {
        const key = img.alt.trim();
        if (!goodImages.has(key)) {
          goodImages.set(key, img.src);
        }
      });
    }
  });

  // Créer des éléments div pour chaque bien, mais les cacher
  goodImages.forEach((src, key) => {
    const divItem = document.createElement("div");
    divItem.className = "good-item";
    divItem.id = `good-${key}`;
    divItem.style.display = "none"; // Caché par défaut

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
    goodsContainer.appendChild(divItem);
  });
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

function updateTotalGoods(
  totalGoods: Record<string, { value: number; src: string }>
) {
  const defaultContainer = document.getElementById("defaultGoodsContainer");
  const dynamicContainer = document.getElementById("dynamicGoodsContainer");

  if (!defaultContainer || !dynamicContainer) return;

  // Si aucun bien n'est sélectionné, afficher les biens par défaut
  if (Object.keys(totalGoods).length === 0) {
    defaultContainer.style.display = "grid";
    dynamicContainer.style.display = "none";
    return;
  }

  // Sinon, cacher les biens par défaut et afficher les biens dynamiques
  defaultContainer.style.display = "none";
  dynamicContainer.style.display = "grid";

  // Détermine le nombre de biens à afficher (> 0)
  const nbGoods = Object.keys(totalGoods).length;
  dynamicContainer.style.gridTemplateRows =
    nbGoods > 18 ? "repeat(4, auto)" : "repeat(3, auto)";

  // Réinitialiser tous les éléments à "display: none"
  const allGoodItems = dynamicContainer.querySelectorAll(".good-item");
  allGoodItems.forEach((item) => {
    (item as HTMLElement).style.display = "none";
  });

  // Afficher et mettre à jour uniquement les biens avec une valeur > 0
  Object.keys(totalGoods).forEach((key) => {
    const { value } = totalGoods[key];
    const goodElement = document.getElementById(`good-${key}`);

    if (goodElement && value > 0) {
      goodElement.style.display = "block";
      const valueSpan = document.getElementById(`goodValue-${key}`);
      if (valueSpan) {
        valueSpan.textContent = ` ${value.toLocaleString("en-US")}`;
      }
    }
  });
}

// Use
export function useTechno(tables: HTMLTableElement[]) {
  const technoTable = findTechnoTable(tables) as HTMLTableElement;
  if (!technoTable) return;

  addCheckboxColumn(technoTable);
  addTotalRow(technoTable);
  preloadGoodImages(technoTable);

  // Stocker les données extraites pour chaque ligne
  const rowData = new Map<
    HTMLTableRowElement,
    { resourceData: any; goodsData: any }
  >();
  const rows = technoTable.querySelectorAll("tr:not(:first-child)");
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
