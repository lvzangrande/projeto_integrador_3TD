export function criarOcorrenciasController({ ocorrenciasService }) {

  async function listar(req, res, next) {
    try {
      const ocorrencias = await ocorrenciasService.listar();
      res.status(200).json({ sucesso: true, dados: ocorrencias });
    } catch (erro) {
      next(erro);
    }
  }

  async function buscar(req, res, next) {
    try {
      const ocorrencias = await ocorrenciasService.buscarPorId(req.params.id);
      res.status(200).json({ sucesso: true, dados: ocorrencias });
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
      const ocorrenciasNovo = await ocorrenciasService.criar(req.body);
      res.status(201).json({ sucesso: true, dados: ocorrenciasNovo });
    } catch (erro) {
      if (erro instanceof TypeError) {
        return res.status(400).json({ erro: erro.message });
      }
      next(erro);
    }
  }

  return { listar, buscar, criar };
}