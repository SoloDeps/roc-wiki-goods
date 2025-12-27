import { Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export function HelpButton() {
  return (
    <Tooltip >
      <TooltipTrigger asChild>
        <Button size="icon-sm" variant="transparent" asChild>
          <a
            href="#"
            onClick={async (e) => {
              e.preventDefault();
              await browser.tabs.update({
                url: "https://riseofcultures.wiki.gg/wiki/Goods#Primary_Goods",
              });
            }}
          >
            <Info className="size-[1.2rem]" />
          </a>
        </Button>
      </TooltipTrigger>
      <TooltipContent side="left" sideOffset={-5}>
        <p className="text-justify">
          Need help finding your workshops?
        </p>
      </TooltipContent>
    </Tooltip>
  );
}
