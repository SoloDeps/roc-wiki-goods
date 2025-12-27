import { ModeToggle } from "@/components/mode-toggle";
import { Button } from "@/components/ui/button";
import { ExternalLink, Info } from "lucide-react";

export const navLinks = [
  {
    label: "Wiki",
    href: "#",
    icon: <ExternalLink />,
  },
  {
    label: "Help",
    href: "#",
    icon: <Info />,
  },
];

export function SiteHeader() {
  return (
    <header className="relative z-20 flex w-full shrink-0 items-center justify-between h-[50px] container-wrapper">
      <div className="flex items-center gap-2">
        <img src="/icon/24.png?url" alt="logo" />
        <a href="/" className="text-sm font-semibold">RoC Wiki Goods</a>
      </div>
      <nav className="flex items-center gap-1.5">
        {navLinks.map((link, i) => (
          <Button variant="outline" size="sm" asChild key={i}>
            <a href={link.href}>
              {link.icon}
              {link.label}
            </a>
          </Button>
        ))}
        <ModeToggle />
      </nav>
    </header>
  );
}
