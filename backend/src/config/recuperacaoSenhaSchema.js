export async function garantirEsquemaRecuperacaoSenha(pool) {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS tokens_redefinicao_senha (
      id_token BIGINT PRIMARY KEY AUTO_INCREMENT,
      id_usuario INT NOT NULL,
      token_hash CHAR(64) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
      expira_em DATETIME NOT NULL,
      usado_em DATETIME NULL,
      criado_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      UNIQUE KEY uq_tokens_redefinicao_hash (token_hash),
      INDEX idx_tokens_redefinicao_usuario_criado (id_usuario, criado_em),
      INDEX idx_tokens_redefinicao_expira (expira_em),
      CONSTRAINT fk_tokens_redefinicao_usuario FOREIGN KEY (id_usuario)
        REFERENCES usuarios(id_usuario) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);
}
