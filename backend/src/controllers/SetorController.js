export function criarSetorController({ setorService }) {
	
  async function listar(req, res, next) {
    try {
      const setor = await setorService.listar();
      res.status(200).json({ sucesso: true, dados: setor });
    } catch (erro) {
      next(erro);
    }
  }

  async function buscar(req, res, next) {
    try {
      const setor = await setorService.buscarPorId(req.params.id);
      res.status(200).json({ sucesso: true, dados: setor });
    } catch (erro) {
      if (erro instanceof TypeError) {
        return res.status(401).json({ erro: erro.message });
      }

      if (erro.message.includes('não encontrado')) {
        return res.status(404).json({ erro: erro.message });
      }

      next(erro);
    }
  }

  
  async function criar(req, res, next) {
    try {
      const setorNovo = await setorService.criar(req.body);
      res.status(201).json({ sucesso: true, dados: setorNovo });
    } catch (erro) {
      if (erro instanceof TypeError) {
        return res.status(400).json({ erro: erro.message });
      }
      next(erro);
    }
  }

  return { listar, buscar, criar };
}