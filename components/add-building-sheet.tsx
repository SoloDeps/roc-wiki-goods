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
import { PlusIcon } from "lucide-react";
import { useState } from "react";
import SelectWikiTable from "./select-wiki-table";
import LinkTree from "./link-tree";

const AddBuildingSheet = () => {
  const [selectedTable, setSelectedTable] = useState("construction");

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button size="sm" variant="outline" className="cursor-pointer">
          <PlusIcon /> Add building
        </Button>
      </SheetTrigger>
      <SheetContent>
        <ScrollArea className="h-full">
          <SheetHeader className="border-b border-alpha-400">
            <SheetTitle>Add building</SheetTitle>
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
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
};

export default AddBuildingSheet;
