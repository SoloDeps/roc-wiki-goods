export function createSaveCell(rowId: string) {
  const td = document.createElement("td");
  const center = document.createElement("div");
  center.style.cssText =
    "display:flex;justify-content:center;align-items:center";

  const checkbox = document.createElement("input");
  checkbox.type = "checkbox";
  checkbox.style.cssText = "cursor:pointer;width:20px;height:20px";
  checkbox.dataset.rowId = rowId;

  center.appendChild(checkbox);
  td.appendChild(center);

  return { td, checkbox };
}
