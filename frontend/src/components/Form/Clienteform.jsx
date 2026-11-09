"use client";

import { useId, useRef, useState } from "react";
import "./formbase.css";
import "./Clienteform.css";
import ModalCadastro from "./ModalCadastro.jsx";
import SecaoForm from "./SecaoForm.jsx";
import { Campo, CampoSenha } from "./Campo.jsx";
import { IconIdCard, IconMail, IconPhone, IconUser, IconUserPlus, IconX } from "./icones";
import {
  mascararCnpj,
  mascararCpf,
  mascararTelefone,
  somenteDigitos,
  TAMANHO_MIN_SENHA,
  validarCnpj,
  validarCpf,
  validarEmail,
  validarSenha,
  validarTelefone,
} from "./utils";

/* ---------- Configuração por tipo de pessoa ---------- */
const TIPOS_PESSOA = {
  fisica: {
    rotulo: "Pessoa Física",
    nomeLabel: "Nome completo",
    nomePlaceholder: "Digite o nome completo",
    nomeErro: "Informe o nome completo.",
    docLabel: "CPF",
    docPlaceholder: "Digite o CPF",
    docErro: "Informe um CPF válido.",
    mascara: mascararCpf,
    validar: validarCpf,
    docMax: 14, // 000.000.000-00
  },
  juridica: {
    rotulo: "Pessoa Jurídica",
    nomeLabel: "Razão social",
    nomePlaceholder: "Digite a razão social",
    nomeErro: "Informe a razão social.",
    docLabel: "CNPJ",
    docPlaceholder: "Digite o CNPJ",
    docErro: "Informe um CNPJ válido.",
    mascara: mascararCnpj,
    validar: validarCnpj,
    docMax: 18, // 00.000.000/0000-00
  },
};

const VALORES_INICIAIS = {
  nome: "",
  documento: "",
  email: "",
  telefone: "",
  senha: "",
  confirmar: "",
};

function validar(valores, tipo) {
  const cfg = TIPOS_PESSOA[tipo];
  const erros = {};

  if (valores.nome.trim().length < 3) erros.nome = cfg.nomeErro;
  if (!cfg.validar(valores.documento)) erros.documento = cfg.docErro;
  if (!validarEmail(valores.email)) erros.email = "Informe um e-mail válido.";
  if (!validarTelefone(valores.telefone)) erros.telefone = "Informe um telefone com DDD.";
  if (!validarSenha(valores.senha)) {
    erros.senha = `A senha deve ter ao menos ${TAMANHO_MIN_SENHA} caracteres.`;
  }
  if (!valores.confirmar) erros.confirmar = "Confirme a senha.";
  else if (valores.confirmar !== valores.senha) erros.confirmar = "As senhas não coincidem.";

  return erros;
}

/* ---------- Componente ----------
 *
 * Props:
 *  - onSubmit   async (dados) => void, chamado só com o formulário válido.
 *               dados = { tipoPessoa: "fisica" | "juridica", nome, documento (só dígitos),
 *                         email, telefone (só dígitos), senha }
 *               Se lançar erro, trate no pai e passe a mensagem em `erroEnvio`.
 *  - onCancel   () => void, ao clicar em "Cancelar"
 *  - enviando   true enquanto a requisição está em andamento (desabilita os botões)
 *  - erroEnvio  mensagem de erro da API, exibida no rodapé
 */
export default function ClienteForm({ onSubmit, onCancel, enviando = false, erroEnvio = null }) {
  const formId = useId();
  const formRef = useRef(null);

  const [tipo, setTipo] = useState("fisica");
  const [valores, setValores] = useState(VALORES_INICIAIS);
  const [erros, setErros] = useState({});

  const cfg = TIPOS_PESSOA[tipo];

  const alterar = (campo, valor) => {
    setValores((v) => ({ ...v, [campo]: valor }));
    setErros((e) => (e[campo] ? { ...e, [campo]: undefined } : e));
  };

  const trocarTipo = (chave) => {
    if (chave === tipo) return;
    setTipo(chave);
    // CPF e CNPJ têm máscaras diferentes: limpa o documento e seu erro
    setValores((v) => ({ ...v, documento: "" }));
    setErros((e) => ({ ...e, nome: undefined, documento: undefined }));
  };

  const enviar = async (ev) => {
    ev.preventDefault();
    if (enviando) return;

    const novosErros = validar(valores, tipo);
    setErros(novosErros);

    if (Object.keys(novosErros).length > 0) {
      // Leva o foco ao primeiro campo inválido (após o React atualizar o DOM)
      requestAnimationFrame(() => {
        formRef.current?.querySelector('[aria-invalid="true"]')?.focus();
      });
      return;
    }

    await onSubmit?.({
      tipoPessoa: tipo,
      nome: valores.nome.trim(),
      documento: somenteDigitos(valores.documento),
      email: valores.email.trim().toLowerCase(),
      telefone: somenteDigitos(valores.telefone),
      senha: valores.senha,
    });
  };

  return (
    <ModalCadastro
      icone={IconUserPlus}
      titulo="Cadastrar novo cliente"
      subtitulo="Registre um novo cliente e conceda acesso à plataforma WaterControl."
      rodape={
        <>
          {erroEnvio && (
            <p className="cf-erro-envio" role="alert">
              {erroEnvio}
            </p>
          )}

          <button
            type="button"
            className="cf-btn cf-btn--sec"
            onClick={onCancel}
            disabled={enviando}
          >
            <IconX size={20} />
            Cancelar
          </button>

          <button type="submit" form={formId} className="cf-btn cf-btn--pri" disabled={enviando}>
            <IconUserPlus size={20} />
            {enviando ? "Cadastrando..." : "Cadastrar cliente"}
          </button>
        </>
      }
    >
      <form id={formId} ref={formRef} onSubmit={enviar} noValidate>
        {/* 1. Identificação */}
        <SecaoForm numero={1} titulo="Identificação" descricao="Informe os dados principais do cliente.">
          <fieldset className="cf-radios">
            <legend className="cf-sr">Tipo de pessoa</legend>
            {Object.entries(TIPOS_PESSOA).map(([chave, t]) => (
              <label key={chave} className="cf-radio">
                <input
                  type="radio"
                  name="tipoPessoa"
                  value={chave}
                  checked={tipo === chave}
                  onChange={() => trocarTipo(chave)}
                />
                <span className="cf-radio__marca" aria-hidden="true" />
                {t.rotulo}
              </label>
            ))}
          </fieldset>

          <div className="cf-grid">
            <Campo
              label={cfg.nomeLabel}
              icone={IconUser}
              placeholder={cfg.nomePlaceholder}
              autoComplete={tipo === "fisica" ? "name" : "organization"}
              value={valores.nome}
              onChange={(e) => alterar("nome", e.target.value)}
              erro={erros.nome}
            />
            <Campo
              label={cfg.docLabel}
              icone={IconIdCard}
              placeholder={cfg.docPlaceholder}
              inputMode="numeric"
              autoComplete="off"
              maxLength={cfg.docMax}
              value={valores.documento}
              onChange={(e) => alterar("documento", cfg.mascara(e.target.value))}
              erro={erros.documento}
            />
          </div>
        </SecaoForm>

        {/* 2. Informações de contato */}
        <SecaoForm numero={2} titulo="Informações de contato" descricao="Informe como podemos entrar em contato.">
          <div className="cf-grid">
            <Campo
              label="E-mail de acesso"
              icone={IconMail}
              type="email"
              placeholder="Digite o e-mail"
              autoComplete="email"
              value={valores.email}
              onChange={(e) => alterar("email", e.target.value)}
              erro={erros.email}
            />
            <Campo
              label="Telefone"
              icone={IconPhone}
              type="tel"
              inputMode="tel"
              placeholder="(00) 00000-0000"
              autoComplete="tel"
              maxLength={15}
              value={valores.telefone}
              onChange={(e) => alterar("telefone", mascararTelefone(e.target.value))}
              erro={erros.telefone}
            />
          </div>
        </SecaoForm>

        {/* 3. Acesso à plataforma */}
        <SecaoForm numero={3} titulo="Acesso à plataforma" descricao="Defina a senha inicial para o cliente.">
          <div className="cf-grid">
            <CampoSenha
              label="Senha"
              placeholder="Digite uma senha"
              autoComplete="new-password"
              value={valores.senha}
              onChange={(e) => alterar("senha", e.target.value)}
              erro={erros.senha}
            />
            <CampoSenha
              label="Confirmar senha"
              placeholder="Confirme a senha"
              autoComplete="new-password"
              value={valores.confirmar}
              onChange={(e) => alterar("confirmar", e.target.value)}
              erro={erros.confirmar}
            />
          </div>
        </SecaoForm>
      </form>
    </ModalCadastro>
  );
}