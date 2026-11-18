import Reunioes from "../models/Reunioes.js";

export function criarReunioesService({ reunioesModel }) {
  async function listar() {
    return reunioesModel.listarTodos();
  }

  async function buscarPorId(idRecebido) {
    const id = Number(idRecebido);
    if (!Number.isInteger(id) || id <= 0) {
      throw new TypeError("ID deve ser um número inteiro positivo");
    }
    const medidor = await reunioesModel.buscarPorId(id);
    if (!medidor) throw new Error(`Medidor ${id} não encontrado`);
    return medidor;
  }

  async function criar(dados) {
    const reunioes = new Reunioes({
      ...dados,
      pauta: dados.pauta,
      resumo: dados.resumo,
      proximos_passos: dados.proximos_passos,
      tipo: dados.tipo
    });
    return reunioesModel.criar(reunioes);
  }

  return { listar, buscarPorId, criar };
}
