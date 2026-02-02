import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { PlusIcon, Loader2 } from "lucide-react";
import { useState } from "react";
import SelectWikiTable from "./select-wiki-table";
import LinkTree from "./link-tree";
import {
  saveAllOttomanAreas,
  saveAllOttomanTradePosts,
} from "@/lib/overview/ottoman-parser";

export const AddBuildingSheet = ({
  variant = "outline",
}: {
  variant?: "default" | "outline";
}) => {
  const [selectedTable, setSelectedTable] = useState("construction");
  const [loadingAreas, setLoadingAreas] = useState(false);
  const [loadingTradePosts, setLoadingTradePosts] = useState(false);

  const handleAddAllAreas = async () => {
    setLoadingAreas(true);
    try {
      const result = await saveAllOttomanAreas();
      console.log(`✅ Added ${result.saved} areas, skipped ${result.skipped}`);
    } catch (error) {
      console.error("Failed to add areas:", error);
    } finally {
      setLoadingAreas(false);
    }
  };

  const handleAddAllTradePosts = async () => {
    setLoadingTradePosts(true);
    try {
      const result = await saveAllOttomanTradePosts();
      console.log(
        `✅ Added ${result.saved} trade posts, failed ${result.failed}`,
      );
    } catch (error) {
      console.error("Failed to add trade posts:", error);
    } finally {
      setLoadingTradePosts(false);
    }
  };

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button size="sm" variant={variant} className="cursor-pointer">
          <PlusIcon /> Add Item
        </Button>
      </SheetTrigger>
      <SheetContent>
        <ScrollArea className="h-full">
          <SheetHeader className="border-b border-alpha-400">
            <SheetTitle>Add building & technos</SheetTitle>
            <SheetDescription>
              Choose the wiki table type you want to open. <br />
              Click a link to go to the wiki.
            </SheetDescription>
          </SheetHeader>
          <div className="p-4 space-y-4 divide-y divide-alpha-400">
            <SelectWikiTable
              selectedTable={selectedTable}
              onTableChange={setSelectedTable}
            />
            <LinkTree selectedTable={selectedTable} />

            {/* Ottoman Quick Add Section */}
            <div className="pt-4 space-y-3">
              <h3 className="text-sm font-medium text-foreground/80">
                Ottoman - Quick Add
              </h3>
              <div className="flex flex-col gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleAddAllAreas}
                  disabled={loadingAreas}
                  className="w-full justify-start"
                >
                  {loadingAreas ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <PlusIcon className="size-4" />
                  )}
                  Add All Areas (0-17)
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleAddAllTradePosts}
                  disabled={loadingTradePosts}
                  className="w-full justify-start"
                >
                  {loadingTradePosts ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <PlusIcon className="size-4" />
                  )}
                  Add All Trade Posts
                </Button>
              </div>
            </div>

          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
};
