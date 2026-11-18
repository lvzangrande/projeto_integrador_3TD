export function criarHealthModel({ pool }) {
  async function verificarConexao() {
    const [linhas] = await pool.query("SELECT 1 AS ok");
    return linhas[0]?.ok === 1;
  }

  return { verificarConexao };
}
