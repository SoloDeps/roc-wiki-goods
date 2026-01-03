import { useState } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { TechnoCard } from "./techno-card";
import { SavedTechno } from "@/lib/overview/storage";

interface TechnoAccordionProps {
  technos: SavedTechno[];
}

export function TechnoAccordion({ technos }: TechnoAccordionProps) {
  const [openItems, setOpenItems] = useState<string[]>([]);

  if (technos.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No saved technologies
      </div>
    );
  }

  return (
    <Accordion type="multiple" value={openItems} onValueChange={setOpenItems}>
      <AccordionItem value="technologies">
        <AccordionTrigger className="text-left">
          <span className="font-medium">Technologies</span>
          <span className="ml-2 text-sm text-muted-foreground">
            ({technos.length})
          </span>
        </AccordionTrigger>
        <AccordionContent>
          <div className="space-y-3 mt-4">
            {technos.map((techno) => (
              <TechnoCard key={techno.id} techno={techno} />
            ))}
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
