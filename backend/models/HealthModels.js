export function criarHealthModel({ pool }) {
  async function listarTodos() {
    const [linhas] = await pool.query("SELECT * FROM usuarios");
    return linhas;
  }

  async function buscarPorId(id) {
    const [linhas] = await pool.query(
      "SELECT * FROM usuarios WHERE id_usuario = ?",
      [id],
    );
    return linhas[0] || null;
  }

// aAAAAAAAAaA

  async function criar(health) {
    const sql = `
      INSERT INTO usuarios
        (nome, email, senha, cnpj, telefone, categoria, tema, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const valores = [
      health.nome,
      health.email,
      health.senha,
      health.cnpj,
      health.telefone,
      health.categoria,
      health.tema,
      health.status,
    ];
    const [resultado] = await pool.query(sql, valores);
    return buscarPorId(resultado.insertId);
  }

  return { listarTodos, buscarPorId, criar };
}
