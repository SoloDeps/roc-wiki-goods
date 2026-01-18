import { Loader2, Scale } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { hasUserResources } from "@/lib/roc/user-resources";
import { getBuildings, getTechnos } from "@/lib/overview/storage";

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
  const [hasResources, setHasResources] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    let mounted = true;

    const checkData = async () => {
      try {
        // Vérifier les données utilisateur
        const userDataResult = await hasUserResources();

        // Vérifier s'il y a des buildings OU des technos
        const [buildings, technos] = await Promise.all([
          getBuildings(),
          getTechnos(),
        ]);

        const hasAnyResources =
          (buildings && buildings.length > 0) ||
          (technos && technos.length > 0);

        if (mounted) {
          setHasUserData(userDataResult);
          setHasResources(hasAnyResources);
          setIsChecking(false);
        }
      } catch (error) {
        console.error("Error checking compare data:", error);
        if (mounted) {
          setIsChecking(false);
        }
      }
    };

    checkData();

    return () => {
      mounted = false;
    };
  }, []);

  const handleToggle = () => {
    onToggle?.(!enabled);
  };

  const canCompare = hasUserData && hasResources;

  const tooltipText = !hasUserData
    ? "Extract your game data first"
    : !hasResources
      ? "Add buildings or technologies first"
      : "Compare your resources with needed amounts";

  return (
    <Button
      size="sm"
      variant={enabled ? "default" : variant}
      onClick={handleToggle}
      disabled={isChecking || !canCompare}
      className="cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
      title={tooltipText}
    >
      {isChecking ? (
        <Loader2 className="animate-spin" />
      ) : (
        <Scale className={enabled ? "animate-pulse" : ""} />
      )}
      Compare Game Data
    </Button>
  );
}
