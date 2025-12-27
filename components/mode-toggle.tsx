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
    <Button size="sm" variant="outline" onClick={toggleTheme}>
      {resolvedTheme === "light" ? (
        <><Sun /> Light</>
      ) : (
        <><Moon /> Dark</>
      )}
    </Button>
  );
}