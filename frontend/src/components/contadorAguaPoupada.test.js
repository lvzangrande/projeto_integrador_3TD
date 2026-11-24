import test from "node:test";
import assert from "node:assert/strict";
import { formatarLitrosPoupados, normalizarLitrosPoupados } from "./contadorAguaPoupada.js";

test("normaliza valores numéricos e DECIMAL serializado como texto", () => {
  assert.equal(normalizarLitrosPoupados({ litros_por_dia: 1250.7 }), 1250.7);
  assert.equal(normalizarLitrosPoupados({ litros_por_dia: "1250.7" }), 1250.7);
});

test("formata a quantidade em litros no padrão brasileiro", () => {
  assert.equal(formatarLitrosPoupados(1250.7), "1.251 L");
  assert.equal(formatarLitrosPoupados(0), "0 L");
});

test("não transforma respostas ausentes ou inválidas em uma quantidade inventada", () => {
  assert.equal(normalizarLitrosPoupados({}), null);
  assert.equal(normalizarLitrosPoupados({ litros_por_dia: "indisponível" }), null);
  assert.equal(normalizarLitrosPoupados({ litros_por_dia: Number.NaN }), null);
  assert.equal(formatarLitrosPoupados(null), "N/D");
});

test("não mostra economia positiva quando o valor calculado é negativo", () => {
  assert.equal(normalizarLitrosPoupados({ litros_por_dia: -10 }), 0);
  assert.equal(formatarLitrosPoupados(-10), "0 L");
});
