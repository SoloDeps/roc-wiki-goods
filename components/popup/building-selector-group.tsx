import { useBuildingSelections } from "@/hooks/useBuildingSelections";
import { buildingsAbbr } from "@/lib/constants";
import { BuildingSelector } from "./building-selector";

export function BuildingSelectorGroup() {
  const selections = useBuildingSelections();

  return (
    <div className="px-4 border-y">
      {buildingsAbbr.map((group, index) => (
        <BuildingSelector
          key={index}
          title={group.title}
          buildings={group.buildings}
          index={index}
          selections={selections}
        />
      ))}
    </div>
  );
}