export function criarReunioesController({ reunioesService }) {
  async function listar(request, response, next) {
    try {
      const dados = await reunioesService.listar(request.usuarioAutenticado.id_usuario);
      response.status(200).json({ sucesso: true, dados });
    } catch (erro) {
      next(erro);
    }
  }

  async function buscar(request, response, next) {
    try {
      const dados = await reunioesService.buscarPorId(request.params.id, request.usuarioAutenticado.id_usuario);
      response.status(200).json({ sucesso: true, dados });
    } catch (erro) {
      if (erro instanceof TypeError) return response.status(400).json({ erro: erro.message });
      if (erro.status) return response.status(erro.status).json({ erro: erro.message });
      next(erro);
    }
  }

  async function criar(request, response, next) {
    try {
      const dados = await reunioesService.criar(request.body ?? {}, request.usuarioAutenticado.id_usuario);
      response.status(201).json({ sucesso: true, dados });
    } catch (erro) {
      if (erro instanceof TypeError) return response.status(400).json({ erro: erro.message });
      if (erro.status) return response.status(erro.status).json({ erro: erro.message });
      next(erro);
    }
  }

  return { listar, buscar, criar };
}
