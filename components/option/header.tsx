import { cn } from "@/lib/utils";
import { ModeToggle } from "@/components/mode-toggle";
import { Button, buttonVariants } from "@/components/ui/button";

export const navLinks = [
  {
    label: "Home",
    href: "#",
  },
  {
    label: "Help",
    href: "#",
  },
];

export function OptionHeader() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur-sm supports-backdrop-filter:bg-background/50">
      <nav className="container-wrapper flex h-12 items-center justify-between">
        <a className={buttonVariants({ variant: "ghost" })} href="/">
          RoC Wiki Goods
        </a>
        <div className="hidden items-center gap-1 md:flex">
          {navLinks.map((link, i) => (
            <a
              className={buttonVariants({ variant: "ghost" })}
              href={link.href}
              key={i}
            >
              {link.label}
            </a>
          ))}
          <ModeToggle />
        </div>
      </nav>
    </header>
  );
}
