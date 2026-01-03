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
import {
  loadSavedBuildings,
  loadSavedTechnos,
  type SavedData,
  type SavedTechnosData,
} from "@/lib/overview/storage";
import { multiplyRowTextContent } from "@/lib/features/upgrade/rowMultiplier";
import { detectEraRow } from "@/lib/features/upgrade/eraDetector";
import { getTitlePage } from "@/lib/utils";

export default defineContentScript({
  matches: ["*://*.riseofcultures.wiki.gg/*"],
  runAt: "document_end",
  async main() {
    // ========= IMAGE REPLACEMENT =========
    const storedBuildingsData = await storage.getItem<string>(
      "local:buildingSelections"
    );
    const storedEraData = await storage.getItem<string>("local:eraSelection");

    let storedBuildings: string[][] = [];
    if (storedBuildingsData && isValidData(storedBuildingsData)) {
      const buildings: string[][] = JSON.parse(storedBuildingsData);
      storedBuildings = buildings;
      replaceTextByImage(buildings);
    }

    let storedEra: EraAbbr | null = null;
    if (storedEraData && isValidData(storedEraData)) {
      storedEra = JSON.parse(storedEraData);
    }

    // ========= Page reload ========

    const unwatchBuildings = storage.watch<string | null>(
      "local:buildingSelections",
      (data: string | null) => {
        if (!data) {
          console.warn("Received null data");
          return;
        }

        try {
          const newBuildings: string[][] = JSON.parse(data);

          // Fonction qui vérifie si un sous-tableau est complètement rempli
          const isFull = (subArray: string[]) =>
            subArray.every((item) => item !== "");

          // Fonction qui vérifie si un sous-tableau est complètement vide
          const isEmpty = (subArray: string[]) =>
            subArray.every((item) => item === "");

          // Compter combien de sous-tableaux sont pleins
          const fullCount = newBuildings.filter(isFull).length;

          // Vérifier s'il y a un sous-tableau partiellement rempli
          const hasPartial = newBuildings.some(
            (subArray) => !isFull(subArray) && !isEmpty(subArray)
          );

          // Recharger uniquement si :
          // - Au moins 2 sous-tableaux sont pleins
          // - Aucun sous-tableau n'est partiellement rempli
          if (fullCount >= 2 && !hasPartial) {
            console.log(`Reloading page: ${fullCount} tables are full`);
            location.reload();
          }
        } catch (error) {
          console.error("Error parsing data:", error);
        }
      }
    );

    const unwatchEra = storage.watch<string | null>(
      "local:eraSelection",
      (data: string | null) => {
        if (!data) {
          console.warn("Received null era data");
          return;
        }

        try {
          const newEra: EraAbbr = JSON.parse(data);

          // Comparer la nouvelle valeur avec l'ancienne
          if (storedEra !== undefined && storedEra !== newEra) {
            // console.log( `Era changed from ${storedEra} to ${newEra}, reloading page`);
            location.reload();
          }

          // Mettre à jour la valeur précédente
          storedEra = newEra;
        } catch (error) {
          console.error("Error parsing era data:", error);
        }
      }
    );

    // ========= Techno/Upgrade Part =========

    const tables = Array.from(
      document.querySelectorAll("table.article-table")
    ) as HTMLTableElement[];

    await useTechno(tables);
    useUpgrade(tables);
    useBuilding(storedBuildings);
    useWonders(tables);

    useQuestlines(storedEra, storedBuildings);

    // ========= Observer les changements de page pour ré-exécuter useTechno =========

    const technoObserver = new MutationObserver(async (mutations) => {
      let shouldReapplyTechno = false;

      mutations.forEach((mutation) => {
        if (mutation.type === "childList") {
          // Vérifier si de nouvelles tables ont été ajoutées
          mutation.addedNodes.forEach((node) => {
            if (node.nodeType === Node.ELEMENT_NODE) {
              const element = node as Element;
              if (
                element.tagName === "TABLE" &&
                element.classList.contains("article-table")
              ) {
                shouldReapplyTechno = true;
              }
              // Vérifier si une table a été ajoutée dans les noeuds parents
              const tables = element.querySelectorAll?.("table.article-table");
              if (tables && tables.length > 0) {
                shouldReapplyTechno = true;
              }
            }
          });
        }
      });

      if (shouldReapplyTechno) {
        console.log("Tables changed, reapplying useTechno...");
        const currentTables = Array.from(
          document.querySelectorAll("table.article-table")
        ) as HTMLTableElement[];
        await useTechno(currentTables);
      }
    });

    // Observer les changements dans le contenu principal
    const mainContent =
      document.querySelector("#mw-content-text") || document.body;
    technoObserver.observe(mainContent, {
      childList: true,
      subtree: true,
    });

    // Aussi observer les changements d'URL (navigation)
    let lastUrl = window.location.pathname;
    const urlObserver = new MutationObserver(async () => {
      const currentUrl = window.location.pathname;
      if (currentUrl !== lastUrl) {
        lastUrl = currentUrl;
        console.log("URL changed, reapplying useTechno...");
        setTimeout(async () => {
          const currentTables = Array.from(
            document.querySelectorAll("table.article-table")
          ) as HTMLTableElement[];
          await useTechno(currentTables);
        }, 500); // Petit délai pour laisser le contenu se charger
      }
    });

    urlObserver.observe(document.body, {
      childList: true,
      subtree: true,
    });

    // ========= Synchronisation depuis Options vers Wiki =========

    storage.watch<SavedData>(
      "local:roc_saved_buildings",
      (newData: SavedData | null) => {
        if (!newData) return;

        // Créer un Set des IDs de buildings sauvegardés pour lookup rapide
        const savedBuildingIds = new Set(newData.buildings.map((b) => b.id));

        const tables = document.querySelectorAll("table.article-table");
        tables.forEach((table) => {
          const rows = Array.from(table.querySelectorAll("tr"));
          let currentEra = "";

          // Détecter le type de table (construction ou upgrade)
          const tableType =
            table.getAttribute("data-table-type") ||
            (table
              .querySelector("caption")
              ?.textContent?.includes("Construction")
              ? "construction"
              : "upgrade");

          rows.forEach((row, index) => {
            const cells = Array.from(row.children).filter(
              (cell) => cell.tagName.toLowerCase() === "td"
            ) as HTMLTableCellElement[];

            if (cells.length === 0) return;

            const era = detectEraRow(row);
            if (era) {
              currentEra = era;
            }

            const headerCells = Array.from(
              table.querySelector("tr")?.children || []
            );
            const levelColumnIndex = headerCells.findIndex(
              (cell) => cell.textContent?.trim().toLowerCase() === "level"
            );

            const levelText =
              levelColumnIndex >= 0 && cells[levelColumnIndex]
                ? cells[levelColumnIndex].textContent?.trim() || String(index)
                : String(index);

            const match = levelText.match(/(\d+)\s*$/);
            const level = match ? match[1] : levelText;

            const pageUrl = window.location.pathname;
            const rowId = `${pageUrl}|${tableType}|${currentEra}|${level}`;

            // Vérifier si ce building est dans les données sauvegardés
            const savedBuilding = newData.buildings.find((b) => b.id === rowId);
            const saveCell = row.querySelector("td:last-child");
            const checkbox = saveCell?.querySelector(
              "input[type='checkbox']"
            ) as HTMLInputElement;

            if (checkbox) {
              // Ignorer seulement si c'est une mise à jour locale du wiki
              const isLocalUpdate = row.hasAttribute("data-local-update");

              if (!isLocalUpdate) {
                if (savedBuilding) {
                  // Le building est sauvegardé : cocher la case et mettre à jour la quantité
                  checkbox.checked = true;

                  const controlCell =
                    row.querySelector("td:last-child")?.previousElementSibling;
                  if (controlCell) {
                    const countSpan = controlCell.querySelector("span");
                    if (
                      countSpan &&
                      countSpan.textContent !==
                        savedBuilding.quantity.toString()
                    ) {
                      countSpan.textContent = savedBuilding.quantity.toString();
                      multiplyRowTextContent(row, savedBuilding.quantity);
                    }
                  }
                } else {
                  // Le building n'est plus sauvegardé : décocher la case et réinitialiser
                  if (checkbox.checked) {
                    checkbox.checked = false;

                    const controlCell =
                      row.querySelector(
                        "td:last-child"
                      )?.previousElementSibling;
                    if (controlCell) {
                      const countSpan = controlCell.querySelector("span");
                      if (countSpan) {
                        countSpan.textContent = "1";
                        multiplyRowTextContent(row, 1);
                      }
                    }
                  }
                }
              }
            }
          });
        });
      }
    );

    // ========= Synchronisation des technologies depuis Options vers Wiki =========

    storage.watch<SavedTechnosData>(
      "local:roc_saved_technos",
      (newData: SavedTechnosData | null) => {
        if (!newData) return;

        // Créer un Set des IDs de technologies sauvegardés pour lookup rapide
        const savedTechnoIds = new Set<string>();
        Object.values(newData.technos).forEach((eraTechnos) => {
          Object.values(eraTechnos).forEach((techno) => {
            savedTechnoIds.add(techno.id);
          });
        });

        const tables = document.querySelectorAll("table.article-table");
        tables.forEach((table) => {
          // Vérifier si c'est une table de technologies
          const firstCell = table.querySelector("tr > td");
          if (
            firstCell &&
            firstCell.textContent &&
            firstCell.textContent.trim() === "Technology"
          ) {
            const rows = Array.from(table.querySelectorAll("tr"));

            rows.forEach((row, index) => {
              const cells = Array.from(row.children).filter(
                (cell) => cell.tagName.toLowerCase() === "td"
              ) as HTMLTableCellElement[];

              if (cells.length < 4) return; // Skip les lignes sans assez de cellules

              // Générer le même ID que dans createCheckboxCell
              const [mainSection, subSection, thirdSection] = getTitlePage();
              const pageParts = [mainSection, subSection, thirdSection].filter(
                Boolean
              );
              const pagePath = pageParts.join("_");
              const technoId = `techno_${pagePath}_${index}`;

              // Vérifier si cette technologie est dans les données sauvegardées
              const isSaved = savedTechnoIds.has(technoId);
              const checkbox = row.querySelector(
                ".checkbox-selection"
              ) as HTMLInputElement;

              if (checkbox) {
                // Ignorer seulement si c'est une mise à jour locale du wiki
                const isLocalUpdate = row.hasAttribute("data-local-update");

                if (!isLocalUpdate) {
                  checkbox.checked = isSaved;
                }
              }
            });

            // Mettre à jour le total après avoir restauré les cases
            const checkboxes = table.querySelectorAll(
              ".checkbox-selection"
            ) as NodeListOf<HTMLInputElement>;

            // Simuler un changement pour mettre à jour le total
            const totalRow = table.querySelector("#totalRow");
            if (totalRow) {
              const event = new Event("change", { bubbles: true });
              checkboxes.forEach((cb) => {
                if (cb.checked) {
                  cb.dispatchEvent(event);
                }
              });
            }
          }
        });
      }
    );
  },
});
