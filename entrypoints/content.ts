import { storage } from "#imports";
import { EraAbbr } from "@/lib/constants";
import {
  useTechno,
  useWonders,
  useBuilding,
  useQuestlines,
} from "@/lib/features";
import { useUpgrade } from "@/lib/features/upgrade/index";
import { replaceTextByImage, isValidData } from "@/lib/utils";
import { type BuildingEntity, type TechnoEntity } from "@/lib/storage/dexie";
import { multiplyRowTextContent } from "@/lib/features/upgrade/rowMultiplier";
import { detectEraRow } from "@/lib/features/upgrade/eraDetector";
import { getTitlePage } from "@/lib/utils";
import {
  ApiConfig,
  injectTokenCapture,
  listenForToken,
} from "@/lib/roc/tokenCapture";
import {
  flattenAndSortTechnos,
  getBuildings,
  getTechnos,
  watchBuildings,
  watchTechnos,
} from "@/lib/overview/storage";

const isGameSite = () =>
  window.location.hostname.includes("riseofcultures.com");
const isWikiSite = () => window.location.hostname.includes("wiki.gg");

export default defineContentScript({
  matches: ["*://*.riseofcultures.wiki.gg/*", "*://*.riseofcultures.com/*"],
  runAt: "document_end",
  async main() {
    if (isGameSite()) {
      await setupGameSite();
      return;
    }

    if (isWikiSite()) {
      await setupWikiSite();
    }
  },
});

// game site logic
async function setupGameSite() {
  await injectTokenCapture();
  listenForToken();

  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === "API_REQUEST") {
      handleApiRequest(message.endpoint, message.options)
        .then((data) => {
          chrome.runtime
            .sendMessage({
              type: "DATA_SAVED",
              success: true,
              endpoint: message.endpoint,
            })
            .catch((err) => console.error("[RoC] Badge message error:", err));
          sendResponse({ data });
        })
        .catch((error) => {
          chrome.runtime
            .sendMessage({ type: "DATA_ERROR", error: error.message })
            .catch((err) => console.error("[RoC] Error message error:", err));
          sendResponse({ error: error.message });
        });
      return true;
    }
  });

  async function handleApiRequest(endpoint: string, options: RequestInit = {}) {
    const result = await chrome.storage.local.get(["apiConfig"]);
    const config = result.apiConfig as ApiConfig;

    if (!config) throw new Error("API config unavailable");

    const url = endpoint.startsWith("http")
      ? endpoint
      : `${config.apiServer}${endpoint}`;
    console.log("[RoC Content] API request to:", url);

    const response = await fetch(url, {
      ...options,
      headers: {
        accept: "application/json",
        "accept-language": config.acceptLanguage,
        "content-type": "application/json",
        "x-auth-token": config.authToken,
        "x-clientversion": config.clientVersion,
        "x-platform": config.platform,
        "x-os": config.os,
        "x-appstore": config.appStore,
        ...options.headers,
      },
      credentials: "include",
    });

    if (!response.ok) throw new Error(`API error ${response.status}`);
    return response.json();
  }
}

// wiki site logic
async function setupWikiSite() {
  const storedBuildingsData = await storage.getItem<string>(
    "local:buildingSelections",
  );
  const storedEraData = await storage.getItem<string>("local:eraSelection");

  let storedBuildings: string[][] = [];
  let storedEra: EraAbbr | null = null;

  if (storedBuildingsData && isValidData(storedBuildingsData)) {
    storedBuildings = JSON.parse(storedBuildingsData);
    replaceTextByImage(storedBuildings);
  }

  if (storedEraData && isValidData(storedEraData)) {
    storedEra = JSON.parse(storedEraData);
  }

  // watch for changes and reload if needed
  storage.watch<string | null>(
    "local:buildingSelections",
    (data: string | null) => {
      if (!data) return;

      try {
        const newBuildings: string[][] = JSON.parse(data);
        const isFull = (arr: string[]) => arr.every((item) => item !== "");
        const isEmpty = (arr: string[]) => arr.every((item) => item === "");
        const fullCount = newBuildings.filter(isFull).length;
        const hasPartial = newBuildings.some(
          (arr) => !isFull(arr) && !isEmpty(arr),
        );

        if (fullCount >= 2 && !hasPartial) {
          console.log(`Reloading: ${fullCount} tables full`);
          location.reload();
        }
      } catch (error) {
        console.error("Error parsing building data:", error);
      }
    },
  );

  storage.watch<string | null>("local:eraSelection", (data: string | null) => {
    if (!data) return;

    try {
      const newEra: EraAbbr = JSON.parse(data);
      if (storedEra !== undefined && storedEra !== newEra) {
        location.reload();
      }
      storedEra = newEra;
    } catch (error) {
      console.error("Error parsing era data:", error);
    }
  });

  // initialize features
  const tables = Array.from(
    document.querySelectorAll("table.article-table"),
  ) as HTMLTableElement[];
  await useTechno(tables);
  useUpgrade(tables);
  useBuilding(storedBuildings);
  useWonders(tables);
  useQuestlines(storedEra, storedBuildings);

  // observe table changes
  setupTableObserver();

  // sync from options to wiki
  setupBuildingsSync();
  setupTechnosSync();
}

function setupTableObserver() {
  const observer = new MutationObserver(async (mutations) => {
    let shouldReapply = false;

    for (const mutation of mutations) {
      if (mutation.type === "childList") {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            const element = node as Element;
            if (
              element.tagName === "TABLE" &&
              element.classList.contains("article-table")
            ) {
              shouldReapply = true;
            }
            if (element.querySelectorAll?.("table.article-table").length) {
              shouldReapply = true;
            }
          }
        });
      }
    }

    if (shouldReapply) {
      console.log("Tables changed, reapplying useTechno...");
      const tables = Array.from(
        document.querySelectorAll("table.article-table"),
      ) as HTMLTableElement[];
      await useTechno(tables);
    }
  });

  const mainContent =
    document.querySelector("#mw-content-text") || document.body;
  observer.observe(mainContent, { childList: true, subtree: true });

  // URL change observer
  let lastUrl = window.location.pathname;
  const urlObserver = new MutationObserver(async () => {
    const currentUrl = window.location.pathname;
    if (currentUrl !== lastUrl) {
      lastUrl = currentUrl;
      console.log("URL changed, reapplying useTechno...");
      setTimeout(async () => {
        const tables = Array.from(
          document.querySelectorAll("table.article-table"),
        ) as HTMLTableElement[];
        await useTechno(tables);
      }, 500);
    }
  });

  urlObserver.observe(document.body, { childList: true, subtree: true });
}

function setupBuildingsSync() {
  watchBuildings(async () => {
    const buildingsData = await getBuildings();
    const savedIds = new Set(buildingsData.map((b: BuildingEntity) => b.id));

    document.querySelectorAll("table.article-table").forEach((table) => {
      const rows = Array.from(table.querySelectorAll("tr"));
      let currentEra = "";
      const tableType =
        table.getAttribute("data-table-type") ||
        (table.querySelector("caption")?.textContent?.includes("Construction")
          ? "construction"
          : "upgrade");

      rows.forEach((row, index) => {
        const cells = Array.from(row.children).filter(
          (cell) => cell.tagName.toLowerCase() === "td",
        ) as HTMLTableCellElement[];

        if (!cells.length) return;

        const era = detectEraRow(row);
        if (era) currentEra = era;

        const headerCells = Array.from(
          table.querySelector("tr")?.children || [],
        );
        const levelIdx = headerCells.findIndex(
          (cell) => cell.textContent?.trim().toLowerCase() === "level",
        );
        const levelText =
          levelIdx >= 0 && cells[levelIdx]
            ? cells[levelIdx].textContent?.trim() || String(index)
            : String(index);

        const match = levelText.match(/(\d+)\s*$/);
        const level = match ? match[1] : levelText;
        const rowId = `${window.location.pathname}|${tableType}|${currentEra}|${level}`;

        const savedBuilding = buildingsData.find(
          (b: BuildingEntity) => b.id === rowId,
        );
        const checkbox = row.querySelector(
          "td:last-child input[type='checkbox']",
        ) as HTMLInputElement;

        if (checkbox && !row.hasAttribute("data-local-update")) {
          if (savedBuilding) {
            checkbox.checked = true;
            const controlCell =
              row.querySelector("td:last-child")?.previousElementSibling;
            if (controlCell) {
              const countSpan = controlCell.querySelector("span");
              if (
                countSpan &&
                countSpan.textContent !== savedBuilding.quantity.toString()
              ) {
                countSpan.textContent = savedBuilding.quantity.toString();
                multiplyRowTextContent(row, savedBuilding.quantity);
              }
            }
          } else if (checkbox.checked) {
            checkbox.checked = false;
            const controlCell =
              row.querySelector("td:last-child")?.previousElementSibling;
            if (controlCell) {
              const countSpan = controlCell.querySelector("span");
              if (countSpan) {
                countSpan.textContent = "1";
                multiplyRowTextContent(row, 1);
              }
            }
          }
        }
      });
    });
  });
}

function setupTechnosSync() {
  watchTechnos(async () => {
    const technosData = flattenAndSortTechnos(await getTechnos());
    const savedIds = new Set(technosData.map((t) => t.id));

    document.querySelectorAll("table.article-table").forEach((table) => {
      const firstCell = table.querySelector("tr > td");
      if (!firstCell || firstCell.textContent?.trim() !== "Technology") return;

      const rows = Array.from(table.querySelectorAll("tr"));
      rows.forEach((row, index) => {
        const cells = Array.from(row.children).filter(
          (cell) => cell.tagName.toLowerCase() === "td",
        ) as HTMLTableCellElement[];

        if (cells.length < 4) return;

        const [mainSection, subSection, thirdSection] = getTitlePage();
        const pagePath = [mainSection, subSection, thirdSection]
          .filter(Boolean)
          .join("_");
        const technoId = `techno_${pagePath}_${index}`;

        const checkbox = row.querySelector(
          ".checkbox-selection",
        ) as HTMLInputElement;
        if (checkbox && !row.hasAttribute("data-local-update")) {
          checkbox.checked = savedIds.has(technoId);
        }
      });

      // update total count
      const checkboxes = table.querySelectorAll(
        ".checkbox-selection",
      ) as NodeListOf<HTMLInputElement>;
      checkboxes.forEach((cb) => {
        if (cb.checked)
          cb.dispatchEvent(new Event("change", { bubbles: true }));
      });
    });
  });
}
