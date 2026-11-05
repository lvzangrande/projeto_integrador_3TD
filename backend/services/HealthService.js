import Health from "../models/Health.js";

export function criarhealthService({ healthModel }) {
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
        // Validação básica dos dados recebidos
        if (!dados.nome || !dados.email || !dados.senha) {
            throw new Error("Os campos 'nome', 'email' e 'senha' são obrigatórios");
        }

        const health = new Health({ ...dados });
        return healthModel.criar({
            nome: health.nome,
            email: health.email,
            senha: health.senha,
            cnpj: health.cnpj,
            telefone: health.telefone,
            categoria: health.categoria,
            status: health.status || "ativo", // Define um status padrão se não for fornecido
        });
    }

    return { listar, buscarPorId, criar };
}