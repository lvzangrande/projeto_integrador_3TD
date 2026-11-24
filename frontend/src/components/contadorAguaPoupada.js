const formatador = new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 0 });

export function normalizarLitrosPoupados(dados) {
  const valorRecebido = dados?.litros_por_dia;
  const valor = typeof valorRecebido === "string" && valorRecebido.trim() !== ""
    ? Number(valorRecebido)
    : valorRecebido;

  if (typeof valor !== "number" || !Number.isFinite(valor)) return null;
  return Math.max(0, valor);
}

export function formatarLitrosPoupados(litros) {
  if (typeof litros !== "number" || !Number.isFinite(litros)) return "N/D";
  return `${formatador.format(Math.max(0, litros))} L`;
}
