import { useState, useEffect } from "react";

import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";

import { useMediaQuery } from "@/hooks/use-media-query";
import { TotalGoodsDisplay } from "../total-goods/total-goods-display";

export function TotalDrawer() {
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
          <div className="w-full sm:mx-auto px-4">
            <DrawerTitle className="text-left text-base pb-1 max-w-[870px] mx-auto">
              Resources Total
            </DrawerTitle>
          </div>
        </DrawerHeader>
        <div className="size-full sm:mx-auto pb-5">
          <TotalGoodsDisplay />
        </div>
          {/* <DrawerFooter className="pt-2">
            <DrawerClose asChild>
              <Button variant="outline" className="rounded-sm">
                Close
              </Button>
            </DrawerClose>
          </DrawerFooter> */}
      </DrawerContent>
    </Drawer>
  );
}
