import { useState, useEffect } from "react";
import { storage } from "wxt/storage";

type BuildingSelectorType = {
  title: string;
  buildings: string[];
  index: number;
  selections: string[];
  setSelections: React.Dispatch<React.SetStateAction<string[]>>;
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

    // storage for popup
    localStorage.setItem("buildingSelections", JSON.stringify(newSelections));

    //storage for browser content
    await storage.setItem(
      "local:buildingSelections",
      JSON.stringify(newSelections)
    );
  };

  const getSecondaryOptions = () =>
    primary ? buildings.filter((name) => name !== primary) : buildings;

  const getTertiaryOptions = () =>
    secondary
      ? buildings.filter((name) => name !== primary && name !== secondary)
      : [];

  useEffect(() => {
    const ter = getTertiaryOptions()[0] || "";
    setTertiary(ter);
    updateSelections(primary, secondary, ter);
  }, [secondary]);

  useEffect(() => {
    updateSelections(primary, secondary, tertiary);
  }, [primary]);

  return (
    <div className="pt-3 not-last:border-b border-neutral-300">
      <h2 className="block text-xs font-medium text-gray-900">{title}</h2>
      <div className="flex space-x-4 pt-3 pb-4">
        {/* Dropdown primary */}
        <div>
          <label
            htmlFor={`primary-${index}`}
            className="block text-xs  text-gray-900"
          >
            Primary
          </label>
          <select
            id={`primary-${index}`}
            value={primary}
            onChange={(e) => {
              const val = e.target.value;
              setPrimary(val);
              setSecondary("");
              setTertiary("");
            }}
            className="mt-1 block w-36 rounded-md border-0 py-1.5 pl-1.5 text-xs text-gray-900 ring-1  ring-gray-300 focus:ring-1 focus:ring-indigo-600 sm:text-sm sm:leading-6"
          >
            <option value="">Select Primary</option>
            {buildings.map((building, idx) => (
              <option key={idx} value={building}>
                {building}
              </option>
            ))}
          </select>
        </div>

        {/* Dropdown secondary */}
        <div>
          <label
            htmlFor={`secondary-${index}`}
            className="block text-xs text-gray-900"
          >
            Secondary
          </label>
          <select
            id={`secondary-${index}`}
            value={secondary}
            onChange={(e) => setSecondary(e.target.value)}
            disabled={!primary}
            className="mt-1 block w-36 rounded-md border-0 py-1.5 pl-1.5 text-xs text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-indigo-600 sm:text-sm sm:leading-6"
          >
            <option value="">Select Secondary</option>
            {getSecondaryOptions().map((building, idx) => (
              <option key={idx} value={building}>
                {building}
              </option>
            ))}
          </select>
        </div>

        {/* Dropdown tertiary */}
        <div>
          <label
            htmlFor={`tertiary-${index}`}
            className="block text-xs text-gray-900"
          >
            Tertiary
          </label>
          <input
            id={`tertiary-${index}`}
            value={tertiary}
            disabled
            className="mt-1 block w-36 rounded-md border-0 py-1.5 pl-1.5 text-xs text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-indigo-600 sm:text-sm sm:leading-6"
          />
        </div>
      </div>
    </div>
  );
}
