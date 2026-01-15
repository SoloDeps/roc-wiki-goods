import { useState, useEffect } from "react";
import { storage } from "#imports";
import { getApiConfig } from "@/lib/roc/tokenCapture";
import { syncGameResources } from "@/lib/roc/rocApi";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

export function ExportGameData() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<boolean>(false);
  const [success, setSuccess] = useState<boolean>(false);
  const [hasAuthToken, setHasAuthToken] = useState<boolean>(false);
  const [isPlayPage, setIsPlayPage] = useState<boolean>(false);
  const [autoSave, setAutoSave] = useState<boolean>(false);

  // Vérifier le token et l'URL au chargement du composant
  useEffect(() => {
    const checkAuthAndUrl = async () => {
      // Vérifier si on a un token d'authentification
      const config = await getApiConfig();
      setHasAuthToken(!!config?.authToken);

      // Vérifier si l'URL contient "-play" (page de connexion)
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        const currentUrl = tabs[0]?.url || "";
        setIsPlayPage(currentUrl.includes("-play"));
      });

      // Charger la préférence auto-save depuis le storage
      const result = await storage.getItem("local:autoSave");
      setAutoSave(result === true);
    };

    checkAuthAndUrl();
  }, []);

  // Sauvegarder la préférence auto-save
  const handleAutoSaveChange = async (checked: boolean) => {
    setAutoSave(checked);
    await storage.setItem("local:autoSave", checked);
  };

  const syncResources = async () => {
    setLoading(true);
    try {
      await syncGameResources();
      setSuccess(true);
    } catch (err: any) {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-4 p-4 border-t border-alpha-400 min-w-[500px] bg-background-100">
      <div className="p-3 border rounded-md bg-background-300">
        <h2 className="block text-sm font-medium">Overview Page</h2>
        <p className="text-[13px] text-muted-foreground mt-0.5">
          Export your game data to use on the overview page.
        </p>
        <Button
          size="sm"
          variant="default"
          className="w-28 mt-2.5"
          disabled={loading || !hasAuthToken || isPlayPage}
          onClick={syncResources}
        >
          {loading ? "Loading..." : "Export data"}
        </Button>
        <div className="pt-2 text-[13px] italic ">
          {!hasAuthToken && !loading && (
            <p className="text-yellow-600">
              Please open the game first to authenticate.
            </p>
          )}
          {isPlayPage && !loading && (
            <p className="text-yellow-600">Please log in to the game first.</p>
          )}
          {error && (
            <p className="text-red-500">An error occurred. Please try again.</p>
          )}
          {success && (
            <p className="text-green-500">Game data exported successfully</p>
          )}
        </div>
      </div>

      <Label className="bg-background-300 hover:bg-accent/70 transition-all flex items-start gap-3 rounded-md border p-3 has-[[aria-checked=true]]:border-blue-600 has-[[aria-checked=true]]:bg-blue-50 dark:has-[[aria-checked=true]]:border-blue-900 dark:has-[[aria-checked=true]]:bg-blue-950">
        <Checkbox
          id="toggle-2"
          checked={autoSave}
          onCheckedChange={handleAutoSaveChange}
          className="data-[state=checked]:border-blue-600 data-[state=checked]:bg-blue-600 data-[state=checked]:text-white dark:data-[state=checked]:border-blue-700 dark:data-[state=checked]:bg-blue-700"
        />
        <div className="grid gap-1.5 font-normal">
          <p className="text-sm leading-none font-medium">Enable auto save</p>
          <p className="text-muted-foreground text-[13px]">
            Enable this option to automatically save your data each time you
            open the game page.
          </p>
        </div>
      </Label>
    </div>
  );
}
