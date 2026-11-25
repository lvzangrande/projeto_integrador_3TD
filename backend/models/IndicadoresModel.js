export function criarIndicadoresModel({ pool }) {
  async function leiturasParaEstimativa({ desde }) {
    const [linhas] = await pool.query(
      `SELECT s.id_setor, s.consumo_max_dia, m.id_med,
              l.id_leitura, CAST(l.volume_leitura AS CHAR) AS volume_leitura,
              DATE_FORMAT(l.momento_leitura, '%Y-%m-%d %H:%i:%s') AS momento_leitura
       FROM medidores m
       INNER JOIN setores s ON s.id_setor = m.id_setor
       INNER JOIN reservatorios r ON r.id_reservatorio = s.id_reservatorio
       LEFT JOIN leituras l
         ON l.id_med = m.id_med AND l.momento_leitura >= ?
       WHERE m.tipo = 'Hidrômetro' AND m.origem = 'Real' AND m.status = 'Ativo'
         AND s.status = 'Ativo' AND r.status = 'Ativo'
       ORDER BY s.id_setor, m.id_med, l.momento_leitura, l.id_leitura`,
      [desde],
    );
    return linhas;
  }

  return { leiturasParaEstimativa };
}
