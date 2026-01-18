export default defineUnlistedScript(() => {
  if ((window as any).__rocHeadersCaptured) {
    console.log("[RoC Injected] Headers already captured, skip");
    return;
  }

  console.log("[RoC Injected] 🎯 Capturing API headers...");

  const originalXHROpen = XMLHttpRequest.prototype.open;
  const originalXHRSend = XMLHttpRequest.prototype.send;

  XMLHttpRequest.prototype.open = function (
    method: string,
    url: string | URL,
    ...args: any[]
  ) {
    (this as any)._url = url.toString();
    (this as any)._method = method;

    const headers: Record<string, string> = {};
    const originalSetRequestHeader = this.setRequestHeader;

    this.setRequestHeader = function (name: string, value: string) {
      headers[name.toLowerCase()] = value;
      return originalSetRequestHeader.apply(this, [name, value]);
    };

    (this as any)._headers = headers;
    return originalXHROpen.apply(this, [method, url, ...args] as any);
  };

  XMLHttpRequest.prototype.send = function (
    body?: Document | XMLHttpRequestBodyInit | null
  ) {
    this.addEventListener("load", function () {
      const url = (this as any)._url || "";

      if (!url.includes("/game/") || (window as any).__rocHeadersCaptured)
        return;

      const headers = (this as any)._headers || {};
      if (!headers["x-auth-token"]) return;

      console.log("[RoC Injected] ✅ Headers captured from:", url);

      const urlObj = new URL(url);
      (window as any).__rocHeadersCaptured = true;

      window.postMessage(
        {
          source: "roc-headers-capture",
          event: "headersCaptured",
          data: {
            apiServer: urlObj.origin,
            referer: window.location.origin,
            origin: window.location.origin,
            authToken: headers["x-auth-token"],
            clientVersion: headers["x-clientversion"] || "1.127.6",
            platform: headers["x-platform"] || "Browser",
            os: headers["x-os"] || "Browser",
            appStore: headers["x-appstore"] || "None",
            userAgent: navigator.userAgent,
            acceptLanguage: headers["accept-language"] || navigator.language,
            allHeaders: headers,
            capturedAt: new Date().toISOString(),
          },
        },
        "*"
      );
    });

    return originalXHRSend.apply(this, [body] as any);
  };

  console.log("[RoC Injected] 👂 Waiting for /game/* request...");
});
