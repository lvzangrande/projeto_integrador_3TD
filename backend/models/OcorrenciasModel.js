export function criarOcorrenciasModel({ pool }) {
  async function listarTodos() {
    const [linhas] = await pool.query("SELECT * FROM ocorrencias");
    return linhas;
  }

  async function buscarPorId(id) {
    const [linhas] = await pool.query(
      "SELECT * FROM ocorrencias WHERE id_oc = ?",
      [id],
    );
    return linhas[0] || null;
  }

  async function criar(ocorrencias) {
    const sql = `
      INSERT INTO setores
        (descricao, volume_perdido, severidade, status, tipo)
      VALUES (?, ?, ?, ?, ?)
    `;
    const valores = [
      ocorrencias.descricao,
      ocorrencias.volume_perdido,
      ocorrencias.severidade,
      ocorrencias.status,
      ocorrencias.tipo
    ];
    const [resultado] = await pool.query(sql, valores);
    return buscarPorId(resultado.insertId);
  }

  return { listarTodos, buscarPorId, criar };
}
