import AppLayout from "@/components/layout";
import BuildingAccordion from "@/components/option/building-accordion";
import Inventory from "@/components/option/inventory";
import { ScrollArea } from '@/components/ui/scroll-area';

export default function OptionsPage() {
  return (
    <AppLayout>
      <div className="container-wrapper h-svh flex overflow-hidden">
        <div className="w-6/11 border-r">
          <ScrollArea className="h-full">
              <Inventory /> 
          </ScrollArea>
        </div>
        
        <div className="w-5/11">
          <ScrollArea className="h-full">
            <div className="py-6 pl-6">
              <BuildingAccordion />
              <BuildingAccordion />
              {/* <BuildingAccordion />
              <BuildingAccordion />
              <BuildingAccordion />
              <BuildingAccordion />
              <BuildingAccordion /> */}
            </div>
          </ScrollArea>
        </div>
      </div>
    </AppLayout>
  );
}