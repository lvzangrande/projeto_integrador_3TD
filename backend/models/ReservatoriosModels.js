export function criarReservatoriosModel({ pool }) {
  async function listarTodos() {
    const [linhas] = await pool.query("SELECT * FROM reservatorios");
    return linhas;
  }

  async function buscarPorId(id) {
    const [linhas] = await pool.query(
      "SELECT * FROM reservatorios WHERE id_reservatorio = ?",
      [id],
    );
    return linhas[0] || null;
  }

  async function criar(reservatorios) {
    const sql = `
      INSERT INTO reservatorios
        (nome,capacidade,nivel_min,nivel_max,status,tipo)
      VALUES (?, ?, ?, ?)
    `;
    const valores = [
      reservatorios.nome,
      reservatorios.capacidade,
      reservatorios.nivel_min,
      reservatorios.nivel_max,
      reservatorios.status,
      reservatorios.tipo
    ];
    const [resultado] = await pool.query(sql, valores);
    return buscarPorId(resultado.insertId);
  }

  return { listarTodos, buscarPorId, criar };
}
