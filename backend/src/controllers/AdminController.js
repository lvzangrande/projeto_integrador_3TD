export function criarAdminController({ adminService }) {
  async function executar(res, proxima, status, operacao) {
    try {
      const dados = await operacao();
      res.status(status).json({ sucesso: true, dados });
    } catch (erro) {
      if (erro.status) return res.status(erro.status).json({ erro: erro.message });
      if (erro.code === "ER_DUP_ENTRY") return res.status(409).json({ erro: "Já existe um registro com os mesmos dados únicos." });
      proxima(erro);
    }
  }

  return {
    dados: (_req, res, next) => executar(res, next, 200, () => adminService.dados()),
    criar: (req, res, next) => executar(res, next, 201, () => adminService.criar(req.params.recurso, req.body)),
    atualizar: (req, res, next) => executar(res, next, 200, async () => {
      await adminService.atualizar(req.params.recurso, req.params.id, req.body);
      return { atualizado: true };
    }),
    alterarStatus: (req, res, next) => executar(res, next, 200, async () => {
      await adminService.alterarStatus(req.params.recurso, req.params.id, req.body?.status);
      return { atualizado: true };
    }),
    definirTarifa: (req, res, next) => executar(res, next, 201, async () => {
      await adminService.definirTarifa(req.body?.valor, req.usuarioAutenticado.id_usuario);
      return { salva: true };
    }),
  };
}
