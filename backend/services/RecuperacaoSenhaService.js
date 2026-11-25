import { createHash, randomBytes } from "node:crypto";
import { gerarHashSenha } from "./AutenticacaoService.js";

const RESPOSTA_GENERICA = {
  mensagem: "Se houver uma conta ativa com esse e-mail, enviaremos um link de recuperação.",
};

function hashToken(token) {
  return createHash("sha256").update(token).digest("hex");
}

function validarEmail(email) {
  const emailLimpo = typeof email === "string" ? email.trim().toLowerCase() : "";
  if (emailLimpo.length > 100 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailLimpo)) {
    throw Object.assign(new Error("Digite um e-mail válido."), { status: 400 });
  }
  return emailLimpo;
}

function obterValidadeMinutos(env) {
  const configurada = Number.parseInt(env.PASSWORD_RESET_TTL_MINUTES, 10);
  return Number.isFinite(configurada) ? Math.min(60, Math.max(5, configurada)) : 30;
}

function criarLink(frontendUrl, token) {
  let link;
  try {
    link = new URL("/esqueceu_senha/trocar-senha", frontendUrl);
  } catch {
    throw new Error("A URL do frontend para redefinição de senha não está configurada corretamente.");
  }
  if (!["http:", "https:"].includes(link.protocol)) {
    throw new Error("A URL do frontend para redefinição de senha não está configurada corretamente.");
  }
  link.searchParams.set("token", token);
  return link.toString();
}

function obterUrlBaseFrontend(env) {
  const configurada = env.FRONTEND_URL?.trim();
  const valor = configurada || (env.NODE_ENV === "production" ? "" : "http://localhost:3000");
  try {
    const url = new URL(valor);
    if (!["http:", "https:"].includes(url.protocol)) throw new Error("Protocolo inválido");
    return url.origin;
  } catch {
    throw Object.assign(new Error("O envio de recuperação está temporariamente indisponível."), { status: 503 });
  }
}

export function criarRecuperacaoSenhaService({
  usuarioModel,
  recuperacaoSenhaModel,
  gmailEmailService,
  env = process.env,
  agora = () => Date.now(),
}) {
  async function solicitarRedefinicao(email) {
    const emailLimpo = validarEmail(email);
    // Falha igual para qualquer endereço quando o Gmail não está configurado.
    gmailEmailService.validarConfiguracao();
    const frontendUrl = obterUrlBaseFrontend(env);

    let usuario;
    try {
      // Consulta somente os dados necessários para confirmar que a conta existe e está ativa.
      usuario = await usuarioModel.buscarContaParaRecuperacao(emailLimpo);
    } catch (error) {
      console.error("Falha ao consultar a conta para recuperação de senha:", error.message);
      throw Object.assign(
        new Error("A recuperação de senha está temporariamente indisponível. Tente novamente mais tarde."),
        { status: 503 },
      );
    }
    if (!usuario || usuario.status !== "Ativo") return RESPOSTA_GENERICA;

    let hashCriado = null;
    try {
      const token = randomBytes(32).toString("hex");
      const tokenHash = hashToken(token);
      const validadeMinutos = obterValidadeMinutos(env);
      const expiraEm = new Date(agora() + validadeMinutos * 60_000)
        .toISOString()
        .slice(0, 19)
        .replace("T", " ");
      const criado = await recuperacaoSenhaModel.criarToken({
        idUsuario: usuario.id_usuario,
        hashToken: tokenHash,
        expiraEm,
      });
      if (!criado) return RESPOSTA_GENERICA;
      hashCriado = tokenHash;

      const link = criarLink(frontendUrl, token);
      await gmailEmailService.enviarEmailRedefinicao({
        destinatario: usuario.email,
        link,
        validadeMinutos,
      });
    } catch (error) {
      if (hashCriado) {
        try {
          await recuperacaoSenhaModel.revogarToken(hashCriado);
        } catch (erroRevogacao) {
          console.error("Falha ao invalidar token de recuperação não enviado:", erroRevogacao.message);
        }
      }
      // Mantém a resposta igual para endereços existentes e inexistentes.
      console.error("Falha ao processar recuperação de senha:", error.message);
    }

    return RESPOSTA_GENERICA;
  }

  async function redefinirSenha({ token, senha }) {
    if (typeof token !== "string" || !/^[a-f0-9]{64}$/.test(token)) {
      throw Object.assign(new Error("Este link é inválido ou expirou. Solicite outro link de recuperação."), { status: 400 });
    }
    if (typeof senha !== "string" || senha.length < 8 || senha.length > 72 || !/[A-Za-z]/.test(senha) || !/\d/.test(senha)) {
      throw Object.assign(new Error("A senha deve ter entre 8 e 72 caracteres e conter letras e números."), { status: 400 });
    }

    const tokenHash = hashToken(token);
    if (!await recuperacaoSenhaModel.tokenValido(tokenHash)) {
      throw Object.assign(new Error("Este link é inválido ou expirou. Solicite outro link de recuperação."), { status: 400 });
    }
    const atualizado = await recuperacaoSenhaModel.redefinirSenha(tokenHash, await gerarHashSenha(senha));
    if (!atualizado) {
      throw Object.assign(new Error("Este link é inválido ou expirou. Solicite outro link de recuperação."), { status: 400 });
    }
    return { mensagem: "Senha redefinida com sucesso." };
  }

  async function validarToken(token) {
    if (typeof token !== "string" || !/^[a-f0-9]{64}$/.test(token)
      || !await recuperacaoSenhaModel.tokenValido(hashToken(token))) {
      throw Object.assign(new Error("Este link é inválido ou expirou. Solicite outro link de recuperação."), { status: 400 });
    }
    return { valido: true };
  }

  return { solicitarRedefinicao, validarToken, redefinirSenha };
}
