import { useState, useEffect } from "react";
import { storage } from "#imports";
import { getApiConfig } from "@/lib/roc/tokenCapture";
import { syncGameResources } from "@/lib/roc/rocApi";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { CheckCircle2, XCircle, Loader2, AlertCircle } from "lucide-react";

interface SyncStatus {
  status: "idle" | "loading" | "success" | "error";
  timestamp: number;
  message: string;
  type: "manual" | "auto";
}

export function ExportGameData() {
  const [loading, setLoading] = useState(false);
  const [hasAuthToken, setHasAuthToken] = useState<boolean>(false);
  const [isPlayPage, setIsPlayPage] = useState<boolean>(false);
  const [autoSave, setAutoSave] = useState<boolean>(false);

  // ✅ État local synchronisé avec le storage
  const [syncStatus, setSyncStatus] = useState<SyncStatus>({
    status: "idle",
    message: "",
    timestamp: 0,
    type: "auto",
  });

  useEffect(() => {
    const init = async () => {
      const config = await getApiConfig();
      setHasAuthToken(!!config?.authToken);

      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        const currentUrl = tabs[0]?.url || "";
        setIsPlayPage(currentUrl.includes("-play"));
      });

      const autoSaveEnabled = await storage.getItem("local:autoSave");
      setAutoSave(autoSaveEnabled === true);

      // ✅ Charger le dernier statut persistant
      const savedStatus = await storage.getItem<SyncStatus>(
        "local:autoSaveStatus",
      );
      if (savedStatus) {
        setSyncStatus(savedStatus);
      }
    };

    init();

    // ✅ Watcher pour updates temps réel
    const unwatch = storage.watch<SyncStatus>(
      "local:autoSaveStatus",
      (newStatus) => {
        if (newStatus) {
          setSyncStatus(newStatus);
        }
      },
    );

    return unwatch;
  }, []);

  const handleAutoSaveChange = async (checked: boolean) => {
    setAutoSave(checked);
    await storage.setItem("local:autoSave", checked);

    if (!checked) {
      setSyncStatus({
        status: "idle",
        message: "",
        timestamp: 0,
        type: "auto",
      });
      await storage.setItem("local:autoSaveStatus", null);
    }
  };

  const syncResources = async () => {
    setLoading(true);

    // ✅ Sauvegarder loading dans storage
    const loadingStatus: SyncStatus = {
      status: "loading",
      message: "Exporting data...",
      timestamp: Date.now(),
      type: "manual",
    };

    setSyncStatus(loadingStatus);
    await storage.setItem("local:autoSaveStatus", loadingStatus);

    try {
      await syncGameResources();

      // ✅ Sauvegarder succès dans storage
      const successStatus: SyncStatus = {
        status: "success",
        message: "Game data exported successfully",
        timestamp: Date.now(),
        type: "manual",
      };

      setSyncStatus(successStatus);
      await storage.setItem("local:autoSaveStatus", successStatus);
    } catch (err: any) {
      // ✅ Sauvegarder erreur dans storage
      const errorStatus: SyncStatus = {
        status: "error",
        message: err.message || "An error occurred. Please try again.",
        timestamp: Date.now(),
        type: "manual",
      };

      setSyncStatus(errorStatus);
      await storage.setItem("local:autoSaveStatus", errorStatus);
    } finally {
      setLoading(false);
    }
  };

  const formatTimestamp = (timestamp: number) => {
    if (!timestamp) return "";
    return new Date(timestamp).toLocaleString("en-GB", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const SyncStatusDisplay = () => {
    if (syncStatus.status === "idle") {
      return (
        <div className="pt-2 text-[13px] italic">
          {!hasAuthToken && !loading && (
            <p className="text-yellow-600">
              Please open the game first to authenticate.
            </p>
          )}
          {isPlayPage && !loading && (
            <p className="text-yellow-600">Please log in to the game first.</p>
          )}
        </div>
      );
    }

    const configs = {
      loading: {
        icon: <Loader2 className="size-4 animate-spin text-blue-500" />,
        color: "text-blue-600 dark:text-blue-400",
        bgColor: "bg-blue-50 dark:bg-blue-950/30",
        borderColor: "border-blue-200 dark:border-blue-800",
      },
      success: {
        icon: <CheckCircle2 className="size-4 text-green-500" />,
        color: "text-green-600 dark:text-green-400",
        bgColor: "bg-green-50 dark:bg-green-950/30",
        borderColor: "border-green-400 dark:border-green-800",
      },
      error: {
        icon: <XCircle className="size-4 text-red-500" />,
        color: "text-red-600 dark:text-red-400",
        bgColor: "bg-red-50 dark:bg-red-950/30",
        borderColor: "border-red-400 dark:border-red-800",
      },
    };

    const config = configs[syncStatus.status];
    const typeLabel =
      syncStatus.type === "auto" ? "Auto-save" : "Manual export";

    return (
      <div className="pt-3">
        <div
          className={`p-2.5 rounded-md border ${config.bgColor} ${config.borderColor}`}
        >
          <div className="flex items-start gap-2">
            {config.icon}
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <p className={`text-xs font-medium ${config.color}`}>
                  {syncStatus.message}
                </p>
                <span className="text-[10px] text-muted-foreground px-1.5 py-0.5 bg-background/50 rounded">
                  {typeLabel}
                </span>
              </div>
              {syncStatus.timestamp > 0 && (
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  {formatTimestamp(syncStatus.timestamp)}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    );
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

        <SyncStatusDisplay />
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
