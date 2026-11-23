const columns = [
  ["medidores", "status", "ALTER TABLE medidores ADD COLUMN status ENUM('Ativo', 'Inativo') NOT NULL DEFAULT 'Ativo'"],
  ["responsaveis", "nome", "ALTER TABLE responsaveis ADD COLUMN nome VARCHAR(100) NULL"],
  ["responsaveis", "funcao", "ALTER TABLE responsaveis ADD COLUMN funcao VARCHAR(120) NULL"],
  ["responsaveis", "telefone", "ALTER TABLE responsaveis ADD COLUMN telefone VARCHAR(20) NULL"],
  ["responsaveis", "email", "ALTER TABLE responsaveis ADD COLUMN email VARCHAR(100) NULL"],
  ["responsaveis", "id_setor", "ALTER TABLE responsaveis ADD COLUMN id_setor INT NULL"],
  ["responsaveis", "status", "ALTER TABLE responsaveis ADD COLUMN status ENUM('Ativo', 'Inativo') NOT NULL DEFAULT 'Ativo'"],
  ["ocorrencias", "acao_corretiva", "ALTER TABLE ocorrencias ADD COLUMN acao_corretiva TEXT NULL"],
  ["ocorrencias", "id_responsavel", "ALTER TABLE ocorrencias ADD COLUMN id_responsavel INT NULL"],
];

async function adicionarColunaSeAusente(pool, tabela, coluna, sql) {
  const [linhas] = await pool.query(
    `SELECT 1 FROM information_schema.columns
     WHERE table_schema = DATABASE() AND table_name = ? AND column_name = ? LIMIT 1`,
    [tabela, coluna],
  );
  if (linhas.length === 0) await pool.query(sql);
}

export async function garantirEsquemaAdministrativo(pool) {
  for (const [tabela, coluna, sql] of columns) {
    await adicionarColunaSeAusente(pool, tabela, coluna, sql);
  }

  await pool.query(`
    CREATE TABLE IF NOT EXISTS alertas (
      id_alerta INT PRIMARY KEY AUTO_INCREMENT,
      id_reservatorio INT NOT NULL,
      id_med INT NULL,
      id_leitura INT NULL,
      id_oc INT NULL,
      tipo VARCHAR(80) NOT NULL,
      severidade ENUM('Informativo', 'Atenção', 'Crítico') NOT NULL DEFAULT 'Informativo',
      status ENUM('Ativo', 'Reconhecido', 'Resolvido') NOT NULL DEFAULT 'Ativo',
      momento_alerta DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_alertas_status_momento (status, momento_alerta),
      UNIQUE KEY uq_alertas_leitura_tipo (id_leitura, tipo),
      CONSTRAINT fk_alertas_reservatorio FOREIGN KEY (id_reservatorio)
        REFERENCES reservatorios(id_reservatorio) ON DELETE CASCADE,
      CONSTRAINT fk_alertas_medidor FOREIGN KEY (id_med)
        REFERENCES medidores(id_med) ON DELETE SET NULL,
      CONSTRAINT fk_alertas_ocorrencia FOREIGN KEY (id_oc)
        REFERENCES ocorrencias(id_oc) ON DELETE SET NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);

  await adicionarColunaSeAusente(pool, "alertas", "id_leitura", "ALTER TABLE alertas ADD COLUMN id_leitura INT NULL");
  const [indiceAlerta] = await pool.query(
    `SELECT 1 FROM information_schema.statistics
     WHERE table_schema = DATABASE() AND table_name = 'alertas' AND index_name = 'uq_alertas_leitura_tipo' LIMIT 1`,
  );
  if (indiceAlerta.length === 0) await pool.query("ALTER TABLE alertas ADD UNIQUE KEY uq_alertas_leitura_tipo (id_leitura, tipo)");

  await pool.query(`
    CREATE TABLE IF NOT EXISTS acessos (
      id_acesso BIGINT PRIMARY KEY AUTO_INCREMENT,
      id_usuario INT NULL,
      email_tentado VARCHAR(100) NULL,
      evento VARCHAR(40) NOT NULL,
      momento DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      ip VARCHAR(45) NULL,
      INDEX idx_acessos_momento (momento),
      CONSTRAINT fk_acessos_usuario FOREIGN KEY (id_usuario)
        REFERENCES usuarios(id_usuario) ON DELETE SET NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS tarifas (
      id_tarifa INT PRIMARY KEY AUTO_INCREMENT,
      valor_m3 DECIMAL(12,4) NOT NULL,
      vigencia_inicio DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      id_usuario INT NULL,
      INDEX idx_tarifas_vigencia (vigencia_inicio),
      CONSTRAINT fk_tarifas_usuario FOREIGN KEY (id_usuario)
        REFERENCES usuarios(id_usuario) ON DELETE SET NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);
}
