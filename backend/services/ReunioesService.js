import Reuniao from "../models/Reunioes.js";

export function criarReunioesService({ reunioesModel, usuarioModel }) {
  async function listar(idFiliado) {
    return reunioesModel.listarPorFiliado(idFiliado);
  }

  async function buscarPorId(idRecebido, idFiliado) {
    const id = Number(idRecebido);
    if (!Number.isInteger(id) || id <= 0) throw new TypeError("ID deve ser um número inteiro positivo.");
    const reuniao = await reunioesModel.buscarPorId(id, idFiliado);
    if (!reuniao) throw Object.assign(new Error("Registro não encontrado."), { status: 404 });
    return reuniao;
  }

  async function criar(dados, idFiliado) {
    const clienteId = Number(dados.id_usuario);
    if (!Number.isInteger(clienteId) || clienteId <= 0) throw new TypeError("Selecione um cliente válido.");
    const cliente = await usuarioModel.buscarClienteDoFiliado(clienteId, idFiliado);
    if (!cliente) throw Object.assign(new Error("O cliente selecionado não pertence à sua carteira."), { status: 403 });

    const reuniao = new Reuniao({ ...dados, id_usuario: clienteId, id_filiado: idFiliado });
    return reunioesModel.criar(reuniao);
  }

  return { listar, buscarPorId, criar };
}
