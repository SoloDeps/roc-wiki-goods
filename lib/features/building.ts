import { type EraAbbr, goodsUrlByEra } from "@/lib/constants";
import { getBuildingFromLocal, getTitlePage } from "@/lib/utils";

export function updateImageSrcByAlt(buildings: string[][]): void {
  const targetCells = document.querySelectorAll("td.mw-collapsible");
  console.log(targetCells);

  targetCells.forEach((td) => {
    const images = td.querySelectorAll("img[alt]");

    images.forEach((img) => {
      const image = img as HTMLImageElement;
      const alt = image.alt;

      const match = alt.match(/^([A-Z]{2})_(primary|secondary|tertiary)$/i);

      if (!match) return;

      const [, era, priority] = match;
      const building = getBuildingFromLocal(
        priority.toLowerCase(),
        era.toUpperCase(),
        buildings
      );
      if (!building) return;

      const normalizedBuilding = building.toLowerCase().replace(/[^\w-]/g, "_");

      const newSrc = goodsUrlByEra
        .get(era.toUpperCase() as EraAbbr)
        ?.get(normalizedBuilding);

      if (newSrc) {
        image.src = newSrc;
      }
    });
  });
}

export function useBuilding(buildings: string[][]) {
  const [mainSection, secondSection] = getTitlePage();
  if (mainSection !== "buildings" || secondSection == null) return;
  updateImageSrcByAlt(buildings);
}
