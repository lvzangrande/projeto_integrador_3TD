const API_URL = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080")
  .replace(/\/+$/, "")
  .replace(/\/api$/i, "");

export async function apiRequest(path, options = {}) {
  let token = null;
  if (typeof window !== "undefined") {
    try {
      token = window.localStorage.getItem("wapi_token");
    } catch {
      // The API remains usable when browser storage is unavailable.
    }
  }

  const response = await fetch(`${API_URL}${path.startsWith("/") ? path : `/${path}`}`, {
    ...options,
    headers: {
      ...(options.body ? { "Content-Type": "application/json" } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
    cache: "no-store",
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(payload.erro || payload.mensagem || `Erro na API (${response.status})`);
  return payload.dados ?? payload;
}
