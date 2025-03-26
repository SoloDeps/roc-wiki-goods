import { buildingsAbbr, goodsUrlByEra } from "./constants";

export function getBuildingFromLocal(
  priority: string,
  era: string,
  buildings: string[][]
) {
  const priorityIndex = { primary: 0, secondary: 1, tertiary: 2 }[
    priority.toLocaleLowerCase()
  ];
  if (priorityIndex === undefined) return;

  const groupIndex = buildingsAbbr.findIndex((group) =>
    group.abbreviations.includes(era.toUpperCase())
  );
  if (groupIndex === -1) return;

  // console.log(buildings[groupIndex]?.[priorityIndex]);
  return buildings[groupIndex]?.[priorityIndex];
}

export function replaceTextByImage(buildings: []) {
  // console.log(buildings);
  const elements = document.querySelectorAll("td");

  if (!buildings || buildings.length === 0) {
    const elements = document.querySelectorAll("td");
    elements.forEach((el) => {
      el.innerHTML = el.innerHTML.replace(
        /(primary|secondary|tertiary):\s*([A-Z]{2})/gi,
        `<img src="/images/thumb/3/36/Goods.png/25px-Goods.png" alt="default_goods" decoding="async" loading="lazy" width="25" height="25">`
      );
    });
    return;
  }

  elements.forEach((el) => {
    el.innerHTML = el.innerHTML.replace(
      /(primary|secondary|tertiary):\s*([A-Z]{2})/gi,
      (_, priority, era) => {
        const building = getBuildingFromLocal(priority, era, buildings);
        const normalizedBuilding = building
          ? building.toLowerCase().replace(/\s+/g, "_")
          : "";
        // console.log(normalizedBuilding);

        // @ts-ignore
        const imgUrl =
          goodsUrlByEra[era]?.[normalizedBuilding] ||
          "/images/thumb/3/36/Goods.png/25px-Goods.png";
        // console.log(imgUrl);

        return `<img src="${imgUrl}" alt="${priority}_${era}" decoding="async" loading="lazy" width="25" height="25">`;
      }
    );
  });
}

// Technos part

// Fonction pour convertir le texte en nombre
export function parseNumber(value: string) {
  if (!value) return 0;

  let number = parseFloat(value.replace(/[^\d.]/g, "")); // Clean text and extract number
  if (value.includes("K")) number *= 1000;
  if (value.includes("M")) number *= 1000000;

  return number;
}

export function formatNumber(value) {
  if (value >= 1000000) {
    return (value / 1000000).toFixed(1).replace(/\.0$/, "") + " M";
  } else if (value >= 1000) {
    return (value / 1000).toFixed(1).replace(/\.0$/, "") + " K";
  }
  return value.toString();
}

// ============ Techno Table =================

export function findTechnoTable() {
  const tables = document.querySelectorAll("table.article-table");

  for (const table of tables) {
    const firstCell = table.querySelector("tr:first-child td:first-child");
    if (firstCell && firstCell.textContent?.trim() === "Technology") {
      return table;
    }
  }

  return;
}

export function addCheckboxColumn(table) {
  // Add "Calculator" legend in first row
  const firstRow = table.querySelector("tr:first-child");
  if (firstRow) {
    firstRow.innerHTML =
      `<td style="text-align: center; white-space: normal;">Calculator</td>` +
      firstRow.innerHTML;
  }

  // Add checkbox column in each rows (except first row)
  const rows = table.querySelectorAll("tr:not(:first-child)");
  rows.forEach((row) => {
    row.innerHTML =
      `<td style="text-align: center; white-space: normal;">
        <input type="checkbox" class="checkbox-selection" style="transform: scale(1.25);">
      </td>` + row.innerHTML;
  });
}

export function addTotalRow(table) {
  const newRow = document.createElement("tr");
  newRow.id = "totalRow";
  newRow.style = "background: rgba(36, 89, 113, 1); height: 100px;";

  newRow.innerHTML = `
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
  `;

  table.querySelector("tbody").appendChild(newRow);
}

export function resetTotalRow(table) {
  table.querySelector("#totalRessources").innerHTML = `
    <img alt="PR" src="/images/thumb/2/20/Research.png/25px-Research.png" width="25" height="25"> 0<br>
    <img alt="Gold" src="/images/thumb/6/6d/Coin.png/25px-Coin.png" width="25" height="25"> 0<br>
    <img alt="Food" src="/images/thumb/c/c6/Food.png/25px-Food.png" width="25" height="25"> 0
  `;
  table.querySelector("#totalGoods").innerHTML = `
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
  `;
}

export function extractResources(row) {
  const cell = row?.cells[2];
  if (!cell) return { research: 0, gold: 0, food: 0 };

  const values = [];
  cell.childNodes.forEach((node) => {
    if (node.nodeType === Node.TEXT_NODE) {
      const text = node.textContent.trim();
      if (text) values.push(text);
    }
  });
  // console.log(values);

  return {
    research: parseNumber(values[0]),
    gold: parseNumber(values[1]),
    food: parseNumber(values[2]),
  };
}

export function extractGoods(row) {
  const cell = row?.cells[3];
  if (!cell) return {};

  let goods = {};

  cell.querySelectorAll("img").forEach((img) => {
    const key = img.alt.trim();
    // const value = parseInt(img.nextSibling.textContent.trim(), 10) || 0;
    const rawValue = img.nextSibling.textContent.trim().replace(/,/g, ""); // Supprimer les virgules
    const value = parseInt(rawValue, 10) || 0;
    const src = img.src;

    if (goods[key]) {
      goods[key].value += value;
    } else {
      goods[key] = { value, src };
    }
  });

  return goods;
}

function updateTotalRessources(totalRessources) {
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

function updateTotalGoods(totalGoods) {
  const cellGoods = document.getElementById("totalGoods");
  const rows = Object.keys(totalGoods).length > 18 ? 4 : 3;
  console.log(rows)

  if (!cellGoods) return;

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

  cellGoods.innerHTML = content;
}

export function calculerTotal() {
  const selectedRows = document.querySelectorAll(".checkbox-selection:checked");

  let totalGoods = {};
  let totalResources = {
    research: 0,
    gold: 0,
    food: 0,
  };

  selectedRows.forEach((checkbox) => {
    const row = checkbox.closest("tr");
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
