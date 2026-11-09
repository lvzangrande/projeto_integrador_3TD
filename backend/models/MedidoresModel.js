export function criarMedidoresModel({ pool }) {
  async function listarTodos() {
    const [linhas] = await pool.query("SELECT * FROM medidores");
    return linhas;
  }

  async function buscarPorId(id) {
    const [linhas] = await pool.query(
      "SELECT * FROM medidores WHERE id_med = ?",
      [id],
    );
    return linhas[0] || null;
  }

  async function criar(medidor) {
    const sql = `
      INSERT INTO medidores
        (num_serie, tipo, origem)
      VALUES (?, ?, ?)
    `;
    const valores = [
        medidor.num_serie,
        medidor.tipo,
        medidor.origem
    ];
    const [resultado] = await pool.query(sql, valores);
    return buscarPorId(resultado.insertId);
  }

  return { listarTodos, buscarPorId, criar };
}
