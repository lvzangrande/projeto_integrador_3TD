export function criarClientePortalController({ clientePortalService }) {
  async function buscarOperacao(request, response, next) {
    try {
      const dados = await clientePortalService.buscarOperacao(request.usuarioAutenticado.id_usuario);
      response.status(200).json({ sucesso: true, dados });
    } catch (erro) {
      if (erro instanceof TypeError) return response.status(400).json({ erro: erro.message });
      next(erro);
    }
  }
  return { buscarOperacao };
}
