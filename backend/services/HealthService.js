import Health from "../models/Health.js";

export function criarHealthService({ healthModel }) {
  async function listar() {
    return healthModel.listarTodos();
  }

  async function buscarPorId(idRecebido) {
    const id = Number(idRecebido);
    if (!Number.isInteger(id) || id <= 0) {
      throw new TypeError("ID deve ser um número inteiro positivo");
    }
    const health = await healthModel.buscarPorId(id);
    if (!health) throw new Error(`Health ${id} não encontrado`);
    return health;
  }

  async function criar(dados) {
    const health = new Health({
      ...dados,
      categoria: dados.categoria || "Cliente",
      tema: dados.tema || "Escuro",
      status: dados.status || "Ativo",
    });
    return healthModel.criar(health);
  }

  return { listar, buscarPorId, criar };
}
