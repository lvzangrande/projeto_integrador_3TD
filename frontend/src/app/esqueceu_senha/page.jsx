"use client";

import "./esqueceu_senha.css";
import Link from "next/link";
import { useState } from "react";
import { apiRequest } from "@/lib/api";
import AguaViva from "@/components/Login/AguaViva";
import BolhasSubindo from "@/components/Login/BolhasSubindo";
import RaiosDeLuz from "@/components/Login/RaiosDeLuz";

export default function EsqueceuSenha() {
  const [email, setEmail] = useState("");
  const [erro, setErro] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [enviado, setEnviado] = useState(false);

  async function solicitar(evento) {
    evento.preventDefault();
    if (enviando) return;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setErro("Digite um endereço de e-mail válido.");
      return;
    }
    setErro("");
    setEnviando(true);
    try {
      await apiRequest("/auth/forgot-password", {
        method: "POST",
        body: JSON.stringify({ email: email.trim() }),
      });
      setEnviado(true);
    } catch (error) {
      setErro(error.message || "Não foi possível solicitar o link agora. Tente novamente.");
    } finally {
      setEnviando(false);
    }
  }

  return (
    <main className="pagina-esqueceu-senha">
      <RaiosDeLuz variante="profunda" />
      <BolhasSubindo variante="profunda" quantidade={36} semente={31} />
      <div className="pagina-esqueceu-senha__agua-viva pagina-esqueceu-senha__agua-viva--grande"><AguaViva sufixo="esqueceu-senha-a" /></div>
      <div className="pagina-esqueceu-senha__agua-viva pagina-esqueceu-senha__agua-viva--pequena"><AguaViva sufixo="esqueceu-senha-b" /></div>
      <section className="pagina-esqueceu-senha__cartao" aria-labelledby="esqueceu-senha-titulo">
        <Link className="pagina-esqueceu-senha__logo" href="/" aria-label="WAPI, voltar ao início">
          <img className="pagina-esqueceu-senha__logo-imagem" src="/logo-wapi.png" alt="WAPI" width="220" height="93" />
        </Link>
        <div className="pagina-esqueceu-senha__cabecalho">
          <span className="pagina-esqueceu-senha__icone" aria-hidden="true">✉</span>
          <h1 className="pagina-esqueceu-senha__titulo" id="esqueceu-senha-titulo">
            {enviado ? "Confira seu e-mail" : "Esqueceu a senha?"}
          </h1>
          <p className="pagina-esqueceu-senha__subtitulo" role={enviado ? "status" : undefined}>
            {enviado
              ? "Se o e-mail informado estiver cadastrado, enviaremos um link para redefinir sua senha. O link expira em 30 minutos."
              : "Informe o e-mail da sua conta. Enviaremos um link para você criar uma nova senha."}
          </p>
        </div>
        {!enviado && (
          <form className="pagina-esqueceu-senha__formulario" onSubmit={solicitar} noValidate>
            <div className="pagina-esqueceu-senha__grupo">
              <div className="pagina-esqueceu-senha__campo">
                <label className="pagina-esqueceu-senha__rotulo" htmlFor="email-recuperacao">E-mail</label>
                <input className="pagina-esqueceu-senha__entrada" id="email-recuperacao" name="email" type="email" autoComplete="email" maxLength={100} required value={email} onChange={(evento) => { setEmail(evento.target.value); setErro(""); }} aria-invalid={erro ? "true" : "false"} />
              </div>
              {erro && <p className="pagina-esqueceu-senha__erro" role="alert">{erro}</p>}
            </div>
            <button className="pagina-esqueceu-senha__botao" type="submit" disabled={enviando}>
              {enviando ? "Enviando..." : "Enviar link de redefinição"}
            </button>
          </form>
        )}
        <Link className="pagina-esqueceu-senha__voltar" href="/#login">Voltar ao login</Link>
      </section>
    </main>
  );
}
