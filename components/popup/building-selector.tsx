import { useEffect, useState } from "react";
import { storage } from "#imports";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getGoodsImg } from "@/lib/utils";
import { RotateCw } from "lucide-react";

type BuildingSelectorType = {
  title: string;
  buildings: string[];
  index: number;
  selections: string[][];
};

export function BuildingSelector({
  title,
  buildings,
  index,
  selections,
}: BuildingSelectorType) {
  const [primary, setPrimary] = useState(selections[index]?.[0] || "");
  const [secondary, setSecondary] = useState(selections[index]?.[1] || "");
  const [tertiary, setTertiary] = useState(selections[index]?.[2] || "");

  // Synchroniser l'état local avec les props
  useEffect(() => {
    setPrimary(selections[index]?.[0] || "");
    setSecondary(selections[index]?.[1] || "");
    setTertiary(selections[index]?.[2] || "");
  }, [selections, index]);

  const updateSelectionsLocal = async (
    pri: string,
    sec: string,
    ter: string
  ) => {
    const newSelections = [...selections];
    newSelections[index] = [pri, sec, ter];

    await storage.setItem(
      "local:buildingSelections",
      JSON.stringify(newSelections)
    );
  };

  const secondaryOptions = primary
    ? buildings.filter((b) => b !== primary)
    : [];

  const tertiaryOptions = secondary
    ? buildings.filter((b) => b !== primary && b !== secondary)
    : [];

  const resetAllFields = () => {
    setPrimary("");
    setSecondary("");
    setTertiary("");
    updateSelectionsLocal("", "", "");
  };

  // Éviter la boucle infinie en ajoutant les dépendances correctes
  useEffect(() => {
    if (secondary) {
      const ter = tertiaryOptions[0] || "";
      if (tertiary !== ter) {
        setTertiary(ter);
        updateSelectionsLocal(primary, secondary, ter);
      }
    }
  }, [secondary, primary]); // Retirer tertiaryOptions et tertiary des deps

  useEffect(() => {
    if (primary) {
      updateSelectionsLocal(primary, secondary, tertiary);
    }
  }, [primary]); // Ne déclencher que quand primary change

  return (
    <div className="pt-3 not-last:border-b border-alpha-400 md:min-w-[600px]">
      {/* Title + reset */}
      <div className="flex justify-between items-center h-4">
        <h2 className="block text-xs font-medium">{title}</h2>
        {primary && (
          <button
            onClick={resetAllFields}
            className="flex gap-1.5 items-center text-neutral-400 hover:text-neutral-300"
          >
            <RotateCw className="size-4" />
            <span className="text-xs">Reset</span>
          </button>
        )}
      </div>

      <div className="flex space-x-4 pt-3 pb-4">
        {/* PRIMARY */}
        <Select
          value={primary}
          onValueChange={(value) => {
            setPrimary(value);
            setSecondary("");
            setTertiary("");
          }}
        >
          <SelectTrigger className="md:min-w-44 w-full h-8 text-xs">
            <SelectValue placeholder="Select Primary" />
          </SelectTrigger>

          <SelectContent>
            {buildings.map((name) => (
              <SelectItem key={name} value={name}>
                <div className="flex items-center gap-2 text-xs">
                  <img
                    src={getGoodsImg(name)}
                    alt=""
                    className="size-[1.4rem] brightness-110"
                  />
                  {name}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* SECONDARY */}
        <Select
          value={secondary}
          onValueChange={setSecondary}
          disabled={!primary}
        >
          <SelectTrigger className="md:min-w-44 w-full h-8 text-xs">
            <SelectValue placeholder="Select Secondary" />
          </SelectTrigger>

          <SelectContent>
            {secondaryOptions.map((name) => (
              <SelectItem key={name} value={name}>
                <div className="flex items-center gap-2 text-xs">
                  <img
                    src={getGoodsImg(name)}
                    alt=""
                    className="size-[1.4rem] brightness-110"
                  />
                  {name}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* TERTIARY (read-only) */}
        <Select value={tertiary} disabled={!secondary}>
          <SelectTrigger className="md:min-w-44 w-full h-8 text-xs">
            <SelectValue placeholder="Select Tertiary" />
          </SelectTrigger>

          <SelectContent>
            {tertiary && (
              <SelectItem value={tertiary}>
                <div className="flex items-center gap-2 text-xs">
                  <img
                    src={getGoodsImg(tertiary)}
                    alt=""
                    className="size-[1.4rem] brightness-110"
                  />
                  {tertiary}
                </div>
              </SelectItem>
            )}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}