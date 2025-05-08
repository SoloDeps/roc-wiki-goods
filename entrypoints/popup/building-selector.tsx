import { useState, useEffect } from "react";
import { storage } from "wxt/storage";
import {
  Listbox,
  ListboxButton,
  ListboxOption,
  ListboxOptions,
} from "@headlessui/react";
import clsx from "clsx";
import { getGoodsImg } from "../lib/utils";

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

  const resetAllFields = () => {
    setPrimary("");
    setSecondary("");
    setTertiary("");
  };

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
      {/* title + reset button */}
      <div className="flex justify-between items-center h-4">
        <h2 className="block text-xs font-medium text-gray-900">{title}</h2>
        {primary && (
          <button
            className="flex gap-1.5 items-center cursor-pointer text-gray-400"
            onClick={() => resetAllFields()}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              className="size-3.5"
            >
              <path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8" />
              <path d="M21 3v5h-5" />
            </svg>
            <span className="block text-xs">Reset</span>
          </button>
        )}
      </div>

      {/* Dropdowns */}
      <div className="flex space-x-4 pt-3 pb-4">
        {/* Dropdown primary */}
        <div>
          <label
            htmlFor={`primary-${index}`}
            className="block text-xs text-gray-900"
          >
            Primary
          </label>

          <Listbox
            value={primary}
            onChange={(option) => {
              setPrimary(option);
              setSecondary("");
              setTertiary("");
            }}
          >
            <div className="relative mt-1 w-44">
              <ListboxButton className="block w-44 h-8 rounded-md border-0 py-1.5 pl-2.5 text-xs text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-blue-500 sm:text-sm sm:leading-6">
                <span className="flex items-center gap-2">
                  {primary ? (
                    <>
                      <img
                        src={getGoodsImg(primary)}
                        alt=""
                        className="size-5 select-none pointer-events-none"
                      />
                      <span className="select-none">{primary}</span>
                    </>
                  ) : (
                    <span className="text-gray-400 select-none">
                      Select Primary
                    </span>
                  )}
                </span>
                <svg
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  aria-hidden="true"
                  className="pointer-events-none absolute top-2 right-2 size-4 fill-gray-400"
                >
                  <path
                    fillRule="evenodd"
                    d="M5.23 7.21a.75.75 0 011.06.02L10 10.584l3.71-3.354a.75.75 0 111.02 1.1l-4.25 3.84a.75.75 0 01-1.02 0l-4.25-3.84a.75.75 0 01.02-1.1z"
                    clipRule="evenodd"
                  />
                </svg>
              </ListboxButton>

              <ListboxOptions
                anchor={{ to: "bottom", gap: 2 }}
                transition
                className={clsx(
                  "w-(--button-width) rounded-md my-0.5 border border-gray-200 bg-white p-1 focus:outline-none",
                  "transition duration-100 ease-in data-leave:data-closed:opacity-0"
                )}
              >
                {buildings.map((name) => (
                  <ListboxOption
                    key={name}
                    value={name}
                    className="group flex cursor-default items-center gap-2 rounded px-2 py-1.5 select-none data-focus:bg-blue-100"
                  >
                    <img
                      src={getGoodsImg(name)}
                      alt=""
                      className="size-5 select-none pointer-events-none"
                    />
                    <div className="text-xs text-gray-900">{name}</div>
                    <svg
                      fill="currentColor"
                      viewBox="0 0 16 16"
                      xmlns="http://www.w3.org/2000/svg"
                      aria-hidden="true"
                      className="invisible size-5 text-blue-500 group-data-selected:visible ml-auto"
                    >
                      <path
                        clipRule="evenodd"
                        fillRule="evenodd"
                        d="M12.416 3.376a.75.75 0 0 1 .208 1.04l-5 7.5a.75.75 0 0 1-1.154.114l-3-3a.75.75 0 0 1 1.06-1.06l2.353 2.353 4.493-6.74a.75.75 0 0 1 1.04-.207Z"
                      />
                    </svg>
                  </ListboxOption>
                ))}
              </ListboxOptions>
            </div>
          </Listbox>
        </div>

        {/* Dropdown secondary */}
        <div>
          <label
            htmlFor={`secondary-${index}`}
            className="block text-xs text-gray-900"
          >
            Secondary
          </label>

          <Listbox
            value={secondary}
            onChange={(option) => setSecondary(option)}
            disabled={!primary}
          >
            <div className="relative mt-1 w-44">
              <ListboxButton className="block w-44 h-8 rounded-md border-0 py-1.5 pl-2.5 text-xs text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-blue-500 sm:text-sm sm:leading-6">
                <span className="flex items-center gap-2">
                  {secondary ? (
                    <>
                      <img
                        src={getGoodsImg(secondary)}
                        alt=""
                        className="size-5 select-none pointer-events-none"
                      />
                      <span className="select-none">{secondary}</span>
                    </>
                  ) : (
                    <span className="text-gray-400 select-none">
                      Select Secondary
                    </span>
                  )}
                </span>
                <svg
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  aria-hidden="true"
                  className="pointer-events-none absolute top-2 right-2 size-4 fill-gray-400"
                >
                  <path
                    fillRule="evenodd"
                    d="M5.23 7.21a.75.75 0 011.06.02L10 10.584l3.71-3.354a.75.75 0 111.02 1.1l-4.25 3.84a.75.75 0 01-1.02 0l-4.25-3.84a.75.75 0 01.02-1.1z"
                    clipRule="evenodd"
                  />
                </svg>
              </ListboxButton>

              <ListboxOptions
                anchor={{ to: "bottom", gap: 2 }}
                transition
                className={clsx(
                  "w-(--button-width) rounded-md mb-5 border border-gray-200 bg-white p-1 focus:outline-none",
                  "transition duration-100 ease-in data-leave:data-closed:opacity-0"
                )}
              >
                {getSecondaryOptions().map((name) => (
                  <ListboxOption
                    key={name}
                    value={name}
                    className="group flex cursor-default items-center gap-2 rounded px-2 py-1.5 select-none data-focus:bg-blue-100"
                  >
                    <img
                      src={getGoodsImg(name)}
                      alt=""
                      className="size-5 select-none pointer-events-none"
                    />
                    <div className="text-xs text-gray-900">{name}</div>
                    <svg
                      fill="currentColor"
                      viewBox="0 0 16 16"
                      xmlns="http://www.w3.org/2000/svg"
                      aria-hidden="true"
                      className="invisible size-5 text-blue-500 group-data-selected:visible ml-auto"
                    >
                      <path
                        clipRule="evenodd"
                        fillRule="evenodd"
                        d="M12.416 3.376a.75.75 0 0 1 .208 1.04l-5 7.5a.75.75 0 0 1-1.154.114l-3-3a.75.75 0 0 1 1.06-1.06l2.353 2.353 4.493-6.74a.75.75 0 0 1 1.04-.207Z"
                      />
                    </svg>
                  </ListboxOption>
                ))}
              </ListboxOptions>
            </div>
          </Listbox>
        </div>

        {/* Dropdown tertiary */}
        <div>
          <label
            htmlFor={`tertiary-${index}`}
            className="block text-xs text-gray-900"
          >
            Tertiary
          </label>

          <div className="relative mt-1 w-44">
            <div className="flex items-center gap-2 mt-1 w-44 h-8 rounded-md border-0 py-1.5 pl-2.5 text-xs text-gray-900 ring-1 ring-inset ring-gray-300 select-none">
              {tertiary ? (
                <>
                  <img
                    src={getGoodsImg(tertiary)}
                    alt=""
                    className="size-5 select-none pointer-events-none"
                  />{" "}
                </>
              ) : null}
              <div
                className={clsx(
                  "bg-transparent border-none outline-none flex-1 text-xs",
                  tertiary ? "text-gray-900" : "text-gray-400"
                )}
              >
                {tertiary || "Select Tertiary"}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
