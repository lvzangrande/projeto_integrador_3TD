export function criarAdminModel({ pool }) {
  async function gerarAlertasDeNivel() {
    await pool.query(`
      UPDATE alertas a
      JOIN medidores m ON m.id_med = a.id_med
      JOIN setores s ON s.id_setor = m.id_setor
      JOIN reservatorios r ON r.id_reservatorio = s.id_reservatorio
      JOIN leituras l ON l.id_leitura = (
        SELECT l2.id_leitura FROM leituras l2
        WHERE l2.id_med = m.id_med
        ORDER BY l2.momento_leitura DESC, l2.id_leitura DESC LIMIT 1
      )
      SET a.status = 'Resolvido'
      WHERE a.status IN ('Ativo', 'Reconhecido')
        AND ((a.tipo = 'Nível mínimo' AND l.volume_leitura >= r.nivel_min)
          OR (a.tipo = 'Nível máximo' AND l.volume_leitura <= r.nivel_max))
    `);

    await pool.query(`
      INSERT IGNORE INTO alertas (id_reservatorio, id_med, id_leitura, tipo, severidade, status, momento_alerta)
      SELECT r.id_reservatorio, m.id_med, l.id_leitura,
        CASE WHEN l.volume_leitura < r.nivel_min THEN 'Nível mínimo' ELSE 'Nível máximo' END,
        'Crítico', 'Ativo', l.momento_leitura
      FROM medidores m
      JOIN setores s ON s.id_setor = m.id_setor
      JOIN reservatorios r ON r.id_reservatorio = s.id_reservatorio
      JOIN leituras l ON l.id_leitura = (
        SELECT l2.id_leitura FROM leituras l2
        WHERE l2.id_med = m.id_med
        ORDER BY l2.momento_leitura DESC, l2.id_leitura DESC LIMIT 1
      )
      WHERE m.tipo = 'Nível' AND m.status = 'Ativo'
        AND (l.volume_leitura < r.nivel_min OR l.volume_leitura > r.nivel_max)
        AND NOT EXISTS (
          SELECT 1 FROM alertas existente
          WHERE existente.id_med = m.id_med
            AND existente.tipo = CASE WHEN l.volume_leitura < r.nivel_min THEN 'Nível mínimo' ELSE 'Nível máximo' END
            AND (existente.status = 'Ativo' OR existente.momento_alerta >= l.momento_leitura)
        )
    `);
  }

  async function listarDados() {
    await gerarAlertasDeNivel();
    const [usuarios] = await pool.query(`
      SELECT id_usuario AS id, nome, email, COALESCE(NULLIF(documento, ''), cnpj) AS documento,
        telefone, categoria, tema, status, id_filiado
      FROM usuarios ORDER BY nome
    `);
    const [reservatorios] = await pool.query(`
      SELECT r.id_reservatorio AS id, r.id_usuario, u.nome AS usuario, r.nome, r.tipo,
        r.capacidade, r.localizacao, r.nivel_min, r.nivel_max, r.status,
        leitura.volume_leitura AS nivel_litros,
        ROUND(leitura.volume_leitura / NULLIF(r.capacidade, 0) * 100, 2) AS nivel
      FROM reservatorios r
      LEFT JOIN usuarios u ON u.id_usuario = r.id_usuario
      LEFT JOIN leituras leitura ON leitura.id_leitura = (
        SELECT l2.id_leitura
        FROM leituras l2
        JOIN medidores m2 ON m2.id_med = l2.id_med AND m2.tipo = 'Nível'
        JOIN setores s2 ON s2.id_setor = m2.id_setor
        WHERE s2.id_reservatorio = r.id_reservatorio
        ORDER BY l2.momento_leitura DESC, l2.id_leitura DESC LIMIT 1
      )
      ORDER BY r.nome
    `);
    const [setores] = await pool.query(`
      SELECT s.id_setor AS id, s.id_reservatorio, r.nome AS reservatorio,
        s.nome, s.tipo, s.consumo_max_dia, s.status
      FROM setores s LEFT JOIN reservatorios r ON r.id_reservatorio = s.id_reservatorio
      ORDER BY s.nome
    `);
    const [medidores] = await pool.query(`
      SELECT m.id_med AS id, m.id_setor, m.num_serie AS serie, m.tipo, m.origem,
        m.status, s.nome AS setor, s.id_reservatorio, r.nome AS reservatorio
      FROM medidores m
      LEFT JOIN setores s ON s.id_setor = m.id_setor
      LEFT JOIN reservatorios r ON r.id_reservatorio = s.id_reservatorio
      ORDER BY m.num_serie
    `);
    const [responsaveis] = await pool.query(`
      SELECT rp.id_responsavel AS id, rp.id_usuario, rp.id_reservatorio, rp.id_setor,
        COALESCE(NULLIF(rp.nome, ''), u.nome) AS nome,
        COALESCE(NULLIF(rp.email, ''), u.email) AS email,
        COALESCE(NULLIF(rp.telefone, ''), u.telefone) AS telefone,
        rp.funcao, rp.status, u.nome AS usuario,
        r.nome AS reservatorio, s.nome AS setor
      FROM responsaveis rp
      LEFT JOIN usuarios u ON u.id_usuario = rp.id_usuario
      LEFT JOIN reservatorios r ON r.id_reservatorio = rp.id_reservatorio
      LEFT JOIN setores s ON s.id_setor = rp.id_setor
      ORDER BY nome
    `);
    const [leituras] = await pool.query(`
      SELECT l.id_leitura AS id, l.id_med, m.num_serie AS medidor, m.tipo AS tipo_medidor,
        s.id_reservatorio, r.nome AS reservatorio, s.id_setor, s.nome AS setor,
        l.volume_leitura AS valor, 'L' AS unidade, l.momento_leitura AS data_hora, l.origem
      FROM leituras l
      LEFT JOIN medidores m ON m.id_med = l.id_med
      LEFT JOIN setores s ON s.id_setor = m.id_setor
      LEFT JOIN reservatorios r ON r.id_reservatorio = s.id_reservatorio
      ORDER BY l.momento_leitura DESC, l.id_leitura DESC
    `);
    const [ocorrencias] = await pool.query(`
      SELECT o.id_oc AS id, o.id_reservatorio, o.id_setor, o.id_responsavel,
        r.nome AS reservatorio, s.nome AS setor, o.tipo, o.severidade, o.descricao,
        o.volume_perdido, o.status, o.momento_abertura AS abertura,
        o.acao_corretiva, COALESCE(rp.nome, u.nome, '') AS responsavel
      FROM ocorrencias o
      LEFT JOIN reservatorios r ON r.id_reservatorio = o.id_reservatorio
      LEFT JOIN setores s ON s.id_setor = o.id_setor
      LEFT JOIN responsaveis rp ON rp.id_responsavel = o.id_responsavel
      LEFT JOIN usuarios u ON u.id_usuario = rp.id_usuario
      ORDER BY o.momento_abertura DESC, o.id_oc DESC
    `);
    const [alertas] = await pool.query(`
      SELECT a.id_alerta AS id, a.id_reservatorio, a.id_med, a.id_oc,
        a.tipo, a.severidade, a.status, a.momento_alerta AS data_hora,
        r.nome AS reservatorio, m.num_serie AS medidor,
        CONCAT('#', o.id_oc, ' · ', o.tipo) AS ocorrencia
      FROM alertas a
      LEFT JOIN reservatorios r ON r.id_reservatorio = a.id_reservatorio
      LEFT JOIN medidores m ON m.id_med = a.id_med
      LEFT JOIN ocorrencias o ON o.id_oc = a.id_oc
      ORDER BY a.momento_alerta DESC, a.id_alerta DESC
    `);
    const [acessos] = await pool.query(`
      SELECT a.id_acesso AS id, a.id_usuario, COALESCE(u.nome, a.email_tentado, 'Usuário removido') AS usuario,
        a.evento, a.momento AS data_hora, a.ip
      FROM acessos a LEFT JOIN usuarios u ON u.id_usuario = a.id_usuario
      ORDER BY a.momento DESC, a.id_acesso DESC LIMIT 500
    `);
    const [reunioes] = await pool.query(`
      SELECT r.id_reuniao AS id, r.id_usuario, r.id_filiado, c.nome AS cliente,
        f.nome AS filiado, r.tipo, r.momento_abertura AS data_hora,
        r.pauta, r.resumo, r.proximos_passos
      FROM reunioes r
      LEFT JOIN usuarios c ON c.id_usuario = r.id_usuario
      LEFT JOIN usuarios f ON f.id_usuario = r.id_filiado
      ORDER BY r.momento_abertura DESC, r.id_reuniao DESC
    `);
    const [tarifas] = await pool.query(`
      SELECT id_tarifa AS id, valor_m3 AS valor, vigencia_inicio
      FROM tarifas ORDER BY vigencia_inicio DESC, id_tarifa DESC
    `);

    return {
      usuarios,
      reservatorios,
      setores,
      medidores,
      responsaveis,
      leituras,
      ocorrencias,
      alertas,
      acessos,
      reunioes,
      tarifa: tarifas[0] || null,
    };
  }

  async function inserir(sql, valores) {
    const [resultado] = await pool.query(sql, valores);
    return resultado.insertId;
  }

  async function criar(recurso, dados) {
    const operacoes = {
      usuarios: () => inserir(`INSERT INTO usuarios
        (nome,email,senha,cnpj,documento,tipo_pessoa,telefone,categoria,tema,status,id_filiado)
        VALUES (?,?,?,?,?,?,?,?,?,?,?)`, [dados.nome,dados.email,dados.senha,dados.documento,
        dados.documento,dados.tipo_pessoa,dados.telefone,dados.categoria,dados.tema,dados.status,dados.id_filiado]),
      reservatorios: () => inserir(`INSERT INTO reservatorios
        (id_usuario,nome,tipo,capacidade,localizacao,nivel_min,nivel_max,status)
        VALUES (?,?,?,?,?,?,?,?)`, [dados.id_usuario,dados.nome,dados.tipo,dados.capacidade,
        dados.localizacao,dados.nivel_min,dados.nivel_max,dados.status]),
      setores: () => inserir(`INSERT INTO setores
        (id_reservatorio,nome,tipo,consumo_max_dia,status) VALUES (?,?,?,?,?)`,
        [dados.id_reservatorio,dados.nome,dados.tipo,dados.consumo_max_dia,dados.status]),
      medidores: () => inserir(`INSERT INTO medidores
        (id_setor,num_serie,tipo,origem,status) VALUES (?,?,?,?,?)`,
        [dados.id_setor,dados.serie,dados.tipo,dados.origem,dados.status]),
      responsaveis: () => inserir(`INSERT INTO responsaveis
        (id_usuario,id_reservatorio,id_setor,nome,funcao,telefone,email,status)
        VALUES (?,?,?,?,?,?,?,?)`, [dados.id_usuario,dados.id_reservatorio,dados.id_setor,
        dados.nome,dados.funcao,dados.telefone,dados.email,dados.status]),
      ocorrencias: () => inserir(`INSERT INTO ocorrencias
        (id_reservatorio,id_setor,id_responsavel,descricao,momento_abertura,volume_perdido,
        status,severidade,tipo,acao_corretiva) VALUES (?,?,?,?,?,?,?,?,?,?)`,
        [dados.id_reservatorio,dados.id_setor,dados.id_responsavel,dados.descricao,dados.abertura,
        dados.volume_perdido,dados.status,dados.severidade,dados.tipo,dados.acao_corretiva]),
      reunioes: () => inserir(`INSERT INTO reunioes
        (id_usuario,id_filiado,momento_abertura,pauta,resumo,proximos_passos,tipo)
        VALUES (?,?,?,?,?,?,?)`, [dados.id_usuario,dados.id_filiado,dados.data_hora,dados.pauta,
        dados.resumo,dados.proximos_passos,dados.tipo]),
    };
    if (!operacoes[recurso]) throw Object.assign(new Error("Este tipo de registro não pode ser criado."), { status: 400 });
    return operacoes[recurso]();
  }

  async function atualizar(recurso, id, dados) {
    const operacoes = {
      usuarios: [`UPDATE usuarios SET nome=?, email=?, cnpj=?, documento=?, tipo_pessoa=?, telefone=?, categoria=?, tema=?, id_filiado=? WHERE id_usuario=?`,
        [dados.nome,dados.email,dados.documento,dados.documento,dados.tipo_pessoa,dados.telefone,dados.categoria,dados.tema,dados.id_filiado,id]],
      reservatorios: [`UPDATE reservatorios SET id_usuario=?, nome=?, tipo=?, capacidade=?, localizacao=?, nivel_min=?, nivel_max=? WHERE id_reservatorio=?`,
        [dados.id_usuario,dados.nome,dados.tipo,dados.capacidade,dados.localizacao,dados.nivel_min,dados.nivel_max,id]],
      setores: [`UPDATE setores SET id_reservatorio=?, nome=?, tipo=?, consumo_max_dia=? WHERE id_setor=?`,
        [dados.id_reservatorio,dados.nome,dados.tipo,dados.consumo_max_dia,id]],
      medidores: [`UPDATE medidores SET id_setor=?, num_serie=?, tipo=?, origem=? WHERE id_med=?`,
        [dados.id_setor,dados.serie,dados.tipo,dados.origem,id]],
      responsaveis: [`UPDATE responsaveis SET id_usuario=?, id_reservatorio=?, id_setor=?, nome=?, funcao=?, telefone=?, email=? WHERE id_responsavel=?`,
        [dados.id_usuario,dados.id_reservatorio,dados.id_setor,dados.nome,dados.funcao,dados.telefone,dados.email,id]],
      ocorrencias: [`UPDATE ocorrencias SET id_reservatorio=?, id_setor=?, id_responsavel=?, descricao=?, momento_abertura=?, volume_perdido=?, status=?, severidade=?, tipo=?, acao_corretiva=? WHERE id_oc=?`,
        [dados.id_reservatorio,dados.id_setor,dados.id_responsavel,dados.descricao,dados.abertura,dados.volume_perdido,dados.status,dados.severidade,dados.tipo,dados.acao_corretiva,id]],
      reunioes: [`UPDATE reunioes SET id_usuario=?, id_filiado=?, momento_abertura=?, pauta=?, resumo=?, proximos_passos=?, tipo=? WHERE id_reuniao=?`,
        [dados.id_usuario,dados.id_filiado,dados.data_hora,dados.pauta,dados.resumo,dados.proximos_passos,dados.tipo,id]],
    };
    const operacao = operacoes[recurso];
    if (!operacao) throw Object.assign(new Error("Este tipo de registro não pode ser alterado."), { status: 400 });
    const [resultado] = await pool.query(...operacao);
    if (resultado.affectedRows === 0) {
      const chaves = { usuarios: ["usuarios", "id_usuario"], reservatorios: ["reservatorios", "id_reservatorio"], setores: ["setores", "id_setor"], medidores: ["medidores", "id_med"], responsaveis: ["responsaveis", "id_responsavel"], ocorrencias: ["ocorrencias", "id_oc"], reunioes: ["reunioes", "id_reuniao"] };
      const [tabela, coluna] = chaves[recurso];
      const [existentes] = await pool.query(`SELECT 1 FROM ${tabela} WHERE ${coluna}=? LIMIT 1`, [id]);
      if (!existentes.length) throw Object.assign(new Error("Registro não encontrado."), { status: 404 });
    }
    if (recurso === "usuarios" && dados.senha) {
      await pool.query("UPDATE usuarios SET senha=? WHERE id_usuario=?", [dados.senha, id]);
    }
    return id;
  }

  async function alterarStatus(recurso, id, status) {
    const tabelaPorRecurso = {
      usuarios: ["usuarios", "id_usuario"],
      reservatorios: ["reservatorios", "id_reservatorio"],
      setores: ["setores", "id_setor"],
      medidores: ["medidores", "id_med"],
      responsaveis: ["responsaveis", "id_responsavel"],
      ocorrencias: ["ocorrencias", "id_oc"],
    };
    const entrada = tabelaPorRecurso[recurso];
    if (!entrada) throw Object.assign(new Error("Status não pode ser alterado neste registro."), { status: 400 });
    const [resultado] = await pool.query(`UPDATE ${entrada[0]} SET status=? WHERE ${entrada[1]}=?`, [status,id]);
    if (resultado.affectedRows === 0) {
      const [existentes] = await pool.query(`SELECT 1 FROM ${entrada[0]} WHERE ${entrada[1]}=? LIMIT 1`, [id]);
      if (!existentes.length) throw Object.assign(new Error("Registro não encontrado."), { status: 404 });
    }
  }

  async function reconhecerAlerta(id) {
    const [resultado] = await pool.query(
      "UPDATE alertas SET status='Reconhecido' WHERE id_alerta=? AND status='Ativo'", [id],
    );
    if (resultado.affectedRows === 0) throw Object.assign(new Error("Alerta ativo não encontrado."), { status: 404 });
  }

  async function registrarTarifa(valor, idUsuario) {
    return inserir("INSERT INTO tarifas (valor_m3, id_usuario) VALUES (?, ?)", [valor,idUsuario]);
  }

  return { listarDados, criar, atualizar, alterarStatus, reconhecerAlerta, registrarTarifa };
}
