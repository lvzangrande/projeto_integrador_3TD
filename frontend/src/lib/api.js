const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080").replace(/\/+$/, "");

function getApiUrl() {
  let base = API_BASE_URL;
  if (typeof window !== "undefined" && process.env.NODE_ENV !== "production") {
    try {
      const url = new URL(base);
      const browserHost = window.location.hostname;
      if (["localhost", "127.0.0.1"].includes(url.hostname) && ["localhost", "127.0.0.1"].includes(browserHost)) {
        url.hostname = browserHost;
        base = url.toString().replace(/\/+$/, "");
      }
    } catch {
      // A URL inválida será apresentada como erro de conexão pelo fetch.
    }
  }

  return /\/api$/i.test(base) ? base : `${base}/api`;
}

export async function apiRequest(path, options = {}) {
  const apiUrl = getApiUrl();
  const response = await fetch(`${apiUrl}${path.startsWith("/") ? path : `/${path}`}`, {
    ...options,
    credentials: "include",
    headers: {
      ...(options.body ? { "Content-Type": "application/json" } : {}),
      ...options.headers,
    },
    cache: "no-store",
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(payload.erro || payload.mensagem || `Erro na API (${response.status})`);
  return payload.dados ?? payload;
}
