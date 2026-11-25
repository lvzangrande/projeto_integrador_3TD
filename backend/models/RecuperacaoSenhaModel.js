export function criarRecuperacaoSenhaModel({ pool }) {
  async function criarToken({ idUsuario, tokenHash, expiresAt }) {
    await pool.query(
      "UPDATE password_reset_tokens SET used_at = CURRENT_TIMESTAMP WHERE user_id = ? AND used_at IS NULL",
      [idUsuario],
    );
    await pool.query(
      "INSERT INTO password_reset_tokens (user_id, token_hash, expires_at) VALUES (?, ?, ?)",
      [idUsuario, tokenHash, expiresAt],
    );
  }

  async function buscarTokenAtivo(tokenHash) {
    const [rows] = await pool.query(
      `SELECT id, user_id AS idUsuario FROM password_reset_tokens
       WHERE token_hash = ? AND used_at IS NULL AND expires_at > CURRENT_TIMESTAMP LIMIT 1`,
      [tokenHash],
    );
    return rows[0] ?? null;
  }

  async function revogarToken(tokenHash) {
    await pool.query(
      "UPDATE password_reset_tokens SET used_at = CURRENT_TIMESTAMP WHERE token_hash = ? AND used_at IS NULL",
      [tokenHash],
    );
  }

  async function consumirToken({ id, idUsuario, senhaHash }) {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();
      const [tokens] = await connection.query(
        `SELECT id FROM password_reset_tokens WHERE id = ? AND user_id = ?
         AND used_at IS NULL AND expires_at > CURRENT_TIMESTAMP FOR UPDATE`,
        [id, idUsuario],
      );
      if (!tokens.length) {
        await connection.rollback();
        return false;
      }
      const [updated] = await connection.query("UPDATE usuarios SET senha = ?, session_version = session_version + 1 WHERE id_usuario = ?", [senhaHash, idUsuario]);
      if (updated.affectedRows !== 1) {
        await connection.rollback();
        return false;
      }
      await connection.query("UPDATE password_reset_tokens SET used_at = CURRENT_TIMESTAMP WHERE user_id = ? AND used_at IS NULL", [idUsuario]);
      await connection.commit();
      return true;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  return { criarToken, buscarTokenAtivo, revogarToken, consumirToken };
}
