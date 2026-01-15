import { Button } from "@/components/ui/button";
import einstein_img from "@/assets/einstein.png";
import { ModeToggle } from "@/components/mode-toggle";
import { HelpButton } from "@/components/popup/help-button";
import { SquareArrowOutUpRight } from "lucide-react";

export function PopupHeader({ isGameSite }: { isGameSite: boolean }) {
  return (
    <div className="px-4 pt-3 bg-[#349ab5] dark:bg-background flex gap-3 min-w-[520px]">
      <img
        src={einstein_img}
        alt="icon"
        className="h-[90px] w-auto brightness-110"
      />

      <div className="flex flex-col w-full justify-between items-end">
        <div className="flex gap-1.5 items-center justify-end">
          {!isGameSite ? <HelpButton /> : null}
          <ModeToggle />
          <Button size="sm" asChild>
            <a
              href="#"
              target="_blank"
              onClick={async (e) => {
                e.preventDefault();
                const url = browser.runtime.getURL("/options.html");
                await browser.tabs.create({ url });
              }}
            >
              Overview <SquareArrowOutUpRight className="size-4 ml-0.5" />
            </a>
          </Button>
        </div>

        <div className="flex gap-1.5 pb-1 text-[13px] italic dark:text-neutral-300">
          {isGameSite ? (
            <>
              <span className="font-semibold">Info:</span>The extension only
              collects your resources data.
            </>
          ) : (
            <>
              <span className="font-semibold">Warning:</span>All dropdowns must
              be filled to display the icons correctly.
            </>
          )}
        </div>
      </div>
    </div>
  );
}
