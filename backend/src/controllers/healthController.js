export function criarHealthController({ healthService }) {
  async function verificar(_request, response, next) {
    try {
      const dados = await healthService.verificar();
      response.status(200).json({ sucesso: true, dados });
    } catch (erro) {
      next(erro);
    }
  }

  return { verificar };
}
