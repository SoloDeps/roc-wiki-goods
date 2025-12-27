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
