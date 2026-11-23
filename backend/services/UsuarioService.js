import { gerarHashSenha } from "./AutenticacaoService.js";

export function criarUsuarioService({ usuarioModel }) {
  async function listarClientes(idFiliado) {
    return usuarioModel.listarClientesDoFiliado(idFiliado);
  }

  async function buscarCliente(idRecebido, idFiliado) {
    const id = Number(idRecebido);
    if (!Number.isInteger(id) || id <= 0) throw new TypeError("ID deve ser um número inteiro positivo.");
    const cliente = await usuarioModel.buscarClienteDoFiliado(id, idFiliado);
    if (!cliente) throw Object.assign(new Error("Cliente não encontrado."), { status: 404 });
    return cliente;
  }

  async function criarCliente(dados, idFiliado) {
    const nome = typeof dados.nome === "string" ? dados.nome.trim() : "";
    const email = typeof dados.email === "string" ? dados.email.trim().toLowerCase() : "";
    const documento = String(dados.documento ?? "").replace(/\D/g, "");
    const telefone = String(dados.telefone ?? "").replace(/\D/g, "");
    const tipoPessoa = dados.tipoPessoa;

    if (nome.length < 3) throw new TypeError("Informe o nome do cliente.");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 100) {
      throw new TypeError("Informe um e-mail válido com até 100 caracteres.");
    }
    if (!["fisica", "juridica"].includes(tipoPessoa)) throw new TypeError("Tipo de pessoa inválido.");
    if (tipoPessoa === "fisica" ? documento.length !== 11 : documento.length !== 14) {
      throw new TypeError("Informe um CPF ou CNPJ válido.");
    }
    if (telefone.length < 10 || telefone.length > 13) throw new TypeError("Informe um telefone válido com DDD.");
    if (typeof dados.senha !== "string" || dados.senha.length < 8) {
      throw new TypeError("A senha deve ter ao menos 8 caracteres.");
    }

    return usuarioModel.criarCliente({
      nome,
      email,
      documento,
      tipoPessoa,
      telefone,
      senha: await gerarHashSenha(dados.senha),
      idFiliado,
    });
  }

  return { listarClientes, buscarCliente, criarCliente };
}
