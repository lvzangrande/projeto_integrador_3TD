"use client";

import "./esqueceu_senha.css";
import Link from "next/link";
import { useState } from "react";
import { apiRequest } from "@/lib/api";
import { mascararCpf, somenteDigitos, validarCpf } from "@/components/Form/utils.jsx";
import AguaViva from "@/components/Login/AguaViva";
import BolhasSubindo from "@/components/Login/BolhasSubindo";
import RaiosDeLuz from "@/components/Login/RaiosDeLuz";

const MINIMO_CARACTERES = 8;
const MAXIMO_CARACTERES = 72;

function senhaValida(senha) {
  return senha.length >= MINIMO_CARACTERES
    && senha.length <= MAXIMO_CARACTERES
    && /[A-Za-z]/.test(senha)
    && /\d/.test(senha);
}

export default function EsqueceuSenha() {
  const [etapa, setEtapa] = useState("cpf");
  const [cpf, setCpf] = useState("");
  const [codigo, setCodigo] = useState("");
  const [senha, setSenha] = useState("");
  const [confirmacao, setConfirmacao] = useState("");
  const [erro, setErro] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [concluido, setConcluido] = useState(false);

  async function solicitarCodigo(evento) {
    evento.preventDefault();
    if (enviando) return;
    if (!validarCpf(cpf)) {
      setErro("Digite um CPF válido.");
      return;
    }

    setErro("");
    setEnviando(true);
    try {
      await apiRequest("/auth/esqueci-senha", {
        method: "POST",
        body: JSON.stringify({ cpf: somenteDigitos(cpf) }),
      });
      setEtapa("codigo");
    } catch (error) {
      setErro(error.message || "Não foi possível solicitar o código agora. Tente novamente.");
    } finally {
      setEnviando(false);
    }
  }

  async function redefinirSenha(evento) {
    evento.preventDefault();
    if (enviando) return;

    if (!/^\d{6}$/.test(codigo)) {
      setErro("Digite o código de 6 números recebido por SMS.");
      return;
    }
    if (!senhaValida(senha)) {
      setErro("A senha deve ter entre 8 e 72 caracteres e conter letras e números.");
      return;
    }
    if (senha !== confirmacao) {
      setErro("As senhas não coincidem.");
      return;
    }

    setErro("");
    setEnviando(true);
    try {
      await apiRequest("/auth/redefinir-senha", {
        method: "POST",
        body: JSON.stringify({ cpf: somenteDigitos(cpf), codigo, senha }),
      });
      setCodigo("");
      setSenha("");
      setConfirmacao("");
      setConcluido(true);
    } catch (error) {
      setErro(error.message || "Não foi possível alterar a senha. Confira o código e tente novamente.");
    } finally {
      setEnviando(false);
    }
  }

  function voltarParaCpf() {
    setErro("");
    setCodigo("");
    setSenha("");
    setConfirmacao("");
    setEtapa("cpf");
  }

  return (
    <main className="pagina-esqueceu-senha">
      <RaiosDeLuz variante="profunda" />
      <BolhasSubindo variante="profunda" quantidade={36} semente={31} />

      <div className="pagina-esqueceu-senha__agua-viva pagina-esqueceu-senha__agua-viva--grande">
        <AguaViva sufixo="esqueceu-senha-a" />
      </div>
      <div className="pagina-esqueceu-senha__agua-viva pagina-esqueceu-senha__agua-viva--pequena">
        <AguaViva sufixo="esqueceu-senha-b" />
      </div>

      <section className="pagina-esqueceu-senha__cartao" aria-labelledby="esqueceu-senha-titulo">
        <Link className="pagina-esqueceu-senha__logo" href="/" aria-label="WAPI, voltar ao início">
          <img
            className="pagina-esqueceu-senha__logo-imagem"
            src="/logo-wapi.png"
            alt="WAPI"
            width="220"
            height="93"
          />
        </Link>

        <div className="pagina-esqueceu-senha__cabecalho">
          <span className="pagina-esqueceu-senha__icone" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="5" width="18" height="14" rx="3" />
              <circle cx="8" cy="11" r="2" />
              <path d="M5.5 16c.7-1.6 4.3-1.6 5 0M13 10h5m-5 4h5" />
            </svg>
          </span>
          <h1 className="pagina-esqueceu-senha__titulo" id="esqueceu-senha-titulo">
            {concluido ? "Senha alterada" : etapa === "cpf" ? "Esqueceu a senha?" : "Digite o código SMS"}
          </h1>
          <p className="pagina-esqueceu-senha__subtitulo" role={concluido ? "status" : undefined}>
            {concluido
              ? "Sua nova senha já está valendo. Use-a para entrar na sua conta."
              : etapa === "cpf"
                ? "Informe o CPF da sua conta. Se ela estiver ativa e tiver telefone cadastrado, enviaremos um código por SMS."
                : "Digite o código de 6 números enviado ao telefone cadastrado. Ele expira em 5 minutos. Se não chegar, confira seu telefone com o administrador."}
          </p>
        </div>

        {concluido ? (
          <Link className="pagina-esqueceu-senha__botao" href="/#login">
            Ir para o login
          </Link>
        ) : etapa === "cpf" ? (
          <form className="pagina-esqueceu-senha__formulario" onSubmit={solicitarCodigo} noValidate>
            <div className="pagina-esqueceu-senha__grupo">
              <div className="pagina-esqueceu-senha__campo">
                <label className="pagina-esqueceu-senha__rotulo" htmlFor="cpf">
                  CPF
                </label>
                <input
                  className="pagina-esqueceu-senha__entrada"
                  id="cpf"
                  name="cpf"
                  type="text"
                  inputMode="numeric"
                  autoComplete="off"
                  placeholder="000.000.000-00"
                  maxLength={14}
                  value={cpf}
                  onChange={(evento) => {
                    setCpf(mascararCpf(evento.target.value));
                    setErro("");
                  }}
                  aria-invalid={erro ? "true" : "false"}
                  aria-describedby={erro ? "recuperacao-erro" : undefined}
                />
              </div>
              {erro && <p className="pagina-esqueceu-senha__erro" id="recuperacao-erro" role="alert">{erro}</p>}
            </div>

            <button className="pagina-esqueceu-senha__botao" type="submit" disabled={enviando}>
              {enviando ? "Solicitando..." : "Enviar código por SMS"}
            </button>
          </form>
        ) : (
          <form className="pagina-esqueceu-senha__formulario" onSubmit={redefinirSenha} noValidate>
            <div className="pagina-esqueceu-senha__grupo">
              <div className="pagina-esqueceu-senha__campo">
                <label className="pagina-esqueceu-senha__rotulo" htmlFor="codigo-sms">Código SMS</label>
                <input
                  className="pagina-esqueceu-senha__entrada"
                  id="codigo-sms"
                  name="codigo"
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  maxLength={6}
                  placeholder="000000"
                  value={codigo}
                  onChange={(evento) => {
                    setCodigo(somenteDigitos(evento.target.value).slice(0, 6));
                    setErro("");
                  }}
                />
              </div>
            </div>

            <div className="pagina-esqueceu-senha__grupo">
              <div className="pagina-esqueceu-senha__campo">
                <label className="pagina-esqueceu-senha__rotulo" htmlFor="nova-senha">Nova senha</label>
                <input
                  className="pagina-esqueceu-senha__entrada"
                  id="nova-senha"
                  name="nova-senha"
                  type="password"
                  autoComplete="new-password"
                  maxLength={MAXIMO_CARACTERES}
                  value={senha}
                  onChange={(evento) => {
                    setSenha(evento.target.value);
                    setErro("");
                  }}
                />
              </div>
              <p className="pagina-esqueceu-senha__subtitulo">Use de 8 a 72 caracteres, com letras e números.</p>
            </div>

            <div className="pagina-esqueceu-senha__grupo">
              <div className="pagina-esqueceu-senha__campo">
                <label className="pagina-esqueceu-senha__rotulo" htmlFor="confirmar-senha">Confirmar nova senha</label>
                <input
                  className="pagina-esqueceu-senha__entrada"
                  id="confirmar-senha"
                  name="confirmar-senha"
                  type="password"
                  autoComplete="new-password"
                  maxLength={MAXIMO_CARACTERES}
                  value={confirmacao}
                  onChange={(evento) => {
                    setConfirmacao(evento.target.value);
                    setErro("");
                  }}
                />
              </div>
            </div>

            {erro && <p className="pagina-esqueceu-senha__erro" role="alert">{erro}</p>}
            <button className="pagina-esqueceu-senha__botao" type="submit" disabled={enviando}>
              {enviando ? "Salvando..." : "Salvar nova senha"}
            </button>
            <button className="pagina-esqueceu-senha__alternar" type="button" onClick={voltarParaCpf} disabled={enviando}>
              Voltar e pedir outro código
            </button>
          </form>
        )}

        <Link className="pagina-esqueceu-senha__voltar" href="/#login">
          Voltar ao login
        </Link>
      </section>
    </main>
  );
}
