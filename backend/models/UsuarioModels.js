export function criarUsuarioModel({ pool }) {
  const COLUNAS_PUBLICAS = `id_usuario, nome, email, documento, tipo_pessoa,
    cnpj, telefone, categoria, tema, status, id_filiado, criado_em`;

  async function buscarPorEmail(email) {
    const [linhas] = await pool.query(
      "SELECT id_usuario, nome, email, senha, cnpj, telefone, categoria, tema, status FROM usuarios WHERE email = ? LIMIT 1",
      [email],
    );
    return linhas[0] || null;
  }

  async function atualizarSenha(id, senha) {
    await pool.query("UPDATE usuarios SET senha = ? WHERE id_usuario = ?", [senha, id]);
  }

  async function listarClientesDoFiliado(idFiliado) {
    const [linhas] = await pool.query(
      `SELECT ${COLUNAS_PUBLICAS},
        (SELECT MAX(r.momento_abertura) FROM reunioes r
          WHERE r.id_usuario = usuarios.id_usuario AND r.id_filiado = usuarios.id_filiado) AS ultima_reuniao
       FROM usuarios WHERE id_filiado = ? AND categoria = 'Cliente'
       ORDER BY criado_em DESC, nome ASC`,
      [idFiliado],
    );
    return linhas;
  }

  async function buscarPorId(id) {
    const [linhas] = await pool.query(
      `SELECT ${COLUNAS_PUBLICAS} FROM usuarios WHERE id_usuario = ?`,
      [id],
    );
    return linhas[0] || null;
  }

  async function buscarClienteDoFiliado(id, idFiliado) {
    const [linhas] = await pool.query(
      `SELECT ${COLUNAS_PUBLICAS} FROM usuarios
       WHERE id_usuario = ? AND id_filiado = ? AND categoria = 'Cliente'`,
      [id, idFiliado],
    );
    return linhas[0] || null;
  }

  async function criarCliente(usuario) {
    const sql = `
      INSERT INTO usuarios
        (nome, email, senha, cnpj, documento, tipo_pessoa, telefone, categoria, tema, status, id_filiado)
      VALUES (?, ?, ?, ?, ?, ?, ?, 'Cliente', 'Escuro', 'Ativo', ?)
    `;
    const valores = [
      usuario.nome,
      usuario.email,
      usuario.senha,
      usuario.documento,
      usuario.documento,
      usuario.tipoPessoa,
      usuario.telefone,
      usuario.idFiliado,
    ];
    const [resultado] = await pool.query(sql, valores);
    return buscarPorId(resultado.insertId);
  }

  return { buscarPorEmail, atualizarSenha, listarClientesDoFiliado, buscarPorId, buscarClienteDoFiliado, criarCliente };
}
