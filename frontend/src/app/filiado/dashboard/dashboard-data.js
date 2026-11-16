const API_BASE = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api").replace(/\/$/, "");

/** Fetches the aggregated affiliate dashboard from the backend without caching. */
export async function getDashboardFiliado(periodo) {
  try {
    const response = await fetch(`${API_BASE}/afiliado/dashboard?periodo=${periodo}`, {
      cache: "no-store",
      headers: { Accept: "application/json" },
      signal: AbortSignal.timeout(5000),
    });
    if (!response.ok) return { dados: null };

    const payload = await response.json();
    const dados = payload?.dados ?? payload;
    if (!dados?.resumo || !Array.isArray(dados.consumo)) return { dados: null };
    return { dados };
  } catch {
    return { dados: null };
  }
}
