import { formatNumber, parseNumber } from "./utils";

function findTechnoTable() {
  const tables = document.querySelectorAll("table.article-table");

  for (const table of tables) {
    const firstCell = table.querySelector("tr:first-child td:first-child");
    if (firstCell && firstCell.textContent?.trim() === "Technology") {
      return table;
    }
  }

  return;
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

  const img1 = document.createElement("img");
  img1.alt = "PR";
  img1.src = "/images/thumb/2/20/Research.png/25px-Research.png";
  img1.width = 25;
  img1.height = 25;

  const img2 = document.createElement("img");
  img2.alt = "Gold";
  img2.src = "/images/thumb/6/6d/Coin.png/25px-Coin.png";
  img2.width = 25;
  img2.height = 25;

  const img3 = document.createElement("img");
  img3.alt = "Food";
  img3.src = "/images/thumb/c/c6/Food.png/25px-Food.png";
  img3.width = 25;
  img3.height = 25;

  td3.appendChild(img1);
  td3.appendChild(document.createTextNode(" 0"));
  td3.appendChild(document.createElement("br"));
  td3.appendChild(img2);
  td3.appendChild(document.createTextNode(" 0"));
  td3.appendChild(document.createElement("br"));
  td3.appendChild(img3);
  td3.appendChild(document.createTextNode(" 0"));

  newRow.appendChild(td3);

  // Quatrième cellule avec la section des biens
  const td4 = document.createElement("td");
  td4.id = "totalGoods";
  td4.colSpan = 2;

  const div = document.createElement("div");
  div.style.display = "grid";
  div.style.gridAutoFlow = "column";
  div.style.gridTemplateRows = "repeat(3, auto)";
  div.style.gap = "0 15px";
  div.style.width = "max-content";
  div.style.justifyContent = "start";

  for (let i = 0; i < 3; i++) {
    const divItem = document.createElement("div");
    const img = document.createElement("img");
    img.src = "/images/thumb/3/36/Goods.png/25px-Goods.png";
    img.width = 25;
    img.height = 25;
    divItem.appendChild(img);
    divItem.appendChild(document.createTextNode(" 0"));
    div.appendChild(divItem);
  }

  td4.appendChild(div);
  newRow.appendChild(td4);

  // Ajoute la nouvelle ligne dans le tbody de la table
  table.querySelector("tbody")?.appendChild(newRow);
}

// Reset values ​​to zero without deleting the row
function resetTotalRow(table: HTMLTableElement) {
  if (!table) return;

  const totalRessources = table.querySelector("#totalRessources");
  const totalGoods = table.querySelector("#totalGoods");

  if (totalRessources) {
    totalRessources.textContent = "";

    const resources = [
      { alt: "PR", src: "/images/thumb/2/20/Research.png/25px-Research.png" },
      { alt: "Gold", src: "/images/thumb/6/6d/Coin.png/25px-Coin.png" },
      { alt: "Food", src: "/images/thumb/c/c6/Food.png/25px-Food.png" },
    ];

    resources.forEach(({ alt, src }) => {
      const img = document.createElement("img");
      img.src = src;
      img.alt = alt;
      img.width = 25;
      img.height = 25;

      totalRessources.appendChild(img);
      totalRessources.appendChild(document.createTextNode(" 0"));
      totalRessources.appendChild(document.createElement("br"));
    });
  }

  if (totalGoods) {
    totalGoods.textContent = "";

    const container = document.createElement("div");
    container.style.display = "grid";
    container.style.gridAutoFlow = "column";
    container.style.gridTemplateRows = "repeat(3, auto)";
    container.style.gap = "0 15px";
    container.style.width = "max-content";
    container.style.justifyContent = "start";

    for (let i = 0; i < 3; i++) {
      const div = document.createElement("div");

      const img = document.createElement("img");
      img.src = "/images/thumb/3/36/Goods.png/25px-Goods.png";
      img.width = 25;
      img.height = 25;

      div.appendChild(img);
      div.appendChild(document.createTextNode(" 0"));
      container.appendChild(div);
    }

    totalGoods.appendChild(container);
  }
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

function updateTotalRessources(totalRessources: {
  research: number;
  gold: number;
  food: number;
}) {
  const cellRessources = document.getElementById("totalRessources");
  if (!cellRessources) return;

  // remove the content
  cellRessources.textContent = "";

  const ressources = [
    {
      src: "/images/thumb/2/20/Research.png/25px-Research.png",
      alt: "Research.png",
      value: totalRessources.research,
    },
    {
      src: "/images/thumb/6/6d/Coin.png/25px-Coin.png",
      alt: "Coin.png",
      value: formatNumber(totalRessources.gold),
    },
    {
      src: "/images/thumb/c/c6/Food.png/25px-Food.png",
      alt: "Food.png",
      value: formatNumber(totalRessources.food),
    },
  ];

  ressources.forEach(({ src, alt, value }) => {
    const img = document.createElement("img");
    img.src = src;
    img.alt = alt;
    img.width = 25;
    img.height = 25;
    img.decoding = "async";
    img.loading = "lazy";

    const textNode = document.createTextNode(` ${value}`);
    const br = document.createElement("br");

    cellRessources.appendChild(img);
    cellRessources.appendChild(textNode);
    cellRessources.appendChild(br);
  });
}

function updateTotalGoods(
  totalGoods: Record<string, { value: number; src: string }>
) {
  const cellGoods = document.getElementById("totalGoods");
  if (!cellGoods) return;

  const rows = Object.keys(totalGoods).length > 18 ? 4 : 3;

  // Clear previous content using replaceChildren (optimized and simple)
  cellGoods.replaceChildren();

  // Create a div to hold the grid content
  const gridContainer = document.createElement("div");
  gridContainer.style.display = "grid";
  gridContainer.style.gridAutoFlow = "column";
  gridContainer.style.gridTemplateRows = `repeat(${rows}, auto)`;
  gridContainer.style.gap = "0 15px";
  gridContainer.style.width = "max-content";
  gridContainer.style.justifyContent = "start";

  // Loop through the totalGoods object and create individual divs
  Object.keys(totalGoods).forEach((key) => {
    const { value, src } = totalGoods[key];

    // Create the inner div for each good
    const divItem = document.createElement("div");

    // Create the image
    const img = document.createElement("img");
    img.src = src;
    img.width = 25;
    img.height = 25;

    // Create the value text
    const valueText = document.createTextNode(
      ` ${value.toLocaleString("en-US")}`
    );

    // Append the image and value text to the div
    divItem.appendChild(img);
    divItem.appendChild(valueText);

    // Append the divItem to the grid container
    gridContainer.appendChild(divItem);
  });

  // Append the grid container to the cellGoods
  cellGoods.appendChild(gridContainer);
}

function calculerTotal() {
  const selectedRows = document.querySelectorAll(".checkbox-selection:checked");

  let totalGoods: Record<string, { value: number; src: string }> = {};
  let totalResources = {
    research: 0,
    gold: 0,
    food: 0,
  };

  selectedRows.forEach((checkbox) => {
    const row = checkbox.closest("tr");
    if (!row) return;

    const resourceData = extractResources(row);
    const goodsData = extractGoods(row);

    Object.keys(goodsData).forEach((key) => {
      if (totalGoods[key]) {
        totalGoods[key].value += goodsData[key].value;
      } else {
        totalGoods[key] = { ...goodsData[key] };
      }
    });

    totalResources.research += resourceData.research;
    totalResources.gold += resourceData.gold;
    totalResources.food += resourceData.food;
  });

  updateTotalRessources(totalResources);
  updateTotalGoods(totalGoods);
}

// Use
export function useTechno() {
  const technoTable = findTechnoTable() as HTMLTableElement;
  if (!technoTable) return;

  addCheckboxColumn(technoTable);
  addTotalRow(technoTable);

  const checkboxes = technoTable.querySelectorAll<HTMLInputElement>(
    ".checkbox-selection"
  );
  const selectAllCheckbox = document.getElementById(
    "checkboxSelectAll"
  ) as HTMLInputElement | null;

  const updateTotal = () => {
    const totalRow = technoTable.querySelector("#totalRow");
    const checkedBoxes = Array.from(checkboxes).filter((cb) => cb.checked);

    checkedBoxes.length > 0
      ? calculerTotal()
      : totalRow
      ? resetTotalRow(technoTable)
      : addTotalRow(technoTable);
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
