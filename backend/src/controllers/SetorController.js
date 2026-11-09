export function criarSetorController({ SetorService }) {
	
  async function listar(req, res, next) {
    try {
      const usuario = await setorService.listar();
      res.status(200).json({ sucesso: true, dados: usuario });
    } catch (erro) {
      next(erro);
    }
  }

  async function buscar(req, res, next) {
    try {
      const usuario = await setorService.buscarPorId(req.params.id);
      res.status(200).json({ sucesso: true, dados: usuario });
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
