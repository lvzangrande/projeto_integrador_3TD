import { randomBytes, scrypt, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";

const scryptAsync = promisify(scrypt);

export async function gerarHashSenha(senha) {
  const salt = randomBytes(16).toString("hex");
  const hash = await scryptAsync(senha, salt, 64);
  return `scrypt$${salt}$${Buffer.from(hash).toString("hex")}`;
}

async function conferirSenha(senha, armazenada) {
  if (armazenada?.startsWith("scrypt$")) {
    const [, salt, hashHex] = armazenada.split("$");
    if (!salt || !hashHex) return false;
    const hashSalvo = Buffer.from(hashHex, "hex");
    const hashRecebido = Buffer.from(await scryptAsync(senha, salt, hashSalvo.length));
    return hashSalvo.length === hashRecebido.length && timingSafeEqual(hashSalvo, hashRecebido);
  }

  // Contas criadas pelo seed legado ainda têm senha em texto simples.
  const senhaBuffer = Buffer.from(String(senha));
  const legadoBuffer = Buffer.from(String(armazenada ?? ""));
  return senhaBuffer.length === legadoBuffer.length && timingSafeEqual(senhaBuffer, legadoBuffer);
}

export function criarAutenticacaoService({ usuarioModel }) {
  async function entrar({ email, senha }) {
    const emailLimpo = typeof email === "string" ? email.trim().toLowerCase() : "";
    if (!emailLimpo || typeof senha !== "string" || !senha) {
      throw Object.assign(new Error("Informe e-mail e senha."), { status: 400 });
    }

    const usuario = await usuarioModel.buscarPorEmail(emailLimpo);
    const senhaValida = usuario && await conferirSenha(senha, usuario.senha);
    if (!senhaValida || usuario.status !== "Ativo") {
      throw Object.assign(new Error("E-mail ou senha inválidos."), { status: 401 });
    }

    if (!usuario.senha.startsWith("scrypt$")) {
      const senhaHash = await gerarHashSenha(senha);
      await usuarioModel.atualizarSenha(usuario.id_usuario, senhaHash);
    }

    return {
      usuario: {
        id_usuario: usuario.id_usuario,
        nome: usuario.nome,
        email: usuario.email,
        categoria: usuario.categoria,
        tema: usuario.tema,
      },
    };
  }

  return { entrar };
}
