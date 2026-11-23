export function criarSetorModel({ pool }) {
  async function listarTodos() {
    const [linhas] = await pool.query("SELECT * FROM setores");
    return linhas;
  }

  async function buscarPorId(id) {
    const [linhas] = await pool.query(
      "SELECT * FROM setores WHERE id_setor = ?",
      [id],
    );
    return linhas[0] || null;
  }

  async function criar(setor) {
    const sql = `
      INSERT INTO setores
        (nome, consumo_max_dia, status, tipo)
      VALUES (?, ?, ?)
    `;
    const valores = [
      setor.nome,
      setor.consumo_max_dia,
      setor.status,
      setor.tipo
    ];
    const [resultado] = await pool.query(sql, valores);
    return buscarPorId(resultado.insertId);
  }

  return { listarTodos, buscarPorId, criar };
}
