export function criarReunioesController({ reunioesService }) {

  async function listar(req, res, next) {
    try {
      const reunioes = await reunioesService.listar();
      res.status(200).json({ sucesso: true, dados: reunioes });
    } catch (erro) {
      next(erro);
    }
  }

  async function buscar(req, res, next) {
    try {
      const reunioes = await reunioesService.buscarPorId(req.params.id);
      res.status(200).json({ sucesso: true, dados: reunioes });
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
      const reunioesNovo = await reunioesService.criar(req.body);
      res.status(201).json({ sucesso: true, dados: reunioesNovo });
    } catch (erro) {
      if (erro instanceof TypeError) {
        return res.status(400).json({ erro: erro.message });
      }
      next(erro);
    }
  }

  return { listar, buscar, criar };
}