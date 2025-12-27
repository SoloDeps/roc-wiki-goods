import * as React from "react";
import { Store } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogHeader,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { buildingsAbbr } from "@/lib/constants";
import BuildingSelector from "./building-selector";

export function BuildingDialog() {
  const [open, setOpen] = React.useState(false);
  const [selections, setSelections] = useState(() => {
    const savedData = localStorage.getItem("buildingSelections");
    return savedData
      ? JSON.parse(savedData)
      : buildingsAbbr.map(() => ["", "", ""]);
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline" className="cursor-pointer">
          <Store /> Change workshops
        </Button>
      </DialogTrigger>

      <DialogContent className="flex flex-col gap-0 p-0 sm:max-h-[min(640px,80vh)] sm:max-w-[600px] [&>button:last-child]:top-3.5">
        <DialogHeader className="contents space-y-0 text-left">
          <DialogTitle className="border-b px-6 py-4 text-base">
            Update Workshops
          </DialogTitle>
          <div className="overflow-y-auto">
            <DialogDescription asChild>
              <div className="px-6 py-4">
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
            </DialogDescription>
          </div>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}
