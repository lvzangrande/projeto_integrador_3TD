import { createHmac } from "node:crypto";
import { gerarHashSenha } from "./AutenticacaoService.js";

const RESPOSTA_GENERICA = {
  mensagem: "Se houver uma conta ativa com esse CPF e telefone cadastrado, enviaremos um código por SMS.",
};
const TAMANHO_CODIGO = 6;

function validarCpf(valor) {
  const cpf = typeof valor === "string" ? valor.replace(/\D/g, "") : "";
  if (cpf.length !== 11 || /^(\d)\1+$/.test(cpf)) return null;

  for (const posicao of [9, 10]) {
    let soma = 0;
    for (let indice = 0; indice < posicao; indice += 1) {
      soma += Number(cpf[indice]) * (posicao + 1 - indice);
    }
    const digito = ((soma * 10) % 11) % 10;
    if (digito !== Number(cpf[posicao])) return null;
  }
  return cpf;
}

function obterTelefoneE164(telefone) {
  const digitos = String(telefone ?? "").replace(/\D/g, "");
  if (digitos.length === 10 || digitos.length === 11) return `+55${digitos}`;
  if ((digitos.length === 12 || digitos.length === 13) && digitos.startsWith("55")) {
    return `+${digitos}`;
  }
  return null;
}

function obterValidadeMinutos(env) {
  const configurada = Number.parseInt(env.PASSWORD_RESET_TTL_MINUTES, 10);
  return Number.isFinite(configurada) ? Math.min(10, Math.max(3, configurada)) : 5;
}

function hashCodigo(codigo, env) {
  const segredo = env.JWT_SECRET?.trim();
  if (!segredo || segredo.length < 32) {
    throw Object.assign(new Error("Configure um JWT_SECRET com pelo menos 32 caracteres no backend/.env."), { status: 503 });
  }
  return createHmac("sha256", segredo).update(codigo).digest("hex");
}

function erroCodigoInvalido() {
  return Object.assign(new Error("Código inválido ou expirado. Solicite outro código SMS."), { status: 400 });
}

export function criarRecuperacaoSenhaService({
  usuarioModel,
  recuperacaoSenhaModel,
  smsService,
  env = process.env,
  agora = () => Date.now(),
}) {
  async function solicitarRedefinicao(cpfRecebido, origem = null) {
    const cpf = validarCpf(cpfRecebido);
    if (!cpf) {
      throw Object.assign(new Error("Digite um CPF válido."), { status: 400 });
    }

    smsService.validarConfiguracao();
    hashCodigo("000000", env);

    let usuario;
    try {
      usuario = await usuarioModel.buscarContaParaRecuperacaoPorCpf(cpf);
    } catch (error) {
      console.error("Falha ao consultar a conta para recuperação de senha:", error.message);
      throw Object.assign(
        new Error("A recuperação de senha está temporariamente indisponível. Tente novamente mais tarde."),
        { status: 503 },
      );
    }
    if (!usuario || usuario.status !== "Ativo") return RESPOSTA_GENERICA;

    const destinatario = obterTelefoneE164(usuario.telefone);
    if (!destinatario) return RESPOSTA_GENERICA;

    // O Twilio Verify gera e valida o código. O hash local representa a solicitação
    // pendente e impede que uma verificação aprovada seja reutilizada para outra troca.
    const hashToken = hashCodigo(`twilio-verify:${usuario.id_usuario}`, env);
    const origemHash = origem ? hashCodigo(`ip:${origem}`, env) : null;
    const validadeMinutos = obterValidadeMinutos(env);
    const expiraEm = new Date(agora() + validadeMinutos * 60_000)
      .toISOString()
      .slice(0, 19)
      .replace("T", " ");

    let hashCriado = null;
    try {
      const criado = await recuperacaoSenhaModel.criarToken({
        idUsuario: usuario.id_usuario,
        hashToken,
        expiraEm,
        origemHash,
      });
      if (!criado) return RESPOSTA_GENERICA;
      hashCriado = hashToken;

      await smsService.enviarCodigo({ destinatario });
    } catch (error) {
      if (hashCriado) {
        try {
          await recuperacaoSenhaModel.revogarToken(hashCriado);
        } catch (erroRevogacao) {
          console.error("Falha ao invalidar código SMS não enviado:", erroRevogacao.message);
        }
      }
      console.error("Falha ao processar recuperação por SMS:", error.message);
    }

    return RESPOSTA_GENERICA;
  }

  async function redefinirSenha({ cpf: cpfRecebido, codigo, senha }) {
    const cpf = validarCpf(cpfRecebido);
    if (!cpf) throw Object.assign(new Error("Digite um CPF válido."), { status: 400 });
    if (typeof codigo !== "string" || !/^\d{6}$/.test(codigo)) throw erroCodigoInvalido();
    if (typeof senha !== "string" || senha.length < 8 || senha.length > 72 || !/[A-Za-z]/.test(senha) || !/\d/.test(senha)) {
      throw Object.assign(new Error("A senha deve ter entre 8 e 72 caracteres e conter letras e números."), { status: 400 });
    }

    hashCodigo("000000", env);
    const usuario = await usuarioModel.buscarContaParaRecuperacaoPorCpf(cpf);
    if (!usuario || usuario.status !== "Ativo") throw erroCodigoInvalido();

    const destinatario = obterTelefoneE164(usuario.telefone);
    if (!destinatario) throw erroCodigoInvalido();

    const hashToken = hashCodigo(`twilio-verify:${usuario.id_usuario}`, env);
    const temSolicitacaoAtiva = await recuperacaoSenhaModel.possuiTokenAtivo(
      usuario.id_usuario,
      hashToken,
    );
    if (!temSolicitacaoAtiva) throw erroCodigoInvalido();

    let codigoValido;
    try {
      smsService.validarConfiguracao();
      codigoValido = await smsService.validarCodigo({ destinatario, codigo });
    } catch (erro) {
      console.error("Falha ao validar código pelo Twilio Verify:", erro.message);
      throw Object.assign(
        new Error("Não foi possível validar o código agora. Solicite outro SMS e tente novamente."),
        { status: 503 },
      );
    }
    if (!codigoValido) {
      await recuperacaoSenhaModel.registrarTentativaInvalida(usuario.id_usuario, hashToken);
      throw erroCodigoInvalido();
    }

    const atualizado = await recuperacaoSenhaModel.redefinirSenha(
      usuario.id_usuario,
      hashToken,
      await gerarHashSenha(senha),
    );
    if (!atualizado) throw erroCodigoInvalido();
    return { mensagem: "Senha redefinida com sucesso." };
  }

  return { solicitarRedefinicao, redefinirSenha };
}
