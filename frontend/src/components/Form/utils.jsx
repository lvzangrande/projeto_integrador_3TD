/* ---------- Máscaras e validações do formulário de cliente ----------
 * Funções puras, sem dependência de React. Fáceis de testar.
 */

export const somenteDigitos = (valor) => String(valor ?? "").replace(/\D/g, "");

/* ---------- Máscaras ---------- */

export function mascararCpf(valor) {
  const d = somenteDigitos(valor).slice(0, 11);
  let s = d.slice(0, 3);
  if (d.length > 3) s += "." + d.slice(3, 6);
  if (d.length > 6) s += "." + d.slice(6, 9);
  if (d.length > 9) s += "-" + d.slice(9, 11);
  return s;
}

export function mascararCnpj(valor) {
  const d = somenteDigitos(valor).slice(0, 14);
  let s = d.slice(0, 2);
  if (d.length > 2) s += "." + d.slice(2, 5);
  if (d.length > 5) s += "." + d.slice(5, 8);
  if (d.length > 8) s += "/" + d.slice(8, 12);
  if (d.length > 12) s += "-" + d.slice(12, 14);
  return s;
}

/* Aceita fixo (10 dígitos) e celular (11 dígitos): (00) 0000-0000 / (00) 00000-0000 */
export function mascararTelefone(valor) {
  const d = somenteDigitos(valor).slice(0, 11);
  if (d.length === 0) return "";
  if (d.length <= 2) return `(${d}`;
  const ddd = d.slice(0, 2);
  const resto = d.slice(2);
  const corte = d.length > 10 ? 5 : 4;
  return `(${ddd}) ${resto.slice(0, corte)}${resto.length > corte ? "-" + resto.slice(corte) : ""}`;
}

/* ---------- Validações ---------- */

export function validarCpf(valor) {
  const d = somenteDigitos(valor);
  if (d.length !== 11 || /^(\d)\1+$/.test(d)) return false;

  for (const t of [9, 10]) {
    let soma = 0;
    for (let i = 0; i < t; i++) soma += Number(d[i]) * (t + 1 - i);
    const dv = ((soma * 10) % 11) % 10;
    if (dv !== Number(d[t])) return false;
  }
  return true;
}

const PESOS_CNPJ_1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
const PESOS_CNPJ_2 = [6, ...PESOS_CNPJ_1];

function digitoCnpj(d, pesos) {
  const soma = pesos.reduce((acc, peso, i) => acc + Number(d[i]) * peso, 0);
  const resto = soma % 11;
  return resto < 2 ? 0 : 11 - resto;
}

export function validarCnpj(valor) {
  const d = somenteDigitos(valor);
  if (d.length !== 14 || /^(\d)\1+$/.test(d)) return false;
  return (
    digitoCnpj(d, PESOS_CNPJ_1) === Number(d[12]) &&
    digitoCnpj(d, PESOS_CNPJ_2) === Number(d[13])
  );
}

export function validarEmail(valor) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(String(valor ?? "").trim());
}

export function validarTelefone(valor) {
  const d = somenteDigitos(valor);
  return d.length === 10 || d.length === 11;
}

export const TAMANHO_MIN_SENHA = 8;

export function validarSenha(valor) {
  return String(valor ?? "").length >= TAMANHO_MIN_SENHA;
}