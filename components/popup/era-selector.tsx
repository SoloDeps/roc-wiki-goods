import { useEffect } from "react";
import { storage } from "#imports";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Era } from "@/lib/constants";

type EraSelectorProps = {
  eras: readonly Era[];
  eraSelected: Era | null;
  setEraSelected: React.Dispatch<React.SetStateAction<Era | null>>;
};

export default function EraSelector({
  eras,
  eraSelected,
  setEraSelected,
}: EraSelectorProps) {
  const handleChange = async (abbr: string) => {
    const selectedEra = eras.find((e) => e.abbr === abbr);
    if (!selectedEra) return;

    setEraSelected(selectedEra);

    localStorage.setItem("eraSelection", JSON.stringify(selectedEra.abbr));
    await storage.setItem(
      "local:eraSelection",
      JSON.stringify(selectedEra.abbr)
    );
  };

  return (
    <div className="pt-3">
      <h2 className="block text-xs font-medium mb-1">
        Your current era
      </h2>

      <Select
        value={eraSelected?.abbr ?? ""}
        onValueChange={handleChange}
      >
        <SelectTrigger className="w-44 h-8 text-xs">
          <SelectValue placeholder="Select your current era" />
        </SelectTrigger>

        <SelectContent>
          {eras.map((era) => (
            <SelectItem
              key={era.abbr}
              value={era.abbr}
              className="text-xs"
            >
              {era.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}