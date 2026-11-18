export function criarUsuarioController({ usuarioService }) {
  async function listar(request, response, next) {
    try {
      const clientes = await usuarioService.listarClientes(request.usuarioAutenticado.id_usuario);
      response.status(200).json({ sucesso: true, dados: clientes });
    } catch (erro) {
      next(erro);
    }
  }

  async function buscar(request, response, next) {
    try {
      const cliente = await usuarioService.buscarCliente(request.params.id, request.usuarioAutenticado.id_usuario);
      response.status(200).json({ sucesso: true, dados: cliente });
    } catch (erro) {
      if (erro instanceof TypeError) return response.status(400).json({ erro: erro.message });
      if (erro.status) return response.status(erro.status).json({ erro: erro.message });
      next(erro);
    }
  }

  async function criar(request, response, next) {
    try {
      const cliente = await usuarioService.criarCliente(request.body ?? {}, request.usuarioAutenticado.id_usuario);
      response.status(201).json({ sucesso: true, dados: cliente });
    } catch (erro) {
      if (erro instanceof TypeError) return response.status(400).json({ erro: erro.message });
      if (erro.code === "ER_DUP_ENTRY") return response.status(409).json({ erro: "Já existe uma conta com esse e-mail ou documento." });
      next(erro);
    }
  }

  return { listar, buscar, criar };
}
