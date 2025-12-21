import TotalGoods from "@/components/total-goods";
import { Button } from "../ui/button";
import { Store } from "lucide-react";

export default function Inventory() {
  return (
    <div className="w-full space-y-4">
      {/* <div className="sticky top-0 z-20 h-14 pr-6 flex items-center justify-between bg-background">
        <h1 className="text-base font-semibold">Total Goods</h1>
        <Button size="sm">
          <Store /> Change workshops
        </Button>
      </div> */}

      <div className="flex items-center justify-between py-5">
        <h1 className="text-base font-semibold">Total Goods</h1>
        <Button size="sm">
          <Store /> Change workshops
        </Button>
      </div>

      {/* <div aria-hidden="true" className="-translate-x-1/2 pointer-events-none absolute left-1/2 h-px w-screen bg-[linear-gradient(to_right,--theme(--color-foreground/.06),--theme(--color-foreground/.12)_200px,--theme(--color-foreground/.12)_calc(100%-200px),--theme(--color-foreground/.06))]"></div> */}

      <div className="pr-6">
        <TotalGoods />
        {/* <TotalGoods /> */}
        {/* <TotalGoods /> */}
      </div>
    </div>
  );
}
