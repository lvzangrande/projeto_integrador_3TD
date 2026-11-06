export function criarUsuarioController({ usuarioService }) {

  async function listar(req, res, next) {
    try {
      const usuario = await usuarioService.listar();
      res.status(200).json({ sucesso: true, dados: usuario });
    } catch (erro) {
      next(erro);
    }
  }

  async function buscar(req, res, next) {
    try {
      const usuario = await usuarioService.buscarPorId(req.params.id);
      res.status(200).json({ sucesso: true, dados: usuario });
    } catch (erro) {
      if (erro instanceof TypeError) {
        return res.status(400).json({ erro: erro.message });
      }

      if (erro.message.includes('não encontrado')) {
        return res.status(404).json({ erro: erro.message });
      }

      next(erro);
    }
  }

  async function criar(req, res, next) {
    try {
      const usuarioNovo = await usuarioService.criar(req.body);
      res.status(201).json({ sucesso: true, dados: usuarioNovo });
    } catch (erro) {
      if (erro instanceof TypeError) {
        return res.status(400).json({ erro: erro.message });
      }
      next(erro);
    }
  }

  return { listar, buscar, criar };
}