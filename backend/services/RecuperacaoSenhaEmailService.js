import { createHash, randomBytes } from "node:crypto";
import { gerarHashSenha } from "./AutenticacaoService.js";

const RESPOSTA_GENERICA = { mensagem: "Se o e-mail existir, enviaremos as instruções para redefinir sua senha." };
const emailValido = (email) => typeof email === "string" && email.length <= 100
  && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
const hashToken = (token) => createHash("sha256").update(token).digest("hex");

export function criarRecuperacaoSenhaService({ usuarioModel, recuperacaoSenhaModel, emailService, env = process.env }) {
  async function solicitarRedefinicao(emailRecebido) {
    if (!emailValido(emailRecebido)) throw Object.assign(new Error("Informe um e-mail válido."), { status: 400 });
    const email = emailRecebido.trim().toLowerCase();
    const usuario = await usuarioModel.buscarPorEmail(email);
    if (!usuario || usuario.status !== "Ativo") return RESPOSTA_GENERICA;

    const token = randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 30 * 60_000);
    await recuperacaoSenhaModel.criarToken({ idUsuario: usuario.id_usuario, tokenHash: hashToken(token), expiresAt });
    const baseUrl = (env.FRONTEND_URL || "http://localhost:3000").replace(/\/$/, "");
    const link = `${baseUrl}/reset-password?token=${encodeURIComponent(token)}`;
    try {
      await emailService.enviarLinkRedefinicao({ destinatario: usuario.email, link });
    } catch (error) {
      console.error("Falha ao enviar e-mail de recuperação.");
      await recuperacaoSenhaModel.revogarToken(hashToken(token)).catch(() => {});
    }
    return RESPOSTA_GENERICA;
  }

  async function redefinirSenha({ token, senha }) {
    if (typeof token !== "string" || !/^[a-f\d]{64}$/i.test(token)) throw tokenInvalido();
    if (typeof senha !== "string" || senha.length < 8 || senha.length > 72 || !/[A-Za-z]/.test(senha) || !/\d/.test(senha)) {
      throw Object.assign(new Error("A senha deve ter entre 8 e 72 caracteres e conter letras e números."), { status: 400 });
    }
    const registro = await recuperacaoSenhaModel.buscarTokenAtivo(hashToken(token));
    if (!registro) throw tokenInvalido();
    const atualizado = await recuperacaoSenhaModel.consumirToken({
      ...registro,
      senhaHash: await gerarHashSenha(senha),
    });
    if (!atualizado) throw tokenInvalido();
    return { mensagem: "Senha redefinida com sucesso." };
  }

  return { solicitarRedefinicao, redefinirSenha };
}

function tokenInvalido() {
  return Object.assign(new Error("Link inválido, expirado ou já utilizado. Solicite um novo link de redefinição."), { status: 400 });
}
