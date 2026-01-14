import { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

import { eras } from "@/lib/constants";
import { applyPreset } from "@/lib/features/presets";
import WarningBanner from "@/components/alerts/warning-banner";

interface SelectPresetProps {
  onPresetApplied?: () => void;
}

export default function SelectPreset({ onPresetApplied }: SelectPresetProps) {
  const [selectedEra, setSelectedEra] = useState<string>("");
  const [isApplying, setIsApplying] = useState(false);

  const handleApplyPreset = async () => {
    if (!selectedEra) return;

    setIsApplying(true);
    try {
      await applyPreset(selectedEra);
      onPresetApplied?.();
    } catch (error) {
      console.error("Failed to apply preset:", error);
    } finally {
      setIsApplying(false);
    }
  };
  return (
    <div className="w-full p-4">
      <WarningBanner
        title="Notice"
        description={
          "Some buildings in the allied cities are still missing for the moment.\nStill working on it."
        }
      />

      <div className="flex flex-col sm:flex-row sm:items-center gap-3 pt-5 pb-2">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 w-full">
          <Label className="text-sm sm:shrink-0">
            Select an era to load presets:
          </Label>
          <Select value={selectedEra} onValueChange={setSelectedEra}>
            <SelectTrigger className="w-full h-8 text-[13px]">
              <SelectValue placeholder="Choose an era..." />
            </SelectTrigger>

            <SelectContent align="end">
              {eras.map((era) => (
                <SelectItem key={era.id} value={era.id}>
                  <div className="flex items-center gap-2 text-[13px]">
                    {era.name}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              className="w-full sm:w-32"
              disabled={!selectedEra || isApplying}
            >
              {isApplying ? "Applying..." : "Confirm"}
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent className="bg-background-100">
            <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription className="dark:text-neutral-400">
                This action cannot be <b>undone</b>.<br />
                This will permanently <b>replace the current selections</b>.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleApplyPreset}>
                Continue
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}
