export function criarAcessoModel({ pool }) {
  async function registrar({ idUsuario = null, email = null, evento, ip = null }) {
    await pool.query(
      "INSERT INTO acessos (id_usuario, email_tentado, evento, ip) VALUES (?, ?, ?, ?)",
      [idUsuario, email, evento, ip],
    );
  }

  return { registrar };
}
