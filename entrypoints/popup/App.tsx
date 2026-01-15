import { browser } from "#imports";
import { useState, useEffect } from "react";

import { PopupHeader } from "@/components/popup/header";
import { EraSelector } from "@/components/popup/era-selector";
import { BuildingSelectorGroup } from "@/components/popup/building-selector-group";
import { ExportGameData } from "@/components/popup/export-game-data";

function App() {
  const [isGameSite, setIsGameSite] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    browser.tabs.query({ active: true, currentWindow: true }).then((tabs) => {
      if (tabs.length > 0 && tabs[0].url) {
        let url = new URL(tabs[0].url);

        if (url.origin.includes("riseofcultures.com")) {
          setIsGameSite(true);
        }
      }
      setLoading(false);
    });
  }, []);

  if (loading) {
    return <div className="bg-background size-0" />;
  }

  return (
    <>
      <PopupHeader isGameSite={isGameSite} />

      {isGameSite ? (
        <ExportGameData />
      ) : (
        <>
          <BuildingSelectorGroup />

          <div className="px-4 pb-4">
            <EraSelector />
            <div className="flex gap-1.5 pt-2 text-[13px] italic">
              <span className="font-semibold">Info:</span>Display event quest
              data automatically based on your current era.
            </div>
          </div>
        </>
      )}
    </>
  );
}

export default App;
