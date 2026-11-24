const STATUS_OCORRENCIAS = new Set(["Aberta", "Em análise", "Em reparo", "Resolvida", "Descartada"]);
const LIMITE_LISTA = 500;

function dataValida(value) {
  if (!value) return null;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return undefined;
  const date = new Date(`${value}T00:00:00.000Z`);
  return Number.isNaN(date.valueOf()) || date.toISOString().slice(0, 10) !== value ? undefined : value;
}

function idCliente(request) {
  return Number(request.usuarioAutenticado.id_usuario);
}

function idFiltro(value) {
  if (!value) return null;
  if (!/^[1-9]\d*$/.test(value)) return undefined;
  return Number(value);
}

function erroFiltro(response, message) {
  return response.status(400).json({ erro: message });
}

export function criarClienteController({ pool }) {
  async function resumo(request, response, next) {
    const idUsuario = idCliente(request);
    try {
      const [[reservatorios]] = await pool.query(
        `SELECT COUNT(*) AS total, COALESCE(SUM(status = 'Ativo'), 0) AS ativos
         FROM reservatorios WHERE id_usuario = ?`,
        [idUsuario],
      );
      const [[setores]] = await pool.query(
        `SELECT COUNT(*) AS total
         FROM setores s INNER JOIN reservatorios r ON r.id_reservatorio = s.id_reservatorio
         WHERE r.id_usuario = ?`,
        [idUsuario],
      );
      const [[medidores]] = await pool.query(
        `SELECT COUNT(*) AS total
         FROM medidores m
         INNER JOIN setores s ON s.id_setor = m.id_setor
         INNER JOIN reservatorios r ON r.id_reservatorio = s.id_reservatorio
         WHERE r.id_usuario = ?`,
        [idUsuario],
      );
      const [[leituras]] = await pool.query(
        `SELECT MAX(l.momento_leitura) AS ultima_leitura
         FROM leituras l
         INNER JOIN medidores m ON m.id_med = l.id_med
         INNER JOIN setores s ON s.id_setor = m.id_setor
         INNER JOIN reservatorios r ON r.id_reservatorio = s.id_reservatorio
         WHERE r.id_usuario = ?`,
        [idUsuario],
      );
      const [[ocorrencias]] = await pool.query(
        `SELECT COUNT(*) AS total,
                COALESCE(SUM(o.status IN ('Aberta', 'Em análise', 'Em reparo')), 0) AS em_andamento
         FROM ocorrencias o
         INNER JOIN reservatorios r ON r.id_reservatorio = o.id_reservatorio
         WHERE r.id_usuario = ?`,
        [idUsuario],
      );
      const [leiturasPorDia] = await pool.query(
        `SELECT DATE_FORMAT(l.momento_leitura, '%Y-%m-%d') AS data, COUNT(*) AS quantidade
         FROM leituras l
         INNER JOIN medidores m ON m.id_med = l.id_med
         INNER JOIN setores s ON s.id_setor = m.id_setor
         INNER JOIN reservatorios r ON r.id_reservatorio = s.id_reservatorio
         WHERE r.id_usuario = ?
           AND l.momento_leitura >= DATE_SUB(CURRENT_DATE(), INTERVAL 29 DAY)
           AND l.momento_leitura < DATE_ADD(CURRENT_DATE(), INTERVAL 1 DAY)
         GROUP BY DATE(l.momento_leitura)
         ORDER BY DATE(l.momento_leitura)`,
        [idUsuario],
      );
      const [ocorrenciasPorStatus] = await pool.query(
        `SELECT o.status, COUNT(*) AS quantidade
         FROM ocorrencias o
         INNER JOIN reservatorios r ON r.id_reservatorio = o.id_reservatorio
         WHERE r.id_usuario = ?
         GROUP BY o.status
         ORDER BY o.status`,
        [idUsuario],
      );
      return response.status(200).json({
        sucesso: true,
        dados: {
          reservatorios: { total: Number(reservatorios.total), ativos: Number(reservatorios.ativos) },
          setores: Number(setores.total),
          medidores: Number(medidores.total),
          ultima_leitura: leituras.ultima_leitura,
          ocorrencias: { total: Number(ocorrencias.total), em_andamento: Number(ocorrencias.em_andamento) },
          graficos: {
            leituras_por_dia: leiturasPorDia.map((item) => ({ data: item.data, quantidade: Number(item.quantidade) })),
            ocorrencias_por_status: ocorrenciasPorStatus.map((item) => ({ status: item.status, quantidade: Number(item.quantidade) })),
          },
        },
      });
    } catch (error) {
      return next(error);
    }
  }

  async function estrutura(request, response, next) {
    try {
      const [linhas] = await pool.query(
        `SELECT r.id_reservatorio, r.nome AS reservatorio, r.capacidade, r.localizacao,
                r.nivel_min, r.nivel_max, r.status AS status_reservatorio, r.tipo AS tipo_reservatorio,
                s.id_setor, s.nome AS setor, s.consumo_max_dia, s.status AS status_setor, s.tipo AS tipo_setor,
                m.id_med AS id_medidor, m.num_serie AS medidor, m.tipo AS tipo_medidor,
                (SELECT COUNT(*) FROM responsaveis resp WHERE resp.id_reservatorio = r.id_reservatorio AND resp.id_usuario = r.id_usuario) AS total_responsaveis
         FROM reservatorios r
         LEFT JOIN setores s ON s.id_reservatorio = r.id_reservatorio
         LEFT JOIN medidores m ON m.id_setor = s.id_setor
         WHERE r.id_usuario = ?
         ORDER BY r.nome, s.nome`,
        [idCliente(request)],
      );
      const reservatorios = new Map();
      for (const row of linhas) {
        if (!reservatorios.has(row.id_reservatorio)) {
          reservatorios.set(row.id_reservatorio, {
            id_reservatorio: row.id_reservatorio,
            nome: row.reservatorio,
            capacidade: row.capacidade,
            localizacao: row.localizacao,
            nivel_min: row.nivel_min,
            nivel_max: row.nivel_max,
            status: row.status_reservatorio,
            tipo: row.tipo_reservatorio,
            total_responsaveis: Number(row.total_responsaveis),
            setores: [],
          });
        }
        if (row.id_setor !== null) {
          const setores = reservatorios.get(row.id_reservatorio).setores;
          let setor = setores.find((item) => item.id_setor === row.id_setor);
          if (!setor) {
            setor = {
              id_setor: row.id_setor,
              nome: row.setor,
              consumo_max_dia: row.consumo_max_dia,
              status: row.status_setor,
              tipo: row.tipo_setor,
              medidores: [],
            };
            setores.push(setor);
          }
          if (row.id_medidor !== null) {
            setor.medidores.push({ id_medidor: row.id_medidor, numero_serie: row.medidor, tipo: row.tipo_medidor });
          }
        }
      }
      return response.status(200).json({ sucesso: true, dados: [...reservatorios.values()] });
    } catch (error) {
      return next(error);
    }
  }

  async function leituras(request, response, next) {
    const inicio = dataValida(request.query.inicio);
    const fim = dataValida(request.query.fim);
    const idReservatorio = idFiltro(request.query.id_reservatorio);
    const idSetor = idFiltro(request.query.id_setor);
    const idMedidor = idFiltro(request.query.id_medidor);
    if (inicio === undefined || fim === undefined) return erroFiltro(response, "Informe as datas no formato AAAA-MM-DD.");
    if (idReservatorio === undefined || idSetor === undefined || idMedidor === undefined) return erroFiltro(response, "Os identificadores dos filtros devem ser inteiros positivos.");
    if (inicio && fim && inicio > fim) return erroFiltro(response, "A data inicial deve ser anterior ou igual à data final.");

    const condicoes = ["r.id_usuario = ?"];
    const valores = [idCliente(request)];
    if (idReservatorio) {
      condicoes.push("r.id_reservatorio = ?");
      valores.push(idReservatorio);
    }
    if (idSetor) {
      condicoes.push("s.id_setor = ?");
      valores.push(idSetor);
    }
    if (idMedidor) {
      condicoes.push("m.id_med = ?");
      valores.push(idMedidor);
    }
    if (inicio) {
      condicoes.push("l.momento_leitura >= ?");
      valores.push(`${inicio} 00:00:00`);
    }
    if (fim) {
      condicoes.push("l.momento_leitura < DATE_ADD(?, INTERVAL 1 DAY)");
      valores.push(fim);
    }
    try {
      const [linhas] = await pool.query(
        `SELECT l.id_leitura, l.volume_leitura, l.momento_leitura, l.origem,
                m.num_serie AS medidor, m.tipo AS tipo_medidor,
                s.nome AS setor, r.nome AS reservatorio
         FROM leituras l
         INNER JOIN medidores m ON m.id_med = l.id_med
         INNER JOIN setores s ON s.id_setor = m.id_setor
         INNER JOIN reservatorios r ON r.id_reservatorio = s.id_reservatorio
         WHERE ${condicoes.join(" AND ")}
         ORDER BY l.momento_leitura DESC
         LIMIT ${LIMITE_LISTA}`,
        valores,
      );
      return response.status(200).json({ sucesso: true, dados: linhas });
    } catch (error) {
      return next(error);
    }
  }

  async function ocorrencias(request, response, next) {
    const status = request.query.status || "";
    if (status && !STATUS_OCORRENCIAS.has(status)) return erroFiltro(response, "Status de ocorrência inválido.");
    try {
      const [linhas] = await pool.query(
        `SELECT o.id_oc, o.descricao, o.momento_abertura, o.volume_perdido, o.status,
                o.severidade, o.tipo, r.nome AS reservatorio, s.nome AS setor
         FROM ocorrencias o
         INNER JOIN reservatorios r ON r.id_reservatorio = o.id_reservatorio
         LEFT JOIN setores s ON s.id_setor = o.id_setor AND s.id_reservatorio = r.id_reservatorio
         WHERE r.id_usuario = ? ${status ? "AND o.status = ?" : ""}
         ORDER BY o.momento_abertura DESC
         LIMIT ${LIMITE_LISTA}`,
        status ? [idCliente(request), status] : [idCliente(request)],
      );
      return response.status(200).json({ sucesso: true, dados: linhas });
    } catch (error) {
      return next(error);
    }
  }

  return { resumo, estrutura, leituras, ocorrencias };
}
