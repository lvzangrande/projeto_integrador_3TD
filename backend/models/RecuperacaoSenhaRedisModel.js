const PREFIXO = "wapi:password-reset";
function chaveToken(hash) { return `${PREFIXO}:token:${hash}`; }
function chaveUsuario(id) { return `${PREFIXO}:user:${id}`; }
function chaveLimite(id) { return `${PREFIXO}:request:${id}`; }

export function criarRecuperacaoSenhaRedisModel({ redisClient, pool }) {
  async function criarToken({ idUsuario, hashToken, expiraEm }) {
    const expiracaoMs = Date.parse(`${expiraEm.replace(" ", "T")}Z`);
    const ttlSegundos = Math.floor((expiracaoMs - Date.now()) / 1000);
    if (!Number.isFinite(ttlSegundos) || ttlSegundos < 1) return false;

    // Um pedido por usuário a cada 60s; SET NX é atômico no Redis.
    const permitido = await redisClient.set(chaveLimite(idUsuario), "1", { NX: true, EX: 60 });
    if (permitido !== "OK") return false;

    const hashAnterior = await redisClient.get(chaveUsuario(idUsuario));
    const operacao = redisClient.multi();
    if (hashAnterior) operacao.del(chaveToken(hashAnterior));
    operacao.set(chaveToken(hashToken), String(idUsuario), { EX: ttlSegundos });
    operacao.set(chaveUsuario(idUsuario), hashToken, { EX: ttlSegundos });
    await operacao.exec();
    return true;
  }

  async function revogarToken(hashToken) {
    const idUsuario = await redisClient.getDel(chaveToken(hashToken));
    if (idUsuario) {
      const chave = chaveUsuario(idUsuario);
      if (await redisClient.get(chave) === hashToken) await redisClient.del(chave);
    }
  }

  async function tokenValido(hashToken) {
    return (await redisClient.exists(chaveToken(hashToken))) > 0;
  }

  async function redefinirSenha(hashToken, senhaHash) {
    // GETDEL garante consumo atômico: duas requisições concorrentes não reutilizam o token.
    const idUsuario = await redisClient.getDel(chaveToken(hashToken));
    if (!idUsuario) return false;
    const [resultado] = await pool.query(
      "UPDATE usuarios SET senha = ? WHERE id_usuario = ?",
      [senhaHash, idUsuario],
    );
    const chave = chaveUsuario(idUsuario);
    if (await redisClient.get(chave) === hashToken) await redisClient.del(chave);
    return resultado.affectedRows === 1;
  }

  return { criarToken, revogarToken, tokenValido, redefinirSenha };
}
