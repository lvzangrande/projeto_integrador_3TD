import { gerarHashSenha } from "./AutenticacaoService.js";

const statusPorRecurso = {
  usuarios: ["Ativo", "Inativo"],
  reservatorios: ["Ativo", "Inativo"],
  setores: ["Ativo", "Inativo"],
  medidores: ["Ativo", "Inativo"],
  responsaveis: ["Ativo", "Inativo"],
  ocorrencias: ["Aberta", "Em análise", "Em reparo", "Resolvida", "Descartada"],
};
const tiposMedidor = ["Nível", "Vazão", "Hidrômetro"];
const tiposOrigem = ["Real", "Simulado"];
const tiposOcorrencia = ["Vazamento visível", "Vazamento Oculto", "Consumo anormal", "Falha de sensor", "Transbordo", "Outro"];
const severidades = ["Baixa", "Média", "Alta", "Extrema"];
const tiposReuniao = ["Reunião", "Entrevista"];

function falha(mensagem, status = 400) {
  return Object.assign(new Error(mensagem), { status });
}

function texto(valor, nome, { obrigatorio = true, max = 255 } = {}) {
  const resultado = typeof valor === "string" ? valor.trim() : "";
  if (obrigatorio && !resultado) throw falha(`${nome} é obrigatório.`);
  if (resultado.length > max) throw falha(`${nome} deve ter até ${max} caracteres.`);
  return resultado || null;
}

function numero(valor, nome, { minimo = 0, obrigatorio = true } = {}) {
  if ((valor === "" || valor == null) && !obrigatorio) return null;
  const resultado = Number(valor);
  if (!Number.isFinite(resultado) || resultado < minimo) throw falha(`${nome} deve ser um número válido maior ou igual a ${minimo}.`);
  return resultado;
}

function id(valor, nome, { obrigatorio = true } = {}) {
  if ((valor === "" || valor == null) && !obrigatorio) return null;
  const resultado = Number(valor);
  if (!Number.isInteger(resultado) || resultado <= 0) throw falha(`Selecione ${nome} válido.`);
  return resultado;
}

function escolha(valor, opcoes, nome) {
  if (!opcoes.includes(valor)) throw falha(`${nome} inválido.`);
  return valor;
}

function dataSql(valor, nome, { obrigatorio = true, naoFutura = false } = {}) {
  if (!valor && !obrigatorio) return null;
  if (typeof valor !== "string") throw falha(`${nome} inválida.`);
  const formatada = valor.replace("T", " ").slice(0, 19);
  const data = new Date(formatada.replace(" ", "T"));
  if (Number.isNaN(data.getTime())) throw falha(`${nome} inválida.`);
  if (naoFutura && data.getTime() > Date.now()) throw falha(`${nome} não pode estar no futuro.`);
  return formatada.length === 16 ? `${formatada}:00` : formatada;
}

function validarIdRelacionamento(lista, valor, nome, { obrigatorio = true, ativo = false } = {}) {
  const escolhido = id(valor, nome, { obrigatorio });
  if (escolhido == null) return null;
  const registro = lista.find((item) => Number(item.id) === escolhido);
  if (!registro) throw falha(`${nome} não encontrado.`, 404);
  if (ativo && registro.status !== "Ativo") throw falha(`${nome} precisa estar ativo.`);
  return escolhido;
}

function validarTransicaoOcorrencia(anterior, proximo) {
  const permitidos = {
    Aberta: ["Aberta", "Em análise", "Descartada"],
    "Em análise": ["Em análise", "Em reparo"],
    "Em reparo": ["Em reparo", "Resolvida"],
    Resolvida: ["Resolvida"],
    Descartada: ["Descartada"],
  };
  if (!permitidos[anterior]?.includes(proximo)) {
    throw falha(`Transição de ocorrência não permitida: ${anterior} → ${proximo}.`);
  }
}

export function criarAdminService({ adminModel }) {
  async function dados() {
    return adminModel.listarDados();
  }

  async function normalizar(recurso, recebido, anterior = null) {
    const data = recebido ?? {};
    const atuais = await adminModel.listarDados();
    const status = (campo) => escolha(data.status ?? anterior?.status ?? "Ativo", statusPorRecurso[campo], "Status");
    const pessoas = atuais.usuarios;
    const reservatorios = atuais.reservatorios;
    const setores = atuais.setores;
    const responsaveis = atuais.responsaveis;

    if (recurso === "usuarios") {
      const documento = texto(data.documento, "CPF/CNPJ", { max: 20 });
      const email = texto(data.email, "E-mail", { max: 100 }).toLowerCase();
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw falha("Informe um e-mail válido.");
      const categoria = escolha(data.categoria, ["Admin", "Filiado", "Cliente"], "Perfil");
      const idFiliado = id(data.id_filiado, "Filiado", { obrigatorio: false });
      if (idFiliado && !pessoas.some((item) => Number(item.id) === idFiliado && item.categoria === "Filiado" && item.status === "Ativo")) throw falha("O Filiado selecionado precisa estar ativo.");
      if (idFiliado && categoria !== "Cliente") throw falha("Somente clientes podem ser vinculados a um Filiado.");
      const senha = typeof data.senha === "string" ? data.senha : "";
      if (!anterior && senha.length < 8) throw falha("A senha inicial deve ter ao menos 8 caracteres.");
      if (senha && senha.length < 8) throw falha("A senha deve ter ao menos 8 caracteres.");
      return {
        nome: texto(data.nome, "Nome", { max: 100 }), email, documento,
        tipo_pessoa: documento.replace(/\D/g, "").length <= 11 ? "fisica" : "juridica",
        telefone: texto(data.telefone, "Telefone", { obrigatorio: false, max: 20 }),
        categoria,
        tema: escolha(data.tema, ["Claro", "Escuro"], "Tema"), status: status(recurso),
        id_filiado: idFiliado,
        senha: senha ? await gerarHashSenha(senha) : null,
      };
    }

    if (recurso === "reservatorios") {
      const capacidade = numero(data.capacidade, "Capacidade", { minimo: 0.001 });
      const nivelMin = numero(data.nivel_min, "Nível mínimo");
      const nivelMax = numero(data.nivel_max, "Nível máximo");
      if (!(nivelMin < nivelMax && nivelMax <= capacidade)) throw falha("Os limites devem respeitar 0 ≤ mínimo < máximo ≤ capacidade (em litros).");
      return {
        id_usuario: validarIdRelacionamento(pessoas.filter((x) => x.status === "Ativo"), data.id_usuario, "conta responsável", { ativo: true }),
        nome: texto(data.nome, "Nome", { max: 100 }),
        tipo: escolha(data.tipo, ["Torre de resfriamento", "Tanque de processo", "Decantador", "Reservatório de água bruta", "Reservatório de agua tratada", "Cisterna", "Tanque elevado", "Outro"], "Tipo"),
        capacidade, localizacao: texto(data.localizacao, "Localização", { max: 255 }),
        nivel_min: nivelMin, nivel_max: nivelMax, status: status(recurso),
      };
    }

    if (recurso === "setores") {
      return {
        id_reservatorio: validarIdRelacionamento(reservatorios.filter((x) => x.status === "Ativo"), data.id_reservatorio, "reservatório", { ativo: true }),
        nome: texto(data.nome, "Nome", { max: 100 }),
        tipo: escolha(data.tipo, ["Linha de produção", "Torres de resfriamento/Caldeiras", "Limpeza/Lavagem", "Uso administrativo", "Tratamento de efluentes", "Agua de reuso", "Outro"], "Tipo"),
        consumo_max_dia: numero(data.consumo_max_dia, "Consumo máximo diário", { minimo: 0.001 }),
        status: status(recurso),
      };
    }

    if (recurso === "medidores") {
      return {
        id_setor: validarIdRelacionamento(setores.filter((x) => x.status === "Ativo"), data.id_setor, "setor", { ativo: true }),
        serie: texto(data.serie, "Número de série", { max: 50 }),
        tipo: escolha(data.tipo, tiposMedidor, "Tipo de medidor"),
        origem: escolha(data.origem, tiposOrigem, "Origem"), status: status(recurso),
      };
    }

    if (recurso === "responsaveis") {
      return {
        id_usuario: validarIdRelacionamento(pessoas.filter((x) => x.categoria === "Cliente" && x.status === "Ativo"), data.id_usuario, "cliente", { ativo: true }),
        id_reservatorio: validarIdRelacionamento(reservatorios.filter((x) => x.status === "Ativo"), data.id_reservatorio, "reservatório", { ativo: true }),
        id_setor: validarIdRelacionamento(setores.filter((x) => x.status === "Ativo"), data.id_setor, "setor", { obrigatorio: false, ativo: true }),
        nome: texto(data.nome, "Nome", { max: 100 }),
        funcao: texto(data.funcao, "Função", { obrigatorio: false, max: 120 }),
        telefone: texto(data.telefone, "Telefone", { obrigatorio: false, max: 20 }),
        email: texto(data.email, "E-mail", { obrigatorio: false, max: 100 }),
        status: status(recurso),
      };
    }

    if (recurso === "ocorrencias") {
      const statusOcorrencia = escolha(data.status ?? anterior?.status ?? "Aberta", statusPorRecurso[recurso], "Status");
      if (anterior) validarTransicaoOcorrencia(anterior.status, statusOcorrencia);
      const acaoCorretiva = texto(data.acao_corretiva, "Ação corretiva", { obrigatorio: false });
      if (statusOcorrencia === "Resolvida" && !acaoCorretiva && anterior?.status !== "Resolvida") throw falha("Registre a ação corretiva antes de resolver a ocorrência.");
      const reservatorioId = validarIdRelacionamento(reservatorios, data.id_reservatorio, "reservatório");
      const setorId = validarIdRelacionamento(setores, data.id_setor, "setor", { obrigatorio: false });
      if (setorId && Number(setores.find((x) => x.id === setorId)?.id_reservatorio) !== reservatorioId) {
        throw falha("O setor selecionado não pertence ao reservatório.");
      }
      return {
        id_reservatorio: reservatorioId, id_setor: setorId,
        id_responsavel: validarIdRelacionamento(responsaveis.filter((x) => x.status === "Ativo"), data.id_responsavel, "responsável", { obrigatorio: false, ativo: true }),
        tipo: escolha(data.tipo, tiposOcorrencia, "Tipo"),
        severidade: escolha(data.severidade, severidades, "Severidade"),
        descricao: texto(data.descricao, "Descrição"),
        volume_perdido: numero(data.volume_perdido ?? 0, "Volume perdido"),
        status: statusOcorrencia,
        abertura: dataSql(data.abertura, "Data de abertura"), acao_corretiva: acaoCorretiva,
      };
    }

    if (recurso === "reunioes") {
      return {
        id_usuario: validarIdRelacionamento(pessoas.filter((x) => x.categoria === "Cliente" && x.status === "Ativo"), data.id_usuario, "cliente", { ativo: true }),
        id_filiado: validarIdRelacionamento(pessoas.filter((x) => x.categoria === "Filiado" && x.status === "Ativo"), data.id_filiado, "Filiado", { ativo: true }),
        tipo: escolha(data.tipo, tiposReuniao, "Tipo"),
        data_hora: dataSql(data.data_hora, "Data e hora"),
        pauta: texto(data.pauta, "Pauta", { max: 255 }),
        resumo: texto(data.resumo, "Resumo"),
        proximos_passos: texto(data.proximos_passos, "Próximos passos", { obrigatorio: false }),
      };
    }

    throw falha("Este tipo de registro é somente para consulta.", 405);
  }

  async function criar(recurso, dados) {
    const normalizados = await normalizar(recurso, dados);
    if (recurso === "responsaveis" && normalizados.id_setor) {
      const { setores } = await adminModel.listarDados();
      if (Number(setores.find((item) => Number(item.id) === normalizados.id_setor)?.id_reservatorio) !== normalizados.id_reservatorio) {
        throw falha("O setor selecionado não pertence ao reservatório.");
      }
    }
    return adminModel.criar(recurso, normalizados);
  }

  async function atualizar(recurso, recebidoId, dados) {
    const registroId = id(recebidoId, "registro");
    const atuais = await adminModel.listarDados();
    const chavePorRecurso = {
      usuarios: "usuarios", reservatorios: "reservatorios", setores: "setores",
      medidores: "medidores", responsaveis: "responsaveis", ocorrencias: "ocorrencias", reunioes: "reunioes",
    };
    const existente = atuais[chavePorRecurso[recurso]]?.find((item) => Number(item.id) === registroId);
    if (!existente) throw falha("Registro não encontrado.", 404);
    const normalizados = await normalizar(recurso, dados, existente);
    if (recurso === "responsaveis" && normalizados.id_setor) {
      const { setores } = await adminModel.listarDados();
      if (Number(setores.find((item) => Number(item.id) === normalizados.id_setor)?.id_reservatorio) !== normalizados.id_reservatorio) {
        throw falha("O setor selecionado não pertence ao reservatório.");
      }
    }
    return adminModel.atualizar(recurso, registroId, normalizados);
  }

  async function alterarStatus(recurso, recebidoId, status) {
    const registroId = id(recebidoId, "registro");
    const estados = statusPorRecurso[recurso];
    if (!estados || !estados.includes(status)) throw falha("Status inválido para este registro.");
    if (recurso === "ocorrencias") {
      const { ocorrencias } = await adminModel.listarDados();
      const atual = ocorrencias.find((item) => Number(item.id) === registroId);
      if (!atual) throw falha("Registro não encontrado.", 404);
      validarTransicaoOcorrencia(atual.status, status);
      if (status === "Resolvida" && !atual.acao_corretiva) throw falha("Registre a ação corretiva antes de resolver a ocorrência.");
    }
    await adminModel.alterarStatus(recurso, registroId, status);
  }

  async function reconhecerAlerta(recebidoId) {
    await adminModel.reconhecerAlerta(id(recebidoId, "alerta"));
  }

  async function definirTarifa(valor, idUsuario) {
    const valorValidado = numero(valor, "Tarifa", { minimo: 0.0001 });
    await adminModel.registrarTarifa(valorValidado, id(idUsuario, "usuário"));
  }

  return { dados, criar, atualizar, alterarStatus, reconhecerAlerta, definirTarifa };
}
