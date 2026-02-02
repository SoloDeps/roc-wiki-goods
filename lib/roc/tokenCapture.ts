// lib/features/tokenCapture/index.ts
// Gestion de la capture des headers et des requêtes API

export interface ApiConfig {
    apiServer: string;          // https://eu2.riseofcultures.com
    referer: string;            // https://eu0.riseofcultures.com
    origin: string;             // https://eu0.riseofcultures.com
    authToken: string;          // e0f9fa43-a55d-424e-bd56-f4c9276db608
    clientVersion: string;      // 1.127.6
    platform: string;           // Browser
    os: string;                 // Browser
    appStore: string;           // None
    userAgent: string;          // Mozilla/5.0...
    acceptLanguage: string;     // fr,fr-FR;q=0.9...
    capturedAt: string;
}

/**
 * Injecte le script de capture des headers
 */
export async function injectTokenCapture() {
    try {
        console.log('[RoC] Injection du script de capture...');
        
        const script = document.createElement('script');
        script.src = browser.runtime.getURL('/injected.js');
        script.onload = () => {
            console.log('[RoC] ✅ Script de capture injecté');
            script.remove();
        };
        (document.head || document.documentElement).appendChild(script);
        
    } catch (error) {
        console.error('[RoC] ❌ Erreur injection:', error);
    }
}

/**
 * Écoute les headers capturés
 */
export function listenForToken() {
    window.addEventListener('message', async (event: MessageEvent) => {
        if (event.source !== window) return;
        
        const data = event.data;
        if (!data || data.source !== 'roc-headers-capture') return; // ← Changé ici
        
        if (data.event === 'headersCaptured') {
            console.log('[RoC] 🔑 Headers API capturés !');
            console.log('[RoC] Server:', data.data.apiServer);
            console.log('[RoC] Version:', data.data.clientVersion);
            
            // Sauvegarder TOUTE la config API
            await chrome.storage.local.set({
                'apiConfig': data.data
            });
            
            console.log('[RoC] ✅ Configuration API sauvegardée');
        }
    });
    
    console.log('[RoC] 👂 En écoute des headers...');
}

/**
 * Récupère la configuration API complète
 */
export async function getApiConfig(): Promise<ApiConfig | null> {
    try {
        const result = await chrome.storage.local.get(['apiConfig']);
        const config = result.apiConfig;
        
        if (config && typeof config === 'object') {
            return config as ApiConfig;
        }
        return null;
    } catch (error) {
        console.error('[RoC] Erreur récupération config:', error);
        return null;
    }
}

/**
 * Récupère juste le token (pour compatibilité)
 */
export async function getAuthToken(): Promise<string | null> {
    const config = await getApiConfig();
    return config?.authToken || null;
}

/**
 * Fait une requête API authentifiée via le content script (pas de CORS)
 */
export async function fetchWithAuth(endpoint: string, options: RequestInit = {}): Promise<any> {
    return new Promise((resolve, reject) => {
        // Chercher spécifiquement un onglet avec le jeu
        chrome.tabs.query({ url: "*://*.riseofcultures.com/*" }, async (tabs) => {
            const gameTab = tabs.find(tab => 
                tab.id && 
                tab.url?.includes('riseofcultures.com') && 
                !tab.url?.includes('-play')
            );
            
            if (!gameTab?.id) {
                reject(new Error('Aucun onglet Rise of Cultures trouvé'));
                return;
            }
            
            chrome.tabs.sendMessage(gameTab.id, {
                type: 'API_REQUEST',
                endpoint,
                options
            }, (response) => {
                if (chrome.runtime.lastError) {
                    reject(new Error(chrome.runtime.lastError.message));
                    return;
                }
                
                if (response?.error) {
                    reject(new Error(response.error));
                } else {
                    resolve(response.data);
                }
            });
        });
    });
}

/**
 * Fait une requête en demandant du protobuf (comme le jeu)
 */
export async function fetchProtobuf(endpoint: string, options: RequestInit = {}): Promise<string> {
    const config = await getApiConfig();
    
    if (!config) {
        throw new Error('Configuration API non disponible. Lance le jeu d\'abord !');
    }
    
    const url = endpoint.startsWith('http') 
        ? endpoint 
        : `${config.apiServer}${endpoint}`;
    
    const headers: HeadersInit = {
        'accept': 'application/x-protobuf',
        'accept-language': config.acceptLanguage,
        'content-type': 'application/x-protobuf',
        'origin': config.origin,
        'referer': config.referer,
        'user-agent': config.userAgent,
        'x-auth-token': config.authToken,
        'x-clientversion': config.clientVersion,
        'x-platform': config.platform,
        'x-os': config.os,
        'x-appstore': config.appStore,
        ...options.headers
    };
    
    const response = await fetch(url, {
        ...options,
        headers,
        credentials: 'include'
    });
    
    if (!response.ok) {
        throw new Error(`Erreur API ${response.status}`);
    }
    
    // Convertir en base64
    const buffer = await response.arrayBuffer();
    const bytes = new Uint8Array(buffer);
    return btoa(String.fromCharCode(...bytes));
}