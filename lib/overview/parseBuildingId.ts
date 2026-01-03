export interface ParsedBuildingId {
  id: string;

  section1: string;
  section2: string;
  section3: string;

  buildingName: string;

  tableType: "construction" | "upgrade";
  era: string;
  level: string;
}

export interface ParsedTechnoId {
  id: string;
  mainSection: string;
  subSection: string;
  thirdSection: string;
  era: string;
  index: string;
}

export function parseBuildingId(id: string): ParsedBuildingId {
  // ex:
  // /wiki/Home_Cultures/Barracks/Infantry_Barracks|upgrade|HM|12

  const [rawPath, tableType, era, level] = id.split("|");

  const pathParts = rawPath.replace(/^\/+/, "").split("/");
  // ["wiki", "Home_Cultures", "Barracks", "Infantry_Barracks"]

  const [, section1, section2, section3] = pathParts;

  if (!section1 || !section2 || !section3) {
    throw new Error(`Invalid building id format: ${id}`);
  }

  return {
    id,

    section1,
    section2,
    section3,

    buildingName: section3.replace(/_/g, " "),

    tableType: tableType as "construction" | "upgrade",
    era,
    level,
  };
}

export function parseTechnoId(id: string): ParsedTechnoId {
  // ex: techno_home_cultures_high_middle_ages_42

  const parts = id.split("_");

  if (parts.length < 5) {
    throw new Error(`Invalid techno id format: ${id}`);
  }

  // Remove "techno" prefix
  const [, mainSection, subSection, thirdSection, ...rest] = parts;
  const index = rest[rest.length - 1]; // Last part is the index
  const eraParts = rest.slice(0, -1); // Everything except the last part
  const era = eraParts.join("_");

  return {
    id,
    mainSection,
    subSection,
    thirdSection,
    era,
    index,
  };
}
