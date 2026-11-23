export function criarRecuperacaoSenhaModel({ pool }) {
  async function criarToken({ idUsuario, hashToken, expiraEm }) {
    const conexao = await pool.getConnection();
    try {
      await conexao.beginTransaction();
      const [recentes] = await conexao.query(
        `SELECT id_token FROM tokens_redefinicao_senha
         WHERE id_usuario = ?
           AND criado_em > DATE_SUB(UTC_TIMESTAMP(), INTERVAL 60 SECOND)
         LIMIT 1 FOR UPDATE`,
        [idUsuario],
      );
      if (recentes.length > 0) {
        await conexao.rollback();
        return false;
      }

      await conexao.query(
        "DELETE FROM tokens_redefinicao_senha WHERE id_usuario = ? OR expira_em <= UTC_TIMESTAMP()",
        [idUsuario],
      );
      await conexao.query(
        `INSERT INTO tokens_redefinicao_senha (id_usuario, token_hash, expira_em, criado_em)
         VALUES (?, ?, ?, UTC_TIMESTAMP())`,
        [idUsuario, hashToken, expiraEm],
      );
      await conexao.commit();
      return true;
    } catch (error) {
      await conexao.rollback();
      throw error;
    } finally {
      conexao.release();
    }
  }

  async function revogarToken(hashToken) {
    await pool.query("DELETE FROM tokens_redefinicao_senha WHERE token_hash = ?", [hashToken]);
  }

  async function tokenValido(hashToken) {
    const [tokens] = await pool.query(
      `SELECT 1 FROM tokens_redefinicao_senha
       WHERE token_hash = ? AND usado_em IS NULL AND expira_em > UTC_TIMESTAMP()
       LIMIT 1`,
      [hashToken],
    );
    return tokens.length > 0;
  }

  async function redefinirSenha(hashToken, senhaHash) {
    const conexao = await pool.getConnection();
    try {
      await conexao.beginTransaction();
      const [tokens] = await conexao.query(
        `SELECT id_usuario FROM tokens_redefinicao_senha
         WHERE token_hash = ? AND usado_em IS NULL AND expira_em > UTC_TIMESTAMP()
         LIMIT 1 FOR UPDATE`,
        [hashToken],
      );
      if (tokens.length === 0) {
        await conexao.rollback();
        return false;
      }

      const idUsuario = tokens[0].id_usuario;
      await conexao.query("UPDATE usuarios SET senha = ? WHERE id_usuario = ?", [senhaHash, idUsuario]);
      await conexao.query(
        "UPDATE tokens_redefinicao_senha SET usado_em = UTC_TIMESTAMP() WHERE id_usuario = ? AND usado_em IS NULL",
        [idUsuario],
      );
      await conexao.commit();
      return true;
    } catch (error) {
      await conexao.rollback();
      throw error;
    } finally {
      conexao.release();
    }
  }

  return { criarToken, revogarToken, tokenValido, redefinirSenha };
}
