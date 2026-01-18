import { filterTables } from "@/lib/utils";
import { enhanceTables } from "./tableEnhancer";

export function useUpgrade(tables: HTMLTableElement[]) {
  const filtered = filterTables(tables, ["construction", "upgrade"]);
  if (!filtered.length) return;
  enhanceTables(filtered);
}
