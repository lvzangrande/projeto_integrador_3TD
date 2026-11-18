import Reservatorios from "../models/Reservatorios.js";

export function criarReservatoriosService({ reservatoriosModel }) {
  async function listar() {
    return reservatoriosModel.listarTodos();
  }

  async function buscarPorId(idRecebido) {
    const id = Number(idRecebido);
    if (!Number.isInteger(id) || id <= 0) {
      throw new TypeError("ID deve ser um número inteiro positivo");
    }
    const reservatorio = await reservatoriosModel.buscarPorId(id);
    if (!reservatorio) throw new Error(`Reservatorios ${id} não encontrado`);
    return reservatorio;
  }

  async function criar(dados) {
    const reservatorios = new Reservatorios({
      ...dados,
      nome,
      capacidade,
      nivel_min,
      nivel_max,
      status,
      tipo
    });
    return reservatoriosModel.criar(reservatorios);
  }

  return { listar, buscarPorId, criar };
}
