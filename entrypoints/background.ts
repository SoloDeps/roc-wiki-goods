// entrypoints/background.ts
import { storage } from "#imports";
import { getApiConfig } from "@/lib/roc/tokenCapture";
import { syncGameResources } from "@/lib/roc/rocApi";

export default defineBackground(() => {
  // Détecter quand un onglet est mis à jour (navigation)
  chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
    // Vérifier si la page est complètement chargée et si c'est une page de jeu
    if (
      changeInfo.status === "complete" &&
      tab.url &&
      tab.url.includes("riseofcultures.com")
    ) {
      // Permettre les pages avec -play pour gérer la redirection automatique
      console.log("[RoC Background] 🎮 Page de jeu détectée:", tab.url);

      // Vérifier si c'est une page de jeu (pas de connexion) et si l'auto-save est activé
      const isPlayPage = tab.url.includes("-play");
      if (!isPlayPage) {
        const autoSave = await storage.getItem("local:autoSave");
        if (autoSave === true) {
          console.log(
            "[RoC Background] 🔄 Auto-sync activé, vérification du token..."
          );

          // Afficher le badge de traitement uniquement si auto-save est activé
          chrome.action.setBadgeText({
            text: "...",
            tabId: tabId,
          });

          chrome.action.setBadgeBackgroundColor({
            color: "#FF8800", // Orange moderne
            tabId: tabId,
          });

          chrome.action.setBadgeTextColor({
            color: "#FFFFFF", // Texte blanc
            tabId: tabId,
          });

          // Attendre 3 secondes pour que la page se charge complètement
          await new Promise((resolve) => setTimeout(resolve, 3000));

          // Vérifier si on a un token
          const config = await getApiConfig();
          if (config?.authToken) {
            console.log(
              "[RoC Background] Token trouvé, lancement de la synchronisation..."
            );

            try {
              // Lancer la synchronisation
              await syncGameResources();

              // Petit délai pour que le badge orange soit visible
              await new Promise((resolve) => setTimeout(resolve, 1000));

              // Envoyer un message de succès au content script pour le badge
              try {
                chrome.tabs.sendMessage(tabId, {
                  type: "DATA_SAVED",
                  success: true,
                });
              } catch (msgError) {
                console.log(
                  "[RoC Background] ⚠️ Content script non disponible pour le message de succès"
                );
              }

              // Mettre le badge de succès directement
              chrome.action.setBadgeText({
                text: "✓",
                tabId: tabId,
              });

              chrome.action.setBadgeBackgroundColor({
                color: "#00C851",
                tabId: tabId,
              });

              chrome.action.setBadgeTextColor({
                color: "#FFFFFF",
                tabId: tabId,
              });

              console.log(
                "[RoC Background] ✅ Synchronisation automatique réussie"
              );
            } catch (error: any) {
              console.log(
                "[RoC Background] ❌ Erreur lors de la synchronisation:" + error
              );

              // Envoyer un message d'erreur
              try {
                chrome.tabs.sendMessage(tabId, {
                  type: "DATA_ERROR",
                  error: error.message || "Erreur inconnue",
                });
              } catch (msgError) {
                console.log(
                  "[RoC Background] ⚠️ Content script non disponible pour le message d'erreur"
                );
              }

              // Mettre le badge d'erreur directement
              chrome.action.setBadgeText({
                text: "Ｘ",
                tabId: tabId,
              });

              chrome.action.setBadgeBackgroundColor({
                color: "#FF4444",
                tabId: tabId,
              });

              chrome.action.setBadgeTextColor({
                color: "#FFFFFF",
                tabId: tabId,
              });
            }
          } else {
            console.log("[RoC Background] ❌ Pas de token disponible");
          }
        }
      }
    }
  });

  chrome.runtime.onMessage.addListener((message, sender) => {
    if (!sender.tab?.id) return;

    const tabId = sender.tab.id;

    // Badge de succès - style Wappalyzer
    if (message.type === "DATA_SAVED" && message.success) {
      chrome.action.setBadgeText({
        text: "✓",
        tabId: tabId,
      });

      chrome.action.setBadgeBackgroundColor({
        color: "#00C851", // Vert moderne (comme Wappalyzer)
        tabId: tabId,
      });

      chrome.action.setBadgeTextColor({
        color: "#FFFFFF", // Texte blanc
        tabId: tabId,
      });
    }

    // Badge d'erreur - style moderne
    if (message.type === "DATA_ERROR") {
      chrome.action.setBadgeText({
        text: "×",
        tabId: tabId,
      });

      chrome.action.setBadgeBackgroundColor({
        color: "#FF4444", // Rouge moderne
        tabId: tabId,
      });

      chrome.action.setBadgeTextColor({
        color: "#FFFFFF", // Texte blanc
        tabId: tabId,
      });

      console.error("[RoC Background] Erreur API:", message.error);
    }
  });
});
