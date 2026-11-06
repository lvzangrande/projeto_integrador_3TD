export function criarUsuarioModel({ pool }) {
  async function listarTodos() {
    const [linhas] = await pool.query("SELECT * FROM usuarios");
    return linhas;
  }

  async function buscarPorId(id) {
    const [linhas] = await pool.query(
      "SELECT * FROM usuarios WHERE id_usuario = ?",
      [id],
    );
    return linhas[0] || null;
  }

  async function criar(usuario) {
    const sql = `
      INSERT INTO usuarios
        (nome, email, senha, cnpj, telefone, categoria, tema, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const valores = [
      usuario.nome,
      usuario.email,
      usuario.senha,
      usuario.cnpj,
      usuario.telefone,
      usuario.categoria,
      usuario.tema,
      usuario.status,
    ];
    const [resultado] = await pool.query(sql, valores);
    return buscarPorId(resultado.insertId);
  }

  return { listarTodos, buscarPorId, criar };
}
