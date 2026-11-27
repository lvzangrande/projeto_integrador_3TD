import { randomBytes, timingSafeEqual } from "node:crypto";
import { mkdir, readFile, rename, rm, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const DIRETORIO_BACKEND = dirname(dirname(fileURLToPath(import.meta.url)));
const ARQUIVO_PADRAO = join(DIRETORIO_BACKEND, "data", "recuperacao-senha.json");
const INTERVALO_ENTRE_PEDIDOS_MS = 60_000;
const JANELA_ORIGEM_MS = 15 * 60_000;
const MAX_PEDIDOS_POR_ORIGEM = 5;
const MAX_TENTATIVAS_CODIGO = 5;

function converterExpiracao(valor) {
  if (typeof valor !== "string") return Number.NaN;
  const iso = valor.includes("T") ? valor : `${valor.replace(" ", "T")}Z`;
  return Date.parse(iso);
}

function hashesIguais(armazenado, recebido) {
  if (typeof armazenado !== "string" || typeof recebido !== "string") return false;
  const hashArmazenado = Buffer.from(armazenado, "hex");
  const hashRecebido = Buffer.from(recebido, "hex");
  return hashArmazenado.length === hashRecebido.length
    && hashArmazenado.length > 0
    && timingSafeEqual(hashArmazenado, hashRecebido);
}

export function criarRecuperacaoSenhaJsonModel({
  pool,
  arquivo = ARQUIVO_PADRAO,
  agora = () => Date.now(),
}) {
  let fila = Promise.resolve();

  function serializar(operacao) {
    const resultado = fila.then(operacao, operacao);
    fila = resultado.then(() => undefined, () => undefined);
    return resultado;
  }

  async function lerArquivo() {
    try {
      const texto = await readFile(arquivo, "utf8");
      const dados = JSON.parse(texto);
      if (!dados || typeof dados !== "object" || Array.isArray(dados)) {
        throw new Error("Formato inválido no arquivo de recuperação de senha.");
      }
      return {
        tokens: Array.isArray(dados.tokens) ? dados.tokens : [],
        solicitacoes: Array.isArray(dados.solicitacoes) ? dados.solicitacoes : [],
      };
    } catch (erro) {
      if (erro.code === "ENOENT") return { tokens: [], solicitacoes: [] };
      throw erro;
    }
  }

  async function salvarArquivo(dados) {
    const diretorio = dirname(arquivo);
    const temporario = join(diretorio, `.recuperacao-senha-${randomBytes(8).toString("hex")}.tmp`);
    await mkdir(diretorio, { recursive: true });
    try {
      await writeFile(temporario, JSON.stringify(dados, null, 2), {
        encoding: "utf8",
        flag: "wx",
        mode: 0o600,
      });
      await rename(temporario, arquivo);
    } catch (erro) {
      await rm(temporario, { force: true }).catch(() => {});
      throw erro;
    }
  }

  async function criarToken({ idUsuario, hashToken, expiraEm, origemHash = null }) {
    return serializar(async () => {
      const momentoAtual = agora();
      const expiracao = converterExpiracao(expiraEm);
      if (!Number.isFinite(expiracao) || expiracao <= momentoAtual) return false;

      const id = String(idUsuario);
      const dados = await lerArquivo();
      const solicitacoesRecentes = dados.solicitacoes.filter(
        (item) => Number.isFinite(item.solicitadoEm)
          && item.solicitadoEm > momentoAtual - JANELA_ORIGEM_MS,
      );
      const solicitadoRecentemente = solicitacoesRecentes.some(
        (item) => item.idUsuario === id
          && item.solicitadoEm > momentoAtual - INTERVALO_ENTRE_PEDIDOS_MS,
      );
      const pedidosDaOrigem = origemHash
        ? solicitacoesRecentes.filter((item) => item.origemHash === origemHash).length
        : 0;
      if (solicitadoRecentemente || pedidosDaOrigem >= MAX_PEDIDOS_POR_ORIGEM) return false;

      dados.tokens = dados.tokens.filter(
        (item) => Number.isFinite(item.expiraEm)
          && item.expiraEm > momentoAtual
          && item.idUsuario !== id,
      );
      dados.tokens.push({ idUsuario: id, hashToken, expiraEm: expiracao, tentativas: 0 });
      dados.solicitacoes = solicitacoesRecentes;
      dados.solicitacoes.push({ idUsuario: id, origemHash, solicitadoEm: momentoAtual });
      await salvarArquivo(dados);
      return true;
    });
  }

  async function revogarToken(hashToken) {
    return serializar(async () => {
      const dados = await lerArquivo();
      const tokens = dados.tokens.filter((item) => item.hashToken !== hashToken);
      if (tokens.length === dados.tokens.length) return;
      dados.tokens = tokens;
      await salvarArquivo(dados);
    });
  }

  async function possuiTokenAtivo(idUsuario, hashToken) {
    return serializar(async () => {
      const dados = await lerArquivo();
      const momentoAtual = agora();
      const token = dados.tokens.find((item) => (
        item.idUsuario === String(idUsuario)
        && item.consumindo !== true
        && Number.isFinite(item.expiraEm)
        && item.expiraEm > momentoAtual
        && (Number(item.tentativas) || 0) < MAX_TENTATIVAS_CODIGO
      ));
      return Boolean(token && hashesIguais(token.hashToken, hashToken));
    });
  }

  async function registrarTentativaInvalida(idUsuario, hashToken) {
    return serializar(async () => {
      const dados = await lerArquivo();
      const momentoAtual = agora();
      const token = dados.tokens.find((item) => (
        item.idUsuario === String(idUsuario)
        && item.consumindo !== true
        && Number.isFinite(item.expiraEm)
        && item.expiraEm > momentoAtual
        && hashesIguais(item.hashToken, hashToken)
      ));
      if (!token) return false;

      token.tentativas = (Number(token.tentativas) || 0) + 1;
      if (token.tentativas >= MAX_TENTATIVAS_CODIGO) {
        dados.tokens = dados.tokens.filter((item) => item !== token);
      }
      await salvarArquivo(dados);
      return true;
    });
  }

  async function redefinirSenha(idUsuario, hashToken, senhaHash) {
    return serializar(async () => {
      const dados = await lerArquivo();
      const momentoAtual = agora();
      const id = String(idUsuario);
      const token = dados.tokens.find((item) => (
        item.idUsuario === id
        && item.consumindo !== true
        && Number.isFinite(item.expiraEm)
        && item.expiraEm > momentoAtual
      ));
      if (!token) return false;

      if (!hashesIguais(token.hashToken, hashToken)) {
        token.tentativas = (Number(token.tentativas) || 0) + 1;
        if (token.tentativas >= MAX_TENTATIVAS_CODIGO) {
          dados.tokens = dados.tokens.filter((item) => item !== token);
        }
        await salvarArquivo(dados);
        return false;
      }

      // Marca antes do UPDATE para que uma queda do servidor não permita reutilizar o token.
      token.consumindo = true;
      await salvarArquivo(dados);

      let resultado;
      try {
        [resultado] = await pool.query(
          "UPDATE usuarios SET senha = ?, session_version = session_version + 1 WHERE id_usuario = ?",
          [senhaHash, token.idUsuario],
        );
      } catch (erro) {
        token.consumindo = false;
        await salvarArquivo(dados).catch(() => {});
        throw erro;
      }
      if (resultado.affectedRows !== 1) {
        token.consumindo = false;
        await salvarArquivo(dados);
        return false;
      }

      dados.tokens = dados.tokens.filter((item) => item.idUsuario !== id);
      await salvarArquivo(dados);
      return true;
    });
  }

  return { criarToken, revogarToken, possuiTokenAtivo, registrarTentativaInvalida, redefinirSenha };
}
