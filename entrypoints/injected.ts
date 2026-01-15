// entrypoints/injected.ts
// Capture TOUS les headers nécessaires pour reproduire les requêtes API

export default defineUnlistedScript(() => {
    if ((window as any).__rocHeadersCaptured) {
        console.log('[RoC Injected] Headers déjà capturés, skip');
        return;
    }
    
    console.log('[RoC Injected] 🎯 Capture des headers API...');
    
    // Intercepter XMLHttpRequest
    const originalXHROpen = XMLHttpRequest.prototype.open;
    const originalXHRSend = XMLHttpRequest.prototype.send;
    
    XMLHttpRequest.prototype.open = function(method: string, url: string | URL, ...args: any[]) {
        (this as any)._url = url.toString();
        (this as any)._method = method;
        
        // Capturer TOUS les headers
        const headers: Record<string, string> = {};
        const originalSetRequestHeader = this.setRequestHeader;
        
        this.setRequestHeader = function(name: string, value: string) {
            headers[name.toLowerCase()] = value;
            return originalSetRequestHeader.apply(this, [name, value]);
        };
        
        (this as any)._headers = headers;
        
        return originalXHROpen.apply(this, [method, url, ...args] as any);
    };
    
    XMLHttpRequest.prototype.send = function(body?: Document | XMLHttpRequestBodyInit | null) {
        this.addEventListener('load', function() {
            const url = (this as any)._url || '';
            
            // 🎯 Filtrer les requêtes /game/*
            if (!url.includes('/game/')) {
                return;
            }
            
            // Vérifier si on a déjà capturé
            if ((window as any).__rocHeadersCaptured) {
                return;
            }
            
            const headers = (this as any)._headers || {};
            
            // Vérifier qu'on a bien le token
            if (!headers['x-auth-token']) {
                return;
            }
            
            console.log('[RoC Injected] ✅ Headers capturés depuis:', url);
            
            // Extraire l'origine et le serveur depuis l'URL
            const urlObj = new URL(url);
            const apiServer = urlObj.origin; // https://eu2.riseofcultures.com
            const referer = window.location.origin; // https://eu0.riseofcultures.com
            
            // Marquer comme capturé
            (window as any).__rocHeadersCaptured = true;
            
            // Envoyer TOUS les headers nécessaires au content script
            window.postMessage({
                source: 'roc-headers-capture',
                event: 'headersCaptured',
                data: {
                    // URLs
                    apiServer: apiServer,
                    referer: referer,
                    origin: referer,
                    
                    // Headers essentiels
                    authToken: headers['x-auth-token'],
                    clientVersion: headers['x-clientversion'] || '1.127.6',
                    platform: headers['x-platform'] || 'Browser',
                    os: headers['x-os'] || 'Browser',
                    appStore: headers['x-appstore'] || 'None',
                    
                    // Headers HTTP standards
                    userAgent: navigator.userAgent,
                    acceptLanguage: headers['accept-language'] || navigator.language,
                    
                    // Tous les headers pour debug
                    allHeaders: headers,
                    
                    capturedAt: new Date().toISOString()
                }
            }, '*');
        });
        
        return originalXHRSend.apply(this, [body] as any);
    };
    
    console.log('[RoC Injected] 👂 En attente d\'une requête /game/* pour capturer les headers...');
});