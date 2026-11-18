export function criarReunioesModel({ pool }) {
  async function listarTodos() {
    const [linhas] = await pool.query(
      "SELECT r.*, u.nome AS nome_usuario FROM reunioes r LEFT JOIN usuarios u ON u.id_usuario = r.id_usuario ORDER BY r.momento_abertura DESC",
    );
    return linhas;
  }

  async function buscarPorId(id) {
    const [linhas] = await pool.query(
      "SELECT r.*, u.nome AS nome_usuario FROM reunioes r LEFT JOIN usuarios u ON u.id_usuario = r.id_usuario WHERE r.id_reuniao = ?",
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
