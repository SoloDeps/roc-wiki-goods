import { Moon, Sun } from "lucide-react";
import * as React from "react"
import { Button } from "@/components/ui/button";
import { useTheme } from "next-themes";

export function ModeToggle() {
  const { setTheme, resolvedTheme } = useTheme();

  const toggleTheme = React.useCallback(() => {
    setTheme(resolvedTheme === "dark" ? "light" : "dark")
  }, [resolvedTheme, setTheme])

  return (
    <Button size="icon-sm" variant="transparent" onClick={toggleTheme}>
      {resolvedTheme === "light" ? (
        <Sun className="size-[1.2rem]" />
      ) : (
        <Moon className="size-[1.2rem]" />
      )}
    </Button>
  );
}