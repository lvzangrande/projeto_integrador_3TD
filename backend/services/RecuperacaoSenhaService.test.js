import test from "node:test";
import assert from "node:assert/strict";
import { criarRecuperacaoSenhaService } from "./RecuperacaoSenhaEmailService.js";

function criarMocks() {
  const chamadas = { criado: null, redefinido: null, email: null };
  const usuarioModel = { buscarPorEmail: async () => ({ id_usuario: 7, email: "pessoa@example.com", status: "Ativo" }) };
  const recuperacaoSenhaModel = {
    criarToken: async (token) => { chamadas.criado = token; },
    buscarTokenAtivo: async (hash) => hash === chamadas.criado?.tokenHash ? { id: 3, idUsuario: 7 } : null,
    consumirToken: async (dados) => { chamadas.redefinido = dados; return true; },
  };
  const emailService = { enviarLinkRedefinicao: async (email) => { chamadas.email = email; } };
  return { chamadas, service: criarRecuperacaoSenhaService({ usuarioModel, recuperacaoSenhaModel, emailService, env: { FRONTEND_URL: "http://localhost:3000" } }) };
}

test("solicita link com token de 32 bytes e persiste somente o hash", async () => {
  const { chamadas, service } = criarMocks();
  const resposta = await service.solicitarRedefinicao("PESSOA@example.com");
  const token = new URL(chamadas.email.link).searchParams.get("token");
  assert.equal(resposta.mensagem, "Se o e-mail existir, enviaremos as instruções para redefinir sua senha.");
  assert.equal(Buffer.from(token, "hex").length, 32);
  assert.equal(chamadas.criado.tokenHash.length, 64);
  assert.notEqual(chamadas.criado.tokenHash, token);
  assert.match(chamadas.email.link, /\/reset-password\?token=/);
  assert.ok(chamadas.criado.expiresAt instanceof Date);
});

test("redefine senha com token válido e rejeita token inválido", async () => {
  const { chamadas, service } = criarMocks();
  await service.solicitarRedefinicao("pessoa@example.com");
  const token = new URL(chamadas.email.link).searchParams.get("token");
  await service.redefinirSenha({ token, senha: "novaSenha123" });
  assert.equal(chamadas.redefinido.idUsuario, 7);
  assert.match(chamadas.redefinido.senhaHash, /^scrypt\$/);
  await assert.rejects(service.redefinirSenha({ token: "a".repeat(64), senha: "novaSenha123" }), /Link inválido/);
});
