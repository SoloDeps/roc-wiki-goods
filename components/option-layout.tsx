import { SiteHeader } from "@/components/site-header";
import { ScrollArea } from "./ui/scroll-area";
import { Button } from "./ui/button";
import { PlusIcon } from "lucide-react";
import GoodsDisplay from "@/components/total-goods";
import { BuildingDialog } from "@/components/building/building-dialog";
import BuildingList from "./building/building-list";
import { TailwindIndicator } from "./tailwind-indicator";

export default function OptionLayout() {
  return (
    <div className="max-h-screen-patched min-h-screen-patched flex w-full flex-col overflow-auto bg-muted dark:bg-background">
      <TailwindIndicator />
      <SiteHeader />

      <div className="flex min-h-0 flex-1 container-wrapper gap-4">
        <aside className="sticky top-0 hidden origin-left xl:block mb-2 material-medium 2xl:w-6/11 lg:w-5/11 overflow-hidden">
          <header className="flex shrink-0 flex-col w-full transition-colors border-b">
            <div className="flex shrink-0 w-full justify-between items-center gap-3 pl-4 pr-3 sm:pl-3 sm:pr-2 h-11 sm:mx-0 bg-background">
              <h2 className="text-base font-semibold">Resource Totals</h2>
              <BuildingDialog />
            </div>
          </header>

          <ScrollArea className="size-full overflow-y-auto">
            <GoodsDisplay />
          </ScrollArea>
        </aside>

        <div className="relative flex min-w-0 flex-1 flex-col 2xl:w-5/11 lg:w-6/11">
          <main className="material-medium relative mb-2 mt-0 flex-1 grow overflow-hidden">
            <div className="@container/page-layout relative flex size-full min-h-0 flex-col">
              <header className="flex shrink-0 flex-col w-full transition-colors border-b">
                <div className="flex shrink-0 w-full justify-between items-center gap-3 px-3 h-11 sm:mx-0 bg-background">
                  <h2 className="hidden xl:block text-base font-semibold">Building List</h2>
                  <div className="block xl:hidden">
                    <BuildingDialog />
                  </div>

                  <Button size="sm">
                    <PlusIcon /> Add building
                  </Button>
                </div>
              </header>
              <div className="size-full overflow-y-auto no-scrollbar flex flex-col">
                <BuildingList />
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
