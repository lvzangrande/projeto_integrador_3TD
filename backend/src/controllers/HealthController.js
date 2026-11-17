export function criarHealthController({ healthService }) {

  async function listar(req, res, next) {
    try {
      const health = await healthService.listar();
      res.status(200).json({ sucesso: true, dados: health });
    } catch (erro) {
      next(erro);
    }
  }

  async function buscar(req, res, next) {
    try {
      const health = await healthService.buscarPorId(req.params.id);
      res.status(200).json({ sucesso: true, dados: health });
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
      const healthNovo = await healthService.criar(req.body);
      res.status(201).json({ sucesso: true, dados: healthNovo });
    } catch (erro) {
      if (erro instanceof TypeError) {
        return res.status(400).json({ erro: erro.message });
      }
      next(erro);
    }
  }

  return { listar, buscar, criar };
}