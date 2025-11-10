// EraSelector.tsx
import { useState, useEffect } from "react";
import { storage } from "wxt/storage";
import {
  Listbox,
  ListboxButton,
  ListboxOption,
  ListboxOptions,
} from "@headlessui/react";
import clsx from "clsx";
import { Era } from "@/lib/constants";

type EraSelectorType = {
  eras: readonly Era[];
  eraSelected: Era | null;
  setEraSelected: React.Dispatch<React.SetStateAction<Era | null>>;
};

export default function EraSelector({
  eras,
  eraSelected,
  setEraSelected,
}: EraSelectorType) {
  const [era, setEra] = useState<Era | null>(eraSelected ?? null);

  useEffect(() => {
    setEra(eraSelected);
  }, [eraSelected]);

  const updateEraSelection = async (selectedEra: Era) => {
    setEra(selectedEra);
    setEraSelected(selectedEra);

    localStorage.setItem("eraSelection", JSON.stringify(selectedEra.abbr));

    await storage.setItem(
      "local:eraSelection",
      JSON.stringify(selectedEra.abbr)
    );
  };

  return (
    <div className="pt-3">
      <div>
        <h2 className="block text-xs font-medium text-gray-900">
          Your current era
        </h2>
        <Listbox value={era ?? null} onChange={updateEraSelection}>
          <div className="relative mt-1 w-44">
            <ListboxButton className="block w-44 h-8 rounded-md border-0 py-1.5 pl-2.5 text-xs text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-blue-500 sm:text-sm sm:leading-6">
              <span className="flex items-center gap-2">
                {era ? (
                  <span className="select-none">{era.name}</span>
                ) : (
                  <span className="text-gray-400 select-none">
                    Select your current era
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
              {eras.map((eraOption) => (
                <ListboxOption
                  key={eraOption.abbr}
                  value={eraOption}
                  className="group flex cursor-default items-center gap-2 rounded px-2 py-1.5 select-none data-focus:bg-blue-100"
                >
                  <div className="text-xs text-gray-900">{eraOption.name}</div>
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
    </div>
  );
}
