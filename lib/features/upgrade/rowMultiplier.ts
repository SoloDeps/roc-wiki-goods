// lib/upgrade/rowMultiplier.ts
import { formatColumns, skipColumns } from "@/lib/constants";
import { formatNumber, parseNumber } from "@/lib/utils";

export function multiplyRowTextContent(
  row: HTMLTableRowElement,
  multiplier: number
) {
  const cells = Array.from(row.cells);

  // Toujours récupérer le vrai header
  const headerRow = row.closest("table")?.querySelector("tr");
  if (!headerRow) return;

  const columnMap: Record<number, string> = {};
  Array.from(headerRow.cells).forEach((th, i) => {
    columnMap[i] = th.textContent?.trim().toLowerCase() || "";
  });

  cells.forEach((cell, i) => {
    const columnName = columnMap[i];
    if (!columnName) return;
    if (skipColumns.includes(columnName)) return;

    cell.childNodes.forEach((node) => {
      if (node.nodeType !== Node.TEXT_NODE) return;

      const textNode = node as Text;

      // Stockage immuable
      if ((textNode as any).dataOriginal === undefined) {
        (textNode as any).dataOriginal = textNode.textContent ?? "";
      }

      const original = (textNode as any).dataOriginal as string;

      const newText = original.replace(
        /(\d{1,3}(?:[.,]\d{1,3})*(?:\.\d+)?)(?:\s*([KM]))?/gi,
        (_m, num, suffix) => {
          const parsed = parseNumber(num + (suffix ?? ""));
          if (isNaN(parsed)) return _m;

          const total = parsed * multiplier;

          if (formatColumns.includes(columnName)) {
            return formatNumber(total);
          }

          return total.toLocaleString("en-US");
        }
      );

      textNode.textContent = newText;
    });
  });
}
