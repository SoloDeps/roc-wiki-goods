import { browser } from "wxt/browser";
import { useState, useEffect } from "react";
import type { Era } from "@/lib/constants";
import { buildingsAbbr, eras, WIKI_URL } from "@/lib/constants";
import EraSelector from "@/components/popup/era-selector";
import PopupHeader from "@/components/popup/header";
import BuildingSelector from "@/components/building/building-selector";

function App() {
  const [selections, setSelections] = useState(() => {
    const savedData = localStorage.getItem("buildingSelections");
    return savedData
      ? JSON.parse(savedData)
      : buildingsAbbr.map(() => ["", "", ""]);
  });

  const [era, setEra] = useState<Era | null>(() => {
    const saved = localStorage.getItem("eraSelection");
    if (saved) {
      const abbr = JSON.parse(saved);
      return eras.find((e) => e.abbr === abbr) ?? null;
    }
    return null;
  });

  const [isAllowedSite, setIsAllowedSite] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    browser.tabs.query({ active: true, currentWindow: true }).then((tabs) => {
      if (tabs.length > 0 && tabs[0].url) {
        let url = new URL(tabs[0].url);
        if (url.hostname === WIKI_URL) {
          setIsAllowedSite(true);
        }
      }
      setLoading(false);
    });
  }, []);

  if (loading) {
    return <div className="p-4">Loading...</div>;
  }

  if (!isAllowedSite) {
    return (
      <div className="bg-red-50 text-red-500 p-4">
        <div className="flex">
          <div className="shrink-0">
            <svg
              className="size-5"
              data-slot="icon"
              fill="currentColor"
              viewBox="0 0 16 16"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <path
                clip-rule="evenodd"
                fill-rule="evenodd"
                d="M8 15A7 7 0 1 0 8 1a7 7 0 0 0 0 14Zm2.78-4.22a.75.75 0 0 1-1.06 0L8 9.06l-1.72 1.72a.75.75 0 1 1-1.06-1.06L6.94 8 5.22 6.28a.75.75 0 0 1 1.06-1.06L8 6.94l1.72-1.72a.75.75 0 1 1 1.06 1.06L9.06 8l1.72 1.72a.75.75 0 0 1 0 1.06Z"
              ></path>
            </svg>
          </div>
          <div className="ml-1.5">
            <h3 className="text-sm font-medium">
              The extension can only be opened on{" "}
              <a
                href="#"
                className="text-red-700 underline cursor-pointer transition duration-200"
                onClick={async (e) => {
                  e.preventDefault();
                  await browser.tabs.create({
                    url: "https://" + WIKI_URL,
                  });
                }}
              >
                {WIKI_URL}
              </a>
              .
            </h3>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <PopupHeader />

      <div className="px-4 border-b border">
        {buildingsAbbr.map((group, index) => (
          <BuildingSelector
            key={index}
            title={group.title}
            buildings={group.buildings}
            index={index}
            selections={selections}
            setSelections={setSelections}
          />
        ))}
      </div>

      <div className="px-4 pb-4">
        <EraSelector eras={eras} eraSelected={era} setEraSelected={setEra} />
        <div className="flex gap-1.5 pt-2 text-[13px] italic">
          <span className="font-semibold">New:</span>Display event quest data
          automatically based on your current era.
        </div>
      </div>
    </>
  );
}

export default App;
