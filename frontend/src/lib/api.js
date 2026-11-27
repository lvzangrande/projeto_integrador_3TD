const API_URL = (
  process.env.NODE_ENV === "production"
    ? "/api"
    : process.env.NEXT_PUBLIC_API_URL || "/api"
).replace(/\/+$/, "");

export async function apiRequest(path, options = {}) {
  const response = await fetch(`${API_URL}${path.startsWith("/") ? path : `/${path}`}`, {
    ...options,
    credentials: options.credentials || "include",
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
