export const fmtNumero = (valor, casas = 1) => valor == null || valor === "" ? "—" : new Intl.NumberFormat("pt-BR", { maximumFractionDigits: casas }).format(Number(valor));
export const fmtData = (valor, comHora = true) => {
  if (!valor) return "—";
  const data = new Date(String(valor).replace(" ", "T"));
  return Number.isNaN(data.getTime()) ? "—" : new Intl.DateTimeFormat("pt-BR", { dateStyle: "medium", ...(comHora ? { timeStyle: "short" } : {}) }).format(data);
};
export const ocorrenciaAtiva = (item) => !["Resolvida", "Descartada"].includes(item.status);
export const statusClasse = (valor) => {
  const texto = String(valor || "").toLowerCase();
  if (texto.includes("crít") || texto.includes("extrema") || texto.includes("alta")) return "critico";
  if (texto.includes("aten") || texto.includes("análise") || texto.includes("reparo") || texto.includes("média") || texto.includes("aberta")) return "atencao";
  if (texto.includes("resolv") || texto.includes("normal") || texto === "ativo") return "normal";
  return "neutro";
};
export const pesquisar = (items, fields, term) => {
  const query = term.trim().toLocaleLowerCase("pt-BR");
  if (!query) return items;
  return items.filter((item) => fields.some((field) => String(item[field] ?? "").toLocaleLowerCase("pt-BR").includes(query)));
};
export function baixarTxt(nome, linhas) {
  const arquivo = new Blob([`\uFEFF${linhas.join("\r\n")}\r\n`], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(arquivo);
  const link = document.createElement("a");
  link.href = url;
  link.download = nome;
  document.body.append(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
export async function carregarOperacao(apiRequest) {
  const data = await apiRequest("/cliente/operacao");
  return {
    reservatorios: Array.isArray(data.reservatorios) ? data.reservatorios : [],
    setores: Array.isArray(data.setores) ? data.setores : [],
    medidores: Array.isArray(data.medidores) ? data.medidores : [],
    responsaveis: Array.isArray(data.responsaveis) ? data.responsaveis : [],
    leituras: Array.isArray(data.leituras) ? data.leituras : [],
    ocorrencias: Array.isArray(data.ocorrencias) ? data.ocorrencias : [],
  };
}
