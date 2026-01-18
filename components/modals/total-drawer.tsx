import { useState } from "react";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { useMediaQuery } from "@/hooks/use-media-query";
import { CompareButton } from "@/components/buttons/compare-button";
import { TotalGoodsDisplay } from "@/components/total-goods/total-goods-display";

interface TotalDrawerProps {
  compareMode?: boolean;
  onToggleCompare?: (enabled: boolean) => void;
}

export function TotalDrawer({
  compareMode = false,
  onToggleCompare,
}: TotalDrawerProps) {
  const [open, setOpen] = useState(false);
  const isXL = useMediaQuery("(min-width: 1280px)");

  if (isXL) return null;

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        <Button size="sm" variant="outline" className="cursor-pointer">
          Resources Total
        </Button>
      </DrawerTrigger>
      <DrawerContent className="bg-background-100 size-full">
        <DrawerHeader className="border border-x-0 border-alpha-400 border-t-transparent py-1.5">
          <div className="w-full md:mx-auto md:max-w-md md:px-4">
            <div className="flex justify-between items-center">
              <DrawerTitle className="text-left text-base pb-1">
                Resources Total
              </DrawerTitle>

              <CompareButton
                variant="outline"
                enabled={compareMode}
                onToggle={onToggleCompare}
              />
            </div>
          </div>
        </DrawerHeader>
        <div className="size-full sm:mx-auto pb-5">
          <TotalGoodsDisplay compareMode={compareMode} />
        </div>
      </DrawerContent>
    </Drawer>
  );
}
