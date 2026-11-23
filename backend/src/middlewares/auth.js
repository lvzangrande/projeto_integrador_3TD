import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";

const COOKIE_NAME = "wapi_session";
const SESSION_SECONDS = 60 * 60 * 8;
const signingSecret = process.env.JWT_SECRET || randomBytes(32).toString("hex");

function base64url(value) {
  return Buffer.from(value).toString("base64url");
}

function cookieOptions() {
  const secure = process.env.COOKIE_SECURE === "true" || process.env.FRONTEND_URL?.startsWith("https://");
  return {
    httpOnly: true,
    secure: Boolean(secure),
    sameSite: process.env.COOKIE_SAME_SITE || "strict",
    path: "/",
    maxAge: SESSION_SECONDS * 1000,
  };
}

function assinar(valor) {
  return createHmac("sha256", signingSecret).update(valor).digest("base64url");
}

export function criarToken(usuario) {
  const agora = Math.floor(Date.now() / 1000);
  const cabecalho = base64url(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const corpo = base64url(JSON.stringify({
    sub: usuario.id_usuario,
    nome: usuario.nome,
    email: usuario.email,
    categoria: usuario.categoria,
    iat: agora,
    exp: agora + SESSION_SECONDS,
  }));
  const semAssinatura = `${cabecalho}.${corpo}`;
  return `${semAssinatura}.${assinar(semAssinatura)}`;
}

function lerCookie(request, nome) {
  const cookies = request.headers.cookie?.split(";") ?? [];
  for (const parte of cookies) {
    const separador = parte.indexOf("=");
    if (separador < 0 || parte.slice(0, separador).trim() !== nome) continue;
    return decodeURIComponent(parte.slice(separador + 1).trim());
  }
  return null;
}

export function verificarToken(token) {
  if (!token) return null;
  const partes = token.split(".");
  if (partes.length !== 3) return null;
  const assinaturaEsperada = Buffer.from(assinar(`${partes[0]}.${partes[1]}`));
  const assinaturaRecebida = Buffer.from(partes[2]);
  if (assinaturaEsperada.length !== assinaturaRecebida.length || !timingSafeEqual(assinaturaEsperada, assinaturaRecebida)) return null;

  try {
    const claims = JSON.parse(Buffer.from(partes[1], "base64url").toString("utf8"));
    if (!Number.isInteger(claims.sub) || claims.exp <= Math.floor(Date.now() / 1000)) return null;
    return { id_usuario: claims.sub, nome: claims.nome, email: claims.email, categoria: claims.categoria };
  } catch {
    return null;
  }
}

export function autenticar(request, response, next) {
  const token = lerCookie(request, COOKIE_NAME);
  if (!token) return response.status(401).json({ erro: "Autenticação necessária. Entre na sua conta para continuar." });
  const usuario = verificarToken(token);
  if (!usuario) return response.status(401).json({ erro: "Sua sessão expirou. Entre novamente." });
  request.usuarioAutenticado = usuario;
  next();
}

export function exigirFiliado(request, response, next) {
  if (request.usuarioAutenticado?.categoria !== "Filiado") {
    return response.status(403).json({ erro: "Esta área está disponível somente para afiliados." });
  }
  next();
}

export function definirCookieSessao(response, usuario) {
  response.cookie(COOKIE_NAME, criarToken(usuario), cookieOptions());
}

export function limparCookieSessao(response) {
  const { maxAge, ...options } = cookieOptions();
  response.clearCookie(COOKIE_NAME, options);
}
