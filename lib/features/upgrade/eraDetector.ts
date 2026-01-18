import { eras } from "@/lib/constants";

export function detectEraRow(row: HTMLTableRowElement): string | null {
  const cells = Array.from(row.cells);

  if (cells.some((c) => c.hasAttribute("colspan"))) {
    const text = row.textContent?.trim() || "";
    const match = eras.find((era) =>
      text.toLowerCase().includes(era.name.toLowerCase())
    );
    return match?.abbr ?? null;
  }

  if (cells.length > 0) {
    const text = cells[0].textContent?.trim() || "";
    const match = eras.find((era) =>
      text.toLowerCase().includes(era.name.toLowerCase())
    );
    return match?.abbr ?? null;
  }

  return null;
}
