export function criarClientePortalService({ clientePortalModel }) {
  async function buscarOperacao(idUsuarioRecebido) {
    const idUsuario = Number(idUsuarioRecebido);
    if (!Number.isInteger(idUsuario) || idUsuario <= 0) {
      throw new TypeError("Sessão de cliente inválida.");
    }
    return clientePortalModel.buscarOperacao(idUsuario);
  }
  return { buscarOperacao };
}
