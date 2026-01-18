import { useState } from "react";
import { Store } from "lucide-react";
import {
  Dialog,
  DialogHeader,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { useMediaQuery } from "@/hooks/use-media-query";
import { BuildingSelectorGroup } from "@/components/popup/building-selector-group";

export function WorkshopModal({
  variant = "outline",
}: {
  variant?: "default" | "outline" | "ghost";
}) {
  const [open, setOpen] = useState(false);
  const isDesktop = useMediaQuery("(min-width: 768px)");

  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button size="sm" variant={variant} className="cursor-pointer">
            <Store /> Workshops
          </Button>
        </DialogTrigger>

        <DialogContent className="flex flex-col gap-0 p-0 sm:max-h-[min(640px,80vh)] w-full sm:max-w-[660px] bg-background-100 shadow-lg">
          <DialogHeader className="px-4 py-4 text-left gap-1 ">
            <DialogTitle className="text-base">Manage Workshops</DialogTitle>
            <DialogDescription className="text-left text-sm">
              Update your workshop selections here. All changes are saved
              automatically.
            </DialogDescription>
          </DialogHeader>
          <BuildingSelectorGroup />
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        <Button size="sm" variant={variant} className="cursor-pointer">
          <Store /> Workshops
        </Button>
      </DrawerTrigger>
      <DrawerContent className="bg-background-100">
        <DrawerHeader className="">
          <div className="w-full sm:mx-auto">
            <DrawerTitle className="text-left text-base">
              Manage Workshops
            </DrawerTitle>
            <DrawerDescription className="text-left text-sm">
              Update your workshop selections here. All changes are saved
              automatically.
            </DrawerDescription>
          </div>
        </DrawerHeader>
        <div className="w-full sm:mx-auto">
          <BuildingSelectorGroup />
          <DrawerFooter className="pt-2">
            <DrawerClose asChild>
              <Button variant="outline" className="rounded-sm">
                Close
              </Button>
            </DrawerClose>
          </DrawerFooter>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
