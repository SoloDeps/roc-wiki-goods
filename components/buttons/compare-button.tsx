import { Loader2, Scale, CheckCircle2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from "@/components/ui/tooltip";
import { useEffect, useState } from "react";
import { watchUserResources } from "@/lib/roc/rocApi";
import { watchBuildings, watchTechnos } from "@/lib/overview/storage";

interface CompareButtonProps {
  variant?: "default" | "outline" | "ghost";
  enabled?: boolean;
  onToggle?: (enabled: boolean) => void;
}

export function CompareButton({
  variant = "outline",
  enabled = false,
  onToggle,
}: CompareButtonProps) {
  const [hasUserData, setHasUserData] = useState(false);
  const [hasWikiData, setHasWikiData] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  // Wrapper explicite pour le cleanup
  useEffect(() => {
    const unwatch = watchUserResources((resources) => {
      setHasUserData(resources.length > 0);
    });

    // Retourne la fonction de cleanup explicitement
    return () => {
      unwatch();
    };
  }, []);

  // Watch buildings & technos
  useEffect(() => {
    const unwatchBuildings = watchBuildings((buildings) => {
      const hasBuildingsData = buildings.length > 0;
      setHasWikiData(hasBuildingsData);
      setIsChecking(false);

      // Auto-désactive si plus de buildings et que le mode était activé
      if (!hasBuildingsData && enabled) {
        onToggle?.(false);
      }
    });

    const unwatchTechnos = watchTechnos((technos) => {
      setHasWikiData((prev) => prev || technos.length > 0);
      setIsChecking(false);
    });

    return () => {
      unwatchBuildings();
      unwatchTechnos();
    };
  }, [enabled, onToggle]);

  const handleToggle = () => {
    onToggle?.(!enabled);
  };

  const canCompare = hasUserData && hasWikiData;
  const desactive = isChecking || !canCompare;

  // Sinon, afficher le tooltip avec les statuts
  return (
    <TooltipProvider delayDuration={0}>
      <Tooltip open={desactive ? undefined : false}>
        <TooltipTrigger asChild>
          <span className="inline-block w-fit" tabIndex={0}>
            <Button
              size="sm"
              variant={enabled ? "default" : variant}
              onClick={handleToggle}
              disabled={desactive}
              className="cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isChecking ? <Loader2 className="animate-spin" /> : <Scale />}
              Compare Game Data
            </Button>
          </span>
        </TooltipTrigger>

        <TooltipContent
          side="left"
          className="bg-background-300 border-alpha-400 text-foreground px-2 py-1 text-xs rounded-sm"
          showArrow
        >
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs">
              {hasUserData ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                  <span>Game data exported</span>
                </>
              ) : (
                <>
                  <XCircle className="w-4 h-4 text-red-500" />
                  <span>Game data not exported</span>
                </>
              )}
            </div>
            <div className="flex items-center gap-2 text-xs">
              {hasWikiData ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                  <span>Buildings/technos in list</span>
                </>
              ) : (
                <>
                  <XCircle className="w-4 h-4 text-red-500" />
                  <span>Buildings/technos not found</span>
                </>
              )}
            </div>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
