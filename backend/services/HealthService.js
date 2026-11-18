export function criarHealthService({ healthModel }) {
  async function verificar() {
    const bancoDisponivel = await healthModel.verificarConexao();
    return {
      api: "ok",
      banco: bancoDisponivel ? "conectado" : "indisponível",
    };
  }

  return { verificar };
}
