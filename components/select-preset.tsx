import { useState, useEffect } from "react";
import { Loader2, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  loadPreset,
  type LoadPresetResult,
} from "@/lib/features/presets/preset-loader";
import { getEraInfo, hasPresetData } from "@/lib/features/presets";
import { PRESET_KEYS } from "@/lib/data/presets/config";
import { getBuildings, getTechnos } from "@/lib/overview/storage";
import { cn } from "@/lib/utils";

interface SelectPresetProps {
  onPresetApplied?: () => void;
}

export default function SelectPreset({ onPresetApplied }: SelectPresetProps) {
  const [loading, setLoading] = useState<string | null>(null);
  const [availablePresets, setAvailablePresets] = useState<string[]>([]);
  const [checking, setChecking] = useState(true);
  const [hoveredPreset, setHoveredPreset] = useState<string | null>(null);
  const [selectedPreset, setSelectedPreset] = useState<string | null>(null);

  // État pour la confirmation
  const [pendingPreset, setPendingPreset] = useState<{
    key: string;
    buildingsCount: number;
    technosCount: number;
  } | null>(null);

  // État pour les erreurs
  const [error, setError] = useState<string | null>(null);

  // Vérifier quels presets ont des données au chargement
  useEffect(() => {
    async function checkPresets() {
      const results = await Promise.allSettled(
        PRESET_KEYS.map(async (key) => ({
          key,
          hasData: await hasPresetData(key),
        })),
      );

      const available = results
        .filter((r) => r.status === "fulfilled" && r.value.hasData)
        .map((r) => (r as any).value.key);

      setAvailablePresets(available);
      setChecking(false);

      // Définir le premier preset comme hover par défaut
      if (available.length > 0) {
        setHoveredPreset(available[0]);
      }
    }

    checkPresets();
  }, []);

  const handlePresetClick = async (presetKey: string) => {
    setError(null);
    setSelectedPreset(presetKey);

    // Vérifier si des données existent déjà
    const [existingBuildings, existingTechnos] = await Promise.all([
      getBuildings(),
      getTechnos(),
    ]);

    const hasExistingData =
      existingBuildings.length > 0 || existingTechnos.length > 0;

    if (hasExistingData) {
      // Afficher la zone de confirmation
      setPendingPreset({
        key: presetKey,
        buildingsCount: existingBuildings.length,
        technosCount: existingTechnos.length,
      });
    } else {
      // Pas de données existantes, charger directement
      await loadPresetDirectly(presetKey);
    }
  };

  const loadPresetDirectly = async (presetKey: string) => {
    setLoading(presetKey);
    setError(null);
    setPendingPreset(null);

    try {
      const result: LoadPresetResult = await loadPreset(presetKey);

      if (result.success) {
        const era = getEraInfo(presetKey);
        console.log(
          `✅ Preset "${era.name}" loaded: ${result.buildingsAdded} buildings, ${result.technosAdded} technos`,
        );

        onPresetApplied?.();
      } else {
        setError(result.error || "Failed to load preset");
      }
    } catch (error) {
      console.error("Unexpected error:", error);
      setError(
        error instanceof Error ? error.message : "An unexpected error occurred",
      );
    } finally {
      setLoading(null);
    }
  };

  const handleConfirmLoad = () => {
    if (pendingPreset) {
      loadPresetDirectly(pendingPreset.key);
    }
  };

  const handleCancelLoad = () => {
    setPendingPreset(null);
    setSelectedPreset(null);
  };

  if (checking) {
    return (
      <div className="p-6 text-center">
        <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
        <p className="text-sm text-muted-foreground">Loading presets...</p>
      </div>
    );
  }

  if (availablePresets.length === 0) {
    return (
      <div className="p-6 text-center text-muted-foreground">
        No presets available yet.
      </div>
    );
  }

  // Obtenir l'image actuelle à afficher
  const currentEra = getEraInfo(
    hoveredPreset ?? selectedPreset ?? availablePresets[0],
  );
  const currentImage = currentEra?.image || "/eras/stone_age.webp";

  return (
    <div className="p-4">
      <div className="flex gap-3">
        {/* Image preview à gauche */}
        <div className="hidden md:flex w-40 h-[370px] rounded-md overflow-hidden bg-muted/50 items-center justify-center">
          <img
            src={currentImage}
            alt={currentEra?.name || "Era preview"}
            className="w-full h-full object-cover transition-opacity duration-300 select-none"
            loading="eager"
            draggable={false}
          />
        </div>

        {/* Liste des presets à droite */}
        <div className="flex-1 flex flex-col gap-2">
          {/* Liste des presets */}
          <div className="grid grid-cols-2 gap-2">
            {availablePresets.map((presetKey) => {
              const era = getEraInfo(presetKey);
              const isLoading = loading === presetKey;
              const isSelected = selectedPreset === presetKey;

              return (
                <Button
                  key={presetKey}
                  variant="outline"
                  className={cn(
                    "justify-between h-auto py-3 px-4 transition-all shadow-none border-alpha-400",
                    isSelected && "beta-badge",
                  )}
                  onClick={() => handlePresetClick(presetKey)}
                  onMouseEnter={() => setHoveredPreset(presetKey)}
                  disabled={
                    isLoading || loading !== null || pendingPreset !== null
                  }
                >
                  <div className="flex flex-col items-start gap-1">
                    <span className="font-semibold">{era.name}</span>
                  </div>
                </Button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="mt-4">
        {/* Zone de confirmation (en dessous de la liste) */}
        {pendingPreset && (
          <div className="p-3 rounded-md border bg-red-50 dark:bg-red-950/30 border-red-400 dark:border-red-800 mt-2">
            <div className="flex items-start gap-3">
              <AlertTriangle className="size-5 text-red-600 dark:text-red-400 flex shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-red-800 dark:text-red-200">
                  Replace existing data?
                </p>
                <p className="text-xs text-red-700 dark:text-red-300 mt-1">
                  This will permanently delete{" "}
                  <strong>{pendingPreset.buildingsCount} buildings</strong> and{" "}
                  <strong>{pendingPreset.technosCount} technologies</strong>.
                  This action cannot be undone.
                </p>
              </div>
              <div className="flex flex-col gap-2 shrink-0">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleCancelLoad}
                  disabled={loading !== null}
                  className="min-w-[120px]"
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={handleConfirmLoad}
                  disabled={loading !== null}
                  className="min-w-[120px]"
                >
                  {loading ? (
                    <>
                      <Loader2 className="size-3 animate-spin" />
                      Loading...
                    </>
                  ) : (
                    "Confirm & Replace"
                  )}
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Zone d'erreur (en dessous) */}
        {error && (
          <div className="p-3 rounded-md border bg-red-50 dark:bg-red-950/30 border-red-400 dark:border-red-800 mt-2">
            <div className="flex items-start gap-2">
              <AlertTriangle className="size-5 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
              <div className="flex w-full items-center justify-between">
                <p className="text-sm font-medium text-red-800 dark:text-red-200">
                  Error loading preset. Try again.
                </p>
                <p className="text-xs text-red-700 dark:text-red-300 mt-1">
                  {error}
                </p>
                <Button
                  size="sm"
                  variant="outline"
                  className="border-red-300 hover:bg-red-100 dark:border-red-700 dark:hover:bg-red-900/20"
                  onClick={() => setError(null)}
                >
                  Dismiss
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
