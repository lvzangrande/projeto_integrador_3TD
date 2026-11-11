export function criarReunioesModel({ pool }) {
  async function listarTodos() {
    const [linhas] = await pool.query("SELECT * FROM reunioes");
    return linhas;
  }

  async function buscarPorId(id) {
    const [linhas] = await pool.query(
      "SELECT * FROM reunioes WHERE id_reunioes = ?",
      [id],
    );
    return linhas[0] || null;
  }

  async function criar(Reunioes) {
    const sql = `
      INSERT INTO Reunioes
        (pauta,resumo,proximos_passos,tipo)
      VALUES (?, ?, ?, ?)
    `;
    const valores = [
      Reunioes.pauta,
      Reunioes.resumo,
      Reunioes.proximos_passos,
      Reunioes.tipo
    ];
    const [resultado] = await pool.query(sql, valores);
    return buscarPorId(resultado.insertId);
  }

  return { listarTodos, buscarPorId, criar };
}
