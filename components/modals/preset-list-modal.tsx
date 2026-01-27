import { useState, useEffect } from "react";
import { SwatchBook } from "lucide-react";
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
import SelectPreset from "@/components/select-preset";

export function PresetListModal({
  variant = "outline",
}: {
  variant?: "default" | "outline" | "ghost";
}) {
  const [open, setOpen] = useState(false);
  const [shouldAnimate, setShouldAnimate] = useState(true);
  const isDesktop = useMediaQuery("(min-width: 768px)");

  useEffect(() => {
    if (open) {
      setShouldAnimate(true);
    }
  }, [open]);

  const handlePresetApplied = () => {
    setShouldAnimate(false);
    requestAnimationFrame(() => {
      setOpen(false);
    });
  };

  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button size="sm" variant={variant} className="cursor-pointer">
            <SwatchBook /> Presets
          </Button>
        </DialogTrigger>

        <DialogContent 
          className="flex flex-col gap-0 p-0 sm:max-h-[min(640px,80vh)] sm:max-w-[600px] bg-background-200 shadow-lg overflow-hidden"
          disableExitAnimation={!shouldAnimate}
        >
          <DialogHeader className="px-5 py-3 text-left gap-0.5 bg-background-300 border border-x-0 border-alpha-400 border-t-transparent">
            <DialogTitle className="text-base">Preset List</DialogTitle>
            <DialogDescription className="text-left text-sm">
              Select a preset to load all data for one era.
            </DialogDescription>
          </DialogHeader>
          <SelectPreset onPresetApplied={handlePresetApplied} />
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        <Button size="sm" variant={variant} className="cursor-pointer">
          <SwatchBook /> Presets
        </Button>
      </DrawerTrigger>
      <DrawerContent 
        className="bg-background-100 overflow-hidden"
        disableExitAnimation={!shouldAnimate}
      >
        <DrawerHeader className="border-b border-alpha-300">
          <div className="sm:w-[600px] w-full sm:mx-auto px-4">
            <DrawerTitle className="text-left text-base">
              Preset List
            </DrawerTitle>
            <DrawerDescription className="text-left text-sm">
              Select a preset to load all data for one era.
            </DrawerDescription>
          </div>
        </DrawerHeader>
        <div className="sm:w-[600px] w-full sm:mx-auto">
          <SelectPreset onPresetApplied={handlePresetApplied} />
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