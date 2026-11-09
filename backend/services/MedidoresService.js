import Medidor from "../models/Medidores.js";

export function criarMedidoresService({ medidorModel }) {
  async function listar() {
    return medidorModel.listarTodos();
  }

  async function buscarPorId(idRecebido) {
    const id = Number(idRecebido);
    if (!Number.isInteger(id) || id <= 0) {
      throw new TypeError("ID deve ser um número inteiro positivo");
    }
    const medidor = await medidorModel.buscarPorId(id);
    if (!medidor) throw new Error(`Medidor ${id} não encontrado`);
    return medidor;
  }

  async function criar(dados) {
    const medidor = new Medidor({
      ...dados,
      num_serie: dados.num_serie,
      tipo: dados.tipo,
      origem: dados.origem,
    });
    return medidorModel.criar(medidor);
  }

  return { listar, buscarPorId, criar };
}
