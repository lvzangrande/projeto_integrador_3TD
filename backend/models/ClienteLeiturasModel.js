function criarErro(message, statusCode) {
  return Object.assign(new Error(message), { statusCode });
}

function escalaMililitros(valor) {
  return Math.round(Number(valor) * 1000);
}

export function criarClienteLeiturasModel({ pool }) {
  async function registrarManual({ id_usuario, id_med, volume_leitura, momento_leitura }) {
    const connection = await pool.getConnection();

    try {
      await connection.beginTransaction();

      const [medidores] = await connection.query(
        `SELECT m.id_med, m.tipo, m.num_serie, s.nome AS setor, r.nome AS reservatorio
         FROM medidores m
         INNER JOIN setores s ON s.id_setor = m.id_setor
         INNER JOIN reservatorios r ON r.id_reservatorio = s.id_reservatorio
         WHERE m.id_med = ? AND r.id_usuario = ? AND m.status = 'Ativo'
           AND r.status = 'Ativo' AND s.status = 'Ativo'
         FOR UPDATE`,
        [id_med, id_usuario],
      );

      const medidor = medidores[0];
      if (!medidor) throw criarErro("Medidor não encontrado ou indisponível na sua operação.", 404);

      if (medidor.tipo === "Hidrômetro") {
        const [anteriores] = await connection.query(
          `SELECT volume_leitura FROM leituras
           WHERE id_med = ? AND momento_leitura <= ?
           ORDER BY momento_leitura DESC, id_leitura DESC LIMIT 1`,
          [id_med, momento_leitura],
        );
        const [posteriores] = await connection.query(
          `SELECT volume_leitura FROM leituras
           WHERE id_med = ? AND momento_leitura > ?
           ORDER BY momento_leitura ASC, id_leitura ASC LIMIT 1`,
          [id_med, momento_leitura],
        );
        const valorNovo = escalaMililitros(volume_leitura);

        if (anteriores[0] && valorNovo < escalaMililitros(anteriores[0].volume_leitura)) {
          throw criarErro("A leitura do hidrômetro não pode ser menor que a leitura anterior.", 400);
        }
        if (posteriores[0] && valorNovo > escalaMililitros(posteriores[0].volume_leitura)) {
          throw criarErro("Essa data deixaria o histórico do hidrômetro em ordem decrescente.", 400);
        }
      }

      const [insercao] = await connection.query(
        `INSERT INTO leituras (id_med, volume_leitura, momento_leitura, origem)
         VALUES (?, ?, ?, 'Manual')`,
        [id_med, volume_leitura, momento_leitura],
      );

      const [leituras] = await connection.query(
        `SELECT l.id_leitura, l.id_med, l.volume_leitura, l.momento_leitura, l.origem,
                m.num_serie AS medidor, m.tipo AS tipo_medidor,
                s.nome AS setor, r.nome AS reservatorio
         FROM leituras l
         INNER JOIN medidores m ON m.id_med = l.id_med
         INNER JOIN setores s ON s.id_setor = m.id_setor
         INNER JOIN reservatorios r ON r.id_reservatorio = s.id_reservatorio
         WHERE l.id_leitura = ?`,
        [insercao.insertId],
      );

      await connection.commit();
      return leituras[0];
    } catch (error) {
      await connection.rollback().catch(() => {});
      throw error;
    } finally {
      connection.release();
    }
  }

  return { registrarManual };
}
