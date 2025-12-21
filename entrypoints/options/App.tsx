import AppLayout from "@/components/layout";
import BuildingAccordion from "@/components/option/building-accordion";
import Inventory from "@/components/option/inventory";
import { ScrollArea } from '@/components/ui/scroll-area';

export default function OptionsPage() {
  return (
    <AppLayout>
      <div className="container-wrapper">
        <div className="flex max-xl:flex-col gap-6">

          {/* GAUCHE — sticky */}
          <aside className="w-6/11 sticky top-14 h-[calc(100svh-3.5rem)] border-r">
            <div className="h-full overflow-y-auto pr-4">
              <Inventory />
            </div>
          </aside>

          {/* DROITE — scroll page */}
          <section className="w-6/11 py-6">
            <BuildingAccordion />
          </section>

        </div>
      </div>
    </AppLayout>
  );
}