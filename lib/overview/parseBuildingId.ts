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
  // Format: /wiki/Home_Cultures/Barracks/Infantry_Barracks|upgrade|HM|12
  const [rawPath, tableType, era, level] = id.split("|");
  const pathParts = rawPath.replace(/^\/+/, "").split("/");
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
  // Format: techno_home_cultures_high_middle_ages_42
  // OU Format simplifié: techno_byzantine_era_0
  const parts = id.split("_");

  if (parts.length < 3) {
    throw new Error(`Invalid techno id format: ${id}`);
  }

  // Le dernier élément est toujours l'index
  const index = parts[parts.length - 1];
  
  // L'era est tout ce qui est entre "techno" et l'index
  // Pour techno_byzantine_era_0 -> byzantine_era
  // Pour techno_home_cultures_high_middle_ages_42 -> home_cultures_high_middle_ages
  const era = parts.slice(1, -1).join("_");

  // Format simplifié: techno_era_number (ex: techno_byzantine_era_0)
  // 4 parts: ["techno", "byzantine", "era", "0"]
  if (parts.length === 4) {
    return {
      id,
      mainSection: "home_cultures",
      subSection: "",
      thirdSection: "",
      era,
      index,
    };
  }

  // Format complet: techno_home_cultures_high_middle_ages_42
  // Au moins 5 parts pour avoir mainSection, subSection, thirdSection
  if (parts.length < 5) {
    throw new Error(`Invalid techno id format: ${id}`);
  }

  const [, mainSection, subSection, thirdSection] = parts;

  return {
    id,
    mainSection,
    subSection,
    thirdSection,
    era,
    index,
  };
}