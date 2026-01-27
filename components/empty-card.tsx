import { AddBuildingSheet } from "./add-building-sheet";
import { WorkshopModal } from "./modals/workshop-modal";
import { PresetListModal } from "./modals/preset-list-modal";

interface EmptyType {
  perso: "male" | "female";
  type: "total" | "building";
}

interface ContentItem {
  image: string;
  text: string;
  description: string;
}

const content: Record<"male" | "female", ContentItem> = {
  male: {
    image: "/characters/male_lge.png",
    text: "I hope you’re doing well, Chief!",
    description:
      "We should start adding new buildings to the list to better track the resources we’ll need for them.",
  },
  female: {
    image: "/characters/female_lge.png",
    text: "Glad to see you, Sire!",
    description:
      "Here, you can view and adjust the resources you need.\nFelix could use your help on the other side!",
  },
};

export function EmptyOutline({ perso, type }: EmptyType) {
  return (
    <div className="relative max-w-xl w-full h-48 border rounded-xl border-alpha-400 bg-background-300 shadow-xs">
      <div className="relative size-full ps-40 p-4 flex flex-col justify-center gap-3 text-center">
        <h3 className="text-[17px] font-semibold">{content[perso].text}</h3>
        <p className="text-[15px] text-muted-foreground whitespace-pre-line">
          {content[perso].description}
        </p>
        <div className="pt-1">
          {type === "building" ? (
            <div className="flex justify-center items-center gap-3">
              <AddBuildingSheet variant="default" />
              <PresetListModal variant="default" />
            </div>
          ) : (
            <WorkshopModal variant="default" />
          )}
        </div>
      </div>
      <img
        src={content[perso].image}
        alt="img"
        className={`absolute ${perso === "male" ? "left-14" : "left-[72px]"} bottom-0 -translate-x-1/2 w-auto h-64 pointer-events-none z-10`}
      />
    </div>
  );
}
