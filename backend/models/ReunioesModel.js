export function criarReunioesModel({ pool }) {
  const SELECT = `SELECT r.*, c.nome AS nome_usuario, c.email AS email_usuario
    FROM reunioes r LEFT JOIN usuarios c ON c.id_usuario = r.id_usuario`;

  async function listarPorFiliado(idFiliado) {
    const [linhas] = await pool.query(
      `${SELECT} WHERE r.id_filiado = ? ORDER BY r.momento_abertura DESC`,
      [idFiliado],
    );
    return linhas;
  }

  async function buscarPorId(id, idFiliado) {
    const [linhas] = await pool.query(
      `${SELECT} WHERE r.id_reuniao = ? AND r.id_filiado = ?`,
      [id, idFiliado],
    );
    return linhas[0] || null;
  }

  async function criar(reuniao) {
    const [resultado] = await pool.query(
      `INSERT INTO reunioes
        (id_usuario, id_filiado, momento_abertura, pauta, resumo, proximos_passos, tipo)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        reuniao.id_usuario,
        reuniao.id_filiado,
        reuniao.momento_abertura,
        reuniao.pauta,
        reuniao.resumo,
        reuniao.proximos_passos,
        reuniao.tipo,
      ],
    );
    return buscarPorId(resultado.insertId, reuniao.id_filiado);
  }

  return { listarPorFiliado, buscarPorId, criar };
}
