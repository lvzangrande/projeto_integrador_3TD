export function criarLeiturasModel({ pool }) {
  async function listarTodos() {
    const [linhas] = await pool.query("SELECT * FROM leituras");
    return linhas;
  }

  async function buscarPorId(id) {
    const [linhas] = await pool.query(
      "SELECT * FROM leituras WHERE id_leitura = ?",
      [id],
    );
    return linhas[0] || null;
  }

  async function criar(leitura) {
    const sql = `
      INSERT INTO leituras
        (volume_leitura, origem)
      VALUES (?, ?)
    `;
    const valores = [
        leitura.volume_leitura,
        leitura.origem
    ];
    const [resultado] = await pool.query(sql, valores);
    return buscarPorId(resultado.insertId);
  }

  return { listarTodos, buscarPorId, criar };
}
