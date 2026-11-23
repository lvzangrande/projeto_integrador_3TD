import Setor from "../models/Setor.js";

export function criarSetorService({ setorModel }) {
  async function listar() {
    return setorModel.listarTodos();
  }

  async function buscarPorId(idRecebido) {
    const id = Number(idRecebido);
    if (!Number.isInteger(id) || id <= 0) {
      throw new TypeError("ID deve ser um número inteiro positivo");
    }
    const setor = await setorModel.buscarPorId(id);
    if (!setor) throw new Error(`Setor ${id} não encontrado`);
    return setor;
  }

  async function criar(dados) {
    const setor = new Setor({
      ...dados,
      status: dados.status || "Ativo",
    });
    return setorModel.criar(setor);
  }

  return { listar, buscarPorId, criar };
}
