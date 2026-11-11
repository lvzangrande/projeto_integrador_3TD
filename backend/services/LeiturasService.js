import Leituras from "../models/Leituras.js";

export function criarLeiturasService({ leituraModel }) {
  async function listar() {
    return leituraModel.listarTodos();
  }

  async function buscarPorId(idRecebido) {
    const id = Number(idRecebido);
    if (!Number.isInteger(id) || id <= 0) {
      throw new TypeError("ID deve ser um número inteiro positivo");
    }
    const leitura = await leituraModel.buscarPorId(id);
    if (!leitura) throw new Error(`Medidor ${id} não encontrado`);
    return leitura;
  }

  async function criar(dados) {
    const leitura = new Leituras({
      ...dados,
      volume_leitura: dados.volume_leitura,
      origem: dados.origem,
    });
    return leituraModel.criar(leitura);
  }

  return { listar, buscarPorId, criar };
}
