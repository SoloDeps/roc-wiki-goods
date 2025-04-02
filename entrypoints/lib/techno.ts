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
  // Add "Calculator" legend in first row
  const firstRow = table.querySelector("tr:first-child");
  if (firstRow) {
    firstRow.insertAdjacentHTML(
      "afterbegin",
      `<td style="text-align: center; white-space: normal;">Calculator</td>`
    );
  }

  // Add checkbox column in each row (except first row)
  const rows = table.querySelectorAll("tr:not(:first-child)");
  rows.forEach((row) => {
    row.insertAdjacentHTML(
      "afterbegin",
      `<td style="text-align: center; white-space: normal;">
      <input type="checkbox" class="checkbox-selection" style="transform: scale(1.25);">
    </td>`
    );
  });
}

function addTotalRow(table: HTMLTableElement) {
  const newRow = document.createElement("tr");
  newRow.id = "totalRow";
  newRow.style.background = "rgba(36, 89, 113, 1)";
  newRow.style.height = "100px";

  newRow.insertAdjacentHTML(
    "beforeend",
    `
    <td style="text-align: center; white-space: normal;">
      <input type="checkbox" id="checkboxSelectAll" name="checkboxSelectAll" style="transform: scale(1.25);">
      <br><label for="checkboxSelectAll">All</label>
    </td>
    <td style="text-align: center; font-weight: bold;">Total<br>Selection</td>
    <td id="totalRessources">
      <img alt="PR" src="/images/thumb/2/20/Research.png/25px-Research.png" decoding="async" loading="lazy" width="25" height="25" data-file-width="239" data-file-height="239"> 0<br>
      <img alt="Gold" src="/images/thumb/6/6d/Coin.png/25px-Coin.png" decoding="async" loading="lazy" width="25" height="25" data-file-width="119" data-file-height="119"> 0<br>
      <img alt="Food" src="/images/thumb/c/c6/Food.png/25px-Food.png" decoding="async" loading="lazy" width="25" height="25" data-file-width="120" data-file-height="120"> 0
    </td>
    <td id="totalGoods" colspan="2">
      <div style="display: grid; grid-auto-flow: column; grid-template-rows: repeat(3, auto); gap: 0 15px; width: max-content; justify-content: start;">
        <div>
          <img src="/images/thumb/3/36/Goods.png/25px-Goods.png" width="25" height="25"> 0
        </div>
        <div>
          <img src="/images/thumb/3/36/Goods.png/25px-Goods.png" width="25" height="25"> 0
        </div>
        <div>
          <img src="/images/thumb/3/36/Goods.png/25px-Goods.png" width="25" height="25"> 0
        </div>
      </div>
    </td>
  `
  );

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

  cellRessources.innerHTML = `
    <img alt="Research.png" src="/images/thumb/2/20/Research.png/25px-Research.png" decoding="async" loading="lazy" width="25" height="25" data-file-width="239" data-file-height="239"> 
    ${totalRessources.research}
    <br>
    <img alt="Coin.png" src="/images/thumb/6/6d/Coin.png/25px-Coin.png" decoding="async" loading="lazy" width="25" height="25" data-file-width="119" data-file-height="119">
    ${formatNumber(totalRessources.gold)}
    <br>
    <img alt="Food.png" src="/images/thumb/c/c6/Food.png/25px-Food.png" decoding="async" loading="lazy" width="25" height="25" data-file-width="120" data-file-height="120">
    ${formatNumber(totalRessources.food)}
  `;
}

function updateTotalGoods(
  totalGoods: Record<string, { value: number; src: string }>
) {
  const cellGoods = document.getElementById("totalGoods");
  if (!cellGoods) return;

  const rows = Object.keys(totalGoods).length > 18 ? 4 : 3;

  let content = `
    <div style="display: grid; grid-auto-flow: column; grid-template-rows: repeat(${rows}, auto); gap: 0 15px; width: max-content; justify-content: start;">
  `;

  Object.keys(totalGoods).forEach((key) => {
    const { value, src } = totalGoods[key];
    content += `
      <div>
        <img src="${src}" width="25" height="25"> ${value.toLocaleString(
      "en-US"
    )}
      </div>
    `;
  });

  content += `</div>`;

  // Use insertAdjacentHTML for better security
  cellGoods.innerHTML = ""; // Clear previous content first
  cellGoods.insertAdjacentHTML("beforeend", content);
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
