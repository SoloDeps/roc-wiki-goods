import { ExternalLink, Info } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/mode-toggle";
import { ButtonExportDB } from "@/components/buttons/button-export-db";

export function SiteHeader() {
  return (
    <header className="relative z-20 flex w-full shrink-0 items-center justify-between h-[50px] container-wrapper">
      <div className="flex items-center gap-2">
        <a href="/" className="flex items-center gap-2 ">
          <img
            src="/icon/24.png?url"
            width={24}
            height={24}
            alt="logo"
            className="shrink-0"
          />
          <span className="hidden md:block text-sm font-semibold">
            RoC Wiki Goods
          </span>
        </a>
        <Badge className="h-6 rounded-sm beta-badge">Beta</Badge>
        <ButtonExportDB />
      </div>
      <nav className="flex items-center gap-1.5">
        <Button variant="outline" size="sm" asChild>
          <a
            href="https://riseofcultures.wiki.gg/"
            onClick={(e) => {
              e.preventDefault();
              browser.tabs.create({
                url: "https://riseofcultures.wiki.gg/",
              });
            }}
          >
            <span className="inline-block md:hidden">
              <ExternalLink />
            </span>
            <span className="hidden md:inline-block">Wiki Homepage</span>
          </a>
        </Button>

        <Button variant="outline" size="sm" asChild>
          <a href="/help">
            <span className="inline-block md:hidden">
              <Info />
            </span>
            <span className="hidden md:inline-block">Help</span>
          </a>
        </Button>
        <ModeToggle />
      </nav>
    </header>
  );
}
