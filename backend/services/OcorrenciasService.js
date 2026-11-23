import Ocorrencias from "../models//Ocorrencias.js";

export function criarOcorrenciasService({ ocorrenciasModel }) {
  async function listar() {
    return ocorrenciasModel.listarTodos();
  }

  async function buscarPorId(idRecebido) {
    const id = Number(idRecebido);
    if (!Number.isInteger(id) || id <= 0) {
      throw new TypeError("ID deve ser um número inteiro positivo");
    }
    const ocorrencias = await ocorrenciasModel.buscarPorId(id);
    if (!ocorrencias) throw new Error(`Ocorrencias ${id} não encontrada`);
    return ocorrencias;
  }

  async function criar(dados) {
    const ocorrencias = new Ocorrencias({
      ...dados,
      severidade: dados.severidade,
      status: dados.status,
      tipo: dados.tipo,
      status: dados.status
    });
    return ocorrenciasModel.criar(ocorrencias);
  }

  return { listar, buscarPorId, criar };
}
