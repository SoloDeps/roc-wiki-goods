import { Button } from "@/components/ui/button";
import { exportPresetsJSON } from "@/lib/storage/repository";

export function ButtonExportDB() {
  return (
    <>
      {import.meta.env.DEV && (
        <Button variant="outline" size="sm" onClick={exportPresetsJSON}>
          Export Preset Json
        </Button>
      )}
    </>
  );
}
