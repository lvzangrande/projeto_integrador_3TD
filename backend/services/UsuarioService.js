import Usuario from "../models/Usuario.js";

export function criarUsuarioService({ usuarioModel }) {
  async function listar() {
    return usuarioModel.listarTodos();
  }

  async function buscarPorId(idRecebido) {
    const id = Number(idRecebido);
    if (!Number.isInteger(id) || id <= 0) {
      throw new TypeError("ID deve ser um número inteiro positivo");
    }
    const usuario = await usuarioModel.buscarPorId(id);
    if (!usuario) throw new Error(`Usuario ${id} não encontrado`);
    return usuario;
  }

  async function criar(dados) {
    const usuario = new Usuario({
      ...dados,
      categoria: dados.categoria || "Cliente",
      tema: dados.tema || "Escuro",
      status: dados.status || "Ativo",
    });
    return usuarioModel.criar(usuario);
  }

  return { listar, buscarPorId, criar };
}
