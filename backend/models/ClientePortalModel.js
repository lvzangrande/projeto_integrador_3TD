export function criarClientePortalModel({ pool }) {
  async function buscarOperacao(idUsuario) {
    const [reservatorios] = await pool.query(
      `SELECT r.id_reservatorio, r.nome, r.capacidade, r.localizacao, r.nivel_min, r.nivel_max, r.status, r.tipo,
        (SELECT l.volume_leitura
         FROM leituras l
         INNER JOIN medidores m ON m.id_med = l.id_med
         INNER JOIN setores s ON s.id_setor = m.id_setor
         WHERE s.id_reservatorio = r.id_reservatorio AND m.tipo = 'Nível'
         ORDER BY l.momento_leitura DESC, l.id_leitura DESC LIMIT 1) AS nivel_atual,
        (SELECT l.momento_leitura
         FROM leituras l
         INNER JOIN medidores m ON m.id_med = l.id_med
         INNER JOIN setores s ON s.id_setor = m.id_setor
         WHERE s.id_reservatorio = r.id_reservatorio AND m.tipo = 'Nível'
         ORDER BY l.momento_leitura DESC, l.id_leitura DESC LIMIT 1) AS nivel_atualizado_em
       FROM reservatorios r WHERE r.id_usuario = ? ORDER BY r.nome`,
      [idUsuario],
    );
    const [setores] = await pool.query(
      `SELECT s.id_setor, s.id_reservatorio, s.nome, s.consumo_max_dia, s.status, s.tipo,
        r.nome AS reservatorio_nome
       FROM setores s INNER JOIN reservatorios r ON r.id_reservatorio = s.id_reservatorio
       WHERE r.id_usuario = ? ORDER BY r.nome, s.nome`,
      [idUsuario],
    );
    const [medidores] = await pool.query(
      `SELECT m.id_med, m.id_setor, m.num_serie, m.tipo, m.origem,
        s.nome AS setor_nome, r.id_reservatorio, r.nome AS reservatorio_nome
       FROM medidores m INNER JOIN setores s ON s.id_setor = m.id_setor
       INNER JOIN reservatorios r ON r.id_reservatorio = s.id_reservatorio
       WHERE r.id_usuario = ? ORDER BY r.nome, s.nome, m.num_serie`,
      [idUsuario],
    );
    const [responsaveis] = await pool.query(
      `SELECT resp.id_reservatorio, COUNT(*) AS total
       FROM responsaveis resp
       INNER JOIN reservatorios r ON r.id_reservatorio = resp.id_reservatorio
       WHERE resp.id_usuario = ? AND r.id_usuario = ?
       GROUP BY resp.id_reservatorio`,
      [idUsuario, idUsuario],
    );
    const [leituras] = await pool.query(
      `SELECT l.id_leitura, l.id_med, l.volume_leitura, l.momento_leitura, l.origem,
        m.num_serie, m.tipo AS tipo_medidor, s.id_setor, s.nome AS setor_nome,
        r.id_reservatorio, r.nome AS reservatorio_nome
       FROM leituras l INNER JOIN medidores m ON m.id_med = l.id_med
       INNER JOIN setores s ON s.id_setor = m.id_setor
       INNER JOIN reservatorios r ON r.id_reservatorio = s.id_reservatorio
       WHERE r.id_usuario = ? ORDER BY l.momento_leitura DESC, l.id_leitura DESC`,
      [idUsuario],
    );
    const [ocorrencias] = await pool.query(
      `SELECT o.id_oc, o.id_reservatorio, o.id_setor, o.descricao, o.momento_abertura,
        o.volume_perdido, o.status, o.severidade, o.tipo,
        r.nome AS reservatorio_nome, s.nome AS setor_nome
       FROM ocorrencias o INNER JOIN reservatorios r ON r.id_reservatorio = o.id_reservatorio
       LEFT JOIN setores s ON s.id_setor = o.id_setor
       WHERE r.id_usuario = ? ORDER BY o.momento_abertura DESC, o.id_oc DESC`,
      [idUsuario],
    );
    return { reservatorios, setores, medidores, responsaveis, leituras, ocorrencias };
  }
  return { buscarOperacao };
}
