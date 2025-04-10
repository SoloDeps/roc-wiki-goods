import { useState, useEffect } from "react";
import { buildingsAbbr, WIKI_URL } from "../lib/constants";
import BuildingSelector from "./building-selector";
import { browser } from "wxt/browser";

function App() {
  const [selections, setSelections] = useState(() => {
    const savedData = localStorage.getItem("buildingSelections");
    return savedData
      ? JSON.parse(savedData)
      : buildingsAbbr.map(() => ["", "", ""]);
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
    return <div className="p-4">Chargement...</div>;
  }

  if (!isAllowedSite) {
    return (
      <div className="bg-red-50 text-red-500 p-4">
        <div className="flex">
          <div className="flex-shrink-0">
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
              The extension is not available on this website.
            </h3>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4">
      {buildingsAbbr.map((group, index) => (
        <BuildingSelector
          key={index}
          buildings={group.buildings}
          index={index}
          selections={selections}
          setSelections={setSelections}
        />
      ))}
    </div>
  );
}

export default App;
