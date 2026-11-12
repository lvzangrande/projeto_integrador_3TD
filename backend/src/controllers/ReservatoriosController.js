export function criarReservatoriosController({ reservatoriosService }) {

  async function listar(req, res, next) {
    try {
      const reservatorios = await reservatoriosService.listar();
      res.status(200).json({ sucesso: true, dados: reservatorios });
    } catch (erro) {
      next(erro);
    }
  }

  async function buscar(req, res, next) {
    try {
      const reservatorios = await reservatoriosService.buscarPorId(req.params.id);
      res.status(200).json({ sucesso: true, dados: reservatorios });
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
      const reservatoriosNovo = await reservatoriosService.criar(req.body);
      res.status(201).json({ sucesso: true, dados: reservatoriosNovo });
    } catch (erro) {
      if (erro instanceof TypeError) {
        return res.status(400).json({ erro: erro.message });
      }
      next(erro);
    }
  }

  return { listar, buscar, criar };
}