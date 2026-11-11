export function criarLeiturasController({ leituraService }) {

  async function listar(req, res, next) {
    try {
      const leituras = await leituraService.listar();
      res.status(200).json({ sucesso: true, dados: leituras });
    } catch (erro) {
      next(erro);
    }
  }

  async function buscar(req, res, next) {
    try {
      const leituras = await leituraService.buscarPorId(req.params.id);
      res.status(200).json({ sucesso: true, dados: leituras });
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
      const leituraNovo = await leituraService.criar(req.body);
      res.status(201).json({ sucesso: true, dados: leituraNovo });
    } catch (erro) {
      if (erro instanceof TypeError) {
        return res.status(400).json({ erro: erro.message });
      }
      next(erro);
    }
  }

  return { listar, buscar, criar };
}