import { useEffect, useState } from "react";
import { storage } from "#imports";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import clsx from "clsx";
import { getGoodsImg } from "@/lib/utils";
import { RotateCw } from "lucide-react";

type BuildingSelectorType = {
  title: string;
  buildings: string[];
  index: number;
  selections: string[][];
  setSelections: (newSelections: string[][]) => void | Promise<void>;
};

export default function BuildingSelector({
  title,
  buildings,
  index,
  selections,
  setSelections,
}: BuildingSelectorType) {
  const [primary, setPrimary] = useState(selections[index]?.[0] || "");
  const [secondary, setSecondary] = useState(selections[index]?.[1] || "");
  const [tertiary, setTertiary] = useState(selections[index]?.[2] || "");

  const updateSelections = async (pri: string, sec: string, ter: string) => {
    const newSelections = [...selections];
    // @ts-ignore
    newSelections[index] = [pri, sec, ter];
    setSelections(newSelections);

    localStorage.setItem("buildingSelections", JSON.stringify(newSelections));
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
    updateSelections("", "", "");
  };

  useEffect(() => {
    const ter = tertiaryOptions[0] || "";
    setTertiary(ter);
    updateSelections(primary, secondary, ter);
  }, [secondary]);

  useEffect(() => {
    updateSelections(primary, secondary, tertiary);
  }, [primary]);

  return (
    <div className="pt-3 not-last:border-b">
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
          <SelectTrigger className="w-44 h-8 text-xs">
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
          <SelectTrigger className="w-44 h-8 text-xs">
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
          <SelectTrigger className="w-44 h-8 text-xs ">
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
