"use client";

import "./esqueceu_senha.css";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { apiRequest } from "@/lib/api";
import AguaViva from "@/components/Login/AguaViva";
import BolhasSubindo from "@/components/Login/BolhasSubindo";
import RaiosDeLuz from "@/components/Login/RaiosDeLuz";

const PADRAO_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function EsqueceuSenha() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [erro, setErro] = useState("");
  const [enviando, setEnviando] = useState(false);

  async function aoEnviar(evento) {
    evento.preventDefault();
    if (enviando) return;
    const emailLimpo = email.trim();

    if (!emailLimpo) {
      setErro("Informe o e-mail da sua conta.");
      return;
    }
    if (!PADRAO_EMAIL.test(emailLimpo)) {
      setErro("Digite um e-mail válido, como nome@empresa.com.");
      return;
    }

    setErro("");
    setEnviando(true);
    try {
      await apiRequest("/auth/esqueci-senha", {
        method: "POST",
        body: JSON.stringify({ email: emailLimpo }),
      });
      router.push(`/esqueceu_senha/enviado?email=${encodeURIComponent(emailLimpo)}`);
    } catch (error) {
      setErro(error.message || "Não foi possível solicitar a recuperação agora. Tente novamente.");
    } finally {
      setEnviando(false);
    }
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
              <path d="M3.5 7.5l8.5 6 8.5-6" />
            </svg>
          </span>
          <h1 className="pagina-esqueceu-senha__titulo" id="esqueceu-senha-titulo">
            Esqueceu a senha?
          </h1>
          <p className="pagina-esqueceu-senha__subtitulo">
            Informe o e-mail da sua conta e enviaremos um link para você criar uma nova senha.
          </p>
        </div>

        <form className="pagina-esqueceu-senha__formulario" onSubmit={aoEnviar} noValidate>
          <div className="pagina-esqueceu-senha__grupo">
            <div className="pagina-esqueceu-senha__campo">
              <label className="pagina-esqueceu-senha__rotulo" htmlFor="email">
                E-mail
              </label>
              <input
                className="pagina-esqueceu-senha__entrada"
                id="email"
                name="email"
                type="email"
                placeholder="Digite seu e-mail"
                autoComplete="email"
                maxLength={100}
                value={email}
                onChange={(evento) => setEmail(evento.target.value)}
                aria-invalid={erro ? "true" : "false"}
                aria-describedby={erro ? "email-erro" : undefined}
              />
            </div>
            {erro && (
              <p className="pagina-esqueceu-senha__erro" id="email-erro" role="alert">
                {erro}
              </p>
            )}
          </div>

          <button className="pagina-esqueceu-senha__botao" type="submit" disabled={enviando}>
            {enviando ? "Enviando..." : "Enviar link de recuperação"}
          </button>
        </form>

        <Link className="pagina-esqueceu-senha__voltar" href="/#login">
          Voltar ao login
        </Link>
      </section>
    </main>
  );
}
