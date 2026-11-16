const pt = new Intl.NumberFormat("pt-BR");
const brl = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

export const formatarInteiro = (valor) => pt.format(Number(valor) || 0);
export const formatarM3 = (valor) => `${pt.format(Number(valor) || 0)} m³`;
export const formatarVolume = (valor) => `${pt.format(Number(valor) || 0)} L`;
export const formatarMoeda = (valor) => brl.format(Number(valor) || 0);
export const plural = (quantidade, singular, pluralizado) => `${formatarInteiro(quantidade)} ${Number(quantidade) === 1 ? singular : pluralizado}`;

export function formatarDataHora(valor) {
  if (!valor) return "Data não informada";
  const data = new Date(valor);
  if (Number.isNaN(data.getTime())) return String(valor);
  return new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "short", timeZone: "America/Sao_Paulo" }).format(data);
}

export function formatarDiaMes(valor) {
  const data = new Date(`${valor}T12:00:00`);
  if (Number.isNaN(data.getTime())) return String(valor ?? "");
  return new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "short", timeZone: "America/Sao_Paulo" }).format(data);
}
