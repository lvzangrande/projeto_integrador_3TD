import { randomBytes } from "node:crypto";

const GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token";
const GMAIL_SEND_URL = "https://gmail.googleapis.com/gmail/v1/users/me/messages/send";

function codificarHeader(valor) {
  return `=?UTF-8?B?${Buffer.from(valor, "utf8").toString("base64")}?=`;
}

function codificarParteMime(valor) {
  const base64 = Buffer.from(valor, "utf8").toString("base64");
  return base64.match(/.{1,76}/g)?.join("\r\n") ?? "";
}

function criarEmailMime({ remetente, destinatario, link, validadeMinutos }) {
  const boundary = `wapi_${randomBytes(12).toString("hex")}`;
  const assunto = codificarHeader("Redefina sua senha da WAPI");
  const texto = [
    "Recebemos uma solicitação para redefinir a senha da sua conta WAPI.",
    "",
    `Use este link para criar uma nova senha: ${link}`,
    "",
    `Por segurança, o link expira em ${validadeMinutos} minutos e só pode ser usado uma vez.`,
    "Se você não solicitou a redefinição, ignore esta mensagem.",
  ].join("\r\n");
  const html = `<!doctype html><html lang="pt-BR"><body style="margin:0;background:#eef5f8;font-family:Arial,sans-serif;color:#17384c"><main style="max-width:560px;margin:32px auto;padding:32px;background:#fff;border:1px solid #d9e8ee;border-radius:16px"><h1 style="font-size:22px">Redefina sua senha</h1><p>Recebemos uma solicitação para redefinir a senha da sua conta WAPI.</p><p style="margin:28px 0"><a href="${link}" style="display:inline-block;padding:14px 20px;border-radius:8px;background:#087fa8;color:#fff;text-decoration:none;font-weight:bold">Criar nova senha</a></p><p>Se o botão não funcionar, copie este endereço para o navegador:</p><p style="overflow-wrap:anywhere">${link}</p><p>Por segurança, o link expira em ${validadeMinutos} minutos e só pode ser usado uma vez.</p><p>Se você não solicitou a redefinição, ignore esta mensagem.</p></main></body></html>`;

  const partes = [
    `From: ${remetente}`,
    `To: ${destinatario}`,
    `Subject: ${assunto}`,
    "MIME-Version: 1.0",
    `Content-Type: multipart/alternative; boundary="${boundary}"`,
    "",
    `--${boundary}`,
    "Content-Type: text/plain; charset=UTF-8",
    "Content-Transfer-Encoding: base64",
    "",
    codificarParteMime(texto),
    `--${boundary}`,
    "Content-Type: text/html; charset=UTF-8",
    "Content-Transfer-Encoding: base64",
    "",
    codificarParteMime(html),
    `--${boundary}--`,
    "",
  ];

  return Buffer.from(partes.join("\r\n"), "utf8").toString("base64url");
}

export function criarGmailEmailService({ env = process.env, fetchImpl = fetch } = {}) {
  let tokenCache = null;

  function validarConfiguracao() {
    const campos = ["GMAIL_CLIENT_ID", "GMAIL_CLIENT_SECRET", "GMAIL_REFRESH_TOKEN", "GMAIL_SENDER"];
    const ausentes = campos.filter((campo) => !env[campo]?.trim());
    const remetenteValido = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(env.GMAIL_SENDER ?? "");
    if (ausentes.length || !remetenteValido) {
      throw Object.assign(new Error("O envio de recuperação está temporariamente indisponível."), { status: 503 });
    }
  }

  async function obterAccessToken() {
    if (tokenCache && tokenCache.expiraEm > Date.now() + 60_000) return tokenCache.accessToken;

    const corpo = new URLSearchParams({
      client_id: env.GMAIL_CLIENT_ID,
      client_secret: env.GMAIL_CLIENT_SECRET,
      refresh_token: env.GMAIL_REFRESH_TOKEN,
      grant_type: "refresh_token",
    });
    const response = await fetchImpl(GOOGLE_TOKEN_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: corpo,
      signal: AbortSignal.timeout(10_000),
    });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok || typeof payload.access_token !== "string") {
      throw new Error(`Falha na autenticação OAuth do Gmail (HTTP ${response.status}).`);
    }

    tokenCache = {
      accessToken: payload.access_token,
      expiraEm: Date.now() + Number(payload.expires_in || 3600) * 1000,
    };
    return tokenCache.accessToken;
  }

  async function enviarEmailRedefinicao({ destinatario, link, validadeMinutos }) {
    validarConfiguracao();
    const accessToken = await obterAccessToken();
    const raw = criarEmailMime({
      remetente: env.GMAIL_SENDER,
      destinatario,
      link,
      validadeMinutos,
    });
    const response = await fetchImpl(GMAIL_SEND_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ raw }),
      signal: AbortSignal.timeout(10_000),
    });
    if (!response.ok) {
      if (response.status === 401 || response.status === 403) tokenCache = null;
      throw new Error(`A API do Gmail recusou o envio (HTTP ${response.status}).`);
    }
  }

  return { validarConfiguracao, enviarEmailRedefinicao };
}
