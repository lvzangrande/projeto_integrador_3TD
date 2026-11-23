"use client";

import "./trocar_senha.css";
import Link from "next/link";
import { useEffect, useState } from "react";
import { apiRequest } from "@/lib/api";
import AguaViva from "@/components/Login/AguaViva";
import BolhasSubindo from "@/components/Login/BolhasSubindo";
import RaiosDeLuz from "@/components/Login/RaiosDeLuz";

const MINIMO_CARACTERES = 8;
// Mantém o limite aceito pela API de recuperação de senha.
const MAXIMO_CARACTERES = 72;

const REGRAS = [
  {
    id: "tamanho",
    texto: `Pelo menos ${MINIMO_CARACTERES} caracteres`,
    atendida: (senha) => senha.length >= MINIMO_CARACTERES,
  },
  {
    id: "composicao",
    texto: "Letras e números",
    atendida: (senha) => /[A-Za-z]/.test(senha) && /\d/.test(senha),
  },
];

function CampoSenha({ id, rotulo, placeholder, autoComplete, valor, aoAlterar, erro }) {
  const [visivel, setVisivel] = useState(false);

  return (
    <div className="pagina-trocar-senha__grupo">
      <div className="pagina-trocar-senha__campo">
        <label className="pagina-trocar-senha__rotulo" htmlFor={id}>
          {rotulo}
        </label>
        <input
          className="pagina-trocar-senha__entrada"
          id={id}
          name={id}
          type={visivel ? "text" : "password"}
          placeholder={placeholder}
          autoComplete={autoComplete}
          maxLength={MAXIMO_CARACTERES}
          value={valor}
          onChange={(evento) => aoAlterar(evento.target.value)}
          aria-invalid={erro ? "true" : "false"}
          aria-describedby={erro ? `${id}-erro` : undefined}
        />
        <button
          className="pagina-trocar-senha__alternar"
          type="button"
          onClick={() => setVisivel((atual) => !atual)}
          aria-label={visivel ? "Ocultar senha" : "Mostrar senha"}
          aria-pressed={visivel}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12Z" />
            <circle cx="12" cy="12" r="3" />
            {visivel && <path d="M4 4l16 16" />}
          </svg>
        </button>
      </div>
      {erro && (
        <p className="pagina-trocar-senha__erro" id={`${id}-erro`} role="alert">
          {erro}
        </p>
      )}
    </div>
  );
}

export default function TrocarSenha() {
  const [novaSenha, setNovaSenha] = useState("");
  const [confirmacao, setConfirmacao] = useState("");
  const [erros, setErros] = useState({});
  const [concluido, setConcluido] = useState(false);
  const [token, setToken] = useState("");
  const [verificandoToken, setVerificandoToken] = useState(true);
  const [enviando, setEnviando] = useState(false);
  const [erroGeral, setErroGeral] = useState("");

  useEffect(() => {
    let ativo = true;
    const tokenUrl = new URLSearchParams(window.location.search).get("token") || "";
    setToken(tokenUrl);
    if (!tokenUrl) {
      setErroGeral("O link está incompleto. Solicite uma nova recuperação de senha.");
      setVerificandoToken(false);
      return () => { ativo = false; };
    }

    apiRequest(`/auth/verificar-token-redefinicao?token=${encodeURIComponent(tokenUrl)}`)
      .catch((error) => {
        if (!ativo) return;
        setToken("");
        setErroGeral(error.message || "Este link é inválido ou expirou. Solicite outro link de recuperação.");
      })
      .finally(() => { if (ativo) setVerificandoToken(false); });

    return () => { ativo = false; };
  }, []);

  const senhasIguais = confirmacao.length > 0 && novaSenha === confirmacao;
  const requisitos = [
    ...REGRAS.map((regra) => ({ id: regra.id, texto: regra.texto, atendido: regra.atendida(novaSenha) })),
    { id: "igualdade", texto: "As duas senhas são iguais", atendido: senhasIguais },
  ];

  async function aoEnviar(evento) {
    evento.preventDefault();
    if (enviando) return;
    const novosErros = {};

    if (!novaSenha) {
      novosErros["nova-senha"] = "Digite a nova senha.";
    } else if (!REGRAS.every((regra) => regra.atendida(novaSenha))) {
      novosErros["nova-senha"] = "A senha ainda não atende aos requisitos abaixo.";
    }

    if (!confirmacao) {
      novosErros["confirmar-senha"] = "Repita a nova senha.";
    } else if (confirmacao !== novaSenha) {
      novosErros["confirmar-senha"] = "As senhas não coincidem.";
    }

    setErros(novosErros);
    if (Object.keys(novosErros).length > 0) return;

    if (!token) {
      setErroGeral("O link está incompleto. Solicite uma nova recuperação de senha.");
      return;
    }

    setErroGeral("");
    setEnviando(true);
    try {
      await apiRequest("/auth/redefinir-senha", {
        method: "POST",
        body: JSON.stringify({ token, senha: novaSenha }),
      });
      setConcluido(true);
      window.history.replaceState({}, document.title, window.location.pathname);
    } catch (error) {
      setErroGeral(error.message || "Não foi possível alterar a senha. Solicite outro link e tente novamente.");
    } finally {
      setEnviando(false);
    }
  }

  return (
    <main className="pagina-trocar-senha">
      <RaiosDeLuz variante="profunda" />
      <BolhasSubindo variante="profunda" quantidade={36} semente={59} />

      <div className="pagina-trocar-senha__agua-viva pagina-trocar-senha__agua-viva--grande">
        <AguaViva sufixo="trocar-senha-a" />
      </div>
      <div className="pagina-trocar-senha__agua-viva pagina-trocar-senha__agua-viva--pequena">
        <AguaViva sufixo="trocar-senha-b" />
      </div>

      <section className="pagina-trocar-senha__cartao" aria-labelledby="trocar-senha-titulo">
        <Link className="pagina-trocar-senha__logo" href="/" aria-label="WAPI, voltar ao início">
          <img
            className="pagina-trocar-senha__logo-imagem"
            src="/logo-wapi.png"
            alt="WAPI"
            width="220"
            height="93"
          />
        </Link>

        {concluido ? (
          <>
            <div className="pagina-trocar-senha__cabecalho">
              <span className="pagina-trocar-senha__icone" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="9" />
                  <path d="M8 12.5l2.8 2.8L16 9.5" />
                </svg>
              </span>
              <h1 className="pagina-trocar-senha__titulo" id="trocar-senha-titulo">
                Senha alterada
              </h1>
              <p className="pagina-trocar-senha__subtitulo" role="status">
                Pronto! Sua nova senha já está valendo. Use-a para entrar na sua conta.
              </p>
            </div>
            <Link className="pagina-trocar-senha__botao" href="/#login">
              Ir para o login
            </Link>
          </>
        ) : (
          <>
            <div className="pagina-trocar-senha__cabecalho">
              <span className="pagina-trocar-senha__icone" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="4.5" y="10.5" width="15" height="10" rx="3" />
                  <path d="M8 10.5V8a4 4 0 0 1 8 0v2.5" />
                  <circle cx="12" cy="15.5" r="1.2" />
                </svg>
              </span>
              <h1 className="pagina-trocar-senha__titulo" id="trocar-senha-titulo">
                Crie uma nova senha
              </h1>
              <p className="pagina-trocar-senha__subtitulo">
                Escolha uma senha que você não use em outros lugares.
              </p>
            </div>

            <form className="pagina-trocar-senha__formulario" onSubmit={aoEnviar} noValidate>
              {erroGeral && <p className="pagina-trocar-senha__erro" role="alert">{erroGeral}</p>}
              {erroGeral && <Link className="pagina-trocar-senha__voltar" href="/esqueceu_senha">Solicitar outro link de recuperação</Link>}
              <CampoSenha
                id="nova-senha"
                rotulo="Nova senha"
                placeholder="Digite a nova senha"
                autoComplete="new-password"
                valor={novaSenha}
                aoAlterar={setNovaSenha}
                erro={erros["nova-senha"]}
              />
              <CampoSenha
                id="confirmar-senha"
                rotulo="Confirmar nova senha"
                placeholder="Repita a nova senha"
                autoComplete="new-password"
                valor={confirmacao}
                aoAlterar={setConfirmacao}
                erro={erros["confirmar-senha"]}
              />

              <ul className="pagina-trocar-senha__requisitos" aria-label="Requisitos da senha">
                {requisitos.map((requisito) => (
                  <li
                    key={requisito.id}
                    className={`pagina-trocar-senha__requisito${requisito.atendido ? " pagina-trocar-senha__requisito--ok" : ""}`}
                  >
                    {requisito.texto}
                  </li>
                ))}
              </ul>

              <button className="pagina-trocar-senha__botao" type="submit" disabled={verificandoToken || enviando || !token}>
                {enviando ? "Salvando..." : "Salvar nova senha"}
              </button>
            </form>

            <Link className="pagina-trocar-senha__voltar" href="/#login">
              Cancelar e voltar ao login
            </Link>
          </>
        )}
      </section>
    </main>
  );
}
